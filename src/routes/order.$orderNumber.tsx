import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { CheckCircle2, Package } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { formatDate, formatPrice } from "@/lib/format";
import { OrderTracker } from "@/components/site/OrderTracker";
import { Reveal } from "@/components/site/Reveal";

export const Route = createFileRoute("/order/$orderNumber")({
  head: () => ({
    meta: [
      { title: "Order Confirmation — Aurélien Genève" },
      { name: "description", content: "Your order confirmation, delivery details and tracking status." },
      { property: "og:title", content: "Order Confirmation — Aurélien Genève" },
      { property: "og:description", content: "Thank you for your order." },
    ],
  }),
  component: OrderPage,
});

function OrderPage() {
  const { orderNumber } = Route.useParams();
  const { data, isLoading } = useQuery({
    queryKey: ["order", orderNumber],
    queryFn: async () => {
      const { data: order, error } = await supabase
        .from("orders")
        .select("*")
        .eq("order_number", orderNumber)
        .maybeSingle();
      if (error) throw error;
      if (!order) return null;
      const { data: items } = await supabase.from("order_items").select("*").eq("order_id", order.id);
      return { order, items: items ?? [] };
    },
  });

  if (isLoading) {
    return <div className="py-32 text-center text-muted-foreground">Loading your order…</div>;
  }

  if (!data) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-32 text-center">
        <Package className="mx-auto h-8 w-8 text-primary" />
        <h1 className="mt-5 text-3xl">Order not found</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Sign in with the account used to place the order to view it.
        </p>
        <Link to="/account" className="mt-6 inline-block text-primary">
          Go to my account
        </Link>
      </div>
    );
  }

  const { order, items } = data;

  return (
    <section className="mx-auto max-w-4xl px-4 py-16 sm:px-6">
      <Reveal className="text-center">
        <CheckCircle2 className="mx-auto h-10 w-10 text-primary" />
        <p className="eyebrow mt-5">Thank you</p>
        <h1 className="mt-3 text-4xl md:text-5xl">Your order is confirmed</h1>
        <p className="mt-4 text-sm text-muted-foreground">
          Order <span className="text-foreground">{order.order_number}</span> · placed{" "}
          {formatDate(order.created_at)}
        </p>
      </Reveal>

      <Reveal delay={100} className="lux-card mt-12 rounded-lg p-8">
        <OrderTracker status={order.status} />
      </Reveal>

      <Reveal delay={150} className="lux-card mt-6 rounded-lg p-8">
        <h2 className="text-2xl">Items</h2>
        <ul className="mt-6 space-y-4">
          {items.map((item) => (
            <li key={item.id} className="flex items-center gap-4">
              {item.product_image ? (
                <img
                  src={item.product_image}
                  alt={item.product_name}
                  width={80}
                  height={80}
                  loading="lazy"
                  className="h-16 w-16 rounded object-cover"
                />
              ) : null}
              <div className="flex-1 text-sm">
                <p>{item.product_name}</p>
                <p className="text-xs text-muted-foreground">
                  {item.quantity} × {formatPrice(item.unit_price)}
                  {item.variant ? ` · ${item.variant}` : ""}
                </p>
              </div>
              <p className="text-sm text-primary">
                {formatPrice(Number(item.unit_price) * item.quantity)}
              </p>
            </li>
          ))}
        </ul>

        <div className="hairline my-7" />

        <div className="grid gap-8 sm:grid-cols-2">
          <div className="space-y-2 text-sm">
            <Row label="Subtotal" value={formatPrice(order.subtotal)} />
            {Number(order.discount) > 0 ? (
              <Row label={`Discount ${order.coupon_code ? `(${order.coupon_code})` : ""}`} value={`−${formatPrice(order.discount)}`} />
            ) : null}
            <Row label="Delivery" value={Number(order.shipping) === 0 ? "Complimentary" : formatPrice(order.shipping)} />
            <Row label="Total" value={formatPrice(order.total)} />
            <Row label="Payment" value={`${order.payment_method.replace(/_/g, " ")} · ${order.payment_status}`} />
            <Row label="Reference" value={order.payment_reference ?? "—"} />
          </div>
          <div className="text-sm text-muted-foreground">
            <p className="text-xs tracking-[0.2em] uppercase text-primary">Delivering to</p>
            <p className="mt-3 text-foreground">{order.customer_name}</p>
            <p>{order.address}</p>
            <p>
              {order.city} {order.postal_code}
            </p>
            <p>{order.country}</p>
            <p className="mt-2">{order.customer_phone}</p>
            <p>{order.customer_email}</p>
          </div>
        </div>
      </Reveal>

      <div className="mt-10 flex flex-wrap justify-center gap-3">
        <Link
          to="/account"
          className="rounded-full bg-gold-gradient px-8 py-3 text-xs tracking-[0.2em] uppercase text-primary-foreground"
        >
          View my orders
        </Link>
        <Link
          to="/shop"
          className="rounded-full border border-border px-8 py-3 text-xs tracking-[0.2em] uppercase transition-colors hover:border-primary hover:text-primary"
        >
          Continue shopping
        </Link>
      </div>
    </section>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-muted-foreground capitalize">{label}</span>
      <span className="text-right">{value}</span>
    </div>
  );
}
