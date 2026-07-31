import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import prisma from "@/lib/prisma";
import {
  ALLOWED_REGISTER_ROLES,
  isValidName,
  isValidPassword,
  normalizeEmail,
} from "@/lib/validation";
import { rateLimit } from "@/lib/rate-limit";
import { generateReferralCode } from "@/lib/utils";

const REFERRAL_CODE_REGEX = /^[A-Z0-9]{3,4}-[A-Z0-9]{4}$/;

export async function POST(req: Request) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  const limited = rateLimit(`register:${ip}`, 10, 60 * 1000);
  if (!limited.ok) {
    return NextResponse.json(
      { error: "Too many attempts. Please try again later." },
      { status: 429 }
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const { name, email, phone, password, role, address, referralCode } = body as {
    name?: unknown;
    email?: unknown;
    phone?: unknown;
    password?: unknown;
    role?: unknown;
    address?: unknown;
    referralCode?: unknown;
  };

  const normalizedEmail = normalizeEmail(email);
  if (!normalizedEmail) {
    return NextResponse.json({ error: "Please enter a valid email address" }, { status: 400 });
  }

  if (!isValidPassword(password)) {
    return NextResponse.json(
      { error: "Password must be at least 8 characters" },
      { status: 400 }
    );
  }

  if (name !== undefined && name !== null && !isValidName(name)) {
    return NextResponse.json(
      { error: "Name must be at least 2 characters" },
      { status: 400 }
    );
  }

  const allowedRole = role === undefined ? "CUSTOMER" : role;
  if (
    typeof allowedRole !== "string" ||
    !ALLOWED_REGISTER_ROLES.includes(allowedRole as (typeof ALLOWED_REGISTER_ROLES)[number])
  ) {
    return NextResponse.json(
      { error: "Role must be CUSTOMER or OWNER" },
      { status: 400 }
    );
  }

  if (phone !== undefined && phone !== null && typeof phone !== "string") {
    return NextResponse.json({ error: "Invalid phone number" }, { status: 400 });
  }

  const normalizedReferralCode =
    typeof referralCode === "string" && referralCode.trim()
      ? referralCode.trim().toUpperCase()
      : null;
  if (normalizedReferralCode && !REFERRAL_CODE_REGEX.test(normalizedReferralCode)) {
    return NextResponse.json({ error: "Invalid referral code" }, { status: 400 });
  }

  try {
    const existing = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });
    if (existing) {
      return NextResponse.json({ error: "Email already registered" }, { status: 400 });
    }

    let referredById: string | null = null;
    if (normalizedReferralCode) {
      const referrer = await prisma.user.findUnique({
        where: { referralCode: normalizedReferralCode },
        select: { id: true, email: true },
      });
      if (!referrer) {
        return NextResponse.json({ error: "Referral code not found" }, { status: 400 });
      }
      if (referrer.email === normalizedEmail) {
        return NextResponse.json(
          { error: "You cannot use your own referral code" },
          { status: 400 }
        );
      }
      referredById = referrer.id;
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const nameSeed = typeof name === "string" ? name : "BBRICK";
    let referralCode = generateReferralCode(nameSeed);
    for (let attempt = 0; attempt < 5; attempt++) {
      const taken = await prisma.user.findUnique({
        where: { referralCode },
        select: { id: true },
      });
      if (!taken) break;
      referralCode = generateReferralCode(`${nameSeed}${attempt}`);
    }

    const user = await prisma.user.create({
      data: {
        name: typeof name === "string" ? name.trim() : null,
        email: normalizedEmail,
        phone: typeof phone === "string" ? phone : null,
        password: hashedPassword,
        role: allowedRole as string,
        address: typeof address === "string" ? address : null,
        referralCode,
        referredById,
      },
    });

    return NextResponse.json(
      { message: "Account created successfully", userId: user.id },
      { status: 201 }
    );
  } catch (error: unknown) {
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      (error as { code: string }).code === "P2002"
    ) {
      return NextResponse.json({ error: "Email already registered" }, { status: 400 });
    }
    console.error("Registration error:", error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
