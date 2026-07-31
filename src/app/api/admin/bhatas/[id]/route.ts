import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
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
}
