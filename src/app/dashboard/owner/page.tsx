"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select } from "@/components/ui/select";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { formatPrice, cn } from "@/lib/utils";
import { ORDER_STATUS, STATUS_COLORS } from "@/lib/constants";
import {
  Factory,
  Package,
  DollarSign,
  Plus,
  Settings,
  Truck,
  Check,
  X,
} from "lucide-react";

interface BhataInfo {
  id: string;
  name: string;
  address: string;
  phone: string | null;
  description: string | null;
  isActive: boolean;
  brickPrices: {
    id: string;
    brickType: { id: string; name: string; unit: string; basePrice: number };
    price: number;
    stock: number | null;
    isAvailable: boolean;
  }[];
}

interface OrderInfo {
  id: string;
  orderNumber: string;
  status: string;
  totalAmount: number;
  paymentMethod: string;
  paymentStatus: string;
  deliveryAddress: string;
  createdAt: string;
  customer: { name: string; email: string; phone: string | null };
  items: { brickType: { name: string }; quantity: number; unitPrice: number }[];
}

export default function OwnerDashboard() {
  const { data: session } = useSession();
  const [bhata, setBhata] = useState<BhataInfo | null>(null);
  const [orders, setOrders] = useState<OrderInfo[]>([]);
  const [brickTypes, setBrickTypes] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<"overview" | "inventory" | "settings">("overview");
  const [showAddPrice, setShowAddPrice] = useState(false);
  const [priceForm, setPriceForm] = useState({ brickTypeId: "", price: "", stock: "" });

  useEffect(() => {
    if (session?.user) {
      fetchBhata();
      fetchOrders();
      fetchBrickTypes();
    }
  }, [session]);

  const fetchBhata = async () => {
    const res = await fetch("/api/bhatas/my");
    if (res.ok) {
      const data = await res.json();
      setBhata(data);
    }
  };

  const fetchOrders = async () => {
    const res = await fetch("/api/orders");
    if (res.ok) {
      const data = await res.json();
      setOrders(data);
    }
  };

  const fetchBrickTypes = async () => {
    const res = await fetch("/api/brick-types");
    if (res.ok) {
      const data = await res.json();
      setBrickTypes(data);
    }
  };

  const handleUpdatePrice = async (priceId: string, price: number, stock: number | null, isAvailable: boolean) => {
    const res = await fetch("/api/bhatas/prices", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: priceId, price, stock, isAvailable }),
    });
    if (res.ok) toast.success("Price updated!");
    else toast.error("Failed to update price");
    fetchBhata();
  };

  const handleAddPrice = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch("/api/bhatas/prices", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        bhataId: bhata?.id,
        brickTypeId: priceForm.brickTypeId,
        price: parseFloat(priceForm.price),
        stock: priceForm.stock ? parseInt(priceForm.stock) : null,
      }),
    });
    if (res.ok) toast.success("Brick type added to your inventory!");
    else toast.error("Failed to add brick type");
    setShowAddPrice(false);
    setPriceForm({ brickTypeId: "", price: "", stock: "" });
    fetchBhata();
  };

  const handleUpdateOrderStatus = async (orderId: string, status: string) => {
    const res = await fetch(`/api/orders/${orderId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    if (res.ok) toast.success(`Order ${status === "CANCELLED" ? "cancelled" : "moved to " + status.toLowerCase()}`);
    else toast.error("Failed to update order");
    fetchOrders();
  };

  const handleUpdateBhata = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bhata) return;
    await fetch("/api/bhatas/my", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: bhata.name,
        address: bhata.address,
        phone: bhata.phone,
        description: bhata.description,
      }),
    });
    fetchBhata();
  };

  const pendingOrders = orders.filter((o) => o.status === "PENDING" || o.status === "CONFIRMED");
  const availableTypes = brickTypes.filter(
    (bt) => !bhata?.brickPrices?.some((bp) => bp.brickType.id === bt.id)
  );

  const statusFlow = ["PENDING", "CONFIRMED", "PROCESSING", "LOADED", "SHIPPED", "DELIVERED"];

  if (!session) return <div className="p-8 text-center">Loading...</div>;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Owner Dashboard</h1>
          <p className="text-gray-600">{bhata?.name || "Manage your bhata"}</p>
        </div>
        {!bhata && (
          <Button onClick={() => setActiveTab("settings")}>
            <Plus className="h-4 w-4" /> Register Your Bhata
          </Button>
        )}
      </div>

      <div className="mb-8 grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="flex items-center gap-4 p-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-orange-100">
              <Package className="h-6 w-6 text-orange-600" />
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
              <Truck className="h-6 w-6 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Pending</p>
              <p className="text-2xl font-bold text-gray-900">{pendingOrders.length}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-100">
              <DollarSign className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Revenue</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatPrice(orders.reduce((s, o) => s + o.totalAmount, 0))}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="mb-6 flex gap-2 border-b border-gray-200">
        {["overview", "inventory", "settings"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab as any)}
            className={cn(
              "px-4 py-2 text-sm font-medium transition-colors border-b-2 -mb-[1px]",
              activeTab === tab
                ? "border-orange-600 text-orange-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
            )}
          >
            {tab === "overview" ? "Orders" : tab === "inventory" ? "Inventory & Pricing" : "Bhata Settings"}
          </button>
        ))}
      </div>

      {activeTab === "overview" && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-900">Recent Orders</h2>
          {orders.map((order) => (
            <Card key={order.id}>
              <CardContent className="p-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
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
                      {order.customer.name} &middot; {order.items.map((i) => `${i.quantity}x ${i.brickType.name}`).join(", ")}
                    </p>
                    <p className="text-sm text-gray-500">
                      {formatPrice(order.totalAmount)} &middot; {order.paymentMethod}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {statusFlow.indexOf(order.status) < statusFlow.length - 1 && order.status !== "CANCELLED" && (
                      <Button
                        size="sm"
                        onClick={() => {
                          const nextStatus = statusFlow[statusFlow.indexOf(order.status) + 1];
                          handleUpdateOrderStatus(order.id, nextStatus);
                        }}
                      >
                        <Check className="h-4 w-4" />
                        Mark {ORDER_STATUS[statusFlow[statusFlow.indexOf(order.status) + 1] as keyof typeof ORDER_STATUS]}
                      </Button>
                    )}
                    {order.status !== "CANCELLED" && order.status !== "DELIVERED" && (
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleUpdateOrderStatus(order.id, "CANCELLED")}
                      >
                        <X className="h-4 w-4" /> Cancel
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
          {orders.length === 0 && (
            <p className="py-8 text-center text-gray-400">No orders yet</p>
          )}
        </div>
      )}

      {activeTab === "inventory" && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Brick Prices</CardTitle>
            {availableTypes.length > 0 && (
              <Button size="sm" onClick={() => setShowAddPrice(true)}>
                <Plus className="h-4 w-4" /> Add Brick Type
              </Button>
            )}
          </CardHeader>
          <CardContent>
            {showAddPrice && (
              <form onSubmit={handleAddPrice} className="mb-6 rounded-lg border border-orange-200 bg-orange-50 p-4">
                <div className="grid gap-4 sm:grid-cols-3">
                  <Select
                    value={priceForm.brickTypeId}
                    onChange={(e) => setPriceForm({ ...priceForm, brickTypeId: e.target.value })}
                    required
                  >
                    <option value="">Select brick type</option>
                    {availableTypes.map((bt: any) => (
                      <option key={bt.id} value={bt.id}>
                        {bt.name} (Base: {formatPrice(bt.basePrice)})
                      </option>
                    ))}
                  </Select>
                  <Input
                    type="number"
                    placeholder="Your price (₹)"
                    value={priceForm.price}
                    onChange={(e) => setPriceForm({ ...priceForm, price: e.target.value })}
                    required
                  />
                  <Input
                    type="number"
                    placeholder="Stock (optional)"
                    value={priceForm.stock}
                    onChange={(e) => setPriceForm({ ...priceForm, stock: e.target.value })}
                  />
                </div>
                <div className="mt-3 flex gap-2">
                  <Button type="submit" size="sm"><Check className="h-4 w-4" /> Save</Button>
                  <Button variant="ghost" size="sm" onClick={() => setShowAddPrice(false)}><X className="h-4 w-4" /> Cancel</Button>
                </div>
              </form>
            )}

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200 text-left text-gray-500">
                    <th className="pb-3 font-medium">Brick Type</th>
                    <th className="pb-3 font-medium">Base Price</th>
                    <th className="pb-3 font-medium">Your Price</th>
                    <th className="pb-3 font-medium">Stock</th>
                    <th className="pb-3 font-medium">Status</th>
                    <th className="pb-3 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {bhata?.brickPrices?.map((bp) => (
                    <PriceRow
                      key={bp.id}
                      bp={bp}
                      onSave={(price, stock, isAvailable) =>
                        handleUpdatePrice(bp.id, price, stock, isAvailable)
                      }
                    />
                  ))}
                  {(!bhata?.brickPrices || bhata.brickPrices.length === 0) && (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-gray-400">
                        No brick prices set yet
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {activeTab === "settings" && (
        <Card>
          <CardHeader>
            <CardTitle>{bhata ? "Update Bhata Details" : "Register Your Bhata"}</CardTitle>
          </CardHeader>
          <CardContent>
            <BhataForm bhata={bhata} onSave={fetchBhata} />
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function PriceRow({
  bp,
  onSave,
}: {
  bp: BhataInfo["brickPrices"][0];
  onSave: (price: number, stock: number | null, isAvailable: boolean) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [price, setPrice] = useState(bp.price.toString());
  const [stock, setStock] = useState(bp.stock?.toString() || "");
  const [available, setAvailable] = useState(bp.isAvailable);

  const handleSave = () => {
    onSave(parseFloat(price), stock ? parseInt(stock) : null, available);
    setEditing(false);
  };

  if (editing) {
    return (
      <tr className="border-b border-gray-100">
        <td className="py-3 font-medium text-gray-900">{bp.brickType.name}</td>
        <td className="py-3">{formatPrice(bp.brickType.basePrice)}</td>
        <td className="py-3">
          <Input
            type="number"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            className="h-8 w-24"
          />
        </td>
        <td className="py-3">
          <Input
            type="number"
            value={stock}
            onChange={(e) => setStock(e.target.value)}
            className="h-8 w-24"
            placeholder="Unlimited"
          />
        </td>
        <td className="py-3">
          <Select value={available ? "true" : "false"} onChange={(e) => setAvailable(e.target.value === "true")}>
            <option value="true">Available</option>
            <option value="false">Unavailable</option>
          </Select>
        </td>
        <td className="py-3">
          <div className="flex gap-2">
            <button onClick={handleSave} className="text-green-600 hover:text-green-800">
              <Check className="h-4 w-4" />
            </button>
            <button onClick={() => setEditing(false)} className="text-red-600 hover:text-red-800">
              <X className="h-4 w-4" />
            </button>
          </div>
        </td>
      </tr>
    );
  }

  return (
    <tr className="border-b border-gray-100">
      <td className="py-3 font-medium text-gray-900">{bp.brickType.name}</td>
      <td className="py-3 text-gray-500">{formatPrice(bp.brickType.basePrice)}</td>
      <td className="py-3 font-medium">{formatPrice(bp.price)}</td>
      <td className="py-3">{bp.stock !== null ? bp.stock : "Unlimited"}</td>
      <td className="py-3">
        <Badge variant={bp.isAvailable ? "success" : "danger"}>
          {bp.isAvailable ? "Available" : "Unavailable"}
        </Badge>
      </td>
      <td className="py-3">
        <Button variant="ghost" size="sm" onClick={() => setEditing(true)}>
          <Settings className="h-4 w-4" /> Edit
        </Button>
      </td>
    </tr>
  );
}

function BhataForm({ bhata, onSave }: { bhata: BhataInfo | null; onSave: () => void }) {
  const [form, setForm] = useState({
    name: bhata?.name || "",
    address: bhata?.address || "",
    phone: bhata?.phone || "",
    description: bhata?.description || "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const method = bhata ? "PUT" : "POST";
    await fetch("/api/bhatas/my", {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    onSave();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-lg">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Bhata Name</label>
        <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
        <Input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} required />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
        <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
        <Input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
      </div>
      <Button type="submit">{bhata ? "Update Bhata" : "Register Bhata"}</Button>
    </form>
  );
}
