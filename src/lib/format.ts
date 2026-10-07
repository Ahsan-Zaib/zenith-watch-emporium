export function formatPrice(value: number | string | null | undefined): string {
  const n = typeof value === "string" ? Number(value) : (value ?? 0);
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(Number.isFinite(n) ? n : 0);
}

export function discountPercent(
  price: number | string,
  originalPrice: number | string | null | undefined,
): number | null {
  const p = Number(price);
  const o = Number(originalPrice ?? 0);
  if (!o || o <= p) return null;
  return Math.round(((o - p) / o) * 100);
}

export function stockLabel(stock: number): {
  label: string;
  tone: "in" | "low" | "out";
} {
  if (stock <= 0) return { label: "Out of stock", tone: "out" };
  if (stock <= 5) return { label: `Only ${stock} left`, tone: "low" };
  return { label: "In stock", tone: "in" };
}

export function formatDate(value: string | null | undefined): string {
  if (!value) return "—";
  return new Date(value).toLocaleDateString("en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export const SHIPPING_FLAT = 45;
export const FREE_SHIPPING_THRESHOLD = 1000;

export function shippingFor(amount: number): number {
  return amount >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_FLAT;
}

export const ORDER_STATUSES = [
  "pending",
  "confirmed",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
] as const;

export type OrderStatus = (typeof ORDER_STATUSES)[number];
