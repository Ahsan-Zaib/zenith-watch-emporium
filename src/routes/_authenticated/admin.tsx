import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  BadgePercent,
  Boxes,
  LayoutDashboard,
  Package,
  Plus,
  Save,
  ShoppingCart,
  Trash2,
  Users,
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { allProductsQuery, categoriesQuery, couponsQuery } from "@/lib/catalog";
import { formatDate, formatPrice, ORDER_STATUSES } from "@/lib/format";
import { Reveal } from "@/components/site/Reveal";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/admin")({
  head: () => ({
    meta: [
      { title: "Admin Dashboard — AURAZ " },
      { name: "description", content: "Manage products, inventory, orders, customers and discounts." },
      { property: "og:title", content: "Admin Dashboard — AURAZ" },
      { property: "og:description", content: "Store management for AURAZ." },
    ],
  }),
  component: AdminPage,
});

type Section = "overview" | "products" | "inventory" | "orders" | "customers" | "discounts";

const SECTIONS: [Section, string, typeof LayoutDashboard][] = [
  ["overview", "Overview", LayoutDashboard],
  ["products", "Products", Package],
  ["inventory", "Inventory", Boxes],
  ["orders", "Orders", ShoppingCart],
  ["customers", "Customers", Users],
  ["discounts", "Discounts", BadgePercent],
];

function AdminPage() {
  const { isAdmin, loading } = useAuth();
  const [section, setSection] = useState<Section>("overview");

  if (loading) {
    return <div className="py-32 text-center text-muted-foreground">Checking permissions…</div>;
  }

  if (!isAdmin) {
    return (
      <div className="mx-auto max-w-xl px-4 py-32 text-center">
        <h1 className="text-3xl">Administrators only</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          Your account doesn't have store management access. If you own this store, open My Account and
          claim store owner access.
        </p>
      </div>
    );
  }

  return (
    <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
      <p className="eyebrow">Store Management</p>
      <h1 className="mt-3 text-4xl md:text-5xl">Admin Dashboard</h1>

      <div className="mt-8 flex flex-wrap gap-2">
        {SECTIONS.map(([value, label, Icon]) => (
          <button
            key={value}
            type="button"
            onClick={() => setSection(value)}
            className={cn(
              "inline-flex items-center gap-2 rounded-full border px-5 py-2.5 text-xs tracking-[0.16em] uppercase transition-colors duration-500",
              section === value
                ? "border-primary bg-primary/10 text-primary"
                : "border-border text-muted-foreground hover:border-primary/50",
            )}
          >
            <Icon className="h-3.5 w-3.5" />
            {label}
          </button>
        ))}
      </div>

      <div className="mt-10">
        {section === "overview" ? <Overview /> : null}
        {section === "products" ? <Products /> : null}
        {section === "inventory" ? <Inventory /> : null}
        {section === "orders" ? <Orders /> : null}
        {section === "customers" ? <Customers /> : null}
        {section === "discounts" ? <Discounts /> : null}
      </div>
    </section>
  );
}

type Summary = {
  revenue: number;
  orders: number;
  customers: number;
  products: number;
  low_stock: number;
  out_of_stock: number;
  daily: { day: string; revenue: number; orders: number }[];
  top_products: { name: string; units: number; revenue: number }[];
};

function Overview() {
  const { data } = useQuery({
    queryKey: ["admin-summary"],
    queryFn: async (): Promise<Summary> => {
      const { data: summary, error } = await supabase.rpc("admin_sales_summary");
      if (error) throw error;
      return summary as unknown as Summary;
    },
  });

  const { data: recent = [] } = useQuery({
    queryKey: ["admin-recent-orders"],
    queryFn: async () => {
      const { data: orders } = await supabase
        .from("orders")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(6);
      return orders ?? [];
    },
  });

  const stats = [
    { label: "Revenue", value: formatPrice(data?.revenue ?? 0) },
    { label: "Orders", value: String(data?.orders ?? 0) },
    { label: "Customers", value: String(data?.customers ?? 0) },
    { label: "Products", value: String(data?.products ?? 0) },
    { label: "Low stock", value: String(data?.low_stock ?? 0) },
    { label: "Out of stock", value: String(data?.out_of_stock ?? 0) },
  ];

  return (
    <div className="space-y-8">
      <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-6">
        {stats.map((s, i) => (
          <Reveal key={s.label} delay={i * 60} className="lux-card rounded-lg p-5">
            <p className="text-[0.65rem] tracking-[0.2em] uppercase text-muted-foreground">{s.label}</p>
            <p className="mt-2 font-display text-2xl text-primary">{s.value}</p>
          </Reveal>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="lux-card rounded-lg p-6">
          <h2 className="text-xl">Revenue, last 14 days</h2>
          <div className="mt-6 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data?.daily ?? []}>
                <CartesianGrid stroke="var(--border)" vertical={false} />
                <XAxis dataKey="day" stroke="var(--muted-foreground)" fontSize={11} />
                <YAxis stroke="var(--muted-foreground)" fontSize={11} />
                <Tooltip
                  contentStyle={{
                    background: "var(--card)",
                    border: "1px solid var(--border)",
                    borderRadius: 8,
                  }}
                />
                <Line type="monotone" dataKey="revenue" stroke="var(--gold)" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="lux-card rounded-lg p-6">
          <h2 className="text-xl">Best-selling products</h2>
          <div className="mt-6 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data?.top_products ?? []}>
                <CartesianGrid stroke="var(--border)" vertical={false} />
                <XAxis dataKey="name" stroke="var(--muted-foreground)" fontSize={10} hide />
                <YAxis stroke="var(--muted-foreground)" fontSize={11} />
                <Tooltip
                  contentStyle={{
                    background: "var(--card)",
                    border: "1px solid var(--border)",
                    borderRadius: 8,
                  }}
                />
                <Bar dataKey="units" fill="var(--gold)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <ul className="mt-4 space-y-1 text-xs text-muted-foreground">
            {(data?.top_products ?? []).map((p) => (
              <li key={p.name} className="flex justify-between">
                <span>{p.name}</span>
                <span>
                  {p.units} units · {formatPrice(p.revenue)}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="lux-card rounded-lg p-6">
        <h2 className="text-xl">Recent orders</h2>
        <div className="mt-5 overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="text-[0.65rem] tracking-[0.18em] uppercase text-muted-foreground">
                <th className="pb-3">Order</th>
                <th className="pb-3">Customer</th>
                <th className="pb-3">Date</th>
                <th className="pb-3">Status</th>
                <th className="pb-3 text-right">Total</th>
              </tr>
            </thead>
            <tbody>
              {recent.map((o) => (
                <tr key={o.id} className="border-t border-border">
                  <td className="py-3">{o.order_number}</td>
                  <td className="py-3">{o.customer_name}</td>
                  <td className="py-3">{formatDate(o.created_at)}</td>
                  <td className="py-3 capitalize text-primary">{o.status}</td>
                  <td className="py-3 text-right">{formatPrice(o.total)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {recent.length === 0 ? (
            <p className="py-6 text-sm text-muted-foreground">No orders yet.</p>
          ) : null}
        </div>
      </div>
    </div>
  );
}

const EMPTY_PRODUCT = {
  name: "",
  slug: "",
  brand: "",
  model: "",
  description: "",
  price: "",
  original_price: "",
  category_id: "",
  gender: "men",
  material: "",
  strap: "",
  case_size: "",
  movement: "",
  water_resistance: "",
  colors: "",
  images: "",
  stock: "0",
  status: "active",
  is_featured: false,
  is_new: false,
  is_best_seller: false,
};

function Products() {
  const queryClient = useQueryClient();
  const { data: products = [] } = useQuery(allProductsQuery());
  const { data: categories = [] } = useQuery(categoriesQuery());
  const [editing, setEditing] = useState<string | null>(null);
  const [form, setForm] = useState({ ...EMPTY_PRODUCT });

  function loadProduct(id: string) {
    const p = products.find((x) => x.id === id);
    if (!p) return;
    setEditing(id);
    setForm({
      name: p.name,
      slug: p.slug,
      brand: p.brand,
      model: p.model ?? "",
      description: p.description ?? "",
      price: String(p.price),
      original_price: p.original_price ? String(p.original_price) : "",
      category_id: p.category_id ?? "",
      gender: p.gender,
      material: p.material ?? "",
      strap: p.strap ?? "",
      case_size: p.case_size ?? "",
      movement: p.movement ?? "",
      water_resistance: p.water_resistance ?? "",
      colors: p.colors.join(", "),
      images: p.images.join(", "),
      stock: String(p.stock),
      status: p.status,
      is_featured: p.is_featured,
      is_new: p.is_new,
      is_best_seller: p.is_best_seller,
    });
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    const payload = {
      name: form.name,
      slug: form.slug || form.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""),
      brand: form.brand,
      model: form.model || null,
      description: form.description || null,
      price: Number(form.price) || 0,
      original_price: form.original_price ? Number(form.original_price) : null,
      category_id: form.category_id || null,
      gender: form.gender,
      material: form.material || null,
      strap: form.strap || null,
      case_size: form.case_size || null,
      movement: form.movement || null,
      water_resistance: form.water_resistance || null,
      colors: form.colors ? form.colors.split(",").map((s) => s.trim()).filter(Boolean) : [],
      images: form.images ? form.images.split(",").map((s) => s.trim()).filter(Boolean) : [],
      stock: Number(form.stock) || 0,
      status: form.status,
      is_featured: form.is_featured,
      is_new: form.is_new,
      is_best_seller: form.is_best_seller,
    };

    const { error } = editing
      ? await supabase.from("products").update(payload).eq("id", editing)
      : await supabase.from("products").insert(payload);

    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success(editing ? "Product updated" : "Product added");
    setEditing(null);
    setForm({ ...EMPTY_PRODUCT });
    void queryClient.invalidateQueries({ queryKey: ["products"] });
  }

  async function remove(id: string) {
    const { error } = await supabase.from("products").delete().eq("id", id);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Product deleted");
    void queryClient.invalidateQueries({ queryKey: ["products"] });
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
      <div className="lux-card rounded-lg p-6">
        <h2 className="text-xl">Catalogue ({products.length})</h2>
        <div className="mt-5 space-y-3">
          {products.map((p) => (
            <div key={p.id} className="flex items-center gap-4 border-b border-border pb-3">
              <img
                src={p.images[0] ?? "/images/watches/noir-classic.jpg"}
                alt={p.name}
                width={64}
                height={64}
                loading="lazy"
                className="h-12 w-12 rounded object-cover"
              />
              <div className="flex-1 text-sm">
                <p>{p.name}</p>
                <p className="text-xs text-muted-foreground">
                  {p.brand} · {formatPrice(p.price)} · {p.stock} in stock · {p.status}
                </p>
              </div>
              <button
                type="button"
                onClick={() => loadProduct(p.id)}
                className="text-xs tracking-[0.14em] uppercase text-primary"
              >
                Edit
              </button>
              <button type="button" aria-label="Delete" onClick={() => remove(p.id)}>
                <Trash2 className="h-4 w-4 text-muted-foreground transition-colors hover:text-destructive" />
              </button>
            </div>
          ))}
        </div>
      </div>

      <form onSubmit={save} className="lux-card h-fit rounded-lg p-6">
        <h2 className="text-xl">{editing ? "Edit product" : "Add product"}</h2>
        <div className="mt-5 space-y-3">
          <In label="Name" value={form.name} onChange={(v) => setForm({ ...form, name: v })} required />
          <In label="Slug (URL)" value={form.slug} onChange={(v) => setForm({ ...form, slug: v })} />
          <In label="Brand" value={form.brand} onChange={(v) => setForm({ ...form, brand: v })} required />
          <In label="Model" value={form.model} onChange={(v) => setForm({ ...form, model: v })} />
          <In label="Price" value={form.price} onChange={(v) => setForm({ ...form, price: v })} required />
          <In
            label="Original price (for discount)"
            value={form.original_price}
            onChange={(v) => setForm({ ...form, original_price: v })}
          />
          <In label="Stock quantity" value={form.stock} onChange={(v) => setForm({ ...form, stock: v })} />
          <Sel
            label="Category"
            value={form.category_id}
            onChange={(v) => setForm({ ...form, category_id: v })}
            options={[{ value: "", label: "Uncategorised" }, ...categories.map((c) => ({ value: c.id, label: c.name }))]}
          />
          <Sel
            label="Gender"
            value={form.gender}
            onChange={(v) => setForm({ ...form, gender: v })}
            options={[
              { value: "men", label: "Men" },
              { value: "women", label: "Women" },
              { value: "unisex", label: "Unisex" },
            ]}
          />
          <Sel
            label="Status"
            value={form.status}
            onChange={(v) => setForm({ ...form, status: v })}
            options={[
              { value: "active", label: "Active" },
              { value: "draft", label: "Draft (hidden)" },
            ]}
          />
          <In label="Material" value={form.material} onChange={(v) => setForm({ ...form, material: v })} />
          <In label="Strap" value={form.strap} onChange={(v) => setForm({ ...form, strap: v })} />
          <In label="Case size" value={form.case_size} onChange={(v) => setForm({ ...form, case_size: v })} />
          <In label="Movement" value={form.movement} onChange={(v) => setForm({ ...form, movement: v })} />
          <In
            label="Water resistance"
            value={form.water_resistance}
            onChange={(v) => setForm({ ...form, water_resistance: v })}
          />
          <In
            label="Colours (comma separated)"
            value={form.colors}
            onChange={(v) => setForm({ ...form, colors: v })}
          />
          <In
            label="Image URLs (comma separated)"
            value={form.images}
            onChange={(v) => setForm({ ...form, images: v })}
          />
          <label className="block">
            <span className="text-[0.65rem] tracking-[0.18em] uppercase text-muted-foreground">
              Description
            </span>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={3}
              className="mt-2 w-full rounded border border-border bg-background/50 px-3 py-2 text-sm outline-none focus:border-primary"
            />
          </label>

          <div className="flex flex-wrap gap-4 pt-2 text-xs">
            {(
              [
                ["is_featured", "Featured"],
                ["is_new", "New arrival"],
                ["is_best_seller", "Best seller"],
              ] as const
            ).map(([key, label]) => (
              <label key={key} className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={form[key]}
                  onChange={(e) => setForm({ ...form, [key]: e.target.checked })}
                  className="accent-primary"
                />
                {label}
              </label>
            ))}
          </div>
        </div>

        <div className="mt-6 flex gap-3">
          <button
            type="submit"
            className="inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-gold-gradient py-3 text-xs tracking-[0.18em] uppercase text-primary-foreground"
          >
            {editing ? <Save className="h-3.5 w-3.5" /> : <Plus className="h-3.5 w-3.5" />}
            {editing ? "Save" : "Add"}
          </button>
          {editing ? (
            <button
              type="button"
              onClick={() => {
                setEditing(null);
                setForm({ ...EMPTY_PRODUCT });
              }}
              className="rounded-full border border-border px-5 text-xs tracking-[0.16em] uppercase text-muted-foreground"
            >
              Cancel
            </button>
          ) : null}
        </div>
      </form>
    </div>
  );
}

function Inventory() {
  const queryClient = useQueryClient();
  const { data: products = [] } = useQuery(allProductsQuery());
  const { data: logs = [] } = useQuery({
    queryKey: ["inventory-logs"],
    queryFn: async () => {
      const { data } = await supabase
        .from("inventory_logs")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(25);
      return data ?? [];
    },
  });
  const [adjust, setAdjust] = useState<Record<string, string>>({});

  const low = products.filter((p) => p.stock > 0 && p.stock <= 5);
  const out = products.filter((p) => p.stock === 0);

  async function applyAdjustment(id: string, current: number) {
    const raw = adjust[id];
    const change = Number(raw);
    if (!raw || Number.isNaN(change) || change === 0) {
      toast.error("Enter a positive or negative number");
      return;
    }
    const next = Math.max(0, current + change);
    const { error } = await supabase.from("products").update({ stock: next }).eq("id", id);
    if (error) {
      toast.error(error.message);
      return;
    }
    await supabase.from("inventory_logs").insert({
      product_id: id,
      change,
      resulting_stock: next,
      reason: "Manual adjustment",
    });
    toast.success(`Stock updated to ${next}`);
    setAdjust({ ...adjust, [id]: "" });
    void queryClient.invalidateQueries({ queryKey: ["products"] });
    void queryClient.invalidateQueries({ queryKey: ["inventory-logs"] });
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Tracked products" value={String(products.length)} />
        <StatCard label="Low stock (≤5)" value={String(low.length)} />
        <StatCard label="Out of stock" value={String(out.length)} />
      </div>

      <div className="lux-card rounded-lg p-6">
        <h2 className="text-xl">Stock levels & adjustment</h2>
        <div className="mt-5 space-y-3">
          {products.map((p) => (
            <div key={p.id} className="flex flex-wrap items-center gap-4 border-b border-border pb-3">
              <div className="flex-1 text-sm">
                <p>{p.name}</p>
                <p
                  className={cn(
                    "text-xs",
                    p.stock === 0 ? "text-destructive" : p.stock <= 5 ? "text-warning" : "text-muted-foreground",
                  )}
                >
                  {p.stock} in stock
                </p>
              </div>
              <input
                value={adjust[p.id] ?? ""}
                onChange={(e) => setAdjust({ ...adjust, [p.id]: e.target.value })}
                placeholder="+5 / -2"
                className="w-24 rounded border border-border bg-background/50 px-3 py-2 text-sm outline-none focus:border-primary"
              />
              <button
                type="button"
                onClick={() => applyAdjustment(p.id, p.stock)}
                className="rounded-full border border-primary px-4 py-2 text-xs tracking-[0.14em] uppercase text-primary"
              >
                Apply
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="lux-card rounded-lg p-6">
        <h2 className="text-xl">Inventory history</h2>
        <ul className="mt-5 space-y-2 text-sm">
          {logs.map((log) => {
            const product = products.find((p) => p.id === log.product_id);
            return (
              <li key={log.id} className="flex justify-between border-b border-border pb-2">
                <span>
                  {product?.name ?? "Product"}{" "}
                  <span className="text-xs text-muted-foreground">{log.reason}</span>
                </span>
                <span className={cn("text-xs", log.change < 0 ? "text-destructive" : "text-success")}>
                  {log.change > 0 ? `+${log.change}` : log.change} → {log.resulting_stock} ·{" "}
                  {formatDate(log.created_at)}
                </span>
              </li>
            );
          })}
          {logs.length === 0 ? <li className="text-muted-foreground">No movements recorded yet.</li> : null}
        </ul>
      </div>
    </div>
  );
}

function Orders() {
  const queryClient = useQueryClient();
  const [term, setTerm] = useState("");
  const [status, setStatus] = useState("");
  const { data: orders = [] } = useQuery({
    queryKey: ["admin-orders"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("orders")
        .select("*, order_items(*)")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  const filtered = useMemo(
    () =>
      orders.filter((o) => {
        if (status && o.status !== status) return false;
        if (term) {
          const hay = `${o.order_number} ${o.customer_name} ${o.customer_email}`.toLowerCase();
          if (!hay.includes(term.toLowerCase())) return false;
        }
        return true;
      }),
    [orders, term, status],
  );

  async function updateStatus(id: string, next: string) {
    const { error } = await supabase
      .from("orders")
      .update({ status: next, updated_at: new Date().toISOString() })
      .eq("id", id);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success(`Order marked ${next}`);
    void queryClient.invalidateQueries({ queryKey: ["admin-orders"] });
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap gap-3">
        <input
          value={term}
          onChange={(e) => setTerm(e.target.value)}
          placeholder="Search order number, customer or email"
          className="flex-1 rounded-full border border-border bg-card px-5 py-2.5 text-sm outline-none focus:border-primary"
        />
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="rounded-full border border-border bg-card px-4 py-2.5 text-xs tracking-[0.14em] uppercase outline-none focus:border-primary"
        >
          <option value="">All statuses</option>
          {ORDER_STATUSES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>

      {filtered.map((o) => (
        <div key={o.id} className="lux-card rounded-lg p-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-sm">{o.order_number}</p>
              <p className="text-xs text-muted-foreground">
                {o.customer_name} · {o.customer_email} · {o.customer_phone ?? "no phone"}
              </p>
              <p className="text-xs text-muted-foreground">
                {o.address}, {o.city} {o.postal_code}, {o.country}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                {formatDate(o.created_at)} · {o.payment_method.replace(/_/g, " ")} · {o.payment_status}
              </p>
            </div>
            <div className="flex items-center gap-4">
              <span className="font-display text-xl text-primary">{formatPrice(o.total)}</span>
              <select
                value={o.status}
                onChange={(e) => updateStatus(o.id, e.target.value)}
                className="rounded-full border border-border bg-background/50 px-4 py-2 text-xs capitalize outline-none focus:border-primary"
              >
                {ORDER_STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <ul className="mt-4 space-y-1 text-xs text-muted-foreground">
            {o.order_items?.map((item) => (
              <li key={item.id}>
                {item.quantity} × {item.product_name} — {formatPrice(item.unit_price)}
              </li>
            ))}
          </ul>
        </div>
      ))}
      {filtered.length === 0 ? (
        <p className="py-10 text-center text-sm text-muted-foreground">No orders match that search.</p>
      ) : null}
    </div>
  );
}

function Customers() {
  const { data: customers = [] } = useQuery({
    queryKey: ["admin-customers"],
    queryFn: async () => {
      const { data } = await supabase.from("profiles").select("*").order("created_at", { ascending: false });
      return data ?? [];
    },
  });
  const { data: orders = [] } = useQuery({
    queryKey: ["admin-orders"],
    queryFn: async () => {
      const { data } = await supabase.from("orders").select("*").order("created_at", { ascending: false });
      return data ?? [];
    },
  });

  return (
    <div className="lux-card rounded-lg p-6">
      <h2 className="text-xl">Customers ({customers.length})</h2>
      <div className="mt-5 space-y-4">
        {customers.map((c) => {
          const theirs = orders.filter((o) => o.user_id === c.id);
          const spend = theirs.reduce((sum, o) => sum + Number(o.total), 0);
          return (
            <div key={c.id} className="border-b border-border pb-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-sm">{c.full_name ?? "Unnamed customer"}</p>
                  <p className="text-xs text-muted-foreground">
                    {c.email} · joined {formatDate(c.created_at)}
                  </p>
                </div>
                <p className="text-xs text-muted-foreground">
                  {theirs.length} orders · {formatPrice(spend)} lifetime
                </p>
              </div>
              {theirs.length ? (
                <ul className="mt-2 space-y-1 text-xs text-muted-foreground">
                  {theirs.slice(0, 4).map((o) => (
                    <li key={o.id}>
                      {o.order_number} — {o.status} — {formatPrice(o.total)}
                    </li>
                  ))}
                </ul>
              ) : null}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function Discounts() {
  const queryClient = useQueryClient();
  const { data: coupons = [] } = useQuery(couponsQuery());
  const [form, setForm] = useState({
    code: "",
    discount_type: "percent",
    discount_value: "",
    min_order_amount: "0",
    starts_at: "",
    ends_at: "",
    is_active: true,
  });

  async function create(e: React.FormEvent) {
    e.preventDefault();
    const { error } = await supabase.from("coupons").insert({
      code: form.code.toUpperCase().trim(),
      discount_type: form.discount_type,
      discount_value: Number(form.discount_value) || 0,
      min_order_amount: Number(form.min_order_amount) || 0,
      starts_at: form.starts_at ? new Date(form.starts_at).toISOString() : null,
      ends_at: form.ends_at ? new Date(form.ends_at).toISOString() : null,
      is_active: form.is_active,
    });
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Coupon created");
    setForm({ ...form, code: "", discount_value: "" });
    void queryClient.invalidateQueries({ queryKey: ["coupons"] });
  }

  async function toggle(id: string, active: boolean) {
    await supabase.from("coupons").update({ is_active: !active }).eq("id", id);
    void queryClient.invalidateQueries({ queryKey: ["coupons"] });
  }

  async function remove(id: string) {
    await supabase.from("coupons").delete().eq("id", id);
    toast.success("Coupon removed");
    void queryClient.invalidateQueries({ queryKey: ["coupons"] });
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
      <div className="lux-card rounded-lg p-6">
        <h2 className="text-xl">Coupons & discounts</h2>
        <div className="mt-5 space-y-3">
          {coupons.map((c) => (
            <div key={c.id} className="flex flex-wrap items-center gap-4 border-b border-border pb-3 text-sm">
              <span className="font-display text-lg text-primary">{c.code}</span>
              <span className="text-xs text-muted-foreground">
                {c.discount_type === "percent" ? `${c.discount_value}% off` : `${formatPrice(c.discount_value)} off`}
                {" · min "}
                {formatPrice(c.min_order_amount)}
                {c.ends_at ? ` · ends ${formatDate(c.ends_at)}` : ""}
              </span>
              <span className="ml-auto flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => toggle(c.id, c.is_active)}
                  className={cn(
                    "rounded-full border px-3 py-1 text-xs",
                    c.is_active ? "border-success text-success" : "border-border text-muted-foreground",
                  )}
                >
                  {c.is_active ? "Active" : "Inactive"}
                </button>
                <button type="button" aria-label="Delete coupon" onClick={() => remove(c.id)}>
                  <Trash2 className="h-4 w-4 text-muted-foreground transition-colors hover:text-destructive" />
                </button>
              </span>
            </div>
          ))}
        </div>
      </div>

      <form onSubmit={create} className="lux-card h-fit rounded-lg p-6">
        <h2 className="text-xl">New coupon</h2>
        <div className="mt-5 space-y-3">
          <In label="Code" value={form.code} onChange={(v) => setForm({ ...form, code: v })} required />
          <Sel
            label="Type"
            value={form.discount_type}
            onChange={(v) => setForm({ ...form, discount_type: v })}
            options={[
              { value: "percent", label: "Percentage" },
              { value: "fixed", label: "Fixed amount" },
            ]}
          />
          <In
            label="Value"
            value={form.discount_value}
            onChange={(v) => setForm({ ...form, discount_value: v })}
            required
          />
          <In
            label="Minimum order amount"
            value={form.min_order_amount}
            onChange={(v) => setForm({ ...form, min_order_amount: v })}
          />
          <In label="Starts (YYYY-MM-DD)" value={form.starts_at} onChange={(v) => setForm({ ...form, starts_at: v })} />
          <In label="Ends (YYYY-MM-DD)" value={form.ends_at} onChange={(v) => setForm({ ...form, ends_at: v })} />
          <label className="flex items-center gap-2 text-xs">
            <input
              type="checkbox"
              checked={form.is_active}
              onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
              className="accent-primary"
            />
            Active
          </label>
        </div>
        <button
          type="submit"
          className="mt-6 w-full rounded-full bg-gold-gradient py-3 text-xs tracking-[0.18em] uppercase text-primary-foreground"
        >
          Create coupon
        </button>
      </form>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="lux-card rounded-lg p-5">
      <p className="text-[0.65rem] tracking-[0.2em] uppercase text-muted-foreground">{label}</p>
      <p className="mt-2 font-display text-2xl text-primary">{value}</p>
    </div>
  );
}

function In({
  label,
  value,
  onChange,
  required = false,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  required?: boolean;
}) {
  return (
    <label className="block">
      <span className="text-[0.65rem] tracking-[0.18em] uppercase text-muted-foreground">{label}</span>
      <input
        value={value}
        required={required}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1.5 w-full rounded border border-border bg-background/50 px-3 py-2 text-sm outline-none transition-colors focus:border-primary"
      />
    </label>
  );
}

function Sel({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <label className="block">
      <span className="text-[0.65rem] tracking-[0.18em] uppercase text-muted-foreground">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1.5 w-full rounded border border-border bg-background/50 px-3 py-2 text-sm outline-none focus:border-primary"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  );
}
