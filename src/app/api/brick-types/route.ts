import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { rateLimit, getClientIp, RATE_LIMIT_PROFILES } from "@/lib/rate-limit";

export async function GET(req: Request) {
  const ip = getClientIp(req);
  const limited = rateLimit(`brick-types-list:${ip}`, RATE_LIMIT_PROFILES.relaxed);
  if (!limited.ok) {
    return NextResponse.json(
      { error: "Too many requests. Please try again later." },
      { status: 429, headers: { "Retry-After": String(limited.retryAfter) } }
    );
  }

  try {
    const types = await prisma.brickType.findMany({
      orderBy: { name: "asc" },
    });
    return NextResponse.json(types, {
      headers: {
        "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
      },
    });
  } catch (error) {
    console.error("List brick types error:", error);
    return NextResponse.json({ error: "Failed to load brick types" }, { status: 500 });
  }
}

function validateBody(body: Record<string, unknown>) {
  const errors: string[] = [];
  if (typeof body.name !== "string" || body.name.trim().length < 2) {
    errors.push("Brick type name must be at least 2 characters");
  }
  if (typeof body.name === "string" && body.name.length > 100) {
    errors.push("Brick type name is too long");
  }
  if (body.description !== undefined && typeof body.description !== "string") {
    errors.push("Description must be a string");
  } else if (typeof body.description === "string" && body.description.length > 2000) {
    errors.push("Description is too long");
  }
  if (body.image !== undefined && typeof body.image !== "string") {
    errors.push("Image must be a URL string");
  } else if (typeof body.image === "string" && body.image.length > 500) {
    errors.push("Image URL is too long");
  }
  if (body.unit !== undefined && (typeof body.unit !== "string" || body.unit.trim().length === 0)) {
    errors.push("Unit must be a non-empty string");
  }
  const price = body.basePrice !== undefined ? Number(body.basePrice) : undefined;
  if (price === undefined || !Number.isFinite(price) || price <= 0) {
    errors.push("Base price must be a positive number");
  }
  return { errors, price };
}

export async function POST(req: Request) {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { errors, price } = validateBody(body);
    if (errors.length > 0) {
      return NextResponse.json({ error: errors[0] }, { status: 400 });
    }

    const type = await prisma.brickType.create({
      data: {
        name: body.name.trim(),
        description: typeof body.description === "string" ? body.description : null,
        unit: typeof body.unit === "string" ? body.unit.trim() : "pieces",
        basePrice: price as number,
        image: typeof body.image === "string" ? body.image : null,
      },
    });
    return NextResponse.json(type, { status: 201 });
  } catch (error) {
    console.error("Create brick type error:", error);
    return NextResponse.json({ error: "Failed to create brick type" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    if (typeof body.id !== "string") {
      return NextResponse.json({ error: "Brick type id is required" }, { status: 400 });
    }
    const { errors, price } = validateBody(body);
    if (errors.length > 0) {
      return NextResponse.json({ error: errors[0] }, { status: 400 });
    }

    const existing = await prisma.brickType.findUnique({ where: { id: body.id } });
    if (!existing) {
      return NextResponse.json({ error: "Brick type not found" }, { status: 404 });
    }

    const type = await prisma.brickType.update({
      where: { id: body.id },
      data: {
        name: body.name.trim(),
        description: typeof body.description === "string" ? body.description : null,
        unit: typeof body.unit === "string" ? body.unit.trim() : "pieces",
        basePrice: price as number,
        image: typeof body.image === "string" ? body.image : null,
      },
    });
    return NextResponse.json(type);
  } catch (error) {
    console.error("Update brick type error:", error);
    return NextResponse.json({ error: "Failed to update brick type" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await req.json();
    if (typeof id !== "string") {
      return NextResponse.json({ error: "Brick type id is required" }, { status: 400 });
    }
    await prisma.brickType.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete brick type error:", error);
    return NextResponse.json({ error: "Failed to delete brick type" }, { status: 500 });
  }
}
