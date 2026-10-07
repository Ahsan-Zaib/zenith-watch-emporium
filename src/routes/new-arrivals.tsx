import { createFileRoute } from "@tanstack/react-router";
import { CatalogView } from "@/components/site/CatalogView";
import { PageHero } from "@/components/site/PageHero";

export const Route = createFileRoute("/new-arrivals")({
  head: () => ({
    meta: [
      { title: "New Arrivals — Aurélien Genève" },
      {
        name: "description",
        content: "The newest Aurélien references, fresh from the Genève atelier this season.",
      },
      { property: "og:title", content: "New Arrivals — Aurélien Genève" },
      { property: "og:description", content: "This season's new references, in limited numbers." },
    ],
  }),
  component: NewArrivalsPage,
});

function NewArrivalsPage() {
  return (
    <>
      <PageHero
        eyebrow="Just Landed"
        title="New Arrivals"
        description="Fresh from the atelier. Early references usually sell through within weeks of release."
      />
      <CatalogView preset={{ isNew: true, sort: "newest" }} />
    </>
  );
}
