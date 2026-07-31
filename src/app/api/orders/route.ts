import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { generateOrderNumber } from "@/lib/utils";
import { isValidLatitude, isValidLongitude, isValidPositiveInt } from "@/lib/validation";
import { rateLimit } from "@/lib/rate-limit";
import { computeDiscount, isFirstOrder } from "@/lib/discounts";

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

  const orderSelect = {
    id: true,
    orderNumber: true,
    status: true,
    totalAmount: true,
    subtotalAmount: true,
    discountAmount: true,
    discountLabel: true,
    paymentMethod: true,
    paymentStatus: true,
    createdAt: true,
    items: {
      select: {
        quantity: true,
        unitPrice: true,
        brickType: { select: { id: true, name: true, unit: true } },
      },
    },
  };

  if (role === "ADMIN") {
    orders = await prisma.order.findMany({
      select: {
        ...orderSelect,
        customer: { select: { id: true, name: true, email: true } },
        bhata: { select: { id: true, name: true, ownerId: true } },
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
      select: {
        ...orderSelect,
        customer: { select: { id: true, name: true, email: true, phone: true } },
        bhata: { select: { id: true, name: true, ownerId: true } },
      },
      orderBy: { createdAt: "desc" },
    });
  } else {
    orders = await prisma.order.findMany({
      where: { customerId: userId },
      select: {
        ...orderSelect,
        bhata: { select: { id: true, name: true, ownerId: true } },
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

    const customer = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { id: true, referredById: true, referralRewards: true },
    });
    if (!customer) {
      return NextResponse.json({ error: "Account not found" }, { status: 400 });
    }

    const existingOrders = await prisma.order.findMany({
      where: { customerId: session.user.id },
      select: { status: true },
    });

    let totalAmount = 0;
    const orderItems: { brickTypeId: string; quantity: number; unitPrice: number }[] = [];

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

    const discount = computeDiscount({
      subtotal: totalAmount,
      hasReferrer: !!customer.referredById,
      isFirstOrder: isFirstOrder(existingOrders),
      referralRewards: customer.referralRewards,
    });

    const order = await prisma.$transaction(async (tx) => {
      const created = await tx.order.create({
        data: {
          orderNumber: generateOrderNumber(),
          customerId: session.user.id,
          bhataId,
          status: "PENDING",
          totalAmount: discount.totalAmount,
          subtotalAmount: discount.subtotalAmount,
          discountAmount: discount.discountAmount,
          discountCode: discount.discountCode || null,
          discountLabel: discount.discountLabel || null,
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

      if (discount.discountCode.includes("REFERRER_REWARD")) {
        await tx.user.update({
          where: { id: session.user.id },
          data: { referralRewards: 0 },
        });
      }

      return created;
    });

    return NextResponse.json(order, { status: 201 });
  } catch (error) {
    console.error("Create order error:", error);
    return NextResponse.json({ error: "Failed to create order" }, { status: 500 });
  }
}
