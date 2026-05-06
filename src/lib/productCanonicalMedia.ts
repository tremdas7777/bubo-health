import type { Product } from "@/data/store";

/**
 * Mídia canónica por slug — garante a mesma arte em lista, PDP, carrinho e checkout
 * mesmo se `products` no repo ou `image_url` no Supabase estiver desatualizado.
 */
const CANONICAL_MEDIA_BY_SLUG: Record<string, { image: string; images?: string[] }> = {
  "combo-3-potes": {
    image: "/products/combo-3-potes.png",
    images: ["/products/combo-3-potes.png"],
  },
};

export function applyCanonicalProductMedia<T extends Pick<Product, "slug" | "image"> & { images?: string[] }>(
  product: T,
): T {
  const canon = CANONICAL_MEDIA_BY_SLUG[product.slug];
  if (!canon) return product;
  return {
    ...product,
    image: canon.image,
    ...(canon.images !== undefined ? { images: canon.images } : {}),
  };
}
