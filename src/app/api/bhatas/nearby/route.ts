import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { rateLimit, getClientIp, RATE_LIMIT_PROFILES } from "@/lib/rate-limit";

export const maxDuration = 60;

const OVERPASS_ENDPOINTS = [
  "https://z.overpass-api.de/api/interpreter",
  "https://maps.mail.ru/osm/tools/overpass/api/interpreter",
  "https://overpass-api.de/api/interpreter",
  "https://overpass.private.coffee/api/interpreter",
];

const MAX_RADIUS = 150;
const CACHE_TTL_MS = 7 * 24 * 60 * 60 * 1000;
const GRID_SIZE = 0.5;
const RADIUS_BUCKET = 150;

interface OsmElement {
  type: "node" | "way" | "relation";
  id: number;
  lat?: number;
  lon?: number;
  center?: { lat: number; lon: number };
  tags?: Record<string, string>;
}

interface LiveBhata {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  address: string;
  source: "osm";
  distance?: number;
}

export async function GET(req: Request) {
  const ip = getClientIp(req);
  const limited = rateLimit(`bhatas-nearby:${ip}`, RATE_LIMIT_PROFILES.relaxed);
  if (!limited.ok) {
    return NextResponse.json(
      { error: "Too many requests. Please try again later." },
      { status: 429, headers: { "Retry-After": String(limited.retryAfter) } }
    );
  }

  const { searchParams } = new URL(req.url);
  const lat = parseFloat(searchParams.get("lat") || "");
  const lng = parseFloat(searchParams.get("lng") || "");
  const radius = parseFloat(searchParams.get("radius") || "50");

  if (
    !Number.isFinite(lat) ||
    !Number.isFinite(lng) ||
    lat < -90 ||
    lat > 90 ||
    lng < -180 ||
    lng > 180
  ) {
    return NextResponse.json({ error: "Invalid coordinates" }, { status: 400 });
  }
  if (!Number.isFinite(radius) || radius <= 0 || radius > 5000) {
    return NextResponse.json({ error: "Invalid radius" }, { status: 400 });
  }

  const cacheKey = `${grid(lat)},${grid(lng)},${RADIUS_BUCKET}`;
  const stale = await prisma.liveKilnCache.findUnique({ where: { cacheKey } });

  if (stale && Date.now() - new Date(stale.fetchedAt).getTime() < CACHE_TTL_MS) {
    const data = (stale.data as unknown) as LiveBhata[];
    return NextResponse.json(filterByRadius(data, lat, lng, radius), {
      headers: { "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400" },
    });
  }

  const dLat = RADIUS_BUCKET / 111;
  const dLng = RADIUS_BUCKET / (111 * Math.max(0.3, Math.cos((lat * Math.PI) / 180)));
  const bbox = `${lat - dLat},${lng - dLng},${lat + dLat},${lng + dLng}`;

  const query = `[out:json][timeout:25];(` +
    `node["industrial"="brickyard"](${bbox});` +
    `way["industrial"="brickyard"](${bbox});` +
    `node["industrial"="brick_kiln"](${bbox});` +
    `way["industrial"="brick_kiln"](${bbox});` +
    `node["craft"="brickmaker"](${bbox});` +
    `way["craft"="brickmaker"](${bbox});` +
    `);out center tags;`;

  let elements: OsmElement[] = [];
  let lastError: string | null = null;

  for (const endpoint of OVERPASS_ENDPOINTS) {
    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          "User-Agent": "BrickBuilding/1.0 (https://brick-building.vercel.app)",
        },
        body: new URLSearchParams({ data: query }),
        cache: "no-store",
        signal: AbortSignal.timeout(20000),
      });
      if (!res.ok) {
        lastError = `Overpass ${endpoint} HTTP ${res.status}`;
        await new Promise((r) => setTimeout(r, 1500));
        continue;
      }
      const json = (await res.json()) as { elements?: OsmElement[] };
      elements = json.elements || [];
      break;
    } catch (error) {
      lastError = `Overpass ${endpoint}: ${error instanceof Error ? error.message : String(error)}`;
      await new Promise((r) => setTimeout(r, 1500));
    }
  }

  if (elements.length === 0) {
    console.error("Nearby bhatas: no results", { lastError, lat, lng, radius });
    if (stale) {
      const data = (stale.data as unknown) as LiveBhata[];
      return NextResponse.json(filterByRadius(data, lat, lng, radius), {
        headers: { "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400" },
      });
    }
  }

  const results: LiveBhata[] = [];
  const seen = new Set<string>();

  for (const el of elements) {
    const elLat = el.lat ?? el.center?.lat;
    const elLng = el.lon ?? el.center?.lon;
    if (typeof elLat !== "number" || typeof elLng !== "number") continue;
    if (!el.tags) continue;

    const kind = el.tags.industrial || el.tags.craft || el.tags.man_made || "brickyard";
    const name =
      el.tags.name ||
      el.tags["name:en"] ||
      (kind === "kiln" ? "Brick Kiln" : "Brick Factory");

    const dedupeKey = `${elLat.toFixed(4)},${elLng.toFixed(4)}`;
    if (seen.has(dedupeKey)) continue;
    seen.add(dedupeKey);

    results.push({
      id: `osm-${el.type}-${el.id}`,
      name,
      latitude: elLat,
      longitude: elLng,
      address: [el.tags["addr:street"], el.tags["addr:city"]]
        .filter(Boolean)
        .join(", ") || "OpenStreetMap",
      source: "osm",
      distance: calculateDistance(lat, lng, elLat, elLng),
    });
  }

  results.sort((a, b) => (a.distance || 0) - (b.distance || 0));

  if (results.length > 0) {
    await prisma.liveKilnCache.upsert({
      where: { cacheKey },
      update: { data: results as unknown as object, fetchedAt: new Date() },
      create: { cacheKey, data: results as unknown as object },
    });
  }

  return NextResponse.json(filterByRadius(results, lat, lng, radius), {
    headers: { "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400" },
  });
}

function grid(v: number): string {
  return (Math.round(v / GRID_SIZE) * GRID_SIZE).toFixed(1);
}

function filterByRadius(data: LiveBhata[], lat: number, lng: number, radius: number): LiveBhata[] {
  return data
    .map((b) => ({ ...b, distance: calculateDistance(lat, lng, b.latitude, b.longitude) }))
    .filter((b) => b.distance <= radius)
    .sort((a, b) => (a.distance || 0) - (b.distance || 0));
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
