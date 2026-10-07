import { useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { CreditCard, Landmark, Banknote, Lock, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useCart } from "@/lib/cart";
import { useAuth } from "@/lib/auth";
import { formatPrice, shippingFor } from "@/lib/format";
import { PageHero } from "@/components/site/PageHero";
import { Reveal } from "@/components/site/Reveal";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/checkout")({
  head: () => ({
    meta: [
      { title: "Checkout — Aurélien Genève" },
      {
        name: "description",
        content: "Secure checkout with delivery details, coupon codes and payment method selection.",
      },
      { property: "og:title", content: "Checkout — Aurélien Genève" },
      { property: "og:description", content: "Complete your order securely." },
    ],
  }),
  component: CheckoutPage,
});

const PAYMENT_METHODS = [
  { value: "mock_card", label: "Card (test mode)", Icon: CreditCard, note: "Simulated authorisation — no card details are stored." },
  { value: "bank_transfer", label: "Bank transfer", Icon: Landmark, note: "We email transfer instructions after you order." },
  { value: "cash_on_delivery", label: "Cash on delivery", Icon: Banknote, note: "Pay the courier when your watch arrives." },
];

function CheckoutPage() {
  const { lines, subtotal, clear } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    postal_code: "",
    country: "",
    notes: "",
  });
  const [coupon, setCoupon] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; discount: number } | null>(null);
  const [method, setMethod] = useState("mock_card");
  const [submitting, setSubmitting] = useState(false);

  const discount = appliedCoupon?.discount ?? 0;
  const shipping = lines.length ? shippingFor(subtotal - discount) : 0;
  const total = Math.max(0, subtotal - discount + shipping);

  async function applyCoupon() {
    const code = coupon.trim();
    if (!code) return;
    const { data, error } = await supabase
      .from("coupons")
      .select("*")
      .ilike("code", code)
      .eq("is_active", true)
      .maybeSingle();
    if (error || !data) {
      toast.error("That coupon code isn't valid");
      setAppliedCoupon(null);
      return;
    }
    if (subtotal < Number(data.min_order_amount)) {
      toast.error(`This code needs a minimum order of ${formatPrice(data.min_order_amount)}`);
      return;
    }
    const value =
      data.discount_type === "percent"
        ? Math.round(subtotal * (Number(data.discount_value) / 100))
        : Math.min(Number(data.discount_value), subtotal);
    setAppliedCoupon({ code: data.code, discount: value });
    toast.success(`Code ${data.code} applied — you saved ${formatPrice(value)}`);
  }

  async function placeOrder(e: React.FormEvent) {
    e.preventDefault();
    if (!user) {
      toast.error("Please sign in to complete your order");
      void navigate({ to: "/auth" });
      return;
    }
    if (!lines.length) return;
    setSubmitting(true);
    const { data, error } = await supabase.rpc("place_order", {
      p_items: lines.map((l) => ({
        product_id: l.productId,
        quantity: l.quantity,
        variant: l.variant ?? null,
      })),
      p_customer: { ...form, email: form.email || user.email },
      p_coupon: appliedCoupon?.code ?? coupon.trim(),
      p_payment_method: method,
    });
    setSubmitting(false);

    if (error) {
      toast.error(error.message.replace(/^.*?:\s*/, ""));
      return;
    }
    const result = data as { order_number: string };
    clear();
    void navigate({ to: "/order/$orderNumber", params: { orderNumber: result.order_number } });
  }

  if (!lines.length) {
    return (
      <>
        <PageHero eyebrow="Checkout" title="Nothing to check out" />
        <div className="mx-auto max-w-3xl px-4 py-20 text-center">
          <p className="text-sm text-muted-foreground">Your bag is empty.</p>
          <Link
            to="/shop"
            className="mt-6 inline-block rounded-full bg-gold-gradient px-8 py-3 text-xs tracking-[0.2em] uppercase text-primary-foreground"
          >
            Browse the collection
          </Link>
        </div>
      </>
    );
  }

  return (
    <>
      <PageHero eyebrow="Secure Checkout" title="Complete your order" />
      <form onSubmit={placeOrder} className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 lg:grid-cols-[1.5fr_1fr]">
        <div className="space-y-8">
          {!user ? (
            <div className="glass-panel rounded-lg p-5 text-sm">
              <p className="text-muted-foreground">
                You'll need an account to track this order.{" "}
                <Link to="/auth" className="text-primary">
                  Sign in or create one
                </Link>
                .
              </p>
            </div>
          ) : null}

          <Reveal className="lux-card rounded-lg p-7">
            <h2 className="text-2xl">Customer information</h2>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <Field label="Full name" value={form.name} onChange={(v) => setForm({ ...form, name: v })} required />
              <Field
                label="Email"
                type="email"
                value={form.email}
                onChange={(v) => setForm({ ...form, email: v })}
                placeholder={user?.email ?? ""}
              />
              <Field label="Phone number" value={form.phone} onChange={(v) => setForm({ ...form, phone: v })} required />
              <Field label="Country" value={form.country} onChange={(v) => setForm({ ...form, country: v })} required />
            </div>
          </Reveal>

          <Reveal delay={90} className="lux-card rounded-lg p-7">
            <h2 className="text-2xl">Delivery address</h2>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <Field label="Street address" value={form.address} onChange={(v) => setForm({ ...form, address: v })} required />
              </div>
              <Field label="City" value={form.city} onChange={(v) => setForm({ ...form, city: v })} required />
              <Field label="Postal code" value={form.postal_code} onChange={(v) => setForm({ ...form, postal_code: v })} required />
              <div className="sm:col-span-2">
                <Field label="Delivery notes (optional)" value={form.notes} onChange={(v) => setForm({ ...form, notes: v })} />
              </div>
            </div>
          </Reveal>

          <Reveal delay={150} className="lux-card rounded-lg p-7">
            <h2 className="text-2xl">Payment method</h2>
            <div className="mt-6 space-y-3">
              {PAYMENT_METHODS.map(({ value, label, Icon, note }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setMethod(value)}
                  className={cn(
                    "flex w-full items-start gap-4 rounded-lg border p-4 text-left transition-colors duration-500",
                    method === value ? "border-primary bg-primary/5" : "border-border hover:border-primary/50",
                  )}
                >
                  <Icon className={cn("mt-0.5 h-5 w-5", method === value ? "text-primary" : "text-muted-foreground")} />
                  <span>
                    <span className="block text-sm">{label}</span>
                    <span className="mt-1 block text-xs text-muted-foreground">{note}</span>
                  </span>
                </button>
              ))}
            </div>
            <p className="mt-5 flex items-start gap-2 text-xs leading-relaxed text-muted-foreground">
              <Lock className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
              This demo runs a safe test payment flow. No card numbers, CVV codes or bank credentials are
              collected or stored anywhere — only a payment reference is kept against your order, so a real
              gateway can be connected later without changing your data.
            </p>
          </Reveal>
        </div>

        <Reveal delay={120} className="lux-card h-fit rounded-lg p-7 lg:sticky lg:top-32">
          <h2 className="text-2xl">Order summary</h2>
          <ul className="mt-6 space-y-4">
            {lines.map((l) => (
              <li key={l.productId + (l.variant ?? "")} className="flex gap-4">
                <img src={l.image} alt={l.name} width={80} height={80} loading="lazy" className="h-16 w-16 rounded object-cover" />
                <div className="flex-1 text-sm">
                  <p>{l.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {l.quantity} × {formatPrice(l.price)}
                    {l.variant ? ` · ${l.variant}` : ""}
                  </p>
                </div>
                <p className="text-sm text-primary">{formatPrice(l.price * l.quantity)}</p>
              </li>
            ))}
          </ul>

          <div className="mt-6 flex gap-2">
            <input
              value={coupon}
              onChange={(e) => setCoupon(e.target.value)}
              placeholder="Coupon code"
              className="flex-1 rounded-full border border-border bg-background/50 px-4 py-2.5 text-sm outline-none focus:border-primary"
            />
            <button
              type="button"
              onClick={applyCoupon}
              className="rounded-full border border-primary px-5 py-2.5 text-xs tracking-[0.16em] uppercase text-primary transition-colors hover:bg-primary/10"
            >
              Apply
            </button>
          </div>

          <div className="mt-6 space-y-2.5 text-sm">
            <Row label="Subtotal" value={formatPrice(subtotal)} />
            {discount > 0 ? <Row label={`Discount (${appliedCoupon?.code})`} value={`−${formatPrice(discount)}`} /> : null}
            <Row label="Delivery" value={shipping === 0 ? "Complimentary" : formatPrice(shipping)} />
            <div className="hairline my-4" />
            <div className="flex items-center justify-between">
              <span className="text-xs tracking-[0.2em] uppercase text-muted-foreground">Total</span>
              <span className="font-display text-2xl text-primary">{formatPrice(total)}</span>
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="shine-on-hover mt-7 flex w-full items-center justify-center gap-2 rounded-full bg-gold-gradient py-3.5 text-xs tracking-[0.2em] uppercase text-primary-foreground disabled:opacity-60"
          >
            {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            Place order
          </button>
        </Reveal>
      </form>
    </>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
  required = false,
  placeholder = "",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  required?: boolean;
  placeholder?: string;
}) {
  return (
    <label className="block">
      <span className="text-[0.68rem] tracking-[0.2em] uppercase text-muted-foreground">{label}</span>
      <input
        type={type}
        required={required}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="mt-2 w-full rounded border border-border bg-background/50 px-4 py-3 text-sm outline-none transition-colors focus:border-primary"
      />
    </label>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-muted-foreground">{label}</span>
      <span>{value}</span>
    </div>
  );
}
