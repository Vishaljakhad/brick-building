import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { rateLimit, getClientIp, RATE_LIMIT_PROFILES } from "@/lib/rate-limit";

export async function GET() {
  const session = await auth();
  if (!session?.user || session.user.role !== "OWNER") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const limited = rateLimit(`my-bhata:${session.user.id}`, RATE_LIMIT_PROFILES.relaxed);
  if (!limited.ok) {
    return NextResponse.json(
      { error: "Too many requests. Please try again later." },
      { status: 429, headers: { "Retry-After": String(limited.retryAfter) } }
    );
  }

  try {
    const bhata = await prisma.bhata.findFirst({
      where: { ownerId: session.user.id },
      include: {
        brickPrices: {
          include: { brickType: true },
          orderBy: { brickType: { name: "asc" } },
        },
      },
    });

    if (!bhata) {
      return NextResponse.json(null);
    }

    return NextResponse.json(bhata);
  } catch (error) {
    console.error("Get my bhata error:", error);
    return NextResponse.json({ error: "Failed to load bhata" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user || session.user.role !== "OWNER") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const ip = getClientIp(req);
  const limited = rateLimit(`my-bhata-write:${session.user.id}:${ip}`, RATE_LIMIT_PROFILES.moderate);
  if (!limited.ok) {
    return NextResponse.json(
      { error: "Too many requests. Please try again later." },
      { status: 429, headers: { "Retry-After": String(limited.retryAfter) } }
    );
  }

  try {
    const { name, address, phone, description } = await req.json();

    if (typeof name !== "string" || name.trim().length < 2) {
      return NextResponse.json(
        { error: "Bhata name must be at least 2 characters" },
        { status: 400 }
      );
    }
    if (name.length > 100) {
      return NextResponse.json({ error: "Bhata name is too long" }, { status: 400 });
    }
    if (typeof address !== "string" || address.trim().length < 5) {
      return NextResponse.json({ error: "Please enter a valid address" }, { status: 400 });
    }
    if (address.length > 500) {
      return NextResponse.json({ error: "Address is too long" }, { status: 400 });
    }
    if (typeof phone === "string" && phone.length > 30) {
      return NextResponse.json({ error: "Phone number is too long" }, { status: 400 });
    }
    if (typeof description === "string" && description.length > 2000) {
      return NextResponse.json({ error: "Description is too long" }, { status: 400 });
    }

    const existing = await prisma.bhata.findFirst({
      where: { ownerId: session.user.id },
    });

    if (existing) {
      return NextResponse.json({ error: "You already have a registered bhata" }, { status: 400 });
    }

    const bhata = await prisma.bhata.create({
      data: {
        name: name.trim(),
        address: address.trim(),
        phone: typeof phone === "string" ? phone : null,
        description: typeof description === "string" ? description : null,
        latitude: 23.685, // Default center of Bangladesh/India
        longitude: 90.356,
        ownerId: session.user.id,
      },
    });

    return NextResponse.json(bhata, { status: 201 });
  } catch (error) {
    console.error("Create bhata error:", error);
    return NextResponse.json({ error: "Failed to create bhata" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  const session = await auth();
  if (!session?.user || session.user.role !== "OWNER") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const ip = getClientIp(req);
  const limited = rateLimit(`my-bhata-write:${session.user.id}:${ip}`, RATE_LIMIT_PROFILES.moderate);
  if (!limited.ok) {
    return NextResponse.json(
      { error: "Too many requests. Please try again later." },
      { status: 429, headers: { "Retry-After": String(limited.retryAfter) } }
    );
  }

  try {
    const { name, address, phone, description } = await req.json();

    if (name !== undefined && (typeof name !== "string" || name.trim().length < 2)) {
      return NextResponse.json(
        { error: "Bhata name must be at least 2 characters" },
        { status: 400 }
      );
    }
    if (name !== undefined && name.length > 100) {
      return NextResponse.json({ error: "Bhata name is too long" }, { status: 400 });
    }
    if (address !== undefined && (typeof address !== "string" || address.trim().length < 5)) {
      return NextResponse.json({ error: "Please enter a valid address" }, { status: 400 });
    }
    if (address !== undefined && address.length > 500) {
      return NextResponse.json({ error: "Address is too long" }, { status: 400 });
    }
    if (typeof phone === "string" && phone.length > 30) {
      return NextResponse.json({ error: "Phone number is too long" }, { status: 400 });
    }
    if (typeof description === "string" && description.length > 2000) {
      return NextResponse.json({ error: "Description is too long" }, { status: 400 });
    }

    const existing = await prisma.bhata.findFirst({
      where: { ownerId: session.user.id },
    });

    if (!existing) {
      return NextResponse.json({ error: "Bhata not found" }, { status: 404 });
    }

    const bhata = await prisma.bhata.update({
      where: { id: existing.id },
      data: {
        name: typeof name === "string" ? name.trim() : undefined,
        address: typeof address === "string" ? address.trim() : undefined,
        phone: typeof phone === "string" ? phone : undefined,
        description: typeof description === "string" ? description : undefined,
      },
    });

    return NextResponse.json(bhata);
  } catch (error) {
    console.error("Update bhata error:", error);
    return NextResponse.json({ error: "Failed to update bhata" }, { status: 500 });
  }
}
