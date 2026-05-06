import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Product, Collection } from "@/data/store";
import { products, collections } from "@/data/store";
import { applyCanonicalProductMedia } from "@/lib/productCanonicalMedia";
import { mergeCatalogProductWithDbRow } from "@/lib/buboBundlePricing";

export const DB_PRODUCTS_QUERY_KEY = ["db-products"] as const;
export const DB_COLLECTIONS_QUERY_KEY = ["db-collections"] as const;

export interface DbProduct {
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

export function mapDbProduct(db: DbProduct, lang: string = "en"): Product {
  let variants: any[] = [];
  let colors: Product["colors"];
  let sizes: string[] | undefined;
  let bundles: Product["bundles"];

  if (Array.isArray(db.variants)) {
    const namedOptions = db.variants.filter(
      (v: any) => v && typeof v === "object" && typeof v.name === "string" && Array.isArray(v.values),
    );
    if (namedOptions.length > 0) {
      variants = namedOptions.map((v: any) => ({
        name: String(v.name),
        values: v.values.map(String),
        prices: v.prices && typeof v.prices === "object" ? v.prices : undefined,
      }));
    }

    const structured = db.variants.find(
      (v: any) =>
        v &&
        typeof v === "object" &&
        (Array.isArray(v.colors) || Array.isArray(v.sizes) || Array.isArray(v.bundles)),
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
    } else if (variants.length === 0) {
      variants = db.variants.flatMap((v: any) => {
        if (typeof v === "string") return [v];
        if (v?.options && Array.isArray(v.options)) return v.options.map(String);
        if (v?.name && !v?.values) return [v.name];
        return [];
      });
    }
  }

  const nameT = (db.name_translations && (db.name_translations[lang] || db.name_translations.en)) || db.name;
  const descT =
    (db.description_translations && (db.description_translations[lang] || db.description_translations.en)) ||
    db.description ||
    "";

  return applyCanonicalProductMedia({
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
  });
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
  return useQuery({
    queryKey: DB_PRODUCTS_QUERY_KEY,
    queryFn: async (): Promise<Product[]> => {
      try {
        const { data, error } = await supabase.from("products").select("*");
        if (error) throw error;
        const rows = (data || []) as DbProduct[];
        const bySlug = new Map(rows.map((r) => [r.slug, r]));
        const staticSlugs = new Set(products.map((p) => p.slug));

        const mergedCatalog = products.map((p) =>
          applyCanonicalProductMedia(mergeCatalogProductWithDbRow(p, bySlug.get(p.slug))),
        );

        const extras = rows
          .filter((r) => !staticSlugs.has(r.slug))
          .map((r) => {
            const staticTemplate = products.find((sp) => sp.slug === r.slug);
            if (staticTemplate) {
              return applyCanonicalProductMedia(mergeCatalogProductWithDbRow(staticTemplate, r));
            }
            return applyCanonicalProductMedia(mapDbProduct(r));
          });

        return [...mergedCatalog, ...extras];
      } catch (e) {
        console.warn("[useDbProducts] fallback static catalog", e);
        return products.map((p) => applyCanonicalProductMedia(p));
      }
    },
    staleTime: 1000 * 60 * 2,
  });
}

export function useDbCollections() {
  return useQuery({
    queryKey: DB_COLLECTIONS_QUERY_KEY,
    queryFn: () => collections,
    staleTime: 1000 * 60 * 5,
  });
}

export function filterByCategory(productsList: Product[], category: string): Product[] {
  return productsList.filter((p) => p.category === category);
}
