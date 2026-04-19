import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { supabase } from "@/integrations/supabase/client";
import type { Product, Collection } from "@/data/store";

export const DB_PRODUCTS_QUERY_KEY = ["db-products"] as const;
export const DB_COLLECTIONS_QUERY_KEY = ["db-collections"] as const;

interface DbProduct {
  id: string;
  name: string;
  slug: string;
  price_cents: number;
  original_price_cents: number | null;
  image_url: string | null;
  images: string[] | null;
  category: string | null;
  description: string | null;
  description_html: string | null;
  description_translations?: Record<string, string> | null;
  name_translations?: Record<string, string> | null;
  variants: any;
  featured: boolean | null;
  active: boolean | null;
  sort_order: number | null;
  gtin: string | null;
}

interface DbCollection {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image_url: string | null;
  sort_order: number | null;
  active: boolean | null;
}

function mapDbProduct(db: DbProduct, lang: string = "en"): Product {
  let variants: string[] = [];
  let colors: Product["colors"];
  let sizes: string[] | undefined;
  let bundles: Product["bundles"];

  if (Array.isArray(db.variants)) {
    // Structured format: [{ colors: [...], sizes: [...], bundles: [...] }]
    const structured = db.variants.find(
      (v: any) => v && typeof v === "object" && (Array.isArray(v.colors) || Array.isArray(v.sizes) || Array.isArray(v.bundles))
    );
    if (structured) {
      if (Array.isArray(structured.colors)) {
        colors = structured.colors
          .filter((c: any) => c && c.name)
          .map((c: any) => ({ name: String(c.name), hex: String(c.hex || "#cccccc"), image: c.image }));
      }
      if (Array.isArray(structured.sizes)) {
        sizes = structured.sizes.map(String);
      }
      if (Array.isArray(structured.bundles)) {
        bundles = structured.bundles
          .filter((b: any) => b && typeof b.qty === "number" && typeof b.priceCents === "number")
          .map((b: any) => ({
            qty: Number(b.qty),
            label: String(b.label || `${b.qty}x`),
            priceCents: Number(b.priceCents),
            originalPriceCents: b.originalPriceCents ? Number(b.originalPriceCents) : undefined,
            perUnitCents: b.perUnitCents ? Number(b.perUnitCents) : undefined,
            badge: b.badge ? String(b.badge) : undefined,
          }));
      }
    } else {
      // Legacy: array of strings or { name } / { options: [...] }
      variants = db.variants.flatMap((v: any) => {
        if (typeof v === "string") return [v];
        if (v?.options && Array.isArray(v.options)) return v.options.map(String);
        if (v?.name) return [v.name];
        return [String(v)];
      });
    }
  }

  const nameT = (db.name_translations && (db.name_translations[lang] || db.name_translations.en)) || db.name;
  const descT = (db.description_translations && (db.description_translations[lang] || db.description_translations.en)) || db.description || "";

  return {
    id: db.id,
    name: nameT,
    slug: db.slug,
    price: db.price_cents / 100,
    compareAtPrice: db.original_price_cents ? db.original_price_cents / 100 : undefined,
    image: db.image_url || "",
    images: db.images && db.images.length > 0 ? db.images : undefined,
    category: db.category || "general",
    description: descT,
    descriptionHtml: db.description_html || undefined,
    stock: 50,
    variants: variants.length > 0 ? variants : undefined,
    colors,
    sizes,
    bundles,
  };
}

function mapDbCollection(db: DbCollection): Collection {
  return {
    id: db.id,
    name: db.name,
    slug: db.slug,
    image: db.image_url || "",
  };
}

export function useDbProducts() {
  const { i18n } = useTranslation();
  const lang = i18n.language?.slice(0, 2) || "en";
  return useQuery({
    queryKey: [...DB_PRODUCTS_QUERY_KEY, lang],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("active", true)
        .order("sort_order", { ascending: true })
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data as DbProduct[]).map((d) => mapDbProduct(d, lang));
    },
    staleTime: 1000 * 60 * 2,
  });
}

export function useDbCollections() {
  return useQuery({
    queryKey: DB_COLLECTIONS_QUERY_KEY,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("collections")
        .select("*")
        .eq("active", true)
        .order("sort_order", { ascending: true });
      if (error) throw error;
      return (data as DbCollection[]).map(mapDbCollection);
    },
    staleTime: 1000 * 60 * 5,
  });
}

// Helper: filter products by category
export function filterByCategory(products: Product[], category: string): Product[] {
  return products.filter((p) => p.category === category);
}
