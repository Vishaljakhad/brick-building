import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { DISCOUNT_RULES } from "@/lib/constants";

export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      referralCode: true,
      referralRewards: true,
      referredById: true,
      orders: { select: { status: true } },
      referrals: { select: { orders: { select: { status: true } } } },
    },
  });

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const hasFirstOrder = user.orders.some((o) => o.status !== "CANCELLED");
  const successfulReferrals = user.referrals.filter((r) =>
    r.orders.some((o) => o.status !== "CANCELLED")
  ).length;

  return NextResponse.json({
    referralCode: user.referralCode,
    referralRewards: user.referralRewards,
    referredById: user.referredById,
    isFirstOrder: !hasFirstOrder,
    successfulReferrals,
    totalReferrals: user.referrals.length,
    rules: DISCOUNT_RULES,
  });
}
