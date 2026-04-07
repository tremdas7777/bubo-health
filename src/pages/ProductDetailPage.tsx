import { useParams, Link } from "react-router-dom";
import { useState } from "react";
import { Minus, Plus, Truck, Shield, CreditCard } from "lucide-react";
import Layout from "@/components/store/Layout";
import { products, formatPrice, getInstallmentPrice, getDiscountPercent } from "@/data/store";
import { useCart } from "@/contexts/CartContext";
import { Button } from "@/components/ui/button";

export default function ProductDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const product = products.find((p) => p.slug === slug);
  const [quantity, setQuantity] = useState(1);
  const { addItem } = useCart();

  if (!product) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-20 text-center">
          <h1 className="text-2xl font-heading font-bold mb-4">Produto não encontrado</h1>
          <Link to="/produtos" className="text-primary hover:underline">
            Ver todos os produtos
          </Link>
        </div>
      </Layout>
    );
  }

  const hasDiscount = product.compareAtPrice && product.compareAtPrice > product.price;
  const pixPrice = product.price * 0.9;

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <nav className="text-sm text-muted-foreground mb-6">
          <Link to="/" className="hover:text-primary">Início</Link>
          <span className="mx-2">/</span>
          <Link to="/produtos" className="hover:text-primary">Produtos</Link>
          <span className="mx-2">/</span>
          <span className="text-foreground">{product.name}</span>
        </nav>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
          {/* Image */}
          <div className="relative overflow-hidden rounded-xl bg-muted">
            <img
              src={product.image}
              alt={product.name}
              className="w-full aspect-square object-cover"
            />
            {product.badge && (
              <span className="absolute top-4 right-4 bg-lime text-foreground text-xs font-bold px-3 py-1.5 rounded-full">
                ✓ {product.badge}
              </span>
            )}
          </div>

          {/* Info */}
          <div className="space-y-4">
            <h1 className="text-2xl lg:text-3xl font-heading font-bold">{product.name}</h1>

            {/* Prices */}
            <div className="space-y-1">
              {hasDiscount && (
                <p className="text-muted-foreground line-through text-sm">
                  {formatPrice(product.compareAtPrice!)}
                </p>
              )}
              <div className="flex items-center gap-3">
                <span className="text-2xl font-bold text-primary">
                  {formatPrice(product.price)}
                </span>
                {hasDiscount && (
                  <span className="bg-lime text-foreground text-xs font-bold px-2 py-1 rounded">
                    ↓ {getDiscountPercent(product.price, product.compareAtPrice!)}%
                  </span>
                )}
              </div>
              <p className="text-sm text-muted-foreground">
                em até 12x de {getInstallmentPrice(product.price)}
              </p>
            </div>

            {/* Stock bar */}
            {product.stock <= 20 && (
              <div>
                <p className="text-sm text-muted-foreground mb-1">
                  Restam apenas {product.stock} unidades deste produto
                </p>
                <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-lime rounded-full"
                    style={{ width: `${Math.min(100, (product.stock / 50) * 100)}%` }}
                  />
                </div>
              </div>
            )}

            {/* Quantity + Add to cart */}
            <div className="flex items-center gap-4 pt-2">
              <div className="flex items-center border border-border rounded-lg">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-3 py-2 hover:bg-muted transition-colors"
                >
                  <Minus size={16} />
                </button>
                <span className="px-4 py-2 font-medium">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="px-3 py-2 hover:bg-muted transition-colors"
                >
                  <Plus size={16} />
                </button>
              </div>

              <Button
                onClick={() => addItem(product, quantity)}
                className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-6 text-base"
              >
                ADICIONAR AO CARRINHO
              </Button>
            </div>

            {/* PIX */}
            <div className="flex items-center gap-3 p-3 border border-border rounded-lg">
              <div className="w-8 h-8 bg-lime/20 rounded-full flex items-center justify-center text-xs font-bold text-primary">
                PIX
              </div>
              <div>
                <p className="text-sm">
                  <strong>{formatPrice(pixPrice)}</strong> no pix{" "}
                  <span className="bg-lime text-foreground text-xs px-1.5 py-0.5 rounded font-semibold">
                    10% de desconto
                  </span>
                </p>
                <p className="text-xs text-muted-foreground">
                  Pague com <strong>PIX</strong> e economize {formatPrice(product.price - pixPrice)}
                </p>
              </div>
            </div>

            {/* Shipping */}
            <div className="flex items-center gap-3 p-3 border border-border rounded-lg">
              <Truck size={24} className="text-primary shrink-0" />
              <div>
                <p className="text-sm">
                  <span className="text-primary font-semibold">Frete Grátis</span>{" "}
                  Enviado por Correios de 3 a 11 dias úteis
                </p>
                <p className="text-xs text-muted-foreground">para sua cidade, UF e Região</p>
              </div>
            </div>

            {/* Trust */}
            <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground pt-2">
              <Shield size={14} /> Pagamento Seguro e Rápido
            </div>

            {/* Payment icons placeholder */}
            <div className="flex items-center justify-center gap-3">
              {["Mastercard", "Visa", "Elo", "Amex", "Pix"].map((m) => (
                <span key={m} className="text-xs bg-muted px-2 py-1 rounded font-medium">
                  {m}
                </span>
              ))}
            </div>

            {/* Description */}
            <div className="border-t border-border pt-6 mt-6">
              <h3 className="font-heading font-semibold mb-2">Descrição</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{product.description}</p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
