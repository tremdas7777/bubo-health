import { useParams, Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { Minus, Plus, Truck, Shield, ShieldCheck, Package, Wrench, Gauge, Flame, Ruler, Zap, CircuitBoard, CheckCircle2, Star, HelpCircle, Gift } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import Breadcrumbs from "@/components/store/Breadcrumbs";
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
    { icon: Gauge, text: "01 Bomba de Vácuo 7 CFM Duplo Estágio Hiatsu ou Friven Smart" },
    { icon: Package, text: "01 Óleo para Bomba de Vácuo" },
    { icon: CircuitBoard, text: "01 Conjunto Manifold R407/22/134/404" },
    { icon: Ruler, text: "03 Mangueiras para R22/R134A/R404A com 90cm" },
    { icon: CircuitBoard, text: "01 Conjunto Manifold R32 R410a" },
    { icon: Ruler, text: "03 Mangueiras para R32/R410 com 90cm" },
    { icon: Wrench, text: "02 Suportes gancho de metal para Manifold" },
    { icon: Zap, text: "01 Alicate amperímetro digital" },
    { icon: Zap, text: "01 Multímetro com função capacímetro" },
    { icon: Gauge, text: "01 Termômetro digital" },
    { icon: Wrench, text: "01 Flangeador Excêntrico" },
    { icon: Ruler, text: "01 Mesa em polegadas: 3/16\", 1/4\", 5/16\", 3/8\", 1/2\", 5/8\" e 3/4\"" },
    { icon: Wrench, text: "01 Cortador de tubos de cobre de 1/8 a 1.1/8" },
    { icon: Package, text: "01 Maleta ou 01 Bolsa de ferramentas" },
    { icon: Flame, text: "01 Bico para solda Portátil Automático até 1.200°C" },
    { icon: Zap, text: "01 Caneta detectora de tensão" },
    { icon: Wrench, text: "01 Mini cortador de tubos" },
    { icon: Wrench, text: "01 Escareador de tubos" },
    { icon: Wrench, text: "01 Alargador de tubos" },
    { icon: Wrench, text: "01 Pente desamassador de aletas de metal" },
    { icon: Flame, text: "05 Varetas foscoper" },
    { icon: Package, text: "01 Pasta fluxo 50g" },
    { icon: Wrench, text: "05 Molas curvadoras de tubos de cobre" },
  ],
};

function ProductRatingSummary({ productId }: { productId: string }) {
  const [avg, setAvg] = useState(0);
  const [count, setCount] = useState(0);

  useEffect(() => {
    supabase
      .from("product_reviews")
      .select("rating")
      .eq("product_id", productId)
      .eq("approved", true)
      .then(({ data }) => {
        if (data && data.length > 0) {
          setCount(data.length);
          setAvg(data.reduce((s, r) => s + r.rating, 0) / data.length);
        }
      });
  }, [productId]);

  if (count === 0) return null;

  return (
    <div className="flex items-center justify-center gap-2 lg:justify-start">
      <div className="flex gap-0.5">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star key={i} size={14} className={i < Math.round(avg) ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground/30"} />
        ))}
      </div>
      <span className="text-sm font-medium">{avg.toFixed(1)}</span>
      <span className="text-xs text-muted-foreground">({count} avaliações)</span>
    </div>
  );
}

export default function ProductDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const { data: products = [], isLoading } = useDbProducts();
  const product = products.find((p) => p.slug === slug);
  const [quantity, setQuantity] = useState(1);
  const [selectedVariant, setSelectedVariant] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
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

  // Filter / reorder images based on selected color or legacy variant
  const getFilteredImages = () => {
    const allImages = product.images && product.images.length > 0 ? product.images : [product.image];

    // New: structured colors with image mapping → put selected color image first
    if (product.colors && product.colors.length > 0 && selectedColor) {
      const found = product.colors.find((c) => c.name === selectedColor);
      if (found?.image) {
        const rest = allImages.filter((img) => img !== found.image);
        return [found.image, ...rest];
      }
    }

    // Legacy variant filter
    if (!selectedVariant || !product.variants) return allImages;

    const variantLower = selectedVariant.toLowerCase();
    const colorKeywords: Record<string, string[]> = {
      "amarelo": ["amarela", "amarelo"],
      "azul": ["azul"],
    };
    const keywords = colorKeywords[variantLower] || [variantLower];

    const variantImages = allImages.filter((img) => {
      const imgLower = img.toLowerCase();
      const isVariantSpecific = keywords.some((kw) => imgLower.includes(kw));
      const isOtherVariant = Object.entries(colorKeywords)
        .filter(([key]) => key !== variantLower)
        .some(([, kws]) => kws.some((kw) => imgLower.includes(kw)));
      return isVariantSpecific || !isOtherVariant;
    });

    return variantImages.length > 0 ? variantImages : allImages;
  };

  const displayImages = getFilteredImages();

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
        <Breadcrumbs
          items={[
            { label: "Produtos", href: "/produtos" },
            { label: product.name },
          ]}
        />

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-12">
          <ProductImageGallery
            images={displayImages}
            name={product.name}
            badge={product.badge}
          />

          <div className="space-y-4">
            <h1 className="text-center text-xl font-heading font-bold lg:text-left lg:text-2xl">{product.name}</h1>

            {/* Rating summary - dynamic from DB */}
            <ProductRatingSummary productId={product.id} />

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

            {/* New: structured colors (swatches) + sizes */}
            {product.colors && product.colors.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm font-medium">
                  Cor: <span className="font-normal text-muted-foreground">{selectedColor || "Selecione"}</span>
                </p>
                <div className="flex flex-wrap gap-2">
                  {product.colors.map((c) => (
                    <button
                      key={c.name}
                      type="button"
                      onClick={() => setSelectedColor(c.name)}
                      title={c.name}
                      aria-label={`Cor ${c.name}`}
                      className={`relative h-9 w-9 rounded-full border-2 transition-all ${
                        selectedColor === c.name
                          ? "border-primary ring-2 ring-primary/30 scale-110"
                          : "border-border hover:border-primary/50"
                      }`}
                      style={{ backgroundColor: c.hex }}
                    />
                  ))}
                </div>
              </div>
            )}

            {product.sizes && product.sizes.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm font-medium">
                  Tamanho: <span className="font-normal text-muted-foreground">{selectedSize || "Selecione"}</span>
                </p>
                <div className="flex flex-wrap gap-2">
                  {product.sizes.map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setSelectedSize(s)}
                      className={`min-w-[44px] rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors ${
                        selectedSize === s
                          ? "bg-primary text-primary-foreground border-primary"
                          : "border-primary text-primary hover:bg-primary/10"
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Legacy single-variant selector (only when no structured colors/sizes) */}
            {!product.colors && !product.sizes && product.variants && product.variants.length > 0 && (() => {
              const sizePattern = /^(PP|P|M|G|GG|XGG|\d?XG|\d?G|XS|S|L|XL|XXL|XXXL|\d{2,3})$/i;
              const isSizes = product.variants.every((v) => sizePattern.test(v.trim()));
              const label = isSizes ? "Tamanho:" : "Cor:";
              return (
                <div className="space-y-2">
                  <p className="text-sm font-medium">{label}</p>
                  <div className="flex flex-wrap gap-2">
                    {product.variants.map((variant) => (
                      <button
                        key={variant}
                        onClick={() => setSelectedVariant(variant)}
                        className={`rounded-lg border px-4 py-1.5 text-sm font-medium transition-colors ${
                          selectedVariant === variant
                            ? "bg-primary text-primary-foreground border-primary"
                            : "border-primary text-primary hover:bg-primary/10"
                        }`}
                      >
                        {variant}
                      </button>
                    ))}
                  </div>
                </div>
              );
            })()}

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
          ) : product.descriptionHtml ? (
            <div
              className="product-description-html text-sm leading-relaxed text-muted-foreground [&_h1]:text-xl [&_h1]:font-bold [&_h1]:text-foreground [&_h1]:mt-6 [&_h1]:mb-3 [&_h2]:text-lg [&_h2]:font-bold [&_h2]:text-foreground [&_h2]:mt-5 [&_h2]:mb-2 [&_h3]:text-base [&_h3]:font-semibold [&_h3]:text-foreground [&_h3]:mt-4 [&_h3]:mb-2 [&_p]:mb-3 [&_ul]:mb-3 [&_ul]:space-y-1.5 [&_li]:flex [&_li]:items-start [&_li]:gap-2 [&_strong]:text-foreground [&_strong]:font-semibold [&_img]:rounded-lg [&_img]:my-4 [&_img]:mx-auto [&_img]:max-w-full [&_img]:h-auto [&_img]:shadow-sm"
              dangerouslySetInnerHTML={{ __html: product.descriptionHtml }}
            />
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
          <ProductReviews productSlug={product.slug} productId={product.id} />
        </div>

        {/* FAQ Section */}
        <div className="mx-auto mt-12 max-w-3xl border-t border-border pt-8">
          <h3 className="mb-4 flex items-center gap-2 text-lg font-heading font-semibold">
            <HelpCircle size={20} className="text-primary" />
            Perguntas Frequentes
          </h3>
          <ProductFAQ productName={product.name} productDescription={product.description || ""} />
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
