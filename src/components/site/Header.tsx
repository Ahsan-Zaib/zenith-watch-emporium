import { useState } from "react";
import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { Menu, Search, ShoppingBag, User, X, LayoutDashboard, LogOut } from "lucide-react";
import { useCart } from "@/lib/cart";
import { useAuth } from "@/lib/auth";
import { cn } from "@/lib/utils";

const NAV = [
  { to: "/shop", label: "All Watches" },
  { to: "/mens", label: "Men" },
  { to: "/womens", label: "Women" },
  { to: "/new-arrivals", label: "New Arrivals" },
  { to: "/best-sellers", label: "Best Sellers" },
  { to: "/sale", label: "Sale" },
  { to: "/about", label: "Maison" },
  { to: "/contact", label: "Contact" },
];

export function Header() {
  const [open, setOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [term, setTerm] = useState("");
  const { count } = useCart();
  const { user, isAdmin, signOut } = useAuth();
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  function submitSearch(e: React.FormEvent) {
    e.preventDefault();
    setSearchOpen(false);
    setOpen(false);
    void navigate({ to: "/shop", search: term ? { q: term } : {} });
  }

  return (
    <header className="sticky top-0 z-50">
      <div className="bg-gold-gradient px-4 py-2 text-center text-[0.7rem] tracking-[0.2em] uppercase text-primary-foreground">
        Complimentary worldwide shipping over $1,000 · 5-year warranty
      </div>
      <div className="glass-panel border-x-0 border-t-0">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
          <button
            type="button"
            className="lg:hidden"
            aria-label="Open menu"
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>

          <Link to="/" className="group flex flex-col items-center lg:items-start">
            <span className="font-display text-2xl leading-none tracking-[0.18em] text-gold-gradient">
              AURÉLIEN
            </span>
            <span className="text-[0.55rem] tracking-[0.4em] uppercase text-muted-foreground">
              Genève
            </span>
          </Link>

          <nav className="hidden items-center gap-7 lg:flex">
            {NAV.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className={cn(
                  "relative text-[0.78rem] tracking-[0.16em] uppercase transition-colors duration-500 hover:text-primary",
                  pathname === item.to ? "text-primary" : "text-foreground/80",
                )}
              >
                {item.label}
                <span
                  className={cn(
                    "absolute -bottom-1.5 left-0 h-px w-full origin-left scale-x-0 bg-primary transition-transform duration-500",
                    pathname === item.to && "scale-x-100",
                  )}
                />
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-3 sm:gap-4">
            <button
              type="button"
              aria-label="Search"
              onClick={() => setSearchOpen((v) => !v)}
              className="transition-colors hover:text-primary"
            >
              <Search className="h-[1.1rem] w-[1.1rem]" />
            </button>
            {isAdmin ? (
              <Link to="/admin" aria-label="Admin dashboard" className="transition-colors hover:text-primary">
                <LayoutDashboard className="h-[1.1rem] w-[1.1rem]" />
              </Link>
            ) : null}
            {user ? (
              <>
                <Link to="/account" aria-label="My account" className="transition-colors hover:text-primary">
                  <User className="h-[1.1rem] w-[1.1rem]" />
                </Link>
                <button
                  type="button"
                  aria-label="Sign out"
                  onClick={async () => {
                    await signOut();
                    void navigate({ to: "/" });
                  }}
                  className="transition-colors hover:text-primary"
                >
                  <LogOut className="h-[1.1rem] w-[1.1rem]" />
                </button>
              </>
            ) : (
              <Link
                to="/auth"
                className="text-[0.72rem] tracking-[0.16em] uppercase transition-colors hover:text-primary"
              >
                Sign in
              </Link>
            )}
            <Link to="/cart" aria-label="Shopping bag" className="relative transition-colors hover:text-primary">
              <ShoppingBag className="h-[1.15rem] w-[1.15rem]" />
              {count > 0 ? (
                <span className="absolute -right-2 -top-2 grid h-4.5 min-w-4.5 place-items-center rounded-full bg-gold-gradient px-1 text-[0.6rem] font-medium text-primary-foreground">
                  {count}
                </span>
              ) : null}
            </Link>
          </div>
        </div>

        {searchOpen ? (
          <form onSubmit={submitSearch} className="mx-auto max-w-7xl px-4 pb-4 sm:px-6">
            <input
              autoFocus
              value={term}
              onChange={(e) => setTerm(e.target.value)}
              placeholder="Search timepieces, brands, references…"
              className="w-full rounded-full border border-border bg-background/60 px-5 py-3 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-primary"
            />
          </form>
        ) : null}

        {open ? (
          <nav className="flex flex-col gap-1 border-t border-border px-4 py-4 lg:hidden">
            {NAV.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => setOpen(false)}
                className="py-2 text-sm tracking-[0.14em] uppercase text-foreground/85 transition-colors hover:text-primary"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        ) : null}
      </div>
    </header>
  );
}
