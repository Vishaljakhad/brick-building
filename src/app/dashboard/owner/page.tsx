"use client";

import { useState, useEffect, useMemo } from "react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { AlertBanner } from "@/components/ui/alert";
import toast from "react-hot-toast";
import { formatPrice, cn } from "@/lib/utils";
import { ORDER_STATUS, STATUS_COLORS } from "@/lib/constants";
import {
  validateBhataName,
  validateAddress,
  validatePhone,
  validatePositiveNumber,
  validateNonNegativeInt,
  type FieldErrors,
} from "@/lib/client-validation";
import {
  Factory,
  Package,
  DollarSign,
  Plus,
  Settings,
  Truck,
  Check,
  X,
  Search,
  Loader2,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";

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

interface BrickTypeOption {
  id: string;
  name: string;
  unit: string;
  basePrice: number;
}

const FILTERS = [
  { key: "ALL", label: "All" },
  { key: "PENDING", label: "Pending" },
  { key: "ACTIVE", label: "In Progress" },
  { key: "DELIVERED", label: "Delivered" },
  { key: "CANCELLED", label: "Cancelled" },
] as const;

const statusFlow = ["PENDING", "CONFIRMED", "PROCESSING", "IN_TRANSIT", "DELIVERED"];

export default function OwnerDashboard() {
  const { data: session } = useSession();
  const [bhata, setBhata] = useState<BhataInfo | null>(null);
  const [orders, setOrders] = useState<OrderInfo[]>([]);
  const [brickTypes, setBrickTypes] = useState<BrickTypeOption[]>([]);
  const [activeTab, setActiveTab] = useState<"overview" | "inventory" | "settings">("overview");
  const [showAddPrice, setShowAddPrice] = useState(false);
  const [priceForm, setPriceForm] = useState({ brickTypeId: "", price: "", stock: "" });
  const [priceErrors, setPriceErrors] = useState<FieldErrors>({});
  const [orderFilter, setOrderFilter] = useState<string>("ALL");
  const [orderSearch, setOrderSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [updatingOrder, setUpdatingOrder] = useState<string | null>(null);

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

  useEffect(() => {
    if (session?.user) {
      Promise.all([fetchBhata(), fetchOrders(), fetchBrickTypes()]).finally(() =>
        setLoading(false)
      );
    }
  }, [session]);

  const handleUpdatePrice = async (priceId: string, price: number, stock: number | null, isAvailable: boolean) => {
    if (!Number.isFinite(price) || price <= 0) {
      toast.error("Price must be a positive number");
      return;
    }
    if (stock !== null && (!Number.isInteger(stock) || stock < 0)) {
      toast.error("Stock must be a non-negative whole number");
      return;
    }
    const res = await fetch("/api/bhatas/prices", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: priceId, price, stock, isAvailable }),
    });
    if (res.ok) toast.success("Price updated!");
    else {
      const data = await res.json();
      toast.error(data.error || "Failed to update price");
    }
    fetchBhata();
  };

  const handleAddPrice = async (e: React.FormEvent) => {
    e.preventDefault();
    const nextErrors: FieldErrors = {
      brickTypeId: priceForm.brickTypeId ? undefined : "Please select a brick type",
      price: validatePositiveNumber(priceForm.price),
      stock: validateNonNegativeInt(priceForm.stock, "Stock", true),
    };
    setPriceErrors(nextErrors);
    if (Object.values(nextErrors).some(Boolean)) {
      toast.error("Please fix the highlighted fields");
      return;
    }

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
    else {
      const data = await res.json();
      toast.error(data.error || "Failed to add brick type");
    }
    setShowAddPrice(false);
    setPriceForm({ brickTypeId: "", price: "", stock: "" });
    fetchBhata();
  };

  const handleUpdateOrderStatus = async (orderId: string, status: string) => {
    setUpdatingOrder(orderId);
    const prevOrders = orders;
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status } : o))
    );

    const res = await fetch(`/api/orders/${orderId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    if (res.ok) {
      toast.success(
        status === "CANCELLED"
          ? "Order cancelled"
          : `Order moved to ${(ORDER_STATUS[status as keyof typeof ORDER_STATUS] || status).toLowerCase()}`
      );
    } else {
      const data = await res.json();
      toast.error(data.error || "Failed to update order");
      setOrders(prevOrders);
    }
    setUpdatingOrder(null);
    fetchOrders();
  };

  const pendingOrders = orders.filter((o) => ["PENDING", "CONFIRMED"].includes(o.status));
  const availableTypes = brickTypes.filter(
    (bt) => !bhata?.brickPrices?.some((bp) => bp.brickType.id === bt.id)
  );

  const filteredOrders = useMemo(() => {
    let list = orders;
    if (orderFilter === "PENDING") list = list.filter((o) => o.status === "PENDING");
    else if (orderFilter === "ACTIVE") list = list.filter((o) => ["CONFIRMED", "PROCESSING", "IN_TRANSIT"].includes(o.status));
    else if (orderFilter === "DELIVERED") list = list.filter((o) => o.status === "DELIVERED");
    else if (orderFilter === "CANCELLED") list = list.filter((o) => o.status === "CANCELLED");

    if (orderSearch.trim()) {
      const q = orderSearch.toLowerCase();
      list = list.filter(
        (o) =>
          o.orderNumber.toLowerCase().includes(q) ||
          o.customer.name.toLowerCase().includes(q) ||
          o.items.some((i) => i.brickType.name.toLowerCase().includes(q))
      );
    }
    return list;
  }, [orders, orderFilter, orderSearch]);

  const lowStockItems = bhata?.brickPrices.filter(
    (bp) => bp.stock !== null && bp.stock > 0 && bp.stock < 500
  );
  const outOfStockItems = bhata?.brickPrices.filter(
    (bp) => bp.stock === 0
  );

  const revenue = orders
    .filter((o) => o.status !== "CANCELLED")
    .reduce((s, o) => s + o.totalAmount, 0);

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

      {outOfStockItems && outOfStockItems.length > 0 && (
        <AlertBanner
          variant="warning"
          title="Out of stock"
          message={`${outOfStockItems.length} brick type(s) are marked out of stock. Update your inventory to avoid losing orders.`}
          className="mb-6"
        />
      )}
      {lowStockItems && lowStockItems.length > 0 && (
        <AlertBanner
          variant="info"
          title="Low stock alert"
          message={`${lowStockItems.length} brick type(s) have less than 500 units left. Consider restocking.`}
          className="mb-6"
        />
      )}

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
              <p className="text-sm text-gray-500">Pending / Active</p>
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
              <p className="text-sm text-gray-500">Revenue (non-cancelled)</p>
              <p className="text-2xl font-bold text-gray-900">{formatPrice(revenue)}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="mb-6 flex gap-2 border-b border-gray-200">
        {["overview", "inventory", "settings"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab as "overview" | "inventory" | "settings")}
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
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="text-xl font-semibold text-gray-900">Recent Orders</h2>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <div className="flex flex-wrap gap-2">
                {FILTERS.map((f) => (
                  <button
                    key={f.key}
                    onClick={() => setOrderFilter(f.key)}
                    className={cn(
                      "px-3 py-1.5 text-xs font-medium rounded-full border transition-colors",
                      orderFilter === f.key
                        ? "bg-orange-600 text-white border-orange-600"
                        : "bg-white text-gray-600 border-gray-300 hover:border-orange-400"
                    )}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
              <div className="relative sm:w-56">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <Input
                  className="pl-9 h-9"
                  placeholder="Search orders..."
                  value={orderSearch}
                  onChange={(e) => setOrderSearch(e.target.value)}
                />
              </div>
            </div>
          </div>

          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Card key={i}>
                  <CardContent className="p-6">
                    <div className="h-5 w-44 animate-pulse rounded bg-gray-200" />
                    <div className="mt-3 h-4 w-72 animate-pulse rounded bg-gray-100" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : filteredOrders.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Package className="mx-auto h-12 w-12 text-gray-300" />
                <h3 className="mt-4 text-lg font-medium text-gray-900">
                  {orderSearch || orderFilter !== "ALL" ? "No orders match your filters" : "No orders yet"}
                </h3>
                <p className="mt-2 text-gray-500">
                  {orderSearch || orderFilter !== "ALL"
                    ? "Try a different search term or filter."
                    : "When customers place orders, they will appear here."}
                </p>
              </CardContent>
            </Card>
          ) : (
            filteredOrders.map((order) => {
              const flowIndex = statusFlow.indexOf(order.status);
              const nextStatus = flowIndex >= 0 && flowIndex < statusFlow.length - 1
                ? statusFlow[flowIndex + 1]
                : null;
              return (
                <Card key={order.id}>
                  <CardContent className="p-6">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-3">
                          <Link href={`/orders/${order.id}`} className="font-mono text-sm font-bold text-gray-900 hover:text-orange-600">
                            {order.orderNumber}
                          </Link>
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
                          {formatPrice(order.totalAmount)} &middot; {order.paymentMethod} &middot;{" "}
                          {new Date(order.createdAt).toLocaleDateString("en-IN")}
                        </p>
                      </div>
                      <div className="flex flex-wrap items-center gap-2">
                        {nextStatus && order.status !== "CANCELLED" && (
                          <Button
                            size="sm"
                            onClick={() => handleUpdateOrderStatus(order.id, nextStatus)}
                            disabled={updatingOrder === order.id}
                          >
                            {updatingOrder === order.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <ArrowRight className="h-4 w-4" />
                            )}
                            Mark {ORDER_STATUS[nextStatus as keyof typeof ORDER_STATUS]}
                          </Button>
                        )}
                        {order.status !== "CANCELLED" && order.status !== "DELIVERED" && (
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleUpdateOrderStatus(order.id, "CANCELLED")}
                            disabled={updatingOrder === order.id}
                          >
                            <X className="h-4 w-4" /> Cancel
                          </Button>
                        )}
                        <Link href={`/orders/${order.id}`}>
                          <Button size="sm" variant="outline">Details</Button>
                        </Link>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })
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
                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">
                      Brick type <span className="text-red-500">*</span>
                    </label>
                    <Select
                      value={priceForm.brickTypeId}
                      onChange={(e) => {
                        setPriceForm({ ...priceForm, brickTypeId: e.target.value });
                        setPriceErrors((p) => ({ ...p, brickTypeId: undefined }));
                      }}
                      error={!!priceErrors.brickTypeId}
                    >
                      <option value="">Select brick type</option>
                      {availableTypes.map((bt) => (
                        <option key={bt.id} value={bt.id}>
                          {bt.name} (Base: {formatPrice(bt.basePrice)})
                        </option>
                      ))}
                    </Select>
                    {priceErrors.brickTypeId && (
                      <p className="mt-1 text-xs text-red-600">{priceErrors.brickTypeId}</p>
                    )}
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">
                      Your price (₹) <span className="text-red-500">*</span>
                    </label>
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="Your price (₹)"
                      value={priceForm.price}
                      onChange={(e) => {
                        setPriceForm({ ...priceForm, price: e.target.value });
                        setPriceErrors((p) => ({ ...p, price: undefined }));
                      }}
                      error={!!priceErrors.price}
                    />
                    {priceErrors.price && (
                      <p className="mt-1 text-xs text-red-600">{priceErrors.price}</p>
                    )}
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">Stock (optional)</label>
                    <Input
                      type="number"
                      min="0"
                      placeholder="Leave blank for unlimited"
                      value={priceForm.stock}
                      onChange={(e) => {
                        setPriceForm({ ...priceForm, stock: e.target.value });
                        setPriceErrors((p) => ({ ...p, stock: undefined }));
                      }}
                      error={!!priceErrors.stock}
                    />
                    {priceErrors.stock && (
                      <p className="mt-1 text-xs text-red-600">{priceErrors.stock}</p>
                    )}
                  </div>
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

  const isLowStock = bp.stock !== null && bp.stock > 0 && bp.stock < 500;

  if (editing) {
    return (
      <tr className="border-b border-gray-100">
        <td className="py-3 font-medium text-gray-900">{bp.brickType.name}</td>
        <td className="py-3">{formatPrice(bp.brickType.basePrice)}</td>
        <td className="py-3">
          <Input
            type="number"
            min="0"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            className="h-8 w-24"
          />
        </td>
        <td className="py-3">
          <Input
            type="number"
            min="0"
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
            <button onClick={handleSave} className="text-green-600 hover:text-green-800" aria-label="Save">
              <Check className="h-4 w-4" />
            </button>
            <button onClick={() => setEditing(false)} className="text-red-600 hover:text-red-800" aria-label="Cancel">
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
      <td className="py-3">
        {bp.stock !== null ? (
          <span className={cn("font-medium", bp.stock === 0 ? "text-red-600" : isLowStock ? "text-amber-600" : "")}>
            {bp.stock}
            {bp.stock === 0 && <Badge variant="danger" className="ml-2">Out</Badge>}
            {isLowStock && <Badge variant="warning" className="ml-2">Low</Badge>}
          </span>
        ) : (
          <span className="text-gray-500">Unlimited</span>
        )}
      </td>
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
  const [errors, setErrors] = useState<FieldErrors>({});
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const nextErrors: FieldErrors = {
      name: validateBhataName(form.name),
      address: validateAddress(form.address, true),
      phone: validatePhone(form.phone),
    };
    setErrors(nextErrors);
    if (Object.values(nextErrors).some(Boolean)) {
      toast.error("Please fix the highlighted fields");
      return;
    }

    setSaving(true);
    const method = bhata ? "PUT" : "POST";
    const res = await fetch("/api/bhatas/my", {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (res.ok) toast.success(bhata ? "Bhata updated!" : "Bhata registered!");
    else {
      const data = await res.json();
      toast.error(data.error || "Failed to save bhata");
    }
    setSaving(false);
    onSave();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-lg">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Bhata Name <span className="text-red-500">*</span>
        </label>
        <Input
          value={form.name}
          onChange={(e) => {
            setForm({ ...form, name: e.target.value });
            setErrors((p) => ({ ...p, name: undefined }));
          }}
          error={!!errors.name}
        />
        {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name}</p>}
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Address <span className="text-red-500">*</span>
        </label>
        <Input
          value={form.address}
          onChange={(e) => {
            setForm({ ...form, address: e.target.value });
            setErrors((p) => ({ ...p, address: undefined }));
          }}
          error={!!errors.address}
        />
        {errors.address && <p className="mt-1 text-xs text-red-600">{errors.address}</p>}
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
        <Input
          value={form.phone}
          onChange={(e) => {
            setForm({ ...form, phone: e.target.value });
            setErrors((p) => ({ ...p, phone: undefined }));
          }}
          error={!!errors.phone}
          placeholder="+91 9876543210"
        />
        {errors.phone && <p className="mt-1 text-xs text-red-600">{errors.phone}</p>}
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
        <Textarea
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          placeholder="About your kiln, production capacity, etc."
        />
      </div>
      <Button type="submit" disabled={saving}>
        {saving ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : bhata ? (
          <Check className="h-4 w-4" />
        ) : (
          <Factory className="h-4 w-4" />
        )}
        {bhata ? "Update Bhata" : "Register Bhata"}
      </Button>
    </form>
  );
}
