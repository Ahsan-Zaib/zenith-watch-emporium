import { createFileRoute, Link } from "@tanstack/react-router";
import { Minus, Plus, Trash2, ShoppingBag } from "lucide-react";
import { useCart } from "@/lib/cart";
import { formatPrice, FREE_SHIPPING_THRESHOLD } from "@/lib/format";
import { PageHero } from "@/components/site/PageHero";
import { Reveal } from "@/components/site/Reveal";

export const Route = createFileRoute("/cart")({
  head: () => ({
    meta: [
      { title: "Shopping Bag — Aurélien Genève" },
      { name: "description", content: "Review the timepieces in your bag before checkout." },
      { property: "og:title", content: "Shopping Bag — Aurélien Genève" },
      { property: "og:description", content: "Review your selection and proceed to secure checkout." },
    ],
  }),
  component: CartPage,
});

function CartPage() {
  const { lines, subtotal, shipping, total, setQuantity, removeLine, clear } = useCart();

  return (
    <>
      <PageHero eyebrow="Your Selection" title="Shopping Bag" />
      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
        {lines.length === 0 ? (
          <div className="lux-card rounded-lg p-16 text-center">
            <ShoppingBag className="mx-auto h-8 w-8 text-primary" />
            <h2 className="mt-5 text-2xl">Your bag is empty</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Explore the collection and add a timepiece to begin.
            </p>
            <Link
              to="/shop"
              className="mt-7 inline-block rounded-full bg-gold-gradient px-8 py-3 text-xs tracking-[0.2em] uppercase text-primary-foreground"
            >
              Browse watches
            </Link>
          </div>
        ) : (
          <div className="grid gap-10 lg:grid-cols-[1.6fr_1fr]">
            <div className="space-y-5">
              {lines.map((line) => (
                <Reveal
                  key={line.productId + (line.variant ?? "")}
                  className="lux-card flex flex-col gap-5 rounded-lg p-5 sm:flex-row sm:items-center"
                >
                  <Link to="/product/$slug" params={{ slug: line.slug }} className="shrink-0">
                    <img
                      src={line.image}
                      alt={line.name}
                      width={160}
                      height={160}
                      loading="lazy"
                      className="h-28 w-28 rounded object-cover"
                    />
                  </Link>
                  <div className="flex-1">
                    <p className="text-[0.7rem] tracking-[0.2em] uppercase text-muted-foreground">
                      {line.brand}
                    </p>
                    <Link to="/product/$slug" params={{ slug: line.slug }}>
                      <h3 className="font-display text-xl transition-colors hover:text-primary">
                        {line.name}
                      </h3>
                    </Link>
                    {line.variant ? (
                      <p className="mt-1 text-xs text-muted-foreground">Variant: {line.variant}</p>
                    ) : null}
                    <p className="mt-2 text-primary">{formatPrice(line.price)}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center rounded-full border border-border">
                      <button
                        type="button"
                        aria-label="Decrease"
                        onClick={() => setQuantity(line.productId, line.variant, line.quantity - 1)}
                        className="grid h-10 w-10 place-items-center text-muted-foreground hover:text-primary"
                      >
                        <Minus className="h-3.5 w-3.5" />
                      </button>
                      <span className="w-8 text-center text-sm">{line.quantity}</span>
                      <button
                        type="button"
                        aria-label="Increase"
                        onClick={() => setQuantity(line.productId, line.variant, line.quantity + 1)}
                        className="grid h-10 w-10 place-items-center text-muted-foreground hover:text-primary"
                      >
                        <Plus className="h-3.5 w-3.5" />
                      </button>
                    </div>
                    <button
                      type="button"
                      aria-label="Remove item"
                      onClick={() => removeLine(line.productId, line.variant)}
                      className="text-muted-foreground transition-colors hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </Reveal>
              ))}
              <button
                type="button"
                onClick={clear}
                className="text-xs tracking-[0.18em] uppercase text-muted-foreground transition-colors hover:text-destructive"
              >
                Empty bag
              </button>
            </div>

            <Reveal delay={120} className="lux-card h-fit rounded-lg p-7 lg:sticky lg:top-32">
              <h2 className="text-2xl">Summary</h2>
              <div className="mt-6 space-y-3 text-sm">
                <Row label="Subtotal" value={formatPrice(subtotal)} />
                <Row label="Delivery" value={shipping === 0 ? "Complimentary" : formatPrice(shipping)} />
                {subtotal < FREE_SHIPPING_THRESHOLD ? (
                  <p className="text-xs text-muted-foreground">
                    Add {formatPrice(FREE_SHIPPING_THRESHOLD - subtotal)} for free insured delivery.
                  </p>
                ) : null}
                <div className="hairline my-4" />
                <div className="flex items-center justify-between">
                  <span className="text-xs tracking-[0.2em] uppercase text-muted-foreground">Total</span>
                  <span className="font-display text-2xl text-primary">{formatPrice(total)}</span>
                </div>
              </div>
              <Link
                to="/checkout"
                className="shine-on-hover mt-7 block rounded-full bg-gold-gradient py-3.5 text-center text-xs tracking-[0.2em] uppercase text-primary-foreground"
              >
                Proceed to checkout
              </Link>
              <Link
                to="/shop"
                className="mt-3 block text-center text-xs tracking-[0.18em] uppercase text-muted-foreground hover:text-primary"
              >
                Continue shopping
              </Link>
              <p className="mt-6 text-xs leading-relaxed text-muted-foreground">
                Coupon codes are applied at checkout. Try GOLD10 for 10% off orders over $500.
              </p>
            </Reveal>
          </div>
        )}
      </section>
    </>
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
