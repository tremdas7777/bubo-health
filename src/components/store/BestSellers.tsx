import { memo } from "react";
import { Link } from "react-router-dom";
import { TrendingUp } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useCart } from "@/contexts/CartContext";
import { useCurrency } from "@/contexts/LocalizationContext";
import { useDbProducts } from "@/hooks/useProducts";
import type { Product } from "@/data/store";

export default memo(function BestSellers() {
  const { t } = useTranslation();
  const { data: allProducts = [] } = useDbProducts();
  const { addItem } = useCart();
  const { formatPrice } = useCurrency();

  // Pick top featured / first 4 products as "best sellers"
  const bestSellers = allProducts.slice(0, 4);

  if (bestSellers.length === 0) return null;

  return (
    <section className="py-10 border-t border-border/50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-center gap-2 mb-8">
          <TrendingUp size={22} className="text-primary" />
          <h2 className="text-xl md:text-2xl font-heading font-semibold text-center">
            {t("home.bestSellers")}
          </h2>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 max-w-[1000px] mx-auto">
          {bestSellers.map((product) => (
            <BestSellerCard key={product.id} product={product} addItem={addItem} formatPrice={formatPrice} addLabel={t("product.addToCart")} stockLeftLabel={t("product.lastUnits", { count: product.stock })} />
          ))}
        </div>
      </div>
    </section>
  );
});

function BestSellerCard({ product, addItem, formatPrice, addLabel, stockLeftLabel }: { product: Product; addItem: (p: any) => void; formatPrice: (cents: number) => string; addLabel: string; stockLeftLabel: string }) {
  const hasDiscount = product.compareAtPrice && product.compareAtPrice > product.price;
  const discountPercent = hasDiscount
    ? Math.round(((product.compareAtPrice! - product.price) / product.compareAtPrice!) * 100)
    : 0;

  return (
    <div className="group bg-card rounded-lg border border-border overflow-hidden hover:shadow-md transition-all">
      <Link to={`/produto/${product.slug}`} className="block relative overflow-hidden">
        <img
          src={product.image}
          alt={product.name}
          className="w-full aspect-square object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
          decoding="async"
          width="400"
          height="400"
        />
        {discountPercent > 0 && (
          <span className="absolute top-2 left-2 bg-destructive text-destructive-foreground text-[10px] font-bold px-2 py-0.5 rounded-full">
            -{discountPercent}%
          </span>
        )}
        {product.stock <= 10 && (
          <span className="absolute bottom-2 left-2 bg-orange-500 text-white text-[9px] font-bold px-2 py-0.5 rounded-full animate-pulse">
            {stockLeftLabel}
          </span>
        )}
      </Link>
      <div className="p-3 text-center space-y-1">
        <Link to={`/produto/${product.slug}`}>
          <h3 className="font-normal text-xs text-foreground line-clamp-2 hover:text-primary transition-colors leading-snug min-h-[2.5em]">
            {product.name}
          </h3>
        </Link>
        <div>
          <div className="flex items-baseline justify-center gap-1.5">
            <span className="text-primary font-bold text-sm">{formatPrice(Math.round(product.price * 100))}</span>
            {hasDiscount && (
              <span className="text-muted-foreground text-[10px] line-through">
                {formatPrice(Math.round(product.compareAtPrice! * 100))}
              </span>
            )}
          </div>
        </div>
        <button
          onClick={() => addItem(product)}
          className="w-full mt-1.5 bg-primary hover:bg-primary/90 text-primary-foreground text-[11px] font-medium rounded py-2 transition-colors"
        >
          {addLabel}
        </button>
      </div>
    </div>
  );
}
