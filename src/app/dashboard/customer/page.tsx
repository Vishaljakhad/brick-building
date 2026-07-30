"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatPrice } from "@/lib/utils";
import { ORDER_STATUS, STATUS_COLORS } from "@/lib/constants";
import { Package, Clock, Search, MapPin } from "lucide-react";

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

export default function CustomerDashboard() {
  const { data: session } = useSession();
  const [orders, setOrders] = useState<OrderSummary[]>([]);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    const res = await fetch("/api/orders");
    if (res.ok) {
      const data = await res.json();
      setOrders(data);
    }
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

      <div className="mb-8 grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="flex items-center gap-4 p-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100">
              <Package className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Orders</p>
              <p className="text-2xl font-bold text-gray-900">{orders.length}</p>
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
              <p className="text-2xl font-bold text-gray-900">
                {orders.filter((o) => !["DELIVERED", "CANCELLED"].includes(o.status)).length}
              </p>
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
              <p className="text-2xl font-bold text-gray-900">
                {orders.filter((o) => o.status === "DELIVERED").length}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        {orders.map((order) => (
          <Link key={order.id} href={`/orders/${order.id}`}>
            <Card className="transition-shadow hover:shadow-md cursor-pointer">
              <CardContent className="p-6">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <div className="flex items-center gap-3">
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
                  <div className="text-sm text-gray-400">
                    {new Date(order.createdAt).toLocaleDateString("en-IN")}
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
        {orders.length === 0 && (
          <Card>
            <CardContent className="py-12 text-center">
              <Package className="mx-auto h-12 w-12 text-gray-300" />
              <h3 className="mt-4 text-lg font-medium text-gray-900">No orders yet</h3>
              <p className="mt-2 text-gray-500">Browse nearby bhatas and place your first order!</p>
              <Link href="/bhatas">
                <Button className="mt-4">
                  <Search className="h-4 w-4" />
                  Find Bhatas
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
