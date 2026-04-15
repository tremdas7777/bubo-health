import { memo } from "react";
import { Link } from "react-router-dom";
import { TrendingUp } from "lucide-react";
import { formatPrice, getInstallmentPrice } from "@/data/store";
import { useCart } from "@/contexts/CartContext";
import { useDbProducts } from "@/hooks/useProducts";
import type { Product } from "@/data/store";

export default memo(function BestSellers() {
  const { data: allProducts = [] } = useDbProducts();
  const { addItem } = useCart();

  // Curated best sellers
  const bestSellerSlugs = ["kit-ferramentas-refrigeracao", "maquina-solda-laser-portatil", "mini-motosserra"];
  const bestSellers = bestSellerSlugs
    .map((slug) => allProducts.find((p) => p.slug === slug))
    .filter(Boolean) as Product[];

  if (bestSellers.length === 0) return null;

  return (
    <section className="py-10 border-t border-border/50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-center gap-2 mb-8">
          <TrendingUp size={22} className="text-primary" />
          <h2 className="text-xl md:text-2xl font-heading font-semibold text-center">
            Mais Vendidos
          </h2>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 max-w-[1000px] mx-auto">
          {bestSellers.map((product) => (
            <BestSellerCard key={product.id} product={product} addItem={addItem} />
          ))}
        </div>
      </div>
    </section>
  );
});

function BestSellerCard({ product, addItem }: { product: Product; addItem: (p: any) => void }) {
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
        />
        {discountPercent > 0 && (
          <span className="absolute top-2 left-2 bg-destructive text-destructive-foreground text-[10px] font-bold px-2 py-0.5 rounded-full">
            -{discountPercent}%
          </span>
        )}
        {product.stock <= 10 && (
          <span className="absolute bottom-2 left-2 bg-orange-500 text-white text-[9px] font-bold px-2 py-0.5 rounded-full animate-pulse">
            Restam {product.stock}!
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
            <span className="text-primary font-bold text-sm">{formatPrice(product.price)}</span>
            {hasDiscount && (
              <span className="text-muted-foreground text-[10px] line-through">
                {formatPrice(product.compareAtPrice!)}
              </span>
            )}
          </div>
          <p className="text-[10px] text-muted-foreground">
            em até <strong>6x</strong> de <strong>{getInstallmentPrice(product.price, 6)}</strong>
          </p>
        </div>
        <button
          onClick={() => addItem(product)}
          className="w-full mt-1.5 bg-primary hover:bg-primary/90 text-primary-foreground text-[11px] font-medium rounded py-2 transition-colors"
        >
          Adicionar ao carrinho
        </button>
      </div>
    </div>
  );
}
