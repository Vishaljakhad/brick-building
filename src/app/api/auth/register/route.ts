import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import prisma from "@/lib/prisma";
import {
  ALLOWED_REGISTER_ROLES,
  isValidEmail,
  isValidName,
  isValidPassword,
  normalizeEmail,
} from "@/lib/validation";
import { rateLimit } from "@/lib/rate-limit";

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

  const { name, email, phone, password, role, address } = body as {
    name?: unknown;
    email?: unknown;
    phone?: unknown;
    password?: unknown;
    role?: unknown;
    address?: unknown;
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

  try {
    const existing = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });
    if (existing) {
      return NextResponse.json({ error: "Email already registered" }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await prisma.user.create({
      data: {
        name: typeof name === "string" ? name.trim() : null,
        email: normalizedEmail,
        phone: typeof phone === "string" ? phone : null,
        password: hashedPassword,
        role: allowedRole as string,
        address: typeof address === "string" ? address : null,
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
