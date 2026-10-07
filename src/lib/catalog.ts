import { queryOptions } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

export type Product = Tables<"products">;
export type Category = Tables<"categories">;
export type Review = Tables<"reviews">;

export type SortKey = "featured" | "price-asc" | "price-desc" | "newest" | "rating" | "popular";

export type ProductFilters = {
  search?: string | undefined;
  category?: string | undefined;
  gender?: string | undefined;
  brand?: string | undefined;
  material?: string | undefined;
  maxPrice?: number | undefined;
  minPrice?: number | undefined;
  onSale?: boolean | undefined;
  isNew?: boolean | undefined;
  bestSeller?: boolean | undefined;
  sort?: SortKey | undefined;
};

export const productsQuery = () =>
  queryOptions({
    queryKey: ["products"],
    queryFn: async (): Promise<Product[]> => {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("status", "active")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
    staleTime: 60_000,
  });

export const allProductsQuery = () =>
  queryOptions({
    queryKey: ["products", "all"],
    queryFn: async (): Promise<Product[]> => {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

export const categoriesQuery = () =>
  queryOptions({
    queryKey: ["categories"],
    queryFn: async (): Promise<Category[]> => {
      const { data, error } = await supabase.from("categories").select("*").order("name");
      if (error) throw error;
      return data ?? [];
    },
    staleTime: 300_000,
  });

export const productQuery = (slug: string) =>
  queryOptions({
    queryKey: ["product", slug],
    queryFn: async (): Promise<Product | null> => {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("slug", slug)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });

export const reviewsQuery = (productId: string | undefined) =>
  queryOptions({
    queryKey: ["reviews", productId],
    queryFn: async (): Promise<Review[]> => {
      if (!productId) return [];
      const { data, error } = await supabase
        .from("reviews")
        .select("*")
        .eq("product_id", productId)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
    enabled: Boolean(productId),
  });

export const couponsQuery = () =>
  queryOptions({
    queryKey: ["coupons"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("coupons")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

export function filterProducts(products: Product[], f: ProductFilters): Product[] {
  const term = f.search?.trim().toLowerCase();
  let out = products.filter((p) => {
    if (term) {
      const haystack = `${p.name} ${p.brand} ${p.model ?? ""} ${p.description ?? ""}`.toLowerCase();
      if (!haystack.includes(term)) return false;
    }
    if (f.category && p.category_id !== f.category) return false;
    if (f.gender && p.gender !== f.gender) return false;
    if (f.brand && p.brand !== f.brand) return false;
    if (f.material && p.material !== f.material) return false;
    if (f.minPrice != null && Number(p.price) < f.minPrice) return false;
    if (f.maxPrice != null && Number(p.price) > f.maxPrice) return false;
    if (f.onSale && !(p.original_price && Number(p.original_price) > Number(p.price))) return false;
    if (f.isNew && !p.is_new) return false;
    if (f.bestSeller && !p.is_best_seller) return false;
    return true;
  });

  const sort = f.sort ?? "featured";
  out = [...out].sort((a, b) => {
    switch (sort) {
      case "price-asc":
        return Number(a.price) - Number(b.price);
      case "price-desc":
        return Number(b.price) - Number(a.price);
      case "newest":
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      case "rating":
        return Number(b.rating) - Number(a.rating);
      case "popular":
        return b.review_count - a.review_count;
      default:
        return Number(b.is_featured) - Number(a.is_featured) || Number(b.rating) - Number(a.rating);
    }
  });
  return out;
}

export function uniqueValues(products: Product[], key: "brand" | "material" | "strap"): string[] {
  return Array.from(new Set(products.map((p) => p[key]).filter(Boolean) as string[])).sort();
}
