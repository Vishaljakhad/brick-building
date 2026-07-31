import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { isValidPositiveNumber } from "@/lib/validation";
import { rateLimit, getClientIp, RATE_LIMIT_PROFILES } from "@/lib/rate-limit";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user || session.user.role !== "OWNER") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const ip = getClientIp(req);
  const limited = rateLimit(`prices-write:${session.user.id}:${ip}`, RATE_LIMIT_PROFILES.moderate);
  if (!limited.ok) {
    return NextResponse.json(
      { error: "Too many requests. Please try again later." },
      { status: 429, headers: { "Retry-After": String(limited.retryAfter) } }
    );
  }

  try {
    const { bhataId, brickTypeId, price, stock } = await req.json();

    if (typeof bhataId !== "string" || typeof brickTypeId !== "string") {
      return NextResponse.json({ error: "Invalid bhata or brick type" }, { status: 400 });
    }

    const numericPrice = Number(price);
    if (!isValidPositiveNumber(numericPrice)) {
      return NextResponse.json({ error: "Price must be a positive number" }, { status: 400 });
    }
    if (numericPrice > 1000000) {
      return NextResponse.json({ error: "Price is too large" }, { status: 400 });
    }

    let numericStock: number | null = null;
    if (stock !== undefined && stock !== null && stock !== "") {
      numericStock = Number(stock);
      if (!Number.isInteger(numericStock) || numericStock < 0) {
        return NextResponse.json({ error: "Stock must be a non-negative integer" }, { status: 400 });
      }
    }

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
        price: numericPrice,
        stock: numericStock,
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

  const ip = getClientIp(req);
  const limited = rateLimit(`prices-write:${session.user.id}:${ip}`, RATE_LIMIT_PROFILES.moderate);
  if (!limited.ok) {
    return NextResponse.json(
      { error: "Too many requests. Please try again later." },
      { status: 429, headers: { "Retry-After": String(limited.retryAfter) } }
    );
  }

  try {
    const { id, price, stock, isAvailable } = await req.json();

    const numericPrice = price !== undefined ? Number(price) : undefined;
    if (numericPrice !== undefined && !isValidPositiveNumber(numericPrice)) {
      return NextResponse.json({ error: "Price must be a positive number" }, { status: 400 });
    }
    if (numericPrice !== undefined && numericPrice > 1000000) {
      return NextResponse.json({ error: "Price is too large" }, { status: 400 });
    }

    let numericStock: number | null | undefined = undefined;
    if (stock !== undefined && stock !== null && stock !== "") {
      numericStock = Number(stock);
      if (!Number.isInteger(numericStock) || numericStock < 0) {
        return NextResponse.json({ error: "Stock must be a non-negative integer" }, { status: 400 });
      }
    } else if (stock !== undefined) {
      numericStock = null;
    }

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
        price: numericPrice,
        stock: numericStock,
        isAvailable: isAvailable !== undefined ? Boolean(isAvailable) : undefined,
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Update price error:", error);
    return NextResponse.json({ error: "Failed to update price" }, { status: 500 });
  }
}
