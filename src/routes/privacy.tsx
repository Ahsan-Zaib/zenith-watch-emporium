import { createFileRoute } from "@tanstack/react-router";
import { LegalPage } from "@/components/site/LegalPage";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: "Privacy Policy — Aurélien Genève" },
      {
        name: "description",
        content:
          "What data Aurélien collects, how orders and accounts are secured, and why we never store card numbers or CVV codes.",
      },
      { property: "og:title", content: "Privacy Policy — Aurélien Genève" },
      { property: "og:description", content: "Your data, handled with the same care as your watch." },
    ],
  }),
  component: () => (
    <LegalPage
      eyebrow="Legal"
      title="Privacy policy"
      description="We collect the minimum needed to sell, deliver and service a watch — and nothing else."
      updated="February 2026"
      sections={[
        {
          heading: "What we collect",
          bullets: [
            "Account data: name, email address and password (stored only as a salted hash).",
            "Delivery data: phone number, street address, city, postal code and country.",
            "Order data: items purchased, totals, coupon used and order status history.",
            "Payment data: the payment method chosen and a payment reference only.",
          ],
        },
        {
          heading: "What we never store",
          paragraphs: [
            "We do not collect, transmit to our database, or store card numbers, expiry dates, CVV codes, bank credentials or plain-text passwords. Card details are handled entirely by the payment provider; our records hold only a reference so an order can be reconciled.",
            "This demonstration store uses a test payment flow, so no real card data exists anywhere in the system.",
          ],
        },
        {
          heading: "How we use your data",
          bullets: [
            "To process, deliver and service your orders.",
            "To answer client service, warranty and repair enquiries.",
            "To send order updates, and marketing email only where you subscribed.",
            "To detect fraud and keep the store secure.",
          ],
        },
        {
          heading: "Security",
          paragraphs: [
            "All traffic is encrypted in transit. Accounts are protected by authenticated sessions, and database access rules restrict every record to its owner: you can read only your own profile, orders and wishlist. Administrative functions are gated on a separate server-side role that customer accounts cannot grant themselves.",
          ],
        },
        {
          heading: "Sharing",
          paragraphs: [
            "We share data only with the couriers who deliver your order and the payment provider who processes it. We do not sell personal data or share it for advertising.",
          ],
        },
        {
          heading: "Your rights",
          paragraphs: [
            "You may access, correct, export or erase your personal data at any time. Profile and address details are editable in your account; for erasure, email clients@aurelien.example and we will act within 30 days, retaining only what tax law requires.",
          ],
        },
        {
          heading: "Cookies",
          paragraphs: [
            "We use essential storage only: your session, your cart and your wishlist. No third-party advertising or tracking cookies are set.",
          ],
        },
      ]}
    />
  ),
});
