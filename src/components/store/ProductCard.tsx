import { memo } from "react";
import { Link } from "react-router-dom";
import { Heart } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Product } from "@/data/store";
import { useCart } from "@/contexts/CartContext";
import { useWishlist } from "@/contexts/WishlistContext";
import { useCurrency } from "@/contexts/LocalizationContext";
import { Button } from "@/components/ui/button";

interface Props {
  product: Product;
}

const ACCENT_BY_SLUG: Record<string, string> = {
  "bubo-sleep": "#7c3aed",
  "bubo-energy": "#f59e0b",
  "bubo-slim": "#16a34a",
  "bubo-hair": "#db2777",
};

export default memo(function ProductCard({ product }: Props) {
  const { addItem } = useCart();
  const { isInWishlist, toggleItem } = useWishlist();
  const { t } = useTranslation();
  const { formatPrice } = useCurrency();
  const hasDiscount = product.compareAtPrice && product.compareAtPrice > product.price;
  const wishlisted = isInWishlist(product.id);
  const salesCount = ((product.id.charCodeAt(0) * 7 + product.id.charCodeAt(1) * 13) % 80) + 20;
  const accent = ACCENT_BY_SLUG[product.slug] ?? "hsl(var(--primary))";

  return (
    <div className="group bg-card rounded-lg border border-border overflow-hidden hover:shadow-md transition-all duration-300 flex flex-col">
      <Link to={`/produto/${product.slug}`} className="block relative overflow-hidden">
        <img
          src={product.image}
          alt={product.name}
          className="w-full aspect-square object-cover group-hover:scale-105 transition-transform duration-500 rounded-2xl"
          loading="lazy"
          decoding="async"
          width="400"
          height="400"
        />
        {product.badge && (
          <span className="absolute top-2 right-2 bg-lime text-foreground text-[10px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1">
            <span className="text-primary">✓</span> {product.badge}
          </span>
        )}
        {product.stock <= 10 && (
          <span className="absolute bottom-2 left-2 bg-orange-500 text-white text-[9px] font-bold px-2 py-0.5 rounded-full animate-pulse">
            {t("product.lastUnits", { count: product.stock })}
          </span>
        )}
        <span className="absolute bottom-2 right-2 bg-foreground/80 text-background text-[9px] font-semibold px-2 py-0.5 rounded-full flex items-center gap-0.5">
          {t("product.salesCount", { count: salesCount })}
        </span>
        <button
          onClick={(e) => { e.preventDefault(); toggleItem(product); }}
          className="absolute top-2 left-2 bg-background/80 backdrop-blur-sm rounded-full p-1.5 hover:bg-background transition-colors"
          aria-label={wishlisted ? t("product.removeFromFavorites") : t("product.addToFavorites")}
        >
          <Heart size={16} className={wishlisted ? "fill-destructive text-destructive" : "text-muted-foreground"} />
        </button>
      </Link>

      <div className="p-4 flex flex-col flex-1 text-center">
        <Link to={`/produto/${product.slug}`} className="flex-1">
          <h3 className="font-normal text-sm text-foreground line-clamp-2 hover:text-primary transition-colors leading-snug min-h-[2.5em]">
            {product.name}
          </h3>
        </Link>

        <div className="mt-2 space-y-1">
          <div className="flex items-baseline justify-center gap-2">
            <span className="font-bold text-base" style={{ color: accent }}>
              {formatPrice(product.price)}
            </span>
            {hasDiscount && (
              <span className="text-muted-foreground text-xs line-through">
                {formatPrice(product.compareAtPrice!)}
              </span>
            )}
          </div>
        </div>

        <Button
          onClick={() => addItem(product)}
          className="w-full mt-3 text-primary-foreground text-xs font-medium rounded-md py-2.5 hover:brightness-95 transition-[filter]"
          style={{ backgroundColor: accent }}
        >
          {t("product.addToCart")}
        </Button>
      </div>
    </div>
  );
});
