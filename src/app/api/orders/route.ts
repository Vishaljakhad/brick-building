import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { generateOrderNumber } from "@/lib/utils";
import { isValidLatitude, isValidLongitude, isValidPositiveInt } from "@/lib/validation";
import { rateLimit } from "@/lib/rate-limit";

const ALLOWED_PAYMENT_METHODS = ["COD", "ONLINE"];

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

  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  const limited = rateLimit(`order:${session.user.id}:${ip}`, 10, 60 * 1000);
  if (!limited.ok) {
    return NextResponse.json(
      { error: "Too many orders. Please try again later." },
      { status: 429 }
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const {
    bhataId,
    items,
    deliveryAddress,
    deliveryLatitude,
    deliveryLongitude,
    paymentMethod,
    truckCapacity,
    notes,
  } = body as {
    bhataId?: unknown;
    items?: unknown;
    deliveryAddress?: unknown;
    deliveryLatitude?: unknown;
    deliveryLongitude?: unknown;
    paymentMethod?: unknown;
    truckCapacity?: unknown;
    notes?: unknown;
  };

  if (typeof bhataId !== "string" || bhataId.length === 0) {
    return NextResponse.json({ error: "Please select a bhata" }, { status: 400 });
  }

  if (!Array.isArray(items) || items.length === 0) {
    return NextResponse.json(
      { error: "Order must contain at least one item" },
      { status: 400 }
    );
  }

  if (typeof deliveryAddress !== "string" || deliveryAddress.trim().length < 10) {
    return NextResponse.json(
      { error: "Please enter a valid delivery address" },
      { status: 400 }
    );
  }

  if (paymentMethod !== undefined && !ALLOWED_PAYMENT_METHODS.includes(paymentMethod as string)) {
    return NextResponse.json(
      { error: "Invalid payment method" },
      { status: 400 }
    );
  }

  try {
    const bhata = await prisma.bhata.findFirst({
      where: { id: bhataId, isActive: true },
    });
    if (!bhata) {
      return NextResponse.json(
        { error: "Bhata not found or inactive" },
        { status: 400 }
      );
    }

    let totalAmount = 0;
    const orderItems = [];

    for (const item of items) {
      const brickTypeId = (item as { brickTypeId?: unknown })?.brickTypeId;
      const quantity = (item as { quantity?: unknown })?.quantity;

      if (typeof brickTypeId !== "string" || !isValidPositiveInt(quantity)) {
        return NextResponse.json(
          { error: "Invalid brick type or quantity" },
          { status: 400 }
        );
      }

      const brickPrice = await prisma.brickPrice.findUnique({
        where: {
          bhataId_brickTypeId: {
            bhataId,
            brickTypeId,
          },
        },
        include: { brickType: true },
      });

      if (!brickPrice || !brickPrice.isAvailable) {
        return NextResponse.json(
          { error: `Brick type not available at this bhata` },
          { status: 400 }
        );
      }

      if (brickPrice.stock !== null && quantity > brickPrice.stock) {
        return NextResponse.json(
          { error: `Insufficient stock for ${brickPrice.brickType.name}` },
          { status: 400 }
        );
      }

      const unitPrice = brickPrice.price;
      const subtotal = unitPrice * quantity;
      totalAmount += subtotal;

      orderItems.push({
        brickTypeId,
        quantity,
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
        paymentMethod: (paymentMethod as string) || "COD",
        paymentStatus: "UNPAID",
        deliveryAddress: deliveryAddress.trim(),
        deliveryLatitude:
          deliveryLatitude !== undefined && isValidLatitude(deliveryLatitude)
            ? deliveryLatitude
            : null,
        deliveryLongitude:
          deliveryLongitude !== undefined && isValidLongitude(deliveryLongitude)
            ? deliveryLongitude
            : null,
        truckCapacity: typeof truckCapacity === "string" ? truckCapacity : null,
        notes: typeof notes === "string" ? notes : null,
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
