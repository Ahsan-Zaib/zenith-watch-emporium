import { Link } from "@tanstack/react-router";
import { Heart, ShoppingBag } from "lucide-react";
import { toast } from "sonner";
import type { Product } from "@/lib/catalog";
import { discountPercent, formatPrice, stockLabel } from "@/lib/format";
import { useCart } from "@/lib/cart";
import { cn } from "@/lib/utils";
import { Stars } from "./Stars";

export function ProductCard({ product, priority = false }: { product: Product; priority?: boolean }) {
  const { addLine, toggleWishlist, isWished } = useCart();
  const off = discountPercent(product.price, product.original_price);
  const stock = stockLabel(product.stock);
  const image = product.images[0] ?? "/images/watches/noir-classic.jpg";
  const wished = isWished(product.id);

  return (
    <article className="lux-card group flex flex-col rounded-lg">
      <Link
        to="/product/$slug"
        params={{ slug: product.slug }}
        className="relative block aspect-square overflow-hidden"
      >
        <img
          src={image}
          alt={product.name}
          width={1024}
          height={1024}
          loading={priority ? "eager" : "lazy"}
          className="h-full w-full object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-[1.08]"
        />
        <div className="absolute left-3 top-3 flex flex-col gap-2">
          {off ? (
            <span className="rounded-full bg-gold-gradient px-2.5 py-1 text-[0.65rem] font-medium tracking-wider text-primary-foreground">
              -{off}%
            </span>
          ) : null}
          {product.is_new ? (
            <span className="glass-panel rounded-full px-2.5 py-1 text-[0.65rem] tracking-[0.18em] uppercase text-primary">
              New
            </span>
          ) : null}
          {product.is_best_seller ? (
            <span className="glass-panel rounded-full px-2.5 py-1 text-[0.65rem] tracking-[0.18em] uppercase text-foreground">
              Best seller
            </span>
          ) : null}
        </div>
        <button
          type="button"
          aria-label={wished ? "Remove from wishlist" : "Add to wishlist"}
          onClick={(e) => {
            e.preventDefault();
            toggleWishlist(product.id);
            toast.success(wished ? "Removed from wishlist" : "Saved to wishlist");
          }}
          className="glass-panel absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-full transition-transform duration-500 hover:scale-110"
        >
          <Heart className={cn("h-4 w-4", wished ? "fill-primary text-primary" : "text-foreground")} />
        </button>
      </Link>

      <div className="flex flex-1 flex-col gap-3 p-5">
        <div className="flex items-center justify-between gap-2">
          <p className="text-[0.7rem] tracking-[0.22em] uppercase text-muted-foreground">
            {product.brand}
          </p>
          <span
            className={cn(
              "text-[0.7rem] tracking-wide",
              stock.tone === "in" && "text-success",
              stock.tone === "low" && "text-warning",
              stock.tone === "out" && "text-destructive",
            )}
          >
            {stock.label}
          </span>
        </div>

        <Link to="/product/$slug" params={{ slug: product.slug }} className="block">
          <h3 className="font-display text-xl leading-snug transition-colors group-hover:text-primary">
            {product.name}
          </h3>
        </Link>

        <div className="flex items-center gap-2">
          <Stars rating={product.rating} />
          <span className="text-xs text-muted-foreground">({product.review_count})</span>
        </div>

        <div className="mt-auto flex items-end justify-between gap-3 pt-2">
          <div>
            <p className="font-display text-2xl text-primary">{formatPrice(product.price)}</p>
            {product.original_price && Number(product.original_price) > Number(product.price) ? (
              <p className="text-xs text-muted-foreground line-through">
                {formatPrice(product.original_price)}
              </p>
            ) : null}
          </div>
          <button
            type="button"
            disabled={product.stock <= 0}
            onClick={() => {
              addLine({
                productId: product.id,
                slug: product.slug,
                name: product.name,
                brand: product.brand,
                price: Number(product.price),
                image,
                stock: product.stock,
              });
              toast.success(`${product.name} added to bag`);
            }}
            className="shine-on-hover inline-flex items-center gap-2 rounded-full border border-border px-4 py-2 text-xs tracking-[0.14em] uppercase transition-colors duration-500 hover:border-primary hover:text-primary disabled:cursor-not-allowed disabled:opacity-40"
          >
            <ShoppingBag className="h-3.5 w-3.5" />
            {product.stock > 0 ? "Add" : "Sold out"}
          </button>
        </div>
      </div>
    </article>
  );
}
