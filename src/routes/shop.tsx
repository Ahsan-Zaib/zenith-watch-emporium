import { createFileRoute } from "@tanstack/react-router";
import { CatalogView } from "@/components/site/CatalogView";
import { PageHero } from "@/components/site/PageHero";

type ShopSearch = { q?: string | undefined };

export const Route = createFileRoute("/shop")({
  validateSearch: (search: Record<string, unknown>): ShopSearch => ({
    q: typeof search["q"] === "string" && search["q"] ? (search["q"] as string) : undefined,
  }),
  head: () => ({
    meta: [
      { title: "All Watches — Aurélien Genève" },
      {
        name: "description",
        content:
          "Browse the full Aurélien collection: automatic, chronograph, diver and dress watches in gold, titanium and steel.",
      },
      { property: "og:title", content: "All Watches — Aurélien Genève" },
      {
        property: "og:description",
        content: "Filter the complete collection by category, brand, material, gender and price.",
      },
    ],
  }),
  component: ShopPage,
});

function ShopPage() {
  const { q } = Route.useSearch();
  return (
    <>
      <PageHero
        eyebrow="The Collection"
        title="All Watches"
        description="Every Aurélien timepiece, from the entry-level Blanc Heritage to the limited Midnight Tourbillon. Filter by category, material, gender and budget."
      />
      <CatalogView initialSearch={q ?? ""} />
    </>
  );
}
