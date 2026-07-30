"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { formatPrice, calculateDistance } from "@/lib/utils";
import dynamic from "next/dynamic";

const MapComponent = dynamic(() => import("@/components/map-component").then((m) => m.MapComponent), {
  ssr: false,
  loading: () => <div className="h-[400px] w-full rounded-xl border border-gray-200 bg-gray-100 animate-pulse" />,
});
import { motion } from "framer-motion";
import { CardSkeleton } from "@/components/ui/skeleton";
import { Search, MapPin, Truck, Navigation } from "lucide-react";

interface Bhata {
  id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  phone: string | null;
  description: string | null;
  image: string | null;
  owner: { name: string; phone: string | null };
  brickPrices: {
    id: string;
    brickType: { id: string; name: string; unit: string; basePrice: number };
    price: number;
    isAvailable: boolean;
  }[];
  _count: { orders: number };
  distance?: number;
}

export default function BhatasPage() {
  const [bhatas, setBhatas] = useState<Bhata[]>([]);
  const [search, setSearch] = useState("");
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setUserLocation([pos.coords.latitude, pos.coords.longitude]);
        },
        () => {
          setUserLocation([23.685, 90.356]);
        }
      );
    } else {
      setUserLocation([23.685, 90.356]);
    }
  }, []);

  useEffect(() => {
    if (userLocation) {
      fetchBhatas();
    }
  }, [userLocation]);

  const fetchBhatas = async () => {
    setLoading(true);
    try {
      const url = userLocation
        ? `/api/bhatas?lat=${userLocation[0]}&lng=${userLocation[1]}`
        : "/api/bhatas";
      const res = await fetch(url);
      const data = await res.json();

      const withDistance = data.map((b: Bhata) => {
        if (userLocation) {
          b.distance = calculateDistance(
            userLocation[0],
            userLocation[1],
            b.latitude,
            b.longitude
          );
        }
        return b;
      });

      setBhatas(withDistance);
    } catch (error) {
      console.error("Failed to fetch bhatas:", error);
    }
    setLoading(false);
  };

  const filtered = bhatas.filter((b) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      b.name.toLowerCase().includes(q) ||
      b.address.toLowerCase().includes(q) ||
      b.brickPrices.some((p) => p.brickType.name.toLowerCase().includes(q))
    );
  });

  const mapMarkers = filtered.map((b) => ({
    id: b.id,
    name: b.name,
    latitude: b.latitude,
    longitude: b.longitude,
    address: b.address,
    priceRange:
      b.brickPrices.length > 0
        ? `${formatPrice(Math.min(...b.brickPrices.map((p) => p.price)))} - ${formatPrice(
            Math.max(...b.brickPrices.map((p) => p.price))
          )}`
        : undefined,
  }));

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Find Nearby Bhatas</h1>
        <p className="mt-1 text-gray-600">
          Browse brick kilns near you and compare prices
        </p>
      </div>

      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
          <Input
            className="pl-10"
            placeholder="Search by kiln name, location, or brick type..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="mb-8 overflow-hidden rounded-xl border border-gray-200">
        {mapMarkers.length > 0 && (
          <MapComponent
            markers={mapMarkers}
            center={userLocation || [23.685, 90.356]}
          />
        )}
      </div>

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card>
            <CardContent className="py-16 text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", delay: 0.1 }}
              >
                <MapPin className="mx-auto h-16 w-16 text-gray-300" />
              </motion.div>
              <h3 className="mt-4 text-xl font-semibold text-gray-900">No bhatas found</h3>
              <p className="mt-2 text-gray-500">
                {search ? "Try a different search term" : "No kilns registered in your area yet"}
              </p>
            </CardContent>
          </Card>
        </motion.div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((bhata, index) => (
            <motion.div
              key={bhata.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
            >
              <Link href={`/bhatas/${bhata.id}`}>
                <Card className="h-full transition-all duration-300 hover:shadow-xl hover:border-orange-300 hover:-translate-y-1 cursor-pointer group">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 group-hover:text-orange-700 transition-colors">{bhata.name}</h3>
                        <p className="mt-1 flex items-center gap-1 text-sm text-gray-500">
                          <MapPin className="h-3.5 w-3.5" />
                          {bhata.address}
                        </p>
                      </div>
                    </div>

                    {bhata.distance !== undefined && (
                      <div className="mt-3 flex items-center gap-1 text-sm font-medium text-orange-600">
                        <Navigation className="h-4 w-4" />
                        {bhata.distance.toFixed(1)} km away
                      </div>
                    )}

                    <div className="mt-4 space-y-2">
                      {bhata.brickPrices.slice(0, 3).map((price) => (
                        <div
                          key={price.id}
                          className="flex items-center justify-between rounded-lg bg-gray-50 px-3 py-2 group-hover:bg-orange-50 transition-colors"
                        >
                          <span className="text-sm font-medium text-gray-700">
                            {price.brickType.name}
                          </span>
                          <span className="text-sm font-bold text-orange-600">
                            {formatPrice(price.price)}
                          </span>
                        </div>
                      ))}
                      {bhata.brickPrices.length > 3 && (
                        <p className="text-xs text-gray-400 text-center">
                          +{bhata.brickPrices.length - 3} more brick types
                        </p>
                      )}
                    </div>

                    <div className="mt-4 flex items-center justify-between text-xs text-gray-400">
                      <span>{bhata.owner.name}</span>
                      <span className="flex items-center gap-1">
                        <Truck className="h-3 w-3" />
                        {bhata._count.orders} orders
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
