import { createFileRoute } from "@tanstack/react-router";
import { LegalPage } from "@/components/site/LegalPage";

export const Route = createFileRoute("/terms")({
  head: () => ({
    meta: [
      { title: "Terms & Conditions — Aurélien Genève" },
      {
        name: "description",
        content:
          "The terms governing orders, pricing, coupons, stock, warranty, account conduct and liability at Aurélien Genève.",
      },
      { property: "og:title", content: "Terms & Conditions — Aurélien Genève" },
      { property: "og:description", content: "The agreement between you and the maison." },
    ],
  }),
  component: () => (
    <LegalPage
      eyebrow="Legal"
      title="Terms & conditions"
      description="These terms govern your use of this store and any order you place with us."
      updated="February 2026"
      sections={[
        {
          heading: "Orders and acceptance",
          paragraphs: [
            "An order is an offer to buy. It is accepted when the order status changes from Pending to Confirmed. Where a reference sells out between your order and confirmation, we will cancel and refund in full.",
            "Stock is reserved at the moment an order is placed and inventory is adjusted atomically, so a watch cannot be sold twice.",
          ],
        },
        {
          heading: "Pricing",
          paragraphs: [
            "Prices are shown in US dollars and exclude import duties. Where an original price is displayed alongside a reduced price, the original is the most recent regular selling price.",
            "We correct obvious pricing errors and will contact you before charging any difference.",
          ],
        },
        {
          heading: "Coupons and discounts",
          bullets: [
            "Coupon codes are case-insensitive and validated on our server, not in your browser.",
            "Each coupon may carry a minimum order value, a start date and an end date.",
            "Only one coupon may be applied per order, and coupons have no cash value.",
            "We may withdraw a coupon at any time before an order is placed.",
          ],
        },
        {
          heading: "Accounts",
          paragraphs: [
            "You are responsible for keeping your account credentials confidential and for activity carried out under your account. Customer accounts have no access to administrative functions; attempting to obtain such access is a breach of these terms.",
          ],
        },
        {
          heading: "Payment",
          paragraphs: [
            "Payment is taken through our payment provider. This demonstration store uses a test payment flow; no real funds move and no card data is stored. When a live gateway is connected, the same order and reference structure applies.",
          ],
        },
        {
          heading: "Warranty and liability",
          paragraphs: [
            "Our 5-year warranty covers the movement and manufacturing defects. It does not cover wear, accidental damage, water ingress after a damaged seal, or work carried out by third parties.",
            "Nothing in these terms limits liability for death, personal injury or fraud. Otherwise our liability for any order is limited to the amount you paid for it.",
          ],
        },
        {
          heading: "Intellectual property",
          paragraphs: [
            "All text, imagery, designs and the Aurélien name are owned by the maison and may not be reproduced commercially without written permission.",
          ],
        },
        {
          heading: "Governing law",
          paragraphs: [
            "These terms are governed by Swiss law, with the courts of Genève having exclusive jurisdiction, without affecting consumer rights in your country of residence.",
          ],
        },
      ]}
    />
  ),
});
