import { useParams, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { Minus, Plus, Truck, Shield } from "lucide-react";
import Layout from "@/components/store/Layout";
import DeliveryTimeline from "@/components/store/DeliveryTimeline";
import CepCalculator from "@/components/store/CepCalculator";
import ProductCard from "@/components/store/ProductCard";
import { products, formatPrice, getInstallmentPrice, getDiscountPercent, getProductsByCategory } from "@/data/store";
import { getPixPrice, getPixSavings, PIX_DISCOUNT_PERCENT } from "@/lib/pricing";
import { useCart } from "@/contexts/CartContext";
import { trackEvent } from "@/lib/funnelTracking";
import { Button } from "@/components/ui/button";
import ProductJsonLd from "@/components/seo/ProductJsonLd";
import BreadcrumbJsonLd from "@/components/seo/BreadcrumbJsonLd";
import PageHead from "@/components/seo/PageHead";

export default function ProductDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const product = products.find((p) => p.slug === slug);
  const [quantity, setQuantity] = useState(1);
  const { addItem } = useCart();

  useEffect(() => {
    if (product) {
      void trackEvent("product_view");
    }
  }, [product]);

  if (!product) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-20 text-center">
          <h1 className="mb-4 text-2xl font-heading font-bold">Produto não encontrado</h1>
          <Link to="/produtos" className="text-primary hover:underline">Ver todos os produtos</Link>
        </div>
      </Layout>
    );
  }

  const hasDiscount = product.compareAtPrice && product.compareAtPrice > product.price;
  const pixPrice = getPixPrice(product.price);
  const relatedProducts = getProductsByCategory(product.category).filter((p) => p.id !== product.id).slice(0, 4);
  const productUrl = `${window.location.origin}/produto/${product.slug}`;

  return (
    <Layout>
      <PageHead
        title={`${product.name} | Kazoom`}
        description={product.description.slice(0, 155)}
        canonical={productUrl}
        noIndex={product.noIndex}
      />
      <ProductJsonLd product={product} url={productUrl} />
      <BreadcrumbJsonLd
        items={[
          { name: "Início", url: window.location.origin },
          { name: "Produtos", url: `${window.location.origin}/produtos` },
          { name: product.name, url: productUrl },
        ]}
      />
      <div className="container mx-auto px-4 py-6">
        <nav className="mb-6 flex flex-wrap items-center gap-1 text-xs text-muted-foreground">
          <Link to="/" className="hover:text-primary">Início</Link>
          <span>/</span>
          <Link to="/produtos" className="hover:text-primary">Produtos</Link>
          <span>/</span>
          <span className="text-foreground">{product.name}</span>
        </nav>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-12">
          <div className="relative overflow-hidden rounded-xl bg-muted">
            <img src={product.image} alt={product.name} className="aspect-square w-full object-cover" />
            {product.badge && (
              <span className="absolute right-4 top-4 flex items-center gap-1 rounded-full bg-lime px-3 py-1.5 text-xs font-bold text-foreground">
                ✓ {product.badge}
              </span>
            )}
          </div>

          <div className="space-y-4">
            <h1 className="text-center text-xl font-heading font-bold lg:text-left lg:text-2xl">{product.name}</h1>

            <div className="space-y-1 text-center lg:text-left">
              {hasDiscount && <p className="text-sm text-muted-foreground line-through">{formatPrice(product.compareAtPrice!)}</p>}
              <div className="flex items-center justify-center gap-3 lg:justify-start">
                <span className="text-2xl font-bold text-primary">{formatPrice(product.price)}</span>
                {hasDiscount && (
                  <span className="flex items-center gap-1 rounded bg-lime px-2 py-1 text-xs font-bold text-foreground">
                    ↓ {getDiscountPercent(product.price, product.compareAtPrice!)}%
                  </span>
                )}
              </div>
              <p className="text-sm text-muted-foreground">em até 12x de {getInstallmentPrice(product.price)}</p>
            </div>

            {product.variants && product.variants.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm font-medium">Opções:</p>
                <div className="flex gap-2">
                  {product.variants.map((variant) => (
                    <button
                      key={variant}
                      className="rounded-lg border border-primary px-4 py-1.5 text-sm font-medium text-primary transition-colors hover:bg-primary hover:text-primary-foreground"
                    >
                      {variant}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {product.stock <= 30 && (
              <div>
                <p className="mb-1 text-sm text-muted-foreground">
                  Restam apenas <strong>{product.stock}</strong> unidades deste produto
                </p>
                <div className="h-2.5 w-full overflow-hidden rounded-full bg-muted">
                  <div className="h-full rounded-full bg-lime transition-all" style={{ width: `${Math.min(100, (product.stock / 50) * 100)}%` }} />
                </div>
              </div>
            )}

            <div className="flex items-center gap-3 pt-1">
              <div className="flex items-center overflow-hidden rounded-lg border border-border">
                <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="px-3 py-2.5 transition-colors hover:bg-muted">
                  <Minus size={16} />
                </button>
                <span className="min-w-[40px] px-4 py-2.5 text-center text-sm font-medium">{quantity}</span>
                <button onClick={() => setQuantity(quantity + 1)} className="px-3 py-2.5 transition-colors hover:bg-muted">
                  <Plus size={16} />
                </button>
              </div>

              <Button onClick={() => addItem(product, quantity)} className="flex-1 py-6 text-sm font-semibold uppercase tracking-wider">
                Adicionar ao Carrinho
              </Button>
            </div>

            <div className="flex items-start gap-3 rounded-lg border border-border bg-card p-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-lime/20">
                <span className="text-xs font-bold text-primary">PIX</span>
              </div>
              <div>
                <p className="text-sm">
                  <strong className="text-foreground">{formatPrice(pixPrice)}</strong> <span className="text-muted-foreground">no pix</span>{" "}
                  <span className="rounded bg-lime px-1.5 py-0.5 text-[10px] font-bold text-foreground">{PIX_DISCOUNT_PERCENT}% de desconto</span>
                </p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  Pague com <strong>PIX</strong> e economize {formatPrice(getPixSavings(product.price))}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 rounded-lg border border-border bg-card p-4">
              <Truck size={24} className="mt-0.5 shrink-0 text-primary" />
              <div>
                <p className="text-sm">
                  <span className="font-semibold text-primary">Frete Grátis</span>{" "}
                  <span className="text-muted-foreground">Enviado por Correios de 3 a 11 dias úteis</span>
                </p>
                <p className="text-xs text-muted-foreground">para sua cidade, UF e Região</p>
              </div>
            </div>

            <CepCalculator />

            <div className="space-y-3 pt-2 text-center">
              <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
                <Shield size={14} /> Pagamento Seguro e Rápido
              </div>
              <div className="flex flex-wrap items-center justify-center gap-2">
                {["Mastercard", "Visa", "Elo", "Maestro", "Amex", "Diners", "Pix"].map((method) => (
                  <span key={method} className="rounded border border-border bg-muted px-2.5 py-1.5 text-[10px] font-medium">
                    {method}
                  </span>
                ))}
              </div>
            </div>

            <DeliveryTimeline />
          </div>
        </div>

        <div className="mx-auto mt-12 max-w-3xl border-t border-border pt-8">
          <h3 className="mb-4 text-lg font-heading font-semibold">Descrição do Produto</h3>
          <p className="text-sm leading-relaxed text-muted-foreground">{product.description}</p>
        </div>

        {relatedProducts.length > 0 && (
          <div className="mt-12 border-t border-border pt-8">
            <h3 className="mb-6 text-center text-xl font-heading font-semibold">Produtos Relacionados</h3>
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
              {relatedProducts.map((relatedProduct) => (
                <ProductCard key={relatedProduct.id} product={relatedProduct} />
              ))}
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
