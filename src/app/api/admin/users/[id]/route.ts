import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { rateLimit, getClientIp, RATE_LIMIT_PROFILES } from "@/lib/rate-limit";

const ALLOWED_ROLES = ["CUSTOMER", "OWNER", "ADMIN"];

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const ip = getClientIp(req);
  const limited = rateLimit(`admin-users-write:${session.user.id}:${ip}`, RATE_LIMIT_PROFILES.moderate);
  if (!limited.ok) {
    return NextResponse.json(
      { error: "Too many requests. Please try again later." },
      { status: 429, headers: { "Retry-After": String(limited.retryAfter) } }
    );
  }

  const { id } = await params;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const { role } = body as { role?: unknown };
  if (typeof role !== "string" || !ALLOWED_ROLES.includes(role)) {
    return NextResponse.json(
      { error: "Role must be CUSTOMER, OWNER, or ADMIN" },
      { status: 400 }
    );
  }

  if (id === session.user.id && role !== "ADMIN") {
    return NextResponse.json(
      { error: "You cannot remove your own admin role" },
      { status: 400 }
    );
  }

  try {
    const existing = await prisma.user.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const user = await prisma.user.update({
      where: { id },
      data: { role },
      select: { id: true, name: true, email: true, role: true, phone: true, createdAt: true },
    });

    return NextResponse.json(user);
  } catch (error) {
    console.error("Update user error:", error);
    return NextResponse.json({ error: "Failed to update user" }, { status: 500 });
  }
}
