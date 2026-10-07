import { useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Heart, Minus, Plus, ShieldCheck, ShoppingBag, Truck, RotateCcw } from "lucide-react";
import { toast } from "sonner";
import { productQuery, productsQuery, reviewsQuery } from "@/lib/catalog";
import { discountPercent, formatDate, formatPrice, stockLabel } from "@/lib/format";
import { useCart } from "@/lib/cart";
import { Stars } from "@/components/site/Stars";
import { Reveal } from "@/components/site/Reveal";
import { ProductCard } from "@/components/site/ProductCard";
import { SectionHeading } from "@/components/site/SectionHeading";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/product/$slug")({
  head: ({ params }) => ({
    meta: [
      { title: `${params.slug.replace(/-/g, " ")} — Aurélien Genève` },
      {
        name: "description",
        content: "Full specifications, movement details, reviews and availability for this Aurélien timepiece.",
      },
      { property: "og:title", content: "Aurélien Genève timepiece" },
      {
        property: "og:description",
        content: "Specifications, movement details and availability for this reference.",
      },
    ],
  }),
  component: ProductPage,
});

function ProductPage() {
  const { slug } = Route.useParams();
  const navigate = useNavigate();
  const { data: product, isLoading } = useQuery(productQuery(slug));
  const { data: reviews = [] } = useQuery(reviewsQuery(product?.id));
  const { data: all = [] } = useQuery(productsQuery());
  const { addLine, toggleWishlist, isWished } = useCart();

  const [imageIndex, setImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [variant, setVariant] = useState<string>("");

  if (isLoading) {
    return <div className="mx-auto max-w-7xl px-4 py-32 text-center text-muted-foreground">Loading…</div>;
  }

  if (!product) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-32 text-center">
        <h1 className="text-3xl">Reference not found</h1>
        <Link to="/shop" className="mt-6 inline-block text-primary">
          Back to the collection
        </Link>
      </div>
    );
  }

  const off = discountPercent(product.price, product.original_price);
  const stock = stockLabel(product.stock);
  const images = product.images.length ? product.images : ["/images/watches/noir-classic.jpg"];
  const activeVariant = variant || product.colors[0] || "";
  const related = all.filter((p) => p.id !== product.id && p.category_id === product.category_id).slice(0, 3);

  function add(buyNow = false) {
    addLine({
      productId: product!.id,
      slug: product!.slug,
      name: product!.name,
      brand: product!.brand,
      price: Number(product!.price),
      image: images[0]!,
      stock: product!.stock,
      quantity,
      ...(activeVariant ? { variant: activeVariant } : {}),
    });
    if (buyNow) {
      void navigate({ to: "/checkout" });
    } else {
      toast.success(`${product!.name} added to bag`);
    }
  }

  const specs: [string, string | null][] = [
    ["Brand", product.brand],
    ["Model", product.model],
    ["Case material", product.material],
    ["Strap", product.strap],
    ["Case size", product.case_size],
    ["Movement", product.movement],
    ["Water resistance", product.water_resistance],
  ];

  return (
    <>
      <div className="mx-auto max-w-7xl px-4 pt-10 sm:px-6">
        <nav className="text-xs tracking-[0.16em] uppercase text-muted-foreground">
          <Link to="/" className="hover:text-primary">
            Home
          </Link>
          <span className="px-2">/</span>
          <Link to="/shop" className="hover:text-primary">
            Shop
          </Link>
          <span className="px-2">/</span>
          <span className="text-foreground">{product.name}</span>
        </nav>
      </div>

      <section className="mx-auto grid max-w-7xl gap-12 px-4 py-12 sm:px-6 lg:grid-cols-2">
        <Reveal>
          <div className="lux-card overflow-hidden rounded-lg">
            <img
              src={images[imageIndex]}
              alt={product.name}
              width={1024}
              height={1024}
              className="aspect-square w-full object-cover"
            />
          </div>
          <div className="mt-4 flex gap-3">
            {images.map((img, i) => (
              <button
                key={img + i}
                type="button"
                onClick={() => setImageIndex(i)}
                className={cn(
                  "h-20 w-20 overflow-hidden rounded border transition-colors duration-500",
                  i === imageIndex ? "border-primary" : "border-border hover:border-primary/60",
                )}
              >
                <img src={img} alt="" width={160} height={160} loading="lazy" className="h-full w-full object-cover" />
              </button>
            ))}
          </div>
        </Reveal>

        <Reveal delay={120}>
          <p className="eyebrow">{product.brand}</p>
          <h1 className="mt-3 text-4xl leading-tight md:text-5xl">{product.name}</h1>
          <div className="mt-4 flex items-center gap-3">
            <Stars rating={product.rating} size={16} />
            <span className="text-sm text-muted-foreground">
              {Number(product.rating).toFixed(1)} · {product.review_count} reviews
            </span>
          </div>

          <div className="mt-6 flex items-end gap-4">
            <p className="font-display text-4xl text-primary">{formatPrice(product.price)}</p>
            {off ? (
              <>
                <p className="text-lg text-muted-foreground line-through">
                  {formatPrice(product.original_price)}
                </p>
                <span className="rounded-full bg-gold-gradient px-3 py-1 text-xs text-primary-foreground">
                  Save {off}%
                </span>
              </>
            ) : null}
          </div>

          <p className="mt-6 text-sm leading-relaxed text-muted-foreground">{product.description}</p>

          {product.colors.length ? (
            <div className="mt-8">
              <p className="text-[0.7rem] tracking-[0.24em] uppercase text-primary">Variant</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {product.colors.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setVariant(c)}
                    className={cn(
                      "rounded-full border px-4 py-2 text-xs transition-colors duration-500",
                      activeVariant === c
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border text-muted-foreground hover:border-primary/60",
                    )}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>
          ) : null}

          <div className="mt-8 flex flex-wrap items-center gap-4">
            <div className="flex items-center rounded-full border border-border">
              <button
                type="button"
                aria-label="Decrease quantity"
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                className="grid h-11 w-11 place-items-center text-muted-foreground transition-colors hover:text-primary"
              >
                <Minus className="h-4 w-4" />
              </button>
              <span className="w-10 text-center text-sm">{quantity}</span>
              <button
                type="button"
                aria-label="Increase quantity"
                onClick={() => setQuantity((q) => Math.min(Math.max(product.stock, 1), q + 1))}
                className="grid h-11 w-11 place-items-center text-muted-foreground transition-colors hover:text-primary"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
            <span
              className={cn(
                "text-sm",
                stock.tone === "in" && "text-success",
                stock.tone === "low" && "text-warning",
                stock.tone === "out" && "text-destructive",
              )}
            >
              {stock.label} · {product.stock} in inventory
            </span>
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <button
              type="button"
              disabled={product.stock <= 0}
              onClick={() => add(false)}
              className="shine-on-hover inline-flex items-center gap-2 rounded-full bg-gold-gradient px-8 py-3.5 text-xs tracking-[0.2em] uppercase text-primary-foreground transition-transform duration-500 hover:scale-[1.03] disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ShoppingBag className="h-4 w-4" />
              Add to bag
            </button>
            <button
              type="button"
              disabled={product.stock <= 0}
              onClick={() => add(true)}
              className="rounded-full border border-primary px-8 py-3.5 text-xs tracking-[0.2em] uppercase text-primary transition-colors duration-500 hover:bg-primary/10 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Buy now
            </button>
            <button
              type="button"
              aria-label="Toggle wishlist"
              onClick={() => {
                toggleWishlist(product.id);
                toast.success(isWished(product.id) ? "Removed from wishlist" : "Saved to wishlist");
              }}
              className="grid h-12 w-12 place-items-center rounded-full border border-border transition-colors duration-500 hover:border-primary"
            >
              <Heart className={cn("h-4 w-4", isWished(product.id) && "fill-primary text-primary")} />
            </button>
          </div>

          <div className="mt-10 grid gap-4 sm:grid-cols-3">
            {[
              { Icon: Truck, label: "Free insured shipping over $1,000" },
              { Icon: ShieldCheck, label: "5-year international warranty" },
              { Icon: RotateCcw, label: "30-day returns, no questions" },
            ].map(({ Icon, label }) => (
              <div key={label} className="glass-panel rounded-lg p-4">
                <Icon className="h-4 w-4 text-primary" />
                <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{label}</p>
              </div>
            ))}
          </div>
        </Reveal>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-6 sm:px-6">
        <Reveal className="lux-card rounded-lg p-8">
          <h2 className="text-2xl">Specifications</h2>
          <dl className="mt-6 grid gap-x-10 gap-y-4 sm:grid-cols-2">
            {specs.map(([label, value]) => (
              <div key={label} className="flex items-center justify-between gap-4 border-b border-border pb-3">
                <dt className="text-xs tracking-[0.18em] uppercase text-muted-foreground">{label}</dt>
                <dd className="text-sm">{value ?? "—"}</dd>
              </div>
            ))}
          </dl>
        </Reveal>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
        <SectionHeading eyebrow="Owner Feedback" title="Customer reviews" />
        <div className="mt-8 grid gap-5 md:grid-cols-2">
          {reviews.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No reviews yet for this reference. Yours could be the first.
            </p>
          ) : (
            reviews.map((r, i) => (
              <Reveal key={r.id} delay={i * 80} className="lux-card rounded-lg p-6">
                <div className="flex items-center justify-between">
                  <p className="text-sm">{r.author_name}</p>
                  <Stars rating={r.rating} />
                </div>
                {r.title ? <h3 className="mt-3 text-lg">{r.title}</h3> : null}
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{r.body}</p>
                <p className="mt-4 text-xs text-muted-foreground">{formatDate(r.created_at)}</p>
              </Reveal>
            ))
          )}
        </div>
      </section>

      {related.length ? (
        <section className="mx-auto max-w-7xl px-4 pb-20 sm:px-6">
          <SectionHeading eyebrow="You may also like" title="Related timepieces" linkTo="/shop" />
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((p, i) => (
              <Reveal key={p.id} delay={i * 90}>
                <ProductCard product={p} />
              </Reveal>
            ))}
          </div>
        </section>
      ) : null}
    </>
  );
}
