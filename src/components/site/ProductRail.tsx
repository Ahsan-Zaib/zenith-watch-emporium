import type { Product } from "@/lib/catalog";
import { ProductCard } from "./ProductCard";
import { Reveal } from "./Reveal";
import { SectionHeading } from "./SectionHeading";

export function ProductRail({
  eyebrow,
  title,
  description,
  products,
  linkTo,
  linkLabel,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  products: Product[];
  linkTo?: string;
  linkLabel?: string;
}) {
  if (!products.length) return null;
  return (
    <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
      <SectionHeading
        {...(eyebrow ? { eyebrow } : {})}
        title={title}
        {...(description ? { description } : {})}
        {...(linkTo ? { linkTo } : {})}
        {...(linkLabel ? { linkLabel } : {})}
      />
      <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {products.map((p, i) => (
          <Reveal key={p.id} delay={(i % 3) * 100}>
            <ProductCard product={p} />
          </Reveal>
        ))}
      </div>
    </section>
  );
}
