import { useParams, Link } from "react-router-dom";
import { useState } from "react";
import { Minus, Plus, Truck, Shield } from "lucide-react";
import Layout from "@/components/store/Layout";
import DeliveryTimeline from "@/components/store/DeliveryTimeline";
import CepCalculator from "@/components/store/CepCalculator";
import ProductCard from "@/components/store/ProductCard";
import { products, formatPrice, getInstallmentPrice, getDiscountPercent, getProductsByCategory } from "@/data/store";
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
          <Link to="/produtos" className="text-primary hover:underline">Ver todos os produtos</Link>
        </div>
      </Layout>
    );
  }

  const hasDiscount = product.compareAtPrice && product.compareAtPrice > product.price;
  const pixPrice = product.price * 0.9;
  const relatedProducts = getProductsByCategory(product.category).filter((p) => p.id !== product.id).slice(0, 4);

  return (
    <Layout>
      <div className="container mx-auto px-4 py-6">
        {/* Breadcrumb */}
        <nav className="text-xs text-muted-foreground mb-6 flex items-center gap-1 flex-wrap">
          <Link to="/" className="hover:text-primary">Início</Link>
          <span>/</span>
          <Link to="/produtos" className="hover:text-primary">Produtos</Link>
          <span>/</span>
          <span className="text-foreground">{product.name}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Image */}
          <div className="relative overflow-hidden rounded-xl bg-muted">
            <img
              src={product.image}
              alt={product.name}
              className="w-full aspect-square object-cover"
            />
            {product.badge && (
              <span className="absolute top-4 right-4 bg-lime text-foreground text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1">
                ✓ {product.badge}
              </span>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-4">
            <h1 className="text-xl lg:text-2xl font-heading font-bold text-center lg:text-left">
              {product.name}
            </h1>

            {/* Pricing */}
            <div className="text-center lg:text-left space-y-1">
              {hasDiscount && (
                <p className="text-muted-foreground line-through text-sm">
                  {formatPrice(product.compareAtPrice!)}
                </p>
              )}
              <div className="flex items-center justify-center lg:justify-start gap-3">
                <span className="text-2xl font-bold text-primary">
                  {formatPrice(product.price)}
                </span>
                {hasDiscount && (
                  <span className="bg-lime text-foreground text-xs font-bold px-2 py-1 rounded flex items-center gap-1">
                    ↓ {getDiscountPercent(product.price, product.compareAtPrice!)}%
                  </span>
                )}
              </div>
              <p className="text-sm text-muted-foreground">
                em até 12x de {getInstallmentPrice(product.price)}
              </p>
            </div>

            {/* Variants */}
            {product.variants && product.variants.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm font-medium">Opções:</p>
                <div className="flex gap-2">
                  {product.variants.map((v) => (
                    <button
                      key={v}
                      className="border border-primary text-primary px-4 py-1.5 rounded-lg text-sm font-medium hover:bg-primary hover:text-primary-foreground transition-colors"
                    >
                      {v}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Stock urgency */}
            {product.stock <= 30 && (
              <div>
                <p className="text-sm text-muted-foreground mb-1">
                  Restam apenas <strong>{product.stock}</strong> unidades deste produto
                </p>
                <div className="w-full h-2.5 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-lime rounded-full transition-all"
                    style={{ width: `${Math.min(100, (product.stock / 50) * 100)}%` }}
                  />
                </div>
              </div>
            )}

            {/* Quantity + ATC */}
            <div className="flex items-center gap-3 pt-1">
              <div className="flex items-center border border-border rounded-lg overflow-hidden">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-3 py-2.5 hover:bg-muted transition-colors"
                >
                  <Minus size={16} />
                </button>
                <span className="px-4 py-2.5 font-medium text-sm min-w-[40px] text-center">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="px-3 py-2.5 hover:bg-muted transition-colors"
                >
                  <Plus size={16} />
                </button>
              </div>

              <Button
                onClick={() => addItem(product, quantity)}
                className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-6 text-sm uppercase tracking-wider"
              >
                Adicionar ao Carrinho
              </Button>
            </div>

            {/* PIX discount */}
            <div className="flex items-start gap-3 p-4 border border-border rounded-lg bg-card">
              <div className="w-10 h-10 bg-lime/20 rounded-full flex items-center justify-center shrink-0">
                <span className="text-xs font-bold text-primary">PIX</span>
              </div>
              <div>
                <p className="text-sm">
                  <strong className="text-foreground">{formatPrice(pixPrice)}</strong>{" "}
                  <span className="text-muted-foreground">no pix</span>{" "}
                  <span className="bg-lime text-foreground text-[10px] px-1.5 py-0.5 rounded font-bold">
                    10% de desconto
                  </span>
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Pague com <strong>PIX</strong> e economize {formatPrice(product.price - pixPrice)}
                </p>
              </div>
            </div>

            {/* Shipping */}
            <div className="flex items-start gap-3 p-4 border border-border rounded-lg bg-card">
              <Truck size={24} className="text-primary shrink-0 mt-0.5" />
              <div>
                <p className="text-sm">
                  <span className="text-primary font-semibold">Frete Grátis</span>{" "}
                  <span className="text-muted-foreground">Enviado por Correios de 3 a 11 dias úteis</span>
                </p>
                <p className="text-xs text-muted-foreground">para sua cidade, UF e Região</p>
              </div>
            </div>

            {/* CEP Calculator */}
            <CepCalculator />

            {/* Security + Payment methods */}
            <div className="text-center space-y-3 pt-2">
              <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
                <Shield size={14} /> Pagamento Seguro e Rápido
              </div>
              <div className="flex items-center justify-center gap-2 flex-wrap">
                {["Mastercard", "Visa", "Elo", "Maestro", "Amex", "Diners", "Pix"].map((m) => (
                  <span key={m} className="text-[10px] bg-muted px-2.5 py-1.5 rounded border border-border font-medium">
                    {m}
                  </span>
                ))}
              </div>
            </div>

            {/* Delivery Timeline */}
            <DeliveryTimeline />
          </div>
        </div>

        {/* Description */}
        <div className="mt-12 border-t border-border pt-8 max-w-3xl mx-auto">
          <h3 className="text-lg font-heading font-semibold mb-4">Descrição do Produto</h3>
          <p className="text-sm text-muted-foreground leading-relaxed">{product.description}</p>
        </div>

        {/* Related products */}
        {relatedProducts.length > 0 && (
          <div className="mt-12 border-t border-border pt-8">
            <h3 className="text-xl font-heading font-semibold text-center mb-6">Produtos Relacionados</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {relatedProducts.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
