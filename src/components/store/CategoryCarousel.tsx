import { useRef, memo } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import { getProductsByCategory, getCategoryName, formatPrice, getInstallmentPrice } from "@/data/store";
import { useCart } from "@/contexts/CartContext";

interface Props {
  category: string;
}

function ProductCard({ product, addItem }: { product: ReturnType<typeof getProductsByCategory>[number]; addItem: (p: any) => void }) {
  const hasDiscount = product.compareAtPrice && product.compareAtPrice > product.price;
  return (
    <div className="flex-shrink-0 w-[200px] md:w-[230px] group/card bg-card rounded-lg border border-border overflow-hidden hover:shadow-md transition-all [.grid_&]:w-full">
      <Link to={`/produto/${product.slug}`} className="block relative overflow-hidden">
        <img
          src={product.image}
          alt={product.name}
          className="w-full aspect-square object-cover group-hover/card:scale-105 transition-transform duration-500"
          loading="lazy"
          decoding="async"
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
            <span className="text-primary font-bold text-sm">{formatPrice(product.price)}</span>
            {hasDiscount && (
              <span className="text-muted-foreground text-[11px] line-through">
                {formatPrice(product.compareAtPrice!)}
              </span>
            )}
          </div>
          <p className="text-[10px] text-muted-foreground mt-0.5">
            em até <strong>12x</strong> de <strong>{getInstallmentPrice(product.price)}</strong>
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

export default memo(function CategoryCarousel({ category }: Props) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const products = getProductsByCategory(category);
  const { addItem } = useCart();

  if (products.length === 0) return null;

  const scroll = (dir: "left" | "right") => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollBy({ left: dir === "left" ? -280 : 280, behavior: "smooth" });
  };

  const isFew = products.length <= 4;

  return (
    <section className="py-8 border-t border-border/50">
      <div className="container mx-auto px-4">
        <h2 className="text-lg md:text-xl font-heading font-semibold text-center mb-6">
          {getCategoryName(category)}
        </h2>

        {isFew ? (
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-3 max-w-[960px] mx-auto">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} addItem={addItem} />
            ))}
          </div>
        ) : (
          <div className="relative group/nav">
            <button
              onClick={() => scroll("left")}
              className="absolute -left-2 top-1/2 -translate-y-1/2 z-10 bg-background/90 border border-border rounded-full p-1.5 shadow-md opacity-0 group-hover/nav:opacity-100 transition-opacity hidden md:flex"
              aria-label="Anterior"
            >
              <ChevronLeft size={18} />
            </button>

            <div
              ref={scrollRef}
              className="flex gap-3 overflow-x-auto pb-2"
              style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
            >
              {products.map((product) => (
                <ProductCard key={product.id} product={product} addItem={addItem} />
              ))}
            </div>

            <button
              onClick={() => scroll("right")}
              className="absolute -right-2 top-1/2 -translate-y-1/2 z-10 bg-background/90 border border-border rounded-full p-1.5 shadow-md opacity-0 group-hover/nav:opacity-100 transition-opacity hidden md:flex"
              aria-label="Próximo"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        )}
      </div>
    </section>
  );
});
