"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/utils";
import { ORDER_STATUS, STATUS_COLORS } from "@/lib/constants";
import { ArrowLeft, MapPin, Package, Phone, Truck, Calendar } from "lucide-react";

interface OrderDetail {
  id: string;
  orderNumber: string;
  status: string;
  totalAmount: number;
  paymentMethod: string;
  paymentStatus: string;
  deliveryAddress: string;
  deliveryLatitude: number | null;
  deliveryLongitude: number | null;
  truckCapacity: string | null;
  notes: string | null;
  createdAt: string;
  customer: { name: string; email: string; phone: string | null };
  bhata: { name: string; address: string; latitude: number; longitude: number; phone: string | null };
  items: { brickType: { name: string; unit: string }; quantity: number; unitPrice: number }[];
}

const statusSteps = ["PENDING", "CONFIRMED", "PROCESSING", "LOADED", "SHIPPED", "DELIVERED"];

export default function OrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrder();
  }, [id]);

  const fetchOrder = async () => {
    try {
      const res = await fetch(`/api/orders/${id}`);
      if (res.ok) {
        const data = await res.json();
        setOrder(data);
      }
    } catch (error) {
      console.error("Failed to fetch order:", error);
    }
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-orange-600 border-t-transparent mx-auto" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center">
        <Package className="mx-auto h-16 w-16 text-gray-300" />
        <h2 className="mt-4 text-2xl font-bold text-gray-900">Order not found</h2>
        <Link href="/dashboard/customer">
          <Button className="mt-4">Back to Dashboard</Button>
        </Link>
      </div>
    );
  }

  const currentStep = statusSteps.indexOf(order.status);

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
      <Link
        href="/dashboard/customer"
        className="mb-6 inline-flex items-center gap-1 text-sm text-gray-500 hover:text-orange-600"
      >
        <ArrowLeft className="h-4 w-4" /> Back to Dashboard
      </Link>

      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold text-gray-900">{order.orderNumber}</h1>
                <Badge className={STATUS_COLORS[order.status] || ""}>
                  {ORDER_STATUS[order.status as keyof typeof ORDER_STATUS]}
                </Badge>
                <Badge variant={order.paymentStatus === "PAID" ? "success" : "warning"}>
                  {order.paymentStatus}
                </Badge>
              </div>
              <p className="mt-1 flex items-center gap-1 text-sm text-gray-500">
                <Calendar className="h-4 w-4" />
                Ordered on {new Date(order.createdAt).toLocaleDateString("en-IN", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-orange-600">{formatPrice(order.totalAmount)}</p>
              <p className="text-sm text-gray-500">{order.paymentMethod}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="mb-6">
        <Card>
          <CardContent className="p-6">
            <h3 className="mb-4 font-semibold text-gray-900">Order Status</h3>
            <div className="flex items-center gap-1">
              {statusSteps.map((step, i) => (
                <div key={step} className="flex items-center flex-1">
                  <div
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                      i <= currentStep
                        ? "bg-orange-600 text-white"
                        : "bg-gray-200 text-gray-400"
                    }`}
                  >
                    {i + 1}
                  </div>
                  {i < statusSteps.length - 1 && (
                    <div
                      className={`h-1 flex-1 ${
                        i < currentStep ? "bg-orange-600" : "bg-gray-200"
                      }`}
                    />
                  )}
                </div>
              ))}
            </div>
            <div className="mt-2 flex justify-between text-xs text-gray-500">
              {statusSteps.map((step) => (
                <span key={step} className="text-center w-[calc(100%/6)]">
                  {ORDER_STATUS[step as keyof typeof ORDER_STATUS]}
                </span>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Order Items</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {order.items.map((item, i) => (
                <div key={i} className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900">{item.brickType.name}</p>
                    <p className="text-sm text-gray-500">
                      {item.quantity} {item.brickType.unit} x {formatPrice(item.unitPrice)}
                    </p>
                  </div>
                  <p className="font-bold text-gray-900">
                    {formatPrice(item.quantity * item.unitPrice)}
                  </p>
                </div>
              ))}
              <hr className="border-gray-200" />
              <div className="flex items-center justify-between text-lg font-bold">
                <span>Total</span>
                <span className="text-orange-600">{formatPrice(order.totalAmount)}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Delivery Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <p className="text-sm text-gray-500 flex items-center gap-1">
                <MapPin className="h-4 w-4" /> Address
              </p>
              <p className="font-medium text-gray-900">{order.deliveryAddress}</p>
            </div>
            {order.truckCapacity && (
              <div>
                <p className="text-sm text-gray-500 flex items-center gap-1">
                  <Truck className="h-4 w-4" /> Truck
                </p>
                <p className="font-medium text-gray-900">{order.truckCapacity}</p>
              </div>
            )}
            <div>
              <p className="text-sm text-gray-500 flex items-center gap-1">
                <Package className="h-4 w-4" /> Supplier
              </p>
              <p className="font-medium text-gray-900">{order.bhata.name}</p>
              <p className="text-sm text-gray-500">{order.bhata.address}</p>
              {order.bhata.phone && (
                <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                  <Phone className="h-3 w-3" /> {order.bhata.phone}
                </p>
              )}
            </div>
            {order.notes && (
              <div>
                <p className="text-sm text-gray-500">Notes</p>
                <p className="text-gray-900">{order.notes}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
