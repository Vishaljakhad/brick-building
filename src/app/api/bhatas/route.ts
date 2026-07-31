import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { rateLimit, getClientIp, RATE_LIMIT_PROFILES } from "@/lib/rate-limit";

export async function GET(req: Request) {
  const ip = getClientIp(req);
  const limited = rateLimit(`bhatas-list:${ip}`, RATE_LIMIT_PROFILES.relaxed);
  if (!limited.ok) {
    return NextResponse.json(
      { error: "Too many requests. Please try again later." },
      { status: 429, headers: { "Retry-After": String(limited.retryAfter) } }
    );
  }

  const { searchParams } = new URL(req.url);
  const latRaw = searchParams.get("lat");
  const lngRaw = searchParams.get("lng");
  const radiusRaw = searchParams.get("radius");

  let userLat: number | null = null;
  let userLng: number | null = null;
  let maxRadius = Infinity;

  if (latRaw || lngRaw) {
    userLat = parseFloat(latRaw || "");
    userLng = parseFloat(lngRaw || "");
    if (
      !Number.isFinite(userLat) ||
      !Number.isFinite(userLng) ||
      userLat < -90 ||
      userLat > 90 ||
      userLng < -180 ||
      userLng > 180
    ) {
      return NextResponse.json({ error: "Invalid coordinates" }, { status: 400 });
    }
  }

  if (radiusRaw) {
    maxRadius = parseFloat(radiusRaw);
    if (!Number.isFinite(maxRadius) || maxRadius <= 0 || maxRadius > 5000) {
      return NextResponse.json({ error: "Invalid radius" }, { status: 400 });
    }
  }

  try {
    const bhatas = await prisma.bhata.findMany({
      where: { isActive: true },
      include: {
        owner: { select: { name: true, phone: true } },
        brickPrices: {
          include: { brickType: true },
          where: { isAvailable: true },
        },
        _count: { select: { orders: true } },
      },
      orderBy: { name: "asc" },
    });

    let result = bhatas;

    if (userLat !== null && userLng !== null) {
      const withDistance = bhatas.map((b) => ({
        ...b,
        distance: calculateDistance(userLat!, userLng!, b.latitude, b.longitude),
      }));

      result = withDistance
        .filter((b) => b.distance <= maxRadius)
        .sort((a, b) => a.distance - b.distance);
    }

    return NextResponse.json(result, {
      headers: {
        "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
      },
    });
  } catch (error) {
    console.error("List bhatas error:", error);
    return NextResponse.json({ error: "Failed to load bhatas" }, { status: 500 });
  }
}

function calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}
