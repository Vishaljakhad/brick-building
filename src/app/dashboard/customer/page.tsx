"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { formatPrice, cn } from "@/lib/utils";
import { ORDER_STATUS, STATUS_COLORS } from "@/lib/constants";
import toast from "react-hot-toast";
import { Package, Clock, Search, MapPin, XCircle, Loader2, AlertTriangle } from "lucide-react";

interface OrderSummary {
  id: string;
  orderNumber: string;
  status: string;
  totalAmount: number;
  paymentMethod: string;
  paymentStatus: string;
  createdAt: string;
  bhata: { name: string };
  items: { brickType: { name: string }; quantity: number }[];
}

const FILTERS = [
  { key: "ALL", label: "All Orders" },
  { key: "ACTIVE", label: "Active" },
  { key: "PENDING", label: "Pending" },
  { key: "DELIVERED", label: "Delivered" },
  { key: "CANCELLED", label: "Cancelled" },
] as const;

export default function CustomerDashboard() {
  const [orders, setOrders] = useState<OrderSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("ALL");
  const [search, setSearch] = useState("");
  const [cancelTarget, setCancelTarget] = useState<OrderSummary | null>(null);
  const [cancelling, setCancelling] = useState(false);

  const fetchOrders = async () => {
    setLoading(true);
    const res = await fetch("/api/orders");
    if (res.ok) {
      const data = await res.json();
      setOrders(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleCancel = async () => {
    if (!cancelTarget) return;
    setCancelling(true);
    try {
      const res = await fetch(`/api/orders/${cancelTarget.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "CANCELLED" }),
      });

      if (!res.ok) {
        const data = await res.json();
        toast.error(data.error || "Failed to cancel order");
        setCancelling(false);
        return;
      }

      toast.success("Order cancelled");
      setCancelTarget(null);
      fetchOrders();
    } catch {
      toast.error("Something went wrong. Please try again.");
    }
    setCancelling(false);
  };

  const filtered = useMemo(() => {
    let list = orders;
    if (filter === "ACTIVE") list = list.filter((o) => !["DELIVERED", "CANCELLED"].includes(o.status));
    else if (filter !== "ALL") list = list.filter((o) => o.status === filter);

    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (o) =>
          o.orderNumber.toLowerCase().includes(q) ||
          o.bhata.name.toLowerCase().includes(q) ||
          o.items.some((i) => i.brickType.name.toLowerCase().includes(q))
      );
    }
    return list;
  }, [orders, filter, search]);

  const stats = {
    total: orders.length,
    active: orders.filter((o) => !["DELIVERED", "CANCELLED"].includes(o.status)).length,
    delivered: orders.filter((o) => o.status === "DELIVERED").length,
    spent: orders
      .filter((o) => o.status !== "CANCELLED")
      .reduce((s, o) => s + o.totalAmount, 0),
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Orders</h1>
          <p className="text-gray-600">Track and manage your brick orders</p>
        </div>
        <Link href="/bhatas">
          <Button size="lg">
            <Search className="h-5 w-5" />
            Browse Bhatas & Order
          </Button>
        </Link>
      </div>

      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="flex items-center gap-4 p-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100">
              <Package className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Orders</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-yellow-100">
              <Clock className="h-6 w-6 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Active Orders</p>
              <p className="text-2xl font-bold text-gray-900">{stats.active}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-100">
              <MapPin className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Delivered</p>
              <p className="text-2xl font-bold text-gray-900">{stats.delivered}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-orange-100">
              <span className="text-lg font-bold text-orange-600">₹</span>
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Spent</p>
              <p className="text-2xl font-bold text-gray-900">{formatPrice(stats.spent)}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-2">
          {FILTERS.map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={cn(
                "px-4 py-2 text-sm font-medium rounded-full border transition-colors",
                filter === f.key
                  ? "bg-orange-600 text-white border-orange-600"
                  : "bg-white text-gray-600 border-gray-300 hover:border-orange-400"
              )}
            >
              {f.label}
            </button>
          ))}
        </div>
        <div className="relative sm:w-72">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input
            className="pl-9"
            placeholder="Search by order #, kiln, or brick..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="h-5 w-40 animate-pulse rounded bg-gray-200" />
                <div className="mt-3 h-4 w-full max-w-md animate-pulse rounded bg-gray-100" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Package className="mx-auto h-12 w-12 text-gray-300" />
            <h3 className="mt-4 text-lg font-medium text-gray-900">
              {search || filter !== "ALL" ? "No orders match your filters" : "No orders yet"}
            </h3>
            <p className="mt-2 text-gray-500">
              {search || filter !== "ALL"
                ? "Try a different search term or filter."
                : "Browse nearby bhatas and place your first order!"}
            </p>
            {!search && filter === "ALL" && (
              <Link href="/bhatas">
                <Button className="mt-4">
                  <Search className="h-4 w-4" />
                  Find Bhatas
                </Button>
              </Link>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filtered.map((order) => {
            const cancellable =
              order.status === "PENDING" || order.status === "CONFIRMED";
            return (
              <Card key={order.id} className="transition-shadow hover:shadow-md">
                <CardContent className="p-6">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-3">
                        <span className="font-mono text-sm font-bold text-gray-900">{order.orderNumber}</span>
                        <Badge className={STATUS_COLORS[order.status] || ""}>
                          {ORDER_STATUS[order.status as keyof typeof ORDER_STATUS] || order.status}
                        </Badge>
                        <Badge variant={order.paymentStatus === "PAID" ? "success" : "warning"}>
                          {order.paymentStatus}
                        </Badge>
                      </div>
                      <p className="mt-1 text-sm text-gray-500">
                        {order.bhata.name} &middot;{" "}
                        {order.items.map((i) => `${i.quantity}x ${i.brickType.name}`).join(", ")}
                      </p>
                      <p className="text-sm text-gray-500">
                        {formatPrice(order.totalAmount)} &middot; {order.paymentMethod}
                      </p>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <div className="text-sm text-gray-400">
                        {new Date(order.createdAt).toLocaleDateString("en-IN")}
                      </div>
                      {cancellable && (
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => setCancelTarget(order)}
                        >
                          <XCircle className="h-4 w-4" /> Cancel
                        </Button>
                      )}
                      <Link href={`/orders/${order.id}`}>
                        <Button size="sm" variant="outline">View</Button>
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <Modal open={!!cancelTarget} onClose={() => !cancelling && setCancelTarget(null)} title="Cancel Order">
        <div className="text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-100">
            <AlertTriangle className="h-7 w-7 text-red-600" />
          </div>
          <p className="mt-4 text-gray-600">
            Are you sure you want to cancel order{" "}
            <strong>{cancelTarget?.orderNumber}</strong>?
          </p>
          <p className="mt-1 text-sm text-gray-400">
            This action cannot be undone. You can only cancel orders that haven&apos;t shipped yet.
          </p>
          <div className="mt-6 flex justify-center gap-3">
            <Button variant="ghost" disabled={cancelling} onClick={() => setCancelTarget(null)}>
              Keep Order
            </Button>
            <Button variant="destructive" onClick={handleCancel} disabled={cancelling}>
              {cancelling ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <XCircle className="h-4 w-4" />
              )}
              Cancel Order
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
