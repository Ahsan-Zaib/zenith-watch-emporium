import { createFileRoute } from "@tanstack/react-router";
import { LegalPage } from "@/components/site/LegalPage";

export const Route = createFileRoute("/returns")({
  head: () => ({
    meta: [
      { title: "Returns & Refund Policy — Aurélien Genève" },
      {
        name: "description",
        content:
          "30-day returns on unworn timepieces, refund timelines, warranty repairs and how to arrange insured collection.",
      },
      { property: "og:title", content: "Returns & Refund Policy — Aurélien Genève" },
      { property: "og:description", content: "Thirty days to change your mind, no questions asked." },
    ],
  }),
  component: () => (
    <LegalPage
      eyebrow="Peace of Mind"
      title="Returns & refunds"
      description="You have 30 days from delivery to return an unworn watch for a full refund."
      updated="February 2026"
      sections={[
        {
          heading: "Return window",
          paragraphs: [
            "Returns are accepted within 30 days of delivery. The watch must be unworn and complete: original case, warranty card, spare links, tags and documentation.",
            "Watches showing wear, sizing performed elsewhere, engraving or accidental damage cannot be refunded, but we will always quote for repair instead.",
          ],
        },
        {
          heading: "How to start a return",
          bullets: [
            "Open My Orders in your account and note the order number.",
            "Email clients@aurelien.example with the order number and reason.",
            "We arrange insured collection from your address at our cost.",
            "Do not ship a watch uninsured; losses in transit cannot be refunded.",
          ],
        },
        {
          heading: "Refunds",
          paragraphs: [
            "Once the watch passes inspection at the atelier, refunds are issued to the original payment method within five working days. Shipping charges are refunded when the return results from our error.",
            "Where a coupon was applied, the refund reflects the amount actually paid.",
          ],
        },
        {
          heading: "Exchanges",
          paragraphs: [
            "We exchange for any other reference of equal or higher value; you pay only the difference. Exchanges are handled as a return plus a new order so that stock and warranty records stay accurate.",
          ],
        },
        {
          heading: "Warranty claims",
          paragraphs: [
            "Every watch carries a 5-year international warranty on the movement and manufacturing defects. Straps, crystals, batteries in hybrid references and accidental damage are excluded.",
            "Warranty work is carried out in Genève. We collect, service and return the watch insured at no cost to you.",
          ],
        },
        {
          heading: "Cancellations",
          paragraphs: [
            "Orders can be cancelled free of charge at any time before the status changes to Shipped. Contact client services and we will cancel and refund immediately.",
          ],
        },
      ]}
    />
  ),
});
