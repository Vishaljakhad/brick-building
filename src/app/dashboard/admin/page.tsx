"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Modal } from "@/components/ui/modal";
import { StatCardSkeleton } from "@/components/ui/skeleton";
import { formatPrice } from "@/lib/utils";
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
} from "lucide-react";

interface BrickType {
  id: string;
  name: string;
  description: string | null;
  unit: string;
  basePrice: number;
  image: string | null;
}

interface DashboardStats {
  totalUsers: number;
  totalBhatas: number;
  totalOrders: number;
  totalRevenue: number;
}

export default function AdminDashboard() {
  const { data: session } = useSession();
  const router = useRouter();
  const [brickTypes, setBrickTypes] = useState<BrickType[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<BrickType | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<BrickType | null>(null);
  const [form, setForm] = useState({ name: "", description: "", unit: "pieces", basePrice: "" });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchBrickTypes();
    fetchStats();
  }, []);

  const fetchBrickTypes = async () => {
    const res = await fetch("/api/brick-types");
    const data = await res.json();
    setBrickTypes(data);
  };

  const fetchStats = async () => {
    try {
      const [usersRes, bhatasRes, ordersRes] = await Promise.all([
        fetch("/api/admin/users"),
        fetch("/api/admin/bhatas"),
        fetch("/api/orders"),
      ]);
      const users = await usersRes.json();
      const bhatas = await bhatasRes.json();
      const orders = await ordersRes.json();
      setStats({
        totalUsers: users.length || 0,
        totalBhatas: bhatas.length || 0,
        totalOrders: orders.length || 0,
        totalRevenue: orders.reduce((sum: number, o: any) => sum + (o.totalAmount || 0), 0),
      });
    } catch {}
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const method = editing ? "PUT" : "POST";
      const res = await fetch("/api/brick-types", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...(editing ? { id: editing.id } : {}),
          name: form.name,
          description: form.description,
          unit: form.unit,
          basePrice: parseFloat(form.basePrice),
        }),
      });

      if (!res.ok) {
        toast.error("Failed to save brick type");
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
        toast.error("Failed to delete brick type");
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

  if (!session || session.user.role !== "ADMIN") {
    return <div className="p-8 text-center">Access denied</div>;
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="mt-1 text-gray-600">Manage brick types, users, and platform settings</p>
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
                  <Input
                    placeholder="Brick name"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    required
                  />
                  <Input
                    placeholder="Description"
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                  />
                  <Input
                    placeholder="Unit"
                    value={form.unit}
                    onChange={(e) => setForm({ ...form, unit: e.target.value })}
                  />
                  <Input
                    type="number"
                    placeholder="Base price (₹)"
                    value={form.basePrice}
                    onChange={(e) => setForm({ ...form, basePrice: e.target.value })}
                    required
                  />
                </div>
                <div className="mt-3 flex gap-2">
                  <Button type="submit" size="sm" disabled={saving}>
                    {saving ? (
                      <span className="flex items-center gap-1"><span className="h-3 w-3 animate-spin rounded-full border-2 border-white border-t-transparent" /> Saving...</span>
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
                          <button onClick={() => startEdit(bt)} className="rounded-lg p-1.5 text-blue-600 hover:bg-blue-50 transition-colors">
                            <Edit2 className="h-4 w-4" />
                          </button>
                          <button onClick={() => setDeleteTarget(bt)} className="rounded-lg p-1.5 text-red-600 hover:bg-red-50 transition-colors">
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
    </div>
  );
}

function StatCard({ icon: Icon, label, value, color }: { icon: any; label: string; value: any; color: string }) {
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
