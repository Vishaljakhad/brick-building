import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET() {
  const session = await auth();
  if (!session?.user || session.user.role !== "OWNER") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const bhata = await prisma.bhata.findFirst({
    where: { ownerId: session.user.id },
    include: {
      brickPrices: {
        include: { brickType: true },
        orderBy: { brickType: { name: "asc" } },
      },
    },
  });

  if (!bhata) {
    return NextResponse.json(null);
  }

  return NextResponse.json(bhata);
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user || session.user.role !== "OWNER") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { name, address, phone, description } = await req.json();

    const existing = await prisma.bhata.findFirst({
      where: { ownerId: session.user.id },
    });

    if (existing) {
      return NextResponse.json({ error: "You already have a registered bhata" }, { status: 400 });
    }

    const bhata = await prisma.bhata.create({
      data: {
        name,
        address,
        phone,
        description,
        latitude: 23.685, // Default center of Bangladesh/India
        longitude: 90.356,
        ownerId: session.user.id,
      },
    });

    return NextResponse.json(bhata, { status: 201 });
  } catch (error) {
    console.error("Create bhata error:", error);
    return NextResponse.json({ error: "Failed to create bhata" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  const session = await auth();
  if (!session?.user || session.user.role !== "OWNER") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { name, address, phone, description } = await req.json();

    const existing = await prisma.bhata.findFirst({
      where: { ownerId: session.user.id },
    });

    if (!existing) {
      return NextResponse.json({ error: "Bhata not found" }, { status: 404 });
    }

    const bhata = await prisma.bhata.update({
      where: { id: existing.id },
      data: { name, address, phone, description },
    });

    return NextResponse.json(bhata);
  } catch (error) {
    console.error("Update bhata error:", error);
    return NextResponse.json({ error: "Failed to update bhata" }, { status: 500 });
  }
}
