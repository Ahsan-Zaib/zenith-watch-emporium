import { createFileRoute } from "@tanstack/react-router";
import { CatalogView } from "@/components/site/CatalogView";
import { PageHero } from "@/components/site/PageHero";

export const Route = createFileRoute("/best-sellers")({
  head: () => ({
    meta: [
      { title: "Best Sellers — Aurélien Genève" },
      {
        name: "description",
        content: "The most-loved Aurélien timepieces, ranked by owners and reviews.",
      },
      { property: "og:title", content: "Best Sellers — Aurélien Genève" },
      { property: "og:description", content: "Our most-loved references, chosen by collectors." },
    ],
  }),
  component: BestSellersPage,
});

function BestSellersPage() {
  return (
    <>
      <PageHero
        eyebrow="Collector Favourites"
        title="Best Sellers"
        description="The references our owners recommend most often — and the ones we restock the fastest."
      />
      <CatalogView preset={{ bestSeller: true, sort: "popular" }} />
    </>
  );
}
