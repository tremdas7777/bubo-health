import { useParams, Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { Minus, Plus, Truck, Shield, ShieldCheck, Package, Wrench, Gauge, Flame, Ruler, Zap, CircuitBoard, CheckCircle2, Star, HelpCircle } from "lucide-react";
import Layout from "@/components/store/Layout";
import ProductImageGallery from "@/components/store/ProductImageGallery";
import DeliveryTimeline from "@/components/store/DeliveryTimeline";
import CepCalculator from "@/components/store/CepCalculator";
import ProductCard from "@/components/store/ProductCard";
import ProductReviews from "@/components/store/ProductReviews";
import ProductFAQ from "@/components/store/ProductFAQ";
import { formatPrice, getInstallmentPrice, getDiscountPercent } from "@/data/store";
import { getPixPrice, getPixSavings, PIX_DISCOUNT_PERCENT } from "@/lib/pricing";
import { useCart } from "@/contexts/CartContext";
import { trackEvent } from "@/lib/funnelTracking";
import { Button } from "@/components/ui/button";
import ProductJsonLd from "@/components/seo/ProductJsonLd";
import BreadcrumbJsonLd from "@/components/seo/BreadcrumbJsonLd";
import PageHead from "@/components/seo/PageHead";
import { useDbProducts, filterByCategory } from "@/hooks/useProducts";

const productBulletPoints: Record<string, { icon: React.ElementType; text: string }[]> = {
  "kit-ferramentas-refrigeracao": [
    { icon: Gauge, text: "Bomba de Vácuo 7 CFM Duplo Estágio de alta performance" },
    { icon: CircuitBoard, text: "2 Conjuntos Manifold completos (R134 e R410) — compatíveis com R22, R32, R404A e R134a" },
    { icon: Wrench, text: "Flangeador excêntrico com rotação 360° para acabamentos perfeitos" },
    { icon: Ruler, text: "Cortador, alargador e escareador de tubos de cobre" },
    { icon: Wrench, text: "5 curvadoras de tubo em medidas diferentes" },
    { icon: Zap, text: "Multímetro digital com capacímetro + termômetro digital + alicate amperímetro" },
    { icon: Flame, text: "Maçarico portátil para solda até 1.200°C" },
    { icon: Package, text: "2 chaves inglesas, kit chave Allen, mangueiras profissionais, pasta fluxo e maleta organizadora (18 kg)" },
  ],
};

export default function ProductDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const { data: products = [], isLoading } = useDbProducts();
  const product = products.find((p) => p.slug === slug);
  const [quantity, setQuantity] = useState(1);
  const { addItem } = useCart();
  const navigate = useNavigate();

  useEffect(() => {
    if (product) {
      void trackEvent("product_view");
    }
  }, [product]);

  if (isLoading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-20 text-center">
          <p className="text-muted-foreground">Carregando produto...</p>
        </div>
      </Layout>
    );
  }

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
  const relatedProducts = filterByCategory(products, product.category).filter((p) => p.id !== product.id).slice(0, 4);
  const productUrl = `${window.location.origin}/produto/${product.slug}`;
  const bullets = productBulletPoints[product.slug];

  const handleBuyNow = () => {
    addItem(product, quantity);
    navigate("/checkout");
  };

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
          <ProductImageGallery
            images={product.images && product.images.length > 0 ? product.images : [product.image]}
            name={product.name}
            badge={product.badge}
          />

          <div className="space-y-4">
            <h1 className="text-center text-xl font-heading font-bold lg:text-left lg:text-2xl">{product.name}</h1>

            {/* Rating summary */}
            <div className="flex items-center justify-center gap-2 lg:justify-start">
              <div className="flex gap-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} size={14} className={i < 5 ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground/30"} />
                ))}
              </div>
              <span className="text-sm font-medium">4.8</span>
              <span className="text-xs text-muted-foreground">(5 avaliações)</span>
            </div>

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
              <p className="text-sm text-muted-foreground">em até 6x de {getInstallmentPrice(product.price, 6)}</p>
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

              <Button onClick={() => addItem(product, quantity)} variant="outline" className="flex-1 py-6 text-sm font-semibold uppercase tracking-wider border-primary text-primary hover:bg-primary/10">
                Adicionar ao Carrinho
              </Button>
            </div>

            {/* Buy Now Button */}
            <Button onClick={handleBuyNow} className="w-full py-6 text-sm font-bold uppercase tracking-wider animate-pulse hover:animate-none">
              Comprar Agora
            </Button>

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

            {/* Guarantee Badge */}
            <div className="flex items-start gap-3 rounded-lg border-2 border-lime/50 bg-lime/5 p-4">
              <ShieldCheck size={28} className="mt-0.5 shrink-0 text-primary" />
              <div>
                <p className="text-sm font-semibold text-foreground">Garantia de 30 Dias</p>
                <p className="text-xs text-muted-foreground">
                  Se não ficar satisfeito, devolvemos seu dinheiro. Sem burocracia.
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

        {/* Bullet Points Description */}
        <div className="mx-auto mt-12 max-w-3xl border-t border-border pt-8">
          <h3 className="mb-4 text-lg font-heading font-semibold">Descrição do Produto</h3>
          {bullets ? (
            <div className="space-y-3">
              <p className="text-sm leading-relaxed text-muted-foreground mb-4">
                Kit Profissional completo para Refrigeração e Ar Condicionado — tudo que você precisa em uma única maleta:
              </p>
              <ul className="space-y-3">
                {bullets.map((item, i) => {
                  const Icon = item.icon;
                  return (
                    <li key={i} className="flex items-start gap-3">
                      <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                        <Icon size={16} className="text-primary" />
                      </div>
                      <span className="text-sm leading-relaxed text-muted-foreground">{item.text}</span>
                    </li>
                  );
                })}
              </ul>
              <div className="mt-4 flex items-center gap-2 rounded-lg bg-lime/10 p-3">
                <CheckCircle2 size={18} className="shrink-0 text-primary" />
                <p className="text-sm font-medium text-foreground">
                  Bivolt 110/220V — 18 kg de ferramentas profissionais prontas para uso
                </p>
              </div>
            </div>
          ) : (
            <p className="text-sm leading-relaxed text-muted-foreground">{product.description}</p>
          )}
        </div>

        {/* Reviews Section */}
        <div className="mx-auto mt-12 max-w-3xl border-t border-border pt-8">
          <h3 className="mb-6 flex items-center gap-2 text-lg font-heading font-semibold">
            <Star size={20} className="fill-yellow-400 text-yellow-400" />
            Avaliações de Clientes
          </h3>
          <ProductReviews productSlug={product.slug} />
        </div>

        {/* FAQ Section */}
        <div className="mx-auto mt-12 max-w-3xl border-t border-border pt-8">
          <h3 className="mb-4 flex items-center gap-2 text-lg font-heading font-semibold">
            <HelpCircle size={20} className="text-primary" />
            Perguntas Frequentes
          </h3>
          <ProductFAQ />
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
