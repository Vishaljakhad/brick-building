"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, MapPin, Navigation, ExternalLink, Info } from "lucide-react";
import dynamic from "next/dynamic";

const MapComponent = dynamic(() => import("@/components/map-component").then((m) => m.MapComponent), {
  ssr: false,
  loading: () => <div className="h-[300px] w-full rounded-xl border border-gray-200 bg-gray-100 animate-pulse" />,
});

export default function LiveBhataDetailPage() {
  return (
    <Suspense fallback={<div className="flex min-h-[50vh] items-center justify-center" />}>
      <LiveContent />
    </Suspense>
  );
}

function LiveContent() {
  const searchParams = useSearchParams();
  const [distance, setDistance] = useState<number | null>(null);

  const name = searchParams.get("name") || "Brick Kiln";
  const address = searchParams.get("address") || "OpenStreetMap";
  const lat = parseFloat(searchParams.get("lat") || "");
  const lng = parseFloat(searchParams.get("lng") || "");

  useEffect(() => {
    if (Number.isFinite(lat) && Number.isFinite(lng) && "geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setDistance(calculateDistance(pos.coords.latitude, pos.coords.longitude, lat, lng));
        },
        () => {}
      );
    }
  }, [lat, lng]);

  if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center">
        <MapPin className="mx-auto h-16 w-16 text-gray-300" />
        <h2 className="mt-4 text-2xl font-bold text-gray-900">Kiln not found</h2>
        <p className="mt-2 text-gray-500">We couldn&apos;t find this kiln&apos;s location.</p>
        <Link href="/bhatas">
          <Button className="mt-6">
            <ArrowLeft className="h-4 w-4" /> Browse Bhatas
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      <Link
        href="/bhatas"
        className="mb-6 inline-flex items-center gap-1 text-sm text-gray-500 hover:text-green-700"
      >
        <ArrowLeft className="h-4 w-4" /> Back to Bhatas
      </Link>

      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold text-gray-900">{name}</h1>
                <Badge className="bg-green-600">Live</Badge>
              </div>
              <p className="mt-1 flex items-center gap-1 text-gray-500">
                <MapPin className="h-4 w-4" />
                {address}
              </p>
              <p className="mt-1 text-xs text-gray-400">
                {lat.toFixed(4)}, {lng.toFixed(4)}
              </p>
              <div className="mt-3 flex flex-wrap gap-3">
                {distance !== null && (
                  <Badge variant="primary" className="flex items-center gap-1">
                    <Navigation className="h-3 w-3" />
                    {distance.toFixed(1)} km away
                  </Badge>
                )}
                <Badge variant="info" className="flex items-center gap-1">
                  <ExternalLink className="h-3 w-3" />
                  OpenStreetMap
                </Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="mt-6 h-[300px] overflow-hidden rounded-xl border border-gray-200">
        <MapComponent
          markers={[{ id: "osm", name, latitude: lat, longitude: lng, address, source: "osm" }]}
          center={[lat, lng]}
          zoom={14}
        />
      </div>

      <Card className="mt-6">
        <CardContent className="p-6">
          <div className="flex items-start gap-3 rounded-lg bg-green-50 p-4">
            <Info className="mt-0.5 h-5 w-5 shrink-0 text-green-600" />
            <div>
              <h3 className="font-semibold text-gray-900">This kiln is not registered yet</h3>
              <p className="mt-1 text-sm text-gray-600">
                This brick kiln was found live on OpenStreetMap but hasn&apos;t been registered on
                BrickBuilding, so its prices and contact details aren&apos;t available yet.
              </p>
            </div>
          </div>

          <div className="mt-5 rounded-lg border border-dashed border-gray-300 p-4 text-center">
            <p className="text-sm text-gray-500">
              Own this kiln? {""}
              <Link href="/register" className="font-semibold text-green-700 hover:underline">
                Register as a brick kiln owner
              </Link>{" "}
              to list your prices and get orders from nearby customers.
            </p>
          </div>

          <a
            href={`https://www.openstreetmap.org/?mlat=${lat}&mlon=${lng}#map=15/${lat}/${lng}`}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-5 inline-flex items-center gap-1 text-sm text-green-700 hover:underline"
          >
            <ExternalLink className="h-4 w-4" /> View on OpenStreetMap
          </a>
        </CardContent>
      </Card>
    </div>
  );
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