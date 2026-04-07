import { useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import { getProductsByCategory, getCategoryName, formatPrice, getInstallmentPrice, getDiscountPercent } from "@/data/store";
import { useCart } from "@/contexts/CartContext";
import { Button } from "@/components/ui/button";

interface Props {
  category: string;
}

export default function CategoryCarousel({ category }: Props) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const products = getProductsByCategory(category);
  const { addItem } = useCart();

  if (products.length === 0) return null;

  const scroll = (dir: "left" | "right") => {
    if (!scrollRef.current) return;
    const amount = 300;
    scrollRef.current.scrollBy({ left: dir === "left" ? -amount : amount, behavior: "smooth" });
  };

  return (
    <section className="py-10">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl md:text-2xl font-heading font-bold">{getCategoryName(category)}</h2>
          <Link
            to={`/colecao/${category}`}
            className="text-sm text-primary hover:underline font-medium"
          >
            Ver todos →
          </Link>
        </div>

        <div className="relative">
          {/* Left arrow */}
          <button
            onClick={() => scroll("left")}
            className="absolute -left-3 top-1/2 -translate-y-1/2 z-10 bg-background border border-border rounded-full p-2 shadow-md hover:bg-muted transition-colors hidden md:flex"
          >
            <ChevronLeft size={20} />
          </button>

          {/* Products scroll */}
          <div
            ref={scrollRef}
            className="flex gap-4 overflow-x-auto scrollbar-hide pb-2 snap-x snap-mandatory"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          >
            {products.map((product) => {
              const hasDiscount = product.compareAtPrice && product.compareAtPrice > product.price;
              return (
                <div
                  key={product.id}
                  className="flex-shrink-0 w-[220px] md:w-[250px] snap-start group bg-card rounded-xl border border-border overflow-hidden hover:shadow-lg transition-all"
                >
                  <Link to={`/produto/${product.slug}`} className="block relative overflow-hidden">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full aspect-square object-cover group-hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                    />
                    {product.badge && (
                      <span className="absolute top-2 right-2 bg-lime text-foreground text-[10px] font-bold px-2 py-0.5 rounded-full">
                        ✓ {product.badge}
                      </span>
                    )}
                  </Link>
                  <div className="p-3 text-center space-y-1.5">
                    <Link to={`/produto/${product.slug}`}>
                      <h3 className="font-medium text-sm text-foreground line-clamp-2 hover:text-primary transition-colors min-h-[2.5rem]">
                        {product.name}
                      </h3>
                    </Link>
                    <div>
                      <div className="flex items-center justify-center gap-2">
                        <span className="text-primary font-bold">{formatPrice(product.price)}</span>
                        {hasDiscount && (
                          <span className="text-muted-foreground text-xs line-through">
                            {formatPrice(product.compareAtPrice!)}
                          </span>
                        )}
                      </div>
                      {hasDiscount && (
                        <span className="inline-block bg-lime/20 text-accent-foreground text-[10px] font-semibold px-1.5 py-0.5 rounded mt-1">
                          {getDiscountPercent(product.price, product.compareAtPrice!)}% OFF
                        </span>
                      )}
                      <p className="text-[11px] text-muted-foreground mt-1">
                        em até 12x de {getInstallmentPrice(product.price)}
                      </p>
                    </div>
                    <Button
                      onClick={() => addItem(product)}
                      size="sm"
                      className="w-full bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-medium"
                    >
                      Adicionar ao carrinho
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Right arrow */}
          <button
            onClick={() => scroll("right")}
            className="absolute -right-3 top-1/2 -translate-y-1/2 z-10 bg-background border border-border rounded-full p-2 shadow-md hover:bg-muted transition-colors hidden md:flex"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </div>
    </section>
  );
}
