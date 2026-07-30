import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user || session.user.role !== "OWNER") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { bhataId, brickTypeId, price, stock } = await req.json();

    const bhata = await prisma.bhata.findFirst({
      where: { id: bhataId, ownerId: session.user.id },
    });

    if (!bhata) {
      return NextResponse.json({ error: "Bhata not found" }, { status: 404 });
    }

    const existing = await prisma.brickPrice.findUnique({
      where: { bhataId_brickTypeId: { bhataId, brickTypeId } },
    });

    if (existing) {
      return NextResponse.json({ error: "Price already exists for this brick type" }, { status: 400 });
    }

    const brickPrice = await prisma.brickPrice.create({
      data: {
        bhataId,
        brickTypeId,
        price: parseFloat(price),
        stock: stock ? parseInt(stock) : null,
      },
    });

    return NextResponse.json(brickPrice, { status: 201 });
  } catch (error) {
    console.error("Create price error:", error);
    return NextResponse.json({ error: "Failed to set price" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  const session = await auth();
  if (!session?.user || session.user.role !== "OWNER") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id, price, stock, isAvailable } = await req.json();

    const brickPrice = await prisma.brickPrice.findUnique({
      where: { id },
      include: { bhata: true },
    });

    if (!brickPrice || brickPrice.bhata.ownerId !== session.user.id) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const updated = await prisma.brickPrice.update({
      where: { id },
      data: {
        price: price !== undefined ? parseFloat(price) : undefined,
        stock: stock !== undefined ? (stock ? parseInt(stock) : null) : undefined,
        isAvailable: isAvailable !== undefined ? isAvailable : undefined,
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Update price error:", error);
    return NextResponse.json({ error: "Failed to update price" }, { status: 500 });
  }
}
