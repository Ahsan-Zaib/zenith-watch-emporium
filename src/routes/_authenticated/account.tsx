import { useEffect, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Heart, Package, ShieldCheck, User as UserIcon } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { useCart } from "@/lib/cart";
import { productsQuery } from "@/lib/catalog";
import { formatDate, formatPrice } from "@/lib/format";
import { PageHero } from "@/components/site/PageHero";
import { Reveal } from "@/components/site/Reveal";
import { OrderTracker } from "@/components/site/OrderTracker";
import { ProductCard } from "@/components/site/ProductCard";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/account")({
  head: () => ({
    meta: [
      { title: "My Account — Aurélien Genève" },
      { name: "description", content: "Your Aurélien profile, order history and saved timepieces." },
      { property: "og:title", content: "My Account — Aurélien Genève" },
      { property: "og:description", content: "Profile, orders and wishlist." },
    ],
  }),
  component: AccountPage,
});

type Tab = "orders" | "profile" | "wishlist";

function AccountPage() {
  const { user, isAdmin, refreshRole } = useAuth();
  const queryClient = useQueryClient();
  const { wishlist } = useCart();
  const [tab, setTab] = useState<Tab>("orders");
  const [openOrder, setOpenOrder] = useState<string | null>(null);

  const { data: profile } = useQuery({
    queryKey: ["profile", user?.id],
    queryFn: async () => {
      const { data } = await supabase.from("profiles").select("*").eq("id", user!.id).maybeSingle();
      return data;
    },
    enabled: Boolean(user),
  });

  const { data: orders = [] } = useQuery({
    queryKey: ["my-orders", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("orders")
        .select("*, order_items(*)")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
    enabled: Boolean(user),
  });

  const { data: products = [] } = useQuery(productsQuery());
  const saved = products.filter((p) => wishlist.includes(p.id));

  const [form, setForm] = useState({
    full_name: "",
    phone: "",
    address: "",
    city: "",
    postal_code: "",
    country: "",
  });

  useEffect(() => {
    if (profile) {
      setForm({
        full_name: profile.full_name ?? "",
        phone: profile.phone ?? "",
        address: profile.address ?? "",
        city: profile.city ?? "",
        postal_code: profile.postal_code ?? "",
        country: profile.country ?? "",
      });
    }
  }, [profile]);

  async function saveProfile(e: React.FormEvent) {
    e.preventDefault();
    const { error } = await supabase.from("profiles").update(form).eq("id", user!.id);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Profile updated");
    void queryClient.invalidateQueries({ queryKey: ["profile"] });
  }

  async function claimAdmin() {
    const { data, error } = await supabase.rpc("claim_first_admin");
    if (error) {
      toast.error(error.message);
      return;
    }
    if (data) {
      toast.success("You are now the store administrator");
      await refreshRole();
    } else {
      toast.error("An administrator already exists for this store");
    }
  }

  return (
    <>
      <PageHero
        eyebrow="Client Area"
        title={profile?.full_name ? `Welcome, ${profile.full_name.split(" ")[0]}` : "My Account"}
        description={user?.email ?? ""}
      />

      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
        <div className="flex flex-wrap items-center gap-3">
          {(
            [
              ["orders", "My orders", Package],
              ["profile", "Profile & address", UserIcon],
              ["wishlist", "Wishlist", Heart],
            ] as const
          ).map(([value, label, Icon]) => (
            <button
              key={value}
              type="button"
              onClick={() => setTab(value)}
              className={cn(
                "inline-flex items-center gap-2 rounded-full border px-5 py-2.5 text-xs tracking-[0.16em] uppercase transition-colors duration-500",
                tab === value ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground",
              )}
            >
              <Icon className="h-3.5 w-3.5" />
              {label}
            </button>
          ))}
          {isAdmin ? (
            <Link
              to="/admin"
              className="inline-flex items-center gap-2 rounded-full bg-gold-gradient px-5 py-2.5 text-xs tracking-[0.16em] uppercase text-primary-foreground"
            >
              <ShieldCheck className="h-3.5 w-3.5" />
              Admin dashboard
            </Link>
          ) : (
            <button
              type="button"
              onClick={claimAdmin}
              className="rounded-full border border-border px-5 py-2.5 text-xs tracking-[0.16em] uppercase text-muted-foreground transition-colors hover:border-primary hover:text-primary"
            >
              Claim store owner access
            </button>
          )}
        </div>

        {tab === "orders" ? (
          <div className="mt-10 space-y-5">
            {orders.length === 0 ? (
              <div className="lux-card rounded-lg p-14 text-center">
                <Package className="mx-auto h-7 w-7 text-primary" />
                <h2 className="mt-4 text-2xl">No orders yet</h2>
                <Link to="/shop" className="mt-4 inline-block text-sm text-primary">
                  Start with the collection
                </Link>
              </div>
            ) : (
              orders.map((order, i) => (
                <Reveal key={order.id} delay={i * 70} className="lux-card rounded-lg p-6">
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                      <p className="text-sm">{order.order_number}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatDate(order.created_at)} · {order.order_items?.length ?? 0} item(s)
                      </p>
                    </div>
                    <div className="flex items-center gap-5">
                      <span className="rounded-full border border-primary/40 px-3 py-1 text-xs capitalize text-primary">
                        {order.status}
                      </span>
                      <span className="font-display text-xl text-primary">{formatPrice(order.total)}</span>
                      <button
                        type="button"
                        onClick={() => setOpenOrder(openOrder === order.id ? null : order.id)}
                        className="text-xs tracking-[0.16em] uppercase text-muted-foreground hover:text-primary"
                      >
                        {openOrder === order.id ? "Hide" : "Track"}
                      </button>
                    </div>
                  </div>

                  {openOrder === order.id ? (
                    <div className="mt-7 border-t border-border pt-7">
                      <OrderTracker status={order.status} />
                      <ul className="mt-7 space-y-3">
                        {order.order_items?.map((item) => (
                          <li key={item.id} className="flex items-center gap-4 text-sm">
                            {item.product_image ? (
                              <img
                                src={item.product_image}
                                alt={item.product_name}
                                width={64}
                                height={64}
                                loading="lazy"
                                className="h-12 w-12 rounded object-cover"
                              />
                            ) : null}
                            <span className="flex-1">
                              {item.product_name}
                              <span className="block text-xs text-muted-foreground">
                                {item.quantity} × {formatPrice(item.unit_price)}
                              </span>
                            </span>
                            <span className="text-primary">
                              {formatPrice(Number(item.unit_price) * item.quantity)}
                            </span>
                          </li>
                        ))}
                      </ul>
                      <Link
                        to="/order/$orderNumber"
                        params={{ orderNumber: order.order_number }}
                        className="mt-6 inline-block text-xs tracking-[0.16em] uppercase text-primary"
                      >
                        Full order details
                      </Link>
                    </div>
                  ) : null}
                </Reveal>
              ))
            )}
          </div>
        ) : null}

        {tab === "profile" ? (
          <Reveal className="lux-card mt-10 max-w-2xl rounded-lg p-8">
            <h2 className="text-2xl">Profile & delivery address</h2>
            <form onSubmit={saveProfile} className="mt-6 grid gap-4 sm:grid-cols-2">
              <Field label="Full name" value={form.full_name} onChange={(v) => setForm({ ...form, full_name: v })} />
              <Field label="Phone" value={form.phone} onChange={(v) => setForm({ ...form, phone: v })} />
              <div className="sm:col-span-2">
                <Field label="Address" value={form.address} onChange={(v) => setForm({ ...form, address: v })} />
              </div>
              <Field label="City" value={form.city} onChange={(v) => setForm({ ...form, city: v })} />
              <Field label="Postal code" value={form.postal_code} onChange={(v) => setForm({ ...form, postal_code: v })} />
              <Field label="Country" value={form.country} onChange={(v) => setForm({ ...form, country: v })} />
              <div className="sm:col-span-2">
                <button
                  type="submit"
                  className="mt-2 rounded-full bg-gold-gradient px-8 py-3 text-xs tracking-[0.2em] uppercase text-primary-foreground"
                >
                  Save changes
                </button>
              </div>
            </form>
          </Reveal>
        ) : null}

        {tab === "wishlist" ? (
          <div className="mt-10">
            {saved.length === 0 ? (
              <div className="lux-card rounded-lg p-14 text-center">
                <Heart className="mx-auto h-7 w-7 text-primary" />
                <h2 className="mt-4 text-2xl">Your wishlist is empty</h2>
                <Link to="/shop" className="mt-4 inline-block text-sm text-primary">
                  Find something to save
                </Link>
              </div>
            ) : (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {saved.map((p, i) => (
                  <Reveal key={p.id} delay={i * 80}>
                    <ProductCard product={p} />
                  </Reveal>
                ))}
              </div>
            )}
          </div>
        ) : null}
      </section>
    </>
  );
}

function Field({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <label className="block">
      <span className="text-[0.68rem] tracking-[0.2em] uppercase text-muted-foreground">{label}</span>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-2 w-full rounded border border-border bg-background/50 px-4 py-3 text-sm outline-none transition-colors focus:border-primary"
      />
    </label>
  );
}
