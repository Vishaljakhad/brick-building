import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { rateLimit, getClientIp, RATE_LIMIT_PROFILES } from "@/lib/rate-limit";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const ip = getClientIp(req);
  const limited = rateLimit(`admin-bhatas-write:${session.user.id}:${ip}`, RATE_LIMIT_PROFILES.moderate);
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

  const { isActive } = body as { isActive?: unknown };
  if (typeof isActive !== "boolean") {
    return NextResponse.json({ error: "isActive must be a boolean" }, { status: 400 });
  }

  try {
    const existing = await prisma.bhata.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Bhata not found" }, { status: 404 });
    }

    const bhata = await prisma.bhata.update({
      where: { id },
      data: { isActive },
      include: {
        owner: { select: { name: true, email: true } },
        _count: { select: { orders: true } },
      },
    });

    return NextResponse.json(bhata);
  } catch (error) {
    console.error("Update admin bhata error:", error);
    return NextResponse.json({ error: "Failed to update bhata" }, { status: 500 });
  }
}
