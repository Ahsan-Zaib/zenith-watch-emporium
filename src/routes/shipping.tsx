import { createFileRoute } from "@tanstack/react-router";
import { LegalPage } from "@/components/site/LegalPage";

export const Route = createFileRoute("/shipping")({
  head: () => ({
    meta: [
      { title: "Shipping & Delivery — Aurélien Genève" },
      {
        name: "description",
        content:
          "Insured worldwide delivery, free express shipping over $1,000, dispatch times, duties and tracking information.",
      },
      { property: "og:title", content: "Shipping & Delivery — Aurélien Genève" },
      { property: "og:description", content: "How and when your timepiece reaches you." },
    ],
  }),
  component: () => (
    <LegalPage
      eyebrow="Orders"
      title="Shipping & delivery"
      description="Every watch leaves Genève fully insured, in a sealed case, with signature required on delivery."
      updated="February 2026"
      sections={[
        {
          heading: "Dispatch times",
          paragraphs: [
            "Orders confirmed before 14:00 CET on a working day are dispatched the same day. Orders placed later, at weekends or on Swiss public holidays are dispatched on the next working day.",
            "If a reference requires final regulation before dispatch, client services will contact you with an exact date.",
          ],
        },
        {
          heading: "Delivery estimates",
          bullets: [
            "Switzerland: next working day",
            "European Union and United Kingdom: 1–2 working days",
            "North America, Middle East and Asia: 2–4 working days",
            "Rest of the world: up to 5 working days",
          ],
        },
        {
          heading: "Shipping charges",
          paragraphs: [
            "A flat insured shipping charge of $45 applies to orders below $1,000. Orders of $1,000 or more ship free by express courier.",
            "The charge shown at checkout is final; we do not add handling or packaging fees.",
          ],
        },
        {
          heading: "Duties and taxes",
          paragraphs: [
            "Prices are shown excluding import duties. Any duties or taxes levied by the destination country are the responsibility of the recipient and are collected by the courier before delivery.",
          ],
        },
        {
          heading: "Tracking your order",
          paragraphs: [
            "Order status is visible at any time under My Orders in your account, and moves through Pending, Confirmed, Processing, Shipped and Delivered. A courier tracking reference is added at the Shipped stage.",
          ],
        },
        {
          heading: "Failed or refused deliveries",
          paragraphs: [
            "Couriers make two delivery attempts, then hold the parcel for seven days. Parcels returned to us as unclaimed are refunded less the outbound shipping cost.",
          ],
        },
      ]}
    />
  ),
});
