import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { generateOrderNumber } from "@/lib/utils";

export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const role = session.user.role;
  const userId = session.user.id;

  let orders;

  if (role === "ADMIN") {
    orders = await prisma.order.findMany({
      include: {
        customer: { select: { name: true, email: true } },
        bhata: { select: { name: true } },
        items: { include: { brickType: true } },
      },
      orderBy: { createdAt: "desc" },
    });
  } else if (role === "OWNER") {
    const userBhatas = await prisma.bhata.findMany({
      where: { ownerId: userId },
      select: { id: true },
    });
    const bhataIds = userBhatas.map((b) => b.id);
    orders = await prisma.order.findMany({
      where: { bhataId: { in: bhataIds } },
      include: {
        customer: { select: { name: true, email: true, phone: true } },
        bhata: { select: { name: true } },
        items: { include: { brickType: true } },
      },
      orderBy: { createdAt: "desc" },
    });
  } else {
    orders = await prisma.order.findMany({
      where: { customerId: userId },
      include: {
        bhata: { select: { name: true } },
        items: { include: { brickType: true } },
      },
      orderBy: { createdAt: "desc" },
    });
  }

  return NextResponse.json(orders);
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const {
      bhataId,
      items,
      deliveryAddress,
      deliveryLatitude,
      deliveryLongitude,
      paymentMethod,
      truckCapacity,
      notes,
    } = await req.json();

    let totalAmount = 0;
    const orderItems = [];

    for (const item of items) {
      const brickPrice = await prisma.brickPrice.findUnique({
        where: {
          bhataId_brickTypeId: {
            bhataId,
            brickTypeId: item.brickTypeId,
          },
        },
        include: { brickType: true },
      });

      if (!brickPrice || !brickPrice.isAvailable) {
        return NextResponse.json(
          { error: `Brick type ${item.brickTypeId} not available` },
          { status: 400 }
        );
      }

      const unitPrice = brickPrice.price;
      const subtotal = unitPrice * item.quantity;
      totalAmount += subtotal;

      orderItems.push({
        brickTypeId: item.brickTypeId,
        quantity: item.quantity,
        unitPrice,
      });
    }

    const order = await prisma.order.create({
      data: {
        orderNumber: generateOrderNumber(),
        customerId: session.user.id,
        bhataId,
        status: "PENDING",
        totalAmount,
        paymentMethod: paymentMethod || "COD",
        paymentStatus: "UNPAID",
        deliveryAddress,
        deliveryLatitude: deliveryLatitude ? parseFloat(deliveryLatitude) : null,
        deliveryLongitude: deliveryLongitude ? parseFloat(deliveryLongitude) : null,
        truckCapacity,
        notes,
        items: {
          create: orderItems,
        },
      },
      include: {
        items: { include: { brickType: true } },
        bhata: { select: { name: true } },
      },
    });

    return NextResponse.json(order, { status: 201 });
  } catch (error) {
    console.error("Create order error:", error);
    return NextResponse.json({ error: "Failed to create order" }, { status: 500 });
  }
}
