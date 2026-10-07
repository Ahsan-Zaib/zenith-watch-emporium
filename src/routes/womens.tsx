import { createFileRoute } from "@tanstack/react-router";
import { CatalogView } from "@/components/site/CatalogView";
import { PageHero } from "@/components/site/PageHero";

export const Route = createFileRoute("/womens")({
  head: () => ({
    meta: [
      { title: "Women's Watches — Aurélien Genève" },
      {
        name: "description",
        content:
          "Women's luxury watches in rose gold and mother-of-pearl, from 28mm jewels to 34mm diamond-set pieces.",
      },
      { property: "og:title", content: "Women's Watches — Aurélien Genève" },
      { property: "og:description", content: "Rose gold, mother-of-pearl and diamond-set timepieces." },
    ],
  }),
  component: WomensPage,
});

function WomensPage() {
  return (
    <>
      <PageHero
        eyebrow="For Her"
        title="Women's Watches"
        description="Slim profiles, mother-of-pearl dials and hand-set stones. Designed to be worn as jewellery and read as an instrument."
      />
      <CatalogView preset={{ gender: "women" }} showGenderFilter={false} />
    </>
  );
}
