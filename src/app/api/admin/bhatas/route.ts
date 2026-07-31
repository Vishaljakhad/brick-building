import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { rateLimit, RATE_LIMIT_PROFILES } from "@/lib/rate-limit";

export async function GET() {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const limited = rateLimit(`admin-bhatas:${session.user.id}`, RATE_LIMIT_PROFILES.relaxed);
  if (!limited.ok) {
    return NextResponse.json(
      { error: "Too many requests. Please try again later." },
      { status: 429, headers: { "Retry-After": String(limited.retryAfter) } }
    );
  }

  try {
    const bhatas = await prisma.bhata.findMany({
      include: {
        owner: { select: { name: true, email: true } },
        _count: { select: { orders: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(bhatas);
  } catch (error) {
    console.error("List admin bhatas error:", error);
    return NextResponse.json({ error: "Failed to load bhatas" }, { status: 500 });
  }
}
