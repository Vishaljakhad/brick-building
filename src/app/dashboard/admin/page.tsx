"use client";

import { useState, useEffect, useMemo } from "react";
import { useSession } from "next-auth/react";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Modal } from "@/components/ui/modal";
import { AlertBanner } from "@/components/ui/alert";
import { StatCardSkeleton } from "@/components/ui/skeleton";
import { formatPrice, cn } from "@/lib/utils";
import { ORDER_STATUS, STATUS_COLORS } from "@/lib/constants";
import type { FieldErrors } from "@/lib/client-validation";
import {
  ToyBrick,
  Plus,
  Package,
  Users,
  Factory,
  TrendingUp,
  Edit2,
  Trash2,
  X,
  Check,
  AlertTriangle,
  Search,
  Loader2,
  UserRound,
  Store,
  ClipboardList,
  Ban,
  CircleCheck,
} from "lucide-react";
import Link from "next/link";

interface BrickType {
  id: string;
  name: string;
  description: string | null;
  unit: string;
  basePrice: number;
  image: string | null;
}

interface AdminUser {
  id: string;
  name: string | null;
  email: string;
  role: string;
  phone: string | null;
  createdAt: string;
}

interface AdminBhata {
  id: string;
  name: string;
  address: string;
  phone: string | null;
  isActive: boolean;
  owner: { name: string; email: string };
  _count: { orders: number };
}

interface AdminOrder {
  id: string;
  orderNumber: string;
  status: string;
  paymentStatus: string;
  totalAmount: number;
  createdAt: string;
  customer: { name: string; email: string };
  bhata: { name: string };
  items: { brickType: { name: string }; quantity: number }[];
}

interface DashboardStats {
  totalUsers: number;
  totalBhatas: number;
  totalOrders: number;
  totalRevenue: number;
}

type Tab = "bricktypes" | "users" | "bhatas" | "orders";

const ROLE_BADGE: Record<string, "primary" | "success" | "info"> = {
  ADMIN: "primary",
  OWNER: "success",
  CUSTOMER: "info",
};

export default function AdminDashboard() {
  const { data: session } = useSession();
  const [brickTypes, setBrickTypes] = useState<BrickType[]>([]);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [bhatas, setBhatas] = useState<AdminBhata[]>([]);
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>("bricktypes");
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<BrickType | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<BrickType | null>(null);
  const [form, setForm] = useState({ name: "", description: "", unit: "pieces", basePrice: "" });
  const [formErrors, setFormErrors] = useState<FieldErrors>({});
  const [saving, setSaving] = useState(false);

  // search
  const [userSearch, setUserSearch] = useState("");
  const [bhataSearch, setBhataSearch] = useState("");
  const [orderSearch, setOrderSearch] = useState("");
  const [orderFilter, setOrderFilter] = useState("ALL");
  const [roleChange, setRoleChange] = useState<{ user: AdminUser; role: string } | null>(null);
  const [bhataToggle, setBhataToggle] = useState<AdminBhata | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchBrickTypes = async () => {
    const res = await fetch("/api/brick-types");
    const data = await res.json();
    setBrickTypes(data);
  };

  const fetchUsers = async () => {
    const res = await fetch("/api/admin/users");
    if (res.ok) setUsers(await res.json());
  };

  const fetchBhatas = async () => {
    const res = await fetch("/api/admin/bhatas");
    if (res.ok) setBhatas(await res.json());
  };

  const fetchOrders = async () => {
    const res = await fetch("/api/orders");
    if (res.ok) setOrders(await res.json());
  };

  const fetchStats = async () => {
    try {
      const [usersRes, bhatasRes, ordersRes] = await Promise.all([
        fetch("/api/admin/users"),
        fetch("/api/admin/bhatas"),
        fetch("/api/orders"),
      ]);
      const usersData = await usersRes.json();
      const bhatasData = await bhatasRes.json();
      const ordersData = await ordersRes.json();
      setStats({
        totalUsers: usersData.length || 0,
        totalBhatas: bhatasData.length || 0,
        totalOrders: ordersData.length || 0,
        totalRevenue: ordersData.reduce((sum: number, o: AdminOrder) => sum + (o.totalAmount || 0), 0),
      });
    } catch {}
  };

  useEffect(() => {
    Promise.all([fetchBrickTypes(), fetchUsers(), fetchBhatas(), fetchOrders(), fetchStats()]).finally(
      () => setLoading(false)
    );
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const nextErrors: Record<string, string> = {};
    if (form.name.trim().length < 2) nextErrors.name = "Name must be at least 2 characters";
    const price = Number(form.basePrice);
    if (!form.basePrice || !Number.isFinite(price) || price <= 0)
      nextErrors.basePrice = "Base price must be a positive number";
    if (!form.unit.trim()) nextErrors.unit = "Unit is required";
    setFormErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      toast.error("Please fix the highlighted fields");
      return;
    }

    setSaving(true);

    try {
      const method = editing ? "PUT" : "POST";
      const res = await fetch("/api/brick-types", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...(editing ? { id: editing.id } : {}),
          name: form.name.trim(),
          description: form.description.trim(),
          unit: form.unit.trim(),
          basePrice: price,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        toast.error(data.error || "Failed to save brick type");
        setSaving(false);
        return;
      }

      toast.success(editing ? "Brick type updated!" : "Brick type created!");
      setShowForm(false);
      setEditing(null);
      setForm({ name: "", description: "", unit: "pieces", basePrice: "" });
      fetchBrickTypes();
    } catch {
      toast.error("Something went wrong");
    }
    setSaving(false);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      const res = await fetch("/api/brick-types", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: deleteTarget.id }),
      });

      if (!res.ok) {
        const data = await res.json();
        toast.error(data.error || "Failed to delete brick type");
        return;
      }

      toast.success("Brick type deleted!");
      setDeleteTarget(null);
      fetchBrickTypes();
    } catch {
      toast.error("Something went wrong");
    }
  };

  const startEdit = (bt: BrickType) => {
    setEditing(bt);
    setForm({
      name: bt.name,
      description: bt.description || "",
      unit: bt.unit,
      basePrice: bt.basePrice.toString(),
    });
    setShowForm(true);
  };

  const handleRoleChange = async () => {
    if (!roleChange) return;
    try {
      const res = await fetch(`/api/admin/users/${roleChange.user.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: roleChange.role }),
      });
      if (!res.ok) {
        const data = await res.json();
        toast.error(data.error || "Failed to update role");
        return;
      }
      toast.success("User role updated");
      setRoleChange(null);
      fetchUsers();
      fetchStats();
    } catch {
      toast.error("Something went wrong");
    }
  };

  const handleBhataToggle = async () => {
    if (!bhataToggle) return;
    try {
      const res = await fetch(`/api/admin/bhatas/${bhataToggle.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !bhataToggle.isActive }),
      });
      if (!res.ok) {
        const data = await res.json();
        toast.error(data.error || "Failed to update bhata");
        return;
      }
      toast.success(bhataToggle.isActive ? "Bhata deactivated" : "Bhata activated");
      setBhataToggle(null);
      fetchBhatas();
      fetchStats();
    } catch {
      toast.error("Something went wrong");
    }
  };

  const filteredUsers = useMemo(() => {
    let list = users;
    if (userSearch.trim()) {
      const q = userSearch.toLowerCase();
      list = list.filter(
        (u) =>
          u.name?.toLowerCase().includes(q) ||
          u.email.toLowerCase().includes(q) ||
          u.role.toLowerCase().includes(q)
      );
    }
    return list;
  }, [users, userSearch]);

  const filteredBhatas = useMemo(() => {
    let list = bhatas;
    if (bhataSearch.trim()) {
      const q = bhataSearch.toLowerCase();
      list = list.filter(
        (b) =>
          b.name.toLowerCase().includes(q) ||
          b.address.toLowerCase().includes(q) ||
          b.owner.name.toLowerCase().includes(q)
      );
    }
    return list;
  }, [bhatas, bhataSearch]);

  const filteredOrders = useMemo(() => {
    let list = orders;
    if (orderFilter !== "ALL") list = list.filter((o) => o.status === orderFilter);
    if (orderSearch.trim()) {
      const q = orderSearch.toLowerCase();
      list = list.filter(
        (o) =>
          o.orderNumber.toLowerCase().includes(q) ||
          o.customer.name.toLowerCase().includes(q) ||
          o.bhata.name.toLowerCase().includes(q)
      );
    }
    return list;
  }, [orders, orderFilter, orderSearch]);

  if (!session || session.user.role !== "ADMIN") {
    return <div className="p-8 text-center">Access denied</div>;
  }

  const tabs: { key: Tab; label: string; icon: React.ElementType }[] = [
    { key: "bricktypes", label: "Brick Types", icon: ToyBrick },
    { key: "users", label: "Users", icon: UserRound },
    { key: "bhatas", label: "Bhatas", icon: Store },
    { key: "orders", label: "Orders", icon: ClipboardList },
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="mt-1 text-gray-600">Manage brick types, users, bhatas, and platform settings</p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
      >
        <StatCard icon={Users} label="Total Users" value={stats?.totalUsers} color="blue" />
        <StatCard icon={Factory} label="Total Bhatas" value={stats?.totalBhatas} color="orange" />
        <StatCard icon={Package} label="Total Orders" value={stats?.totalOrders} color="green" />
        <StatCard icon={TrendingUp} label="Revenue" value={stats ? formatPrice(stats.totalRevenue) : null} color="purple" />
      </motion.div>

      <div className="mb-6 flex flex-wrap gap-2 border-b border-gray-200">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={cn(
                "flex items-center gap-2 px-4 py-2 text-sm font-medium transition-colors border-b-2 -mb-[1px]",
                isActive
                  ? "border-orange-600 text-orange-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              )}
            >
              <Icon className="h-4 w-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {loading && <StatCardSkeleton />}

      {activeTab === "bricktypes" && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="border-0 shadow-lg shadow-gray-100">
            <CardHeader className="flex flex-row items-center justify-between border-b border-gray-100">
              <CardTitle className="flex items-center gap-2">
                <ToyBrick className="h-5 w-5 text-orange-600" />
                Brick Types
              </CardTitle>
              <Button
                size="sm"
                onClick={() => { setShowForm(true); setEditing(null); setForm({ name: "", description: "", unit: "pieces", basePrice: "" }); }}
                className="bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-700 hover:to-orange-600 shadow-md shadow-orange-200"
              >
                <Plus className="h-4 w-4" /> Add Brick Type
              </Button>
            </CardHeader>
            <CardContent className="p-0">
              {showForm && (
                <motion.form
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  onSubmit={handleSubmit}
                  className="border-b border-gray-100 bg-gradient-to-r from-orange-50 to-amber-50 p-4"
                >
                  <div className="grid gap-3 sm:grid-cols-4">
                    <div>
                      <Input
                        placeholder="Brick name"
                        value={form.name}
                        onChange={(e) => {
                          setForm({ ...form, name: e.target.value });
                          setFormErrors((p) => ({ ...p, name: undefined }));
                        }}
                        error={!!formErrors.name}
                      />
                      {formErrors.name && <p className="mt-1 text-xs text-red-600">{formErrors.name}</p>}
                    </div>
                    <div>
                      <Input
                        placeholder="Description"
                        value={form.description}
                        onChange={(e) => setForm({ ...form, description: e.target.value })}
                      />
                    </div>
                    <div>
                      <Input
                        placeholder="Unit"
                        value={form.unit}
                        onChange={(e) => {
                          setForm({ ...form, unit: e.target.value });
                          setFormErrors((p) => ({ ...p, unit: undefined }));
                        }}
                        error={!!formErrors.unit}
                      />
                      {formErrors.unit && <p className="mt-1 text-xs text-red-600">{formErrors.unit}</p>}
                    </div>
                    <div>
                      <Input
                        type="number"
                        min="0"
                        step="0.01"
                        placeholder="Base price (₹)"
                        value={form.basePrice}
                        onChange={(e) => {
                          setForm({ ...form, basePrice: e.target.value });
                          setFormErrors((p) => ({ ...p, basePrice: undefined }));
                        }}
                        error={!!formErrors.basePrice}
                      />
                      {formErrors.basePrice && <p className="mt-1 text-xs text-red-600">{formErrors.basePrice}</p>}
                    </div>
                  </div>
                  <div className="mt-3 flex gap-2">
                    <Button type="submit" size="sm" disabled={saving}>
                      {saving ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <><Check className="h-4 w-4" /> {editing ? "Update" : "Save"}</>
                      )}
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => { setShowForm(false); setEditing(null); }}>
                      <X className="h-4 w-4" /> Cancel
                    </Button>
                  </div>
                </motion.form>
              )}

              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-100 text-left text-gray-500">
                      <th className="p-4 font-medium">Name</th>
                      <th className="p-4 font-medium">Description</th>
                      <th className="p-4 font-medium">Unit</th>
                      <th className="p-4 font-medium">Base Price</th>
                      <th className="p-4 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {brickTypes.map((bt, i) => (
                      <motion.tr
                        key={bt.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.05 }}
                        className="border-b border-gray-50 hover:bg-gray-50 transition-colors group"
                      >
                        <td className="p-4 font-medium text-gray-900">{bt.name}</td>
                        <td className="p-4 text-gray-500">{bt.description || "-"}</td>
                        <td className="p-4"><Badge variant="primary">{bt.unit}</Badge></td>
                        <td className="p-4 font-semibold text-gray-900">{formatPrice(bt.basePrice)}</td>
                        <td className="p-4">
                          <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => startEdit(bt)} className="rounded-lg p-1.5 text-blue-600 hover:bg-blue-50 transition-colors" aria-label="Edit">
                              <Edit2 className="h-4 w-4" />
                            </button>
                            <button onClick={() => setDeleteTarget(bt)} className="rounded-lg p-1.5 text-red-600 hover:bg-red-50 transition-colors" aria-label="Delete">
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                    {brickTypes.length === 0 && (
                      <tr>
                        <td colSpan={5} className="p-8 text-center text-gray-400">
                          No brick types yet. Add your first one!
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {activeTab === "users" && (
        <Card className="border-0 shadow-lg shadow-gray-100">
          <CardHeader className="flex flex-col gap-3 border-b border-gray-100 sm:flex-row sm:items-center sm:justify-between">
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-orange-600" />
              Users ({users.length})
            </CardTitle>
            <div className="relative sm:w-72">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input
                className="pl-9"
                placeholder="Search by name, email, or role..."
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
              />
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 text-left text-gray-500">
                    <th className="p-4 font-medium">Name</th>
                    <th className="p-4 font-medium">Email</th>
                    <th className="p-4 font-medium">Phone</th>
                    <th className="p-4 font-medium">Role</th>
                    <th className="p-4 font-medium">Joined</th>
                    <th className="p-4 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((u) => (
                    <tr key={u.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                      <td className="p-4 font-medium text-gray-900">{u.name || "-"}</td>
                      <td className="p-4 text-gray-500">{u.email}</td>
                      <td className="p-4 text-gray-500">{u.phone || "-"}</td>
                      <td className="p-4">
                        <Badge variant={ROLE_BADGE[u.role] || "info"}>{u.role}</Badge>
                      </td>
                      <td className="p-4 text-gray-500">
                        {new Date(u.createdAt).toLocaleDateString("en-IN")}
                      </td>
                      <td className="p-4">
                        <Button size="sm" variant="outline" onClick={() => setRoleChange({ user: u, role: u.role })}>
                          Change Role
                        </Button>
                      </td>
                    </tr>
                  ))}
                  {filteredUsers.length === 0 && (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-gray-400">
                        No users found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {activeTab === "bhatas" && (
        <Card className="border-0 shadow-lg shadow-gray-100">
          <CardHeader className="flex flex-col gap-3 border-b border-gray-100 sm:flex-row sm:items-center sm:justify-between">
            <CardTitle className="flex items-center gap-2">
              <Factory className="h-5 w-5 text-orange-600" />
              Bhatas ({bhatas.length})
            </CardTitle>
            <div className="relative sm:w-72">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input
                className="pl-9"
                placeholder="Search by name, owner, or location..."
                value={bhataSearch}
                onChange={(e) => setBhataSearch(e.target.value)}
              />
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 text-left text-gray-500">
                    <th className="p-4 font-medium">Name</th>
                    <th className="p-4 font-medium">Owner</th>
                    <th className="p-4 font-medium">Location</th>
                    <th className="p-4 font-medium">Orders</th>
                    <th className="p-4 font-medium">Status</th>
                    <th className="p-4 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredBhatas.map((b) => (
                    <tr key={b.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                      <td className="p-4 font-medium text-gray-900">{b.name}</td>
                      <td className="p-4 text-gray-500">
                        <p>{b.owner.name}</p>
                        <p className="text-xs text-gray-400">{b.owner.email}</p>
                      </td>
                      <td className="p-4 text-gray-500 max-w-[200px] truncate">{b.address}</td>
                      <td className="p-4 text-gray-500">{b._count.orders}</td>
                      <td className="p-4">
                        <Badge variant={b.isActive ? "success" : "danger"}>
                          {b.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </td>
                      <td className="p-4">
                        <Button
                          size="sm"
                          variant={b.isActive ? "destructive" : "default"}
                          onClick={() => setBhataToggle(b)}
                        >
                          {b.isActive ? <Ban className="h-4 w-4" /> : <CircleCheck className="h-4 w-4" />}
                          {b.isActive ? "Deactivate" : "Activate"}
                        </Button>
                      </td>
                    </tr>
                  ))}
                  {filteredBhatas.length === 0 && (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-gray-400">
                        No bhatas found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {activeTab === "orders" && (
        <Card className="border-0 shadow-lg shadow-gray-100">
          <CardHeader className="flex flex-col gap-3 border-b border-gray-100 lg:flex-row lg:items-center lg:justify-between">
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5 text-orange-600" />
              Orders ({orders.length})
            </CardTitle>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <Select value={orderFilter} onChange={(e) => setOrderFilter(e.target.value)} className="h-9 w-40">
                <option value="ALL">All statuses</option>
                {Object.entries(ORDER_STATUS).map(([key, label]) => (
                  <option key={key} value={key}>{label}</option>
                ))}
              </Select>
              <div className="relative sm:w-64">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <Input
                  className="pl-9 h-9"
                  placeholder="Search order #, customer..."
                  value={orderSearch}
                  onChange={(e) => setOrderSearch(e.target.value)}
                />
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 text-left text-gray-500">
                    <th className="p-4 font-medium">Order #</th>
                    <th className="p-4 font-medium">Customer</th>
                    <th className="p-4 font-medium">Bhata</th>
                    <th className="p-4 font-medium">Items</th>
                    <th className="p-4 font-medium">Amount</th>
                    <th className="p-4 font-medium">Status</th>
                    <th className="p-4 font-medium">Payment</th>
                    <th className="p-4 font-medium">Date</th>
                    <th className="p-4 font-medium"></th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOrders.map((o) => (
                    <tr key={o.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                      <td className="p-4 font-mono text-xs font-bold text-gray-900">{o.orderNumber}</td>
                      <td className="p-4 text-gray-700">
                        <p>{o.customer.name}</p>
                        <p className="text-xs text-gray-400">{o.customer.email}</p>
                      </td>
                      <td className="p-4 text-gray-500">{o.bhata.name}</td>
                      <td className="p-4 text-gray-500">
                        {o.items.map((i) => `${i.quantity}x ${i.brickType.name}`).join(", ")}
                      </td>
                      <td className="p-4 font-semibold text-gray-900">{formatPrice(o.totalAmount)}</td>
                      <td className="p-4">
                        <Badge className={STATUS_COLORS[o.status] || ""}>
                          {ORDER_STATUS[o.status as keyof typeof ORDER_STATUS] || o.status}
                        </Badge>
                      </td>
                      <td className="p-4">
                        <Badge variant={o.paymentStatus === "PAID" ? "success" : "warning"}>
                          {o.paymentStatus}
                        </Badge>
                      </td>
                      <td className="p-4 text-gray-500">
                        {new Date(o.createdAt).toLocaleDateString("en-IN")}
                      </td>
                      <td className="p-4">
                        <Link href={`/orders/${o.id}`}>
                          <Button size="sm" variant="outline">View</Button>
                        </Link>
                      </td>
                    </tr>
                  ))}
                  {filteredOrders.length === 0 && (
                    <tr>
                      <td colSpan={9} className="p-8 text-center text-gray-400">
                        No orders found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      <Modal open={!!deleteTarget} onClose={() => setDeleteTarget(null)} title="Delete Brick Type">
        <div className="text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-100">
            <AlertTriangle className="h-7 w-7 text-red-600" />
          </div>
          <p className="mt-4 text-gray-600">
            Are you sure you want to delete <strong>{deleteTarget?.name}</strong>?
          </p>
          <p className="mt-1 text-sm text-gray-400">This action cannot be undone.</p>
          <div className="mt-6 flex gap-3 justify-center">
            <Button variant="ghost" onClick={() => setDeleteTarget(null)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDelete}>
              <Trash2 className="h-4 w-4" /> Delete
            </Button>
          </div>
        </div>
      </Modal>

      <Modal open={!!roleChange} onClose={() => setRoleChange(null)} title="Change User Role">
        <div className="space-y-4">
          <div className="rounded-lg bg-gray-50 p-4">
            <p className="font-medium text-gray-900">{roleChange?.user.name || roleChange?.user.email}</p>
            <p className="text-sm text-gray-500">{roleChange?.user.email}</p>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">New role</label>
            <Select
              value={roleChange?.role || "CUSTOMER"}
              onChange={(e) => roleChange && setRoleChange({ ...roleChange, role: e.target.value })}
            >
              <option value="CUSTOMER">Customer</option>
              <option value="OWNER">Kiln Owner</option>
              <option value="ADMIN">Admin</option>
            </Select>
          </div>
          {roleChange?.user.role === "ADMIN" && roleChange.role !== "ADMIN" && (
            <AlertBanner variant="warning" message="Changing this user from Admin will revoke their admin access." />
          )}
          <div className="flex justify-end gap-3">
            <Button variant="ghost" onClick={() => setRoleChange(null)}>Cancel</Button>
            <Button onClick={handleRoleChange}>Save Role</Button>
          </div>
        </div>
      </Modal>

      <Modal open={!!bhataToggle} onClose={() => setBhataToggle(null)} title={bhataToggle?.isActive ? "Deactivate Bhata" : "Activate Bhata"}>
        <div className="text-center">
          <div className={`mx-auto flex h-14 w-14 items-center justify-center rounded-full ${bhataToggle?.isActive ? "bg-red-100" : "bg-green-100"}`}>
            {bhataToggle?.isActive ? (
              <Ban className="h-7 w-7 text-red-600" />
            ) : (
              <CircleCheck className="h-7 w-7 text-green-600" />
            )}
          </div>
          <p className="mt-4 text-gray-600">
            Are you sure you want to {bhataToggle?.isActive ? "deactivate" : "activate"}{" "}
            <strong>{bhataToggle?.name}</strong>?
          </p>
          <p className="mt-1 text-sm text-gray-400">
            {bhataToggle?.isActive
              ? "Deactivated bhatas will be hidden from the public listing."
              : "Activated bhatas will appear in the public listing."}
          </p>
          <div className="mt-6 flex justify-center gap-3">
            <Button variant="ghost" onClick={() => setBhataToggle(null)}>Cancel</Button>
            <Button variant={bhataToggle?.isActive ? "destructive" : "default"} onClick={handleBhataToggle}>
              {bhataToggle?.isActive ? "Deactivate" : "Activate"}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, color }: { icon: React.ElementType; label: string; value?: string | number | null; color: string }) {
  const colors: Record<string, string> = {
    blue: "from-blue-100 to-blue-50 text-blue-600",
    orange: "from-orange-100 to-amber-50 text-orange-600",
    green: "from-green-100 to-emerald-50 text-green-600",
    purple: "from-purple-100 to-violet-50 text-purple-600",
  };

  return (
    <motion.div whileHover={{ y: -2 }} className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm hover:shadow-md transition-all duration-200">
      <div className="flex items-center gap-4">
        <div className={`flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${colors[color]} shadow-sm`}>
          <Icon className="h-6 w-6" />
        </div>
        <div>
          <p className="text-sm text-gray-500">{label}</p>
          <p className="text-2xl font-bold text-gray-900">{value ?? <span className="inline-block h-6 w-16 animate-pulse rounded bg-gray-200" />}</p>
        </div>
      </div>
    </motion.div>
  );
}
