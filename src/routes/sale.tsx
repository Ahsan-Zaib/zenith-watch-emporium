import { createFileRoute } from "@tanstack/react-router";
import { CatalogView } from "@/components/site/CatalogView";
import { PageHero } from "@/components/site/PageHero";

export const Route = createFileRoute("/sale")({
  head: () => ({
    meta: [
      { title: "Sale & Discounts — Aurélien Genève" },
      {
        name: "description",
        content:
          "Reduced Aurélien timepieces with savings of up to 25%, plus current coupon codes for extra discount.",
      },
      { property: "og:title", content: "Sale & Discounts — Aurélien Genève" },
      { property: "og:description", content: "Limited reductions across selected references." },
    ],
  }),
  component: SalePage,
});

function SalePage() {
  return (
    <>
      <PageHero
        eyebrow="Limited Reductions"
        title="Sale"
        description="Selected references at reduced pricing. Use code GOLD10 for a further 10% on orders over $500."
      />
      <CatalogView preset={{ onSale: true, sort: "price-desc" }} />
    </>
  );
}
