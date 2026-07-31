import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { DISCOUNT_RULES } from "@/lib/constants";

const ALLOWED_STATUS = ["PENDING", "CONFIRMED", "PROCESSING", "IN_TRANSIT", "DELIVERED", "CANCELLED"];
const ALLOWED_PAYMENT_STATUS = ["UNPAID", "PAID", "REFUNDED"];

// Allowed status transitions per role (undefined = any of ALLOWED_STATUS)
const ROLE_STATUS_RULES: Record<string, string[]> = {
  ADMIN: ALLOWED_STATUS,
  OWNER: ["CONFIRMED", "PROCESSING", "IN_TRANSIT", "DELIVERED", "CANCELLED"],
  CUSTOMER: ["CANCELLED"],
};

const STATUS_FLOW = ["PENDING", "CONFIRMED", "PROCESSING", "IN_TRANSIT", "DELIVERED"];

async function canAccessOrder(order: { customerId: string; bhataId: string }, role: string, userId: string): Promise<boolean> {
  if (role === "ADMIN") return true;
  if (role === "CUSTOMER") return order.customerId === userId;
  if (role === "OWNER") {
    const bhata = await prisma.bhata.findFirst({
      where: { id: order.bhataId, ownerId: userId },
      select: { id: true },
    });
    return !!bhata;
  }
  return false;
}

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const order = await prisma.order.findUnique({
    where: { id },
    select: {
      id: true,
      orderNumber: true,
      customerId: true,
      bhataId: true,
      status: true,
      totalAmount: true,
      subtotalAmount: true,
      discountAmount: true,
      discountCode: true,
      discountLabel: true,
      paymentMethod: true,
      paymentStatus: true,
      deliveryAddress: true,
      deliveryLatitude: true,
      deliveryLongitude: true,
      truckCapacity: true,
      deliveryEstimate: true,
      notes: true,
      createdAt: true,
      updatedAt: true,
      customer: { select: { name: true, email: true, phone: true } },
      bhata: {
        select: { name: true, address: true, latitude: true, longitude: true, phone: true },
      },
      items: { include: { brickType: true } },
    },
  });

  if (!order) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  const role = session.user.role as string;
  const userId = session.user.id as string;
  if (!(await canAccessOrder(order, role, userId))) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  return NextResponse.json(order);
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const role = session.user.role as string;
  const userId = session.user.id as string;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const { status, paymentStatus } = body as { status?: unknown; paymentStatus?: unknown };

  const existing = await prisma.order.findUnique({
    where: { id: (await params).id },
    select: { id: true, customerId: true, bhataId: true, status: true },
  });

  if (!existing) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  if (!(await canAccessOrder(existing, role, userId))) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  const data: { status?: string; paymentStatus?: string } = {};

  if (status !== undefined) {
    if (typeof status !== "string" || !ALLOWED_STATUS.includes(status)) {
      return NextResponse.json({ error: "Invalid order status" }, { status: 400 });
    }

    const roleAllowed = ROLE_STATUS_RULES[role] || [];
    if (!roleAllowed.includes(status)) {
      return NextResponse.json(
        { error: "You are not allowed to set this status" },
        { status: 403 }
      );
    }

    if (status === "CANCELLED") {
      const flowIndex = STATUS_FLOW.indexOf(existing.status);
      if (existing.status === "CANCELLED") {
        return NextResponse.json({ error: "Order is already cancelled" }, { status: 400 });
      }
      // Customers can only cancel while order is still pending/confirmed.
      // Owners/admins can cancel any order that hasn't been delivered.
      if (role === "CUSTOMER" && existing.status !== "PENDING" && existing.status !== "CONFIRMED") {
        return NextResponse.json(
          { error: "This order can no longer be cancelled" },
          { status: 400 }
        );
      }
      if (existing.status === "DELIVERED" || flowIndex === -1) {
        return NextResponse.json({ error: "This order can no longer be cancelled" }, { status: 400 });
      }
    }

    data.status = status;
  }

  if (paymentStatus !== undefined) {
    if (role !== "ADMIN" && role !== "OWNER") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }
    if (typeof paymentStatus !== "string" || !ALLOWED_PAYMENT_STATUS.includes(paymentStatus)) {
      return NextResponse.json({ error: "Invalid payment status" }, { status: 400 });
    }
    data.paymentStatus = paymentStatus;
  }

  if (Object.keys(data).length === 0) {
    return NextResponse.json({ error: "No valid fields to update" }, { status: 400 });
  }

  try {
    const order = await prisma.$transaction(async (tx) => {
      const updated = await tx.order.update({
        where: { id: existing.id },
        data,
      });

      if (data.status === "DELIVERED") {
        const customer = await tx.user.findUnique({
          where: { id: existing.customerId },
          select: {
            referredById: true,
            referralRewardGranted: true,
            referrals: { select: { id: true } },
          },
        });

        if (customer?.referredById && !customer.referralRewardGranted) {
          const rewardAmount = Math.min(
            updated.subtotalAmount * DISCOUNT_RULES.REFERRER_REWARD_PERCENT,
            DISCOUNT_RULES.REFERRER_REWARD_CAP
          );

          await tx.user.update({
            where: { id: customer.referredById },
            data: { referralRewards: { increment: rewardAmount } },
          });

          await tx.user.update({
            where: { id: existing.customerId },
            data: { referralRewardGranted: true },
          });
        }
      }

      return updated;
    });

    return NextResponse.json(order);
  } catch (error) {
    console.error("Update order error:", error);
    return NextResponse.json({ error: "Failed to update order" }, { status: 500 });
  }
}
