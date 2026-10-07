import { createFileRoute } from "@tanstack/react-router";
import { CatalogView } from "@/components/site/CatalogView";
import { PageHero } from "@/components/site/PageHero";

export const Route = createFileRoute("/mens")({
  head: () => ({
    meta: [
      { title: "Men's Watches — Aurélien Genève" },
      {
        name: "description",
        content:
          "Men's Swiss automatic, chronograph and dive watches from 39mm to 44mm in gold, steel and titanium.",
      },
      { property: "og:title", content: "Men's Watches — Aurélien Genève" },
      { property: "og:description", content: "Swiss automatics, chronographs and divers for men." },
    ],
  }),
  component: MensPage,
});

function MensPage() {
  return (
    <>
      <PageHero
        eyebrow="For Him"
        title="Men's Watches"
        description="Substantial cases, in-house automatic calibres and finishing you can feel through the crown. Sized 39mm to 44mm."
      />
      <CatalogView preset={{ gender: "men" }} showGenderFilter={false} />
    </>
  );
}
