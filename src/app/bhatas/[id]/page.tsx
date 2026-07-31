"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { AlertBanner } from "@/components/ui/alert";
import { formatPrice, calculateDistance } from "@/lib/utils";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import dynamic from "next/dynamic";

const MapComponent = dynamic(() => import("@/components/map-component").then((m) => m.MapComponent), {
  ssr: false,
  loading: () => <div className="h-[300px] w-full rounded-xl border border-gray-200 bg-gray-100 animate-pulse" />,
});
import { TRUCK_TYPES } from "@/lib/constants";
import { computeDiscount } from "@/lib/discounts";
import {
  ArrowLeft,
  MapPin,
  Phone,
  Navigation,
  Truck,
  Package,
  ShoppingCart,
  Check,
  Loader2,
} from "lucide-react";
import Link from "next/link";

interface BhataDetail {
  id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  phone: string | null;
  description: string | null;
  owner: { name: string; phone: string | null };
  brickPrices: {
    id: string;
    brickType: { id: string; name: string; unit: string; basePrice: number };
    price: number;
    stock: number | null;
    isAvailable: boolean;
  }[];
}

export default function BhataDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { data: session } = useSession();

  const [bhata, setBhata] = useState<BhataDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [distance, setDistance] = useState<number | null>(null);

  // Order form
  const [orderItems, setOrderItems] = useState<Record<string, number>>({});
  const [quantityErrors, setQuantityErrors] = useState<Record<string, string>>({});
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [deliverToCurrent, setDeliverToCurrent] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("COD");
  const [selectedTruck, setSelectedTruck] = useState("");
  const [notes, setNotes] = useState("");
  const [ordering, setOrdering] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [error, setError] = useState("");
  const [addressError, setAddressError] = useState("");
  const [referralInfo, setReferralInfo] = useState<{
    isFirstOrder: boolean;
    referredById: string | null;
    referralRewards: number;
  } | null>(null);

  const fetchReferralInfo = async () => {
    try {
      const res = await fetch("/api/referral");
      if (res.ok) {
        const data = await res.json();
        setReferralInfo({
          isFirstOrder: data.isFirstOrder,
          referredById: data.referredById,
          referralRewards: data.referralRewards,
        });
      }
    } catch {}
  };

  const fetchBhata = async () => {
    try {
      const res = await fetch(`/api/bhatas`);
      const bhatas = await res.json();
      const found = bhatas.find((b: { id: string }) => b.id === id);
      setBhata(found || null);
    } catch (error) {
      console.error("Failed to fetch bhata:", error);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchBhata();
    fetchReferralInfo();

    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setUserLocation([pos.coords.latitude, pos.coords.longitude]),
        () => {}
      );
    }
  }, [id]);

  useEffect(() => {
    if (bhata && userLocation) {
      setDistance(
        calculateDistance(
          userLocation[0],
          userLocation[1],
          bhata.latitude,
          bhata.longitude
        )
      );
    }
  }, [bhata, userLocation]);

  const availableBricks = bhata?.brickPrices.filter((bp) => bp.isAvailable) || [];

  const totalQuantity = Object.values(orderItems).reduce((sum, qty) => sum + qty, 0);
  const totalPrice = Object.entries(orderItems).reduce((sum, [priceId, qty]) => {
    const bp = availableBricks.find((b) => b.id === priceId);
    return sum + (bp ? bp.price * qty : 0);
  }, 0);

  const discount = computeDiscount({
    subtotal: totalPrice,
    hasReferrer: !!referralInfo?.referredById,
    isFirstOrder: !!referralInfo?.isFirstOrder,
    referralRewards: referralInfo?.referralRewards ?? 0,
  });
  const discountEligible = totalPrice > 0 && discount.discountAmount > 0;

  const truckCapacity = TRUCK_TYPES.find((t) => t.name === selectedTruck);
  const exceedsCapacity = truckCapacity ? totalQuantity > truckCapacity.capacity : false;

  const handleQuantityChange = (priceId: string, value: string) => {
    const bp = availableBricks.find((b) => b.id === priceId);
    const num = parseInt(value);

    setOrderItems((prev) => {
      const next = { ...prev };
      if (value === "" || Number.isNaN(num) || num <= 0) {
        delete next[priceId];
      } else {
        next[priceId] = num;
      }
      return next;
    });

    if (value === "" || Number.isNaN(num) || num <= 0) {
      setQuantityErrors((prev) => {
        const next = { ...prev };
        delete next[priceId];
        return next;
      });
    } else if (bp?.stock !== null && bp?.stock !== undefined && num > bp.stock) {
      setQuantityErrors((prev) => ({
        ...prev,
        [priceId]: `Only ${bp.stock} in stock`,
      }));
    } else {
      setQuantityErrors((prev) => {
        const next = { ...prev };
        delete next[priceId];
        return next;
      });
    }
  };

  const handleOrder = async () => {
    if (!session?.user) {
      toast.error("Please sign in to place an order");
      router.push("/login");
      return;
    }

    const entries = Object.entries(orderItems).filter(([, qty]) => qty > 0);

    if (entries.length === 0) {
      toast.error("Please add at least one brick type to your order");
      return;
    }

    let valid = true;
    const nextErrors: Record<string, string> = {};
    for (const [priceId, qty] of entries) {
      const bp = availableBricks.find((b) => b.id === priceId);
      if (bp?.stock !== null && bp?.stock !== undefined && qty > bp.stock) {
        nextErrors[priceId] = `Only ${bp.stock} in stock`;
        valid = false;
      }
    }    setQuantityErrors(nextErrors);

    const trimmedAddress = deliveryAddress.trim();
    if (!deliverToCurrent && trimmedAddress.length < 10) {
      setAddressError("Please provide a valid delivery address (min 10 characters)");
      valid = false;
    } else {
      setAddressError("");
    }

    if (!valid) {
      toast.error("Please fix the highlighted fields");
      return;
    }

    setOrdering(true);
    setError("");

    try {
      const items = entries.map(([priceId, qty]) => {
        const bp = availableBricks.find((b) => b.id === priceId);
        return { brickTypeId: bp!.brickType.id, quantity: qty };
      });

      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bhataId: id,
          items,
          deliveryAddress: deliverToCurrent ? "Deliver to my location" : trimmedAddress,
          deliveryLatitude: userLocation?.[0],
          deliveryLongitude: userLocation?.[1],
          paymentMethod,
          truckCapacity: selectedTruck,
          notes,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Failed to place order");
        toast.error(data.error || "Failed to place order");
        setOrdering(false);
        return;
      }

      toast.success("Order placed successfully!");
      setOrderSuccess(true);
    } catch {
      setError("Something went wrong. Please try again.");
      toast.error("Something went wrong. Please try again.");
      setOrdering(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-orange-600" />
      </div>
    );
  }

  if (!bhata) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center">
        <Package className="mx-auto h-16 w-16 text-gray-300" />
        <h2 className="mt-4 text-2xl font-bold text-gray-900">Bhata not found</h2>
        <p className="mt-2 text-gray-500">This brick kiln might not exist or has been removed.</p>
        <Link href="/bhatas">
          <Button className="mt-6">
            <ArrowLeft className="h-4 w-4" /> Browse Bhatas
          </Button>
        </Link>
      </div>
    );
  }

  if (orderSuccess) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-center">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", delay: 0.1 }}
          className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-green-100"
        >
          <motion.div
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <Check className="h-10 w-10 text-green-600" />
          </motion.div>
        </motion.div>
        <motion.h2
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-6 text-2xl font-bold text-gray-900"
        >
          Order Placed! 🎉
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-2 text-gray-600"
        >
          Your order from <strong>{bhata.name}</strong> has been placed successfully.
          The kiln owner will confirm your order shortly.
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-8 flex justify-center gap-4"
        >
          <Link href="/dashboard/customer">
            <Button className="bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-700 hover:to-orange-600 shadow-lg">View My Orders</Button>
          </Link>
          <Link href="/bhatas">
            <Button variant="outline">Order More</Button>
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <Link
        href="/bhatas"
        className="mb-6 inline-flex items-center gap-1 text-sm text-gray-500 hover:text-orange-600"
      >
        <ArrowLeft className="h-4 w-4" /> Back to Bhatas
      </Link>

      <div className="grid gap-8 lg:grid-cols-5">
        <div className="lg:col-span-3 space-y-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">{bhata.name}</h1>
                  <p className="mt-1 flex items-center gap-1 text-gray-500">
                    <MapPin className="h-4 w-4" />
                    {bhata.address}
                  </p>
                  <div className="mt-3 flex flex-wrap gap-3">
                    {distance !== null && (
                      <Badge variant="primary" className="flex items-center gap-1">
                        <Navigation className="h-3 w-3" />
                        {distance.toFixed(1)} km away
                      </Badge>
                    )}
                    {bhata.phone && (
                      <Badge variant="info" className="flex items-center gap-1">
                        <Phone className="h-3 w-3" />
                        {bhata.phone}
                      </Badge>
                    )}
                    <Badge variant="success" className="flex items-center gap-1">
                      <Package className="h-3 w-3" />
                      {availableBricks.length} brick types
                    </Badge>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-500">Kiln Owner</p>
                  <p className="font-medium text-gray-900">{bhata.owner.name}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="h-[300px] overflow-hidden rounded-xl border border-gray-200">
            <MapComponent
              markers={[
                {
                  id: bhata.id,
                  name: bhata.name,
                  latitude: bhata.latitude,
                  longitude: bhata.longitude,
                  address: bhata.address,
                },
              ]}
              center={[bhata.latitude, bhata.longitude]}
              zoom={14}
            />
          </div>

          {bhata.description && (
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold text-gray-900">About</h3>
                <p className="mt-1 text-gray-600">{bhata.description}</p>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle>Available Bricks & Prices</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {availableBricks.map((bp) => (
                  <div
                    key={bp.id}
                    className="flex items-center justify-between rounded-lg border border-gray-100 bg-white p-4"
                  >
                    <div>
                      <h4 className="font-medium text-gray-900">{bp.brickType.name}</h4>
                      <p className="text-sm text-gray-500">
                        Base price: {formatPrice(bp.brickType.basePrice)} / {bp.brickType.unit}
                      </p>
                      {bp.stock !== null && (
                        <p className="text-xs text-gray-400">Stock: {bp.stock} {bp.brickType.unit}</p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-orange-600">{formatPrice(bp.price)}</p>
                      <p className="text-xs text-gray-400">per {bp.brickType.unit}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2">
          <div className="sticky top-24">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ShoppingCart className="h-5 w-5" />
                  Place Order
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="mb-2 text-sm font-medium text-gray-700">Select Quantities</h4>
                  {availableBricks.map((bp) => (
                    <div key={bp.id} className="mb-3">
                      <div className="flex items-center justify-between gap-3">
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-gray-900 truncate">{bp.brickType.name}</p>
                          <p className="text-xs text-orange-600">{formatPrice(bp.price)} each</p>
                        </div>
                        <Input
                          type="number"
                          min="0"
                          placeholder="Qty"
                          className="w-24 text-center"
                          value={orderItems[bp.id] || ""}
                          onChange={(e) => handleQuantityChange(bp.id, e.target.value)}
                          error={!!quantityErrors[bp.id]}
                        />
                      </div>
                      {quantityErrors[bp.id] && (
                        <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                          <span className="inline-block h-1.5 w-1.5 rounded-full bg-red-500 shrink-0" />
                          {quantityErrors[bp.id]}
                        </p>
                      )}
                    </div>
                  ))}
                  {availableBricks.length === 0 && (
                    <p className="text-sm text-gray-400">No bricks available at this time</p>
                  )}
                </div>

                {totalQuantity > 0 && (
                  <>
                    {discountEligible && (
                      <AlertBanner
                        variant="success"
                        title={`${discount.discountLabel} applied`}
                        message={`You save ${formatPrice(discount.discountAmount)} on this order.`}
                      />
                    )}
                    <div className="rounded-lg bg-orange-50 p-3">
                      <p className="flex justify-between text-sm">
                        <span>Total Quantity:</span>
                        <span className="font-bold">{totalQuantity} pieces</span>
                      </p>
                      <p className="flex justify-between text-sm">
                        <span>Subtotal:</span>
                        <span>{formatPrice(discount.subtotalAmount)}</span>
                      </p>
                      {discount.discountAmount > 0 && (
                        <p className="flex justify-between text-sm text-green-600">
                          <span>{discount.discountLabel}:</span>
                          <span>-{formatPrice(discount.discountAmount)}</span>
                        </p>
                      )}
                      <p className="flex justify-between text-lg font-bold text-orange-600 border-t border-orange-200 pt-1 mt-1">
                        <span>Total Amount:</span>
                        <span>{formatPrice(discount.totalAmount)}</span>
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Truck Capacity (optional)
                      </label>
                      <Select value={selectedTruck} onChange={(e) => setSelectedTruck(e.target.value)}>
                        <option value="">Select truck type</option>
                        {TRUCK_TYPES.map((t) => (
                          <option key={t.name} value={t.name}>
                            {t.name} - {t.label}
                          </option>
                        ))}
                      </Select>
                      {selectedTruck && (
                        <div className="mt-2">
                          {exceedsCapacity ? (
                            <p className="text-sm text-red-600 flex items-center gap-1">
                              <Truck className="h-4 w-4" />
                              Exceeds {truckCapacity!.name} capacity ({truckCapacity!.label})
                            </p>
                          ) : (
                            <p className="text-sm text-green-600 flex items-center gap-1">
                              <Truck className="h-4 w-4" />
                              Fits in {truckCapacity!.name} ({truckCapacity!.label})
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  </>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Delivery Address <span className="text-red-500">*</span>
                  </label>
                  {userLocation && (
                    <label className="mb-2 flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={deliverToCurrent}
                        onChange={(e) => {
                          setDeliverToCurrent(e.target.checked);
                          setAddressError("");
                        }}
                        className="rounded border-gray-300"
                      />
                      Deliver to my current location
                    </label>
                  )}
                  {!deliverToCurrent && (
                    <Input
                      placeholder="Enter full delivery address (min 10 characters)"
                      value={deliveryAddress}
                      onChange={(e) => {
                        setDeliveryAddress(e.target.value);
                        if (addressError) setAddressError("");
                      }}
                      error={!!addressError}
                    />
                  )}
                  {addressError && <p className="mt-1 text-xs text-red-600">{addressError}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Payment Method
                  </label>
                  <Select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)}>
                    <option value="COD">Cash on Delivery</option>
                    <option value="ONLINE">Online Payment (UPI/Card)</option>
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Notes (optional)
                  </label>
                  <Textarea
                    placeholder="Any special instructions..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                  />
                </div>

                {error && (
                  <AlertBanner
                    variant="error"
                    message={error}
                    onClose={() => setError("")}
                  />
                )}

                <Button
                  className="w-full"
                  size="lg"
                  onClick={handleOrder}
                  disabled={ordering || totalQuantity === 0}
                >
                  {ordering ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" /> Placing Order...
                    </>
                  ) : !session ? (
                    "Sign In to Order"
                  ) : (
                    <>
                      <ShoppingCart className="h-5 w-5" /> Place Order - {formatPrice(discount.totalAmount)}
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
