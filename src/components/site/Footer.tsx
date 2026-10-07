import { Link } from "@tanstack/react-router";
import { Instagram, Facebook, Twitter, Youtube } from "lucide-react";

const COLUMNS: { title: string; links: { to: string; label: string }[] }[] = [
  {
    title: "Shop",
    links: [
      { to: "/shop", label: "All Watches" },
      { to: "/mens", label: "Men's Watches" },
      { to: "/womens", label: "Women's Watches" },
      { to: "/new-arrivals", label: "New Arrivals" },
      { to: "/best-sellers", label: "Best Sellers" },
      { to: "/sale", label: "Sale" },
    ],
  },
  {
    title: "Maison",
    links: [
      { to: "/about", label: "About Us" },
      { to: "/contact", label: "Contact Us" },
      { to: "/faq", label: "FAQ" },
      { to: "/shipping", label: "Shipping & Delivery" },
    ],
  },
  {
    title: "Account",
    links: [
      { to: "/auth", label: "Login / Sign up" },
      { to: "/account", label: "My Account" },
      { to: "/cart", label: "Shopping Bag" },
      { to: "/checkout", label: "Checkout" },
    ],
  },
  {
    title: "Legal",
    links: [
      { to: "/returns", label: "Returns & Refunds" },
      { to: "/privacy", label: "Privacy Policy" },
      { to: "/terms", label: "Terms & Conditions" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="mt-24 border-t border-border surface-gradient">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <div className="grid gap-12 md:grid-cols-[1.3fr_repeat(4,1fr)]">
          <div>
            <span className="font-display text-2xl tracking-[0.18em] text-gold-gradient">AURÉLIEN</span>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-muted-foreground">
              Independent Swiss watchmaking since 1908. Each movement assembled by hand in our
              Genève atelier, then tested for 21 days before it leaves us.
            </p>
            <div className="mt-6 flex gap-3">
              {[Instagram, Facebook, Twitter, Youtube].map((Icon, i) => (
                <span
                  key={i}
                  className="grid h-9 w-9 place-items-center rounded-full border border-border transition-colors duration-500 hover:border-primary hover:text-primary"
                >
                  <Icon className="h-4 w-4" />
                </span>
              ))}
            </div>
          </div>

          {COLUMNS.map((col) => (
            <div key={col.title}>
              <h4 className="text-[0.7rem] tracking-[0.26em] uppercase text-primary">{col.title}</h4>
              <ul className="mt-5 space-y-2.5">
                {col.links.map((link) => (
                  <li key={link.to + link.label}>
                    <Link
                      to={link.to}
                      className="text-sm text-muted-foreground transition-colors duration-500 hover:text-foreground"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-14 hairline" />
        <div className="mt-6 flex flex-col items-center justify-between gap-3 text-xs text-muted-foreground sm:flex-row">
          <p>© {new Date().getFullYear()} Aurélien Genève. All rights reserved.</p>
          <p>Secure payments · Test mode enabled for demonstration</p>
        </div>
      </div>
    </footer>
  );
}
