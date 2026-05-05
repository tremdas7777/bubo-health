import { useRef, memo } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useCart } from "@/contexts/CartContext";
import { useCurrency } from "@/contexts/LocalizationContext";
import { useDbProducts, filterByCategory } from "@/hooks/useProducts";
import type { Product } from "@/data/store";

interface Props {
  category: string;
}

function ProductCardInline({ product, addItem }: { product: Product; addItem: (p: any) => void }) {
  const { t } = useTranslation();
  const { formatPrice } = useCurrency();
  const hasDiscount = product.compareAtPrice && product.compareAtPrice > product.price;
  return (
    <div className="flex-shrink-0 w-[200px] md:w-[230px] group/card bg-card rounded-lg border border-border overflow-hidden hover:shadow-md transition-all [.grid_&]:w-full">
      <Link to={`/produto/${product.slug}`} className="block relative overflow-hidden">
        <img
          src={product.image}
          alt={product.name}
          className="w-full aspect-square object-cover group-hover/card:scale-105 transition-transform duration-500 rounded-xl"
          loading="lazy"
          decoding="async"
          width="400"
          height="400"
        />
        {product.badge && (
          <span className="absolute top-2 right-2 bg-lime text-foreground text-[10px] font-bold px-2 py-0.5 rounded-full">
            ✓ {product.badge}
          </span>
        )}
      </Link>
      <div className="p-3 text-center space-y-1">
        <Link to={`/produto/${product.slug}`}>
          <h3 className="font-normal text-sm text-foreground line-clamp-2 hover:text-primary transition-colors leading-snug min-h-[2.5em]">
            {product.name}
          </h3>
        </Link>
        <div>
          <div className="flex items-baseline justify-center gap-1.5">
            <span className="text-primary font-bold text-sm">{formatPrice(Math.round(product.price * 100))}</span>
            {hasDiscount && (
              <span className="text-muted-foreground text-[11px] line-through">
                {formatPrice(Math.round(product.compareAtPrice! * 100))}
              </span>
            )}
          </div>
        </div>
        <button
          onClick={() => addItem(product)}
          className="w-full mt-1.5 bg-primary hover:bg-primary/90 text-primary-foreground text-[11px] font-medium rounded py-2 transition-colors"
        >
          {t("product.addToCart")}
        </button>
      </div>
    </div>
  );
}

export default memo(function CategoryCarousel({ category }: Props) {
  const { t } = useTranslation();
  const scrollRef = useRef<HTMLDivElement>(null);
  const { data: allProducts = [] } = useDbProducts();
  const products = filterByCategory(allProducts, category);
  const { addItem } = useCart();
  const COLLECTION_I18N: Record<string, string> = {
    "home-kitchen": t("collections.homeKitchen"),
    "electronics": t("collections.electronics"),
    "sports": t("collections.sports"),
    "tools": t("collections.tools"),
    "fitness": t("collections.fitness"),
    "fishing": t("collections.fishing"),
    "health-beauty": t("collections.healthBeauty"),
  };

  if (products.length === 0) return null;

  const scroll = (dir: "left" | "right") => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollBy({ left: dir === "left" ? -280 : 280, behavior: "smooth" });
  };

  const isFew = products.length <= 4;

  return (
    <section className="py-8 border-t border-border/50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg md:text-xl font-heading font-semibold">
            {COLLECTION_I18N[category] || category}
          </h2>
          <Link
            to={`/colecao/${category}`}
            className="text-primary text-sm font-medium hover:underline transition-colors"
          >
            {t("common.viewAll")} →
          </Link>
        </div>

        {isFew ? (
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-3 max-w-[960px] mx-auto">
            {products.map((product) => (
              <ProductCardInline key={product.id} product={product} addItem={addItem} />
            ))}
          </div>
        ) : (
          <div className="relative group/nav">
            <button
              onClick={() => scroll("left")}
              className="absolute -left-2 top-1/2 -translate-y-1/2 z-10 bg-background/90 border border-border rounded-full p-1.5 shadow-md opacity-0 group-hover/nav:opacity-100 transition-opacity hidden md:flex"
              aria-label={t("common.previous")}
            >
              <ChevronLeft size={18} />
            </button>

            <div
              ref={scrollRef}
              className="flex gap-3 overflow-x-auto pb-2"
              style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
            >
              {products.map((product) => (
                <ProductCardInline key={product.id} product={product} addItem={addItem} />
              ))}
            </div>

            <button
              onClick={() => scroll("right")}
              className="absolute -right-2 top-1/2 -translate-y-1/2 z-10 bg-background/90 border border-border rounded-full p-1.5 shadow-md opacity-0 group-hover/nav:opacity-100 transition-opacity hidden md:flex"
              aria-label={t("common.next")}
            >
              <ChevronRight size={18} />
            </button>
          </div>
        )}
      </div>
    </section>
  );
});
