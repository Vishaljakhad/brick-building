import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const lat = searchParams.get("lat");
  const lng = searchParams.get("lng");
  const radius = searchParams.get("radius");

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

  if (lat && lng) {
    const userLat = parseFloat(lat);
    const userLng = parseFloat(lng);
    const maxRadius = radius ? parseFloat(radius) : Infinity;

    const withDistance = bhatas.map((b) => ({
      ...b,
      distance: calculateDistance(userLat, userLng, b.latitude, b.longitude),
    }));

    result = withDistance
      .filter((b) => b.distance <= maxRadius)
      .sort((a, b) => a.distance - b.distance);
  }

  return NextResponse.json(result);
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
