import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { shippingFor } from "./format";

export type CartLine = {
  productId: string;
  slug: string;
  name: string;
  brand: string;
  price: number;
  image: string;
  quantity: number;
  variant?: string;
  stock: number;
};

type CartContextValue = {
  lines: CartLine[];
  count: number;
  subtotal: number;
  shipping: number;
  total: number;
  addLine: (line: Omit<CartLine, "quantity"> & { quantity?: number }) => void;
  setQuantity: (productId: string, variant: string | undefined, quantity: number) => void;
  removeLine: (productId: string, variant?: string) => void;
  clear: () => void;
  wishlist: string[];
  toggleWishlist: (productId: string) => void;
  isWished: (productId: string) => boolean;
};

const CartContext = createContext<CartContextValue | null>(null);
const CART_KEY = "aurelien.cart.v1";
const WISH_KEY = "aurelien.wishlist.v1";

function read<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>([]);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setLines(read<CartLine[]>(CART_KEY, []));
    setWishlist(read<string[]>(WISH_KEY, []));
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    window.localStorage.setItem(CART_KEY, JSON.stringify(lines));
  }, [lines, hydrated]);

  useEffect(() => {
    if (!hydrated) return;
    window.localStorage.setItem(WISH_KEY, JSON.stringify(wishlist));
  }, [wishlist, hydrated]);

  const addLine = useCallback<CartContextValue["addLine"]>((line) => {
    setLines((prev) => {
      const qty = line.quantity ?? 1;
      const idx = prev.findIndex(
        (l) => l.productId === line.productId && (l.variant ?? "") === (line.variant ?? ""),
      );
      if (idx >= 0) {
        const next = [...prev];
        const existing = next[idx]!;
        next[idx] = {
          ...existing,
          quantity: Math.min(existing.stock || 99, existing.quantity + qty),
        };
        return next;
      }
      return [...prev, { ...line, quantity: qty }];
    });
  }, []);

  const setQuantity = useCallback<CartContextValue["setQuantity"]>((productId, variant, qty) => {
    setLines((prev) =>
      prev
        .map((l) =>
          l.productId === productId && (l.variant ?? "") === (variant ?? "")
            ? { ...l, quantity: Math.max(1, Math.min(l.stock || 99, qty)) }
            : l,
        )
        .filter((l) => l.quantity > 0),
    );
  }, []);

  const removeLine = useCallback<CartContextValue["removeLine"]>((productId, variant) => {
    setLines((prev) =>
      prev.filter((l) => !(l.productId === productId && (l.variant ?? "") === (variant ?? ""))),
    );
  }, []);

  const clear = useCallback(() => setLines([]), []);

  const toggleWishlist = useCallback((productId: string) => {
    setWishlist((prev) =>
      prev.includes(productId) ? prev.filter((id) => id !== productId) : [...prev, productId],
    );
  }, []);

  const value = useMemo<CartContextValue>(() => {
    const subtotal = lines.reduce((sum, l) => sum + l.price * l.quantity, 0);
    const shipping = lines.length ? shippingFor(subtotal) : 0;
    return {
      lines,
      count: lines.reduce((sum, l) => sum + l.quantity, 0),
      subtotal,
      shipping,
      total: subtotal + shipping,
      addLine,
      setQuantity,
      removeLine,
      clear,
      wishlist,
      toggleWishlist,
      isWished: (id: string) => wishlist.includes(id),
    };
  }, [lines, wishlist, addLine, setQuantity, removeLine, clear, toggleWishlist]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside CartProvider");
  return ctx;
}
