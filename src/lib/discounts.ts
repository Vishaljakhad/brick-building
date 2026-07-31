import { DISCOUNT_RULES, DISCOUNT_LABELS } from "@/lib/constants";

export interface DiscountResult {
  discountAmount: number;
  subtotalAmount: number;
  totalAmount: number;
  discountCode: string;
  discountLabel: string;
}

export function isFirstOrder(
  orders: { status: string }[],
  currentOrder?: { status: string }
): boolean {
  const all = currentOrder ? [...orders, currentOrder] : orders;
  return !all.some((o) => o.status !== "CANCELLED");
}

export function computeDiscount({
  subtotal,
  hasReferrer,
  isFirstOrder,
  referralRewards,
}: {
  subtotal: number;
  hasReferrer: boolean;
  isFirstOrder: boolean;
  referralRewards: number;
}): DiscountResult {
  if (subtotal <= 0) {
    return {
      discountAmount: 0,
      subtotalAmount: 0,
      totalAmount: 0,
      discountCode: "",
      discountLabel: "",
    };
  }

  let discountAmount = 0;
  let discountCode = "";
  let discountLabel = "";

  if (isFirstOrder) {
    const percent = hasReferrer ? DISCOUNT_RULES.REFERRAL_PERCENT : DISCOUNT_RULES.FIRST_ORDER_PERCENT;
    const cap = hasReferrer ? DISCOUNT_RULES.REFERRAL_CAP : DISCOUNT_RULES.FIRST_ORDER_CAP;
    discountAmount = Math.min(subtotal * percent, cap);
    discountCode = hasReferrer ? "REFERRAL_FIRST_ORDER" : "FIRST_ORDER";
    discountLabel = DISCOUNT_LABELS[discountCode];
  }

  const remaining = subtotal - discountAmount;
  if (referralRewards > 0 && remaining > 0) {
    const fromRewards = Math.min(referralRewards, remaining);
    discountAmount += fromRewards;
    if (discountCode) {
      discountCode = `${discountCode}+REFERRER_REWARD`;
    } else {
      discountCode = "REFERRER_REWARD";
    }
    discountLabel = discountCode.includes("+")
      ? "First order discount + Referral reward"
      : DISCOUNT_LABELS["REFERRER_REWARD"];
  }

  return {
    discountAmount: Math.round(discountAmount * 100) / 100,
    subtotalAmount: subtotal,
    totalAmount: Math.round((subtotal - discountAmount) * 100) / 100,
    discountCode,
    discountLabel,
  };
}
