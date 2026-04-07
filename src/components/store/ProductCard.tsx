import { Link } from "react-router-dom";
import { Product, formatPrice, getInstallmentPrice, getDiscountPercent } from "@/data/store";
import { useCart } from "@/contexts/CartContext";
import { Button } from "@/components/ui/button";

interface Props {
  product: Product;
}

export default function ProductCard({ product }: Props) {
  const { addItem } = useCart();
  const hasDiscount = product.compareAtPrice && product.compareAtPrice > product.price;

  return (
    <div className="group bg-card rounded-xl border border-border overflow-hidden hover:shadow-lg transition-all duration-300">
      <Link to={`/produto/${product.slug}`} className="block relative overflow-hidden">
        <img
          src={product.image}
          alt={product.name}
          className="w-full aspect-square object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
        {product.badge && (
          <span className="absolute top-3 right-3 bg-lime text-foreground text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1">
            ✓ {product.badge}
          </span>
        )}
      </Link>

      <div className="p-4 text-center space-y-2">
        <Link to={`/produto/${product.slug}`}>
          <h3 className="font-medium text-sm text-foreground line-clamp-2 hover:text-primary transition-colors min-h-[2.5rem]">
            {product.name}
          </h3>
        </Link>

        <div className="space-y-1">
          <div className="flex items-center justify-center gap-2">
            <span className="text-primary font-bold text-lg">{formatPrice(product.price)}</span>
            {hasDiscount && (
              <span className="text-muted-foreground text-sm line-through">
                {formatPrice(product.compareAtPrice!)}
              </span>
            )}
          </div>
          {hasDiscount && (
            <span className="inline-block bg-lime/20 text-accent-foreground text-xs font-semibold px-2 py-0.5 rounded">
              {getDiscountPercent(product.price, product.compareAtPrice!)}% OFF
            </span>
          )}
          <p className="text-xs text-muted-foreground">
            em até 12x de {getInstallmentPrice(product.price)}
          </p>
        </div>

        <Button
          onClick={() => addItem(product)}
          className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-medium mt-2"
        >
          Adicionar ao carrinho
        </Button>
      </div>
    </div>
  );
}
