import { useParams, Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { Trans, useTranslation } from "react-i18next";
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
import SizeGuideDialog from "@/components/store/SizeGuideDialog";
import { formatPrice as formatBRL, getInstallmentPrice, getDiscountPercent } from "@/data/store";
// pix removed
import { useCart } from "@/contexts/CartContext";
import { useLocalization } from "@/contexts/LocalizationContext";
import { trackEvent } from "@/lib/funnelTracking";
import { Button } from "@/components/ui/button";
import ProductJsonLd from "@/components/seo/ProductJsonLd";
import BreadcrumbJsonLd from "@/components/seo/BreadcrumbJsonLd";
import PageHead from "@/components/seo/PageHead";
import { useDbProducts, filterByCategory } from "@/hooks/useProducts";
import { translateBundleLabel, translateBundleBadge } from "@/lib/bundleI18n";

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
  const { t } = useTranslation();
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
      <span className="text-xs text-muted-foreground">{t("productPage.reviewsCount", { count })}</span>
    </div>
  );
}

export default function ProductDetailPage() {
  const { t } = useTranslation();
  const { slug } = useParams<{ slug: string }>();
  const { data: products = [], isLoading } = useDbProducts();
  const product = products.find((p) => p.slug === slug);
  const { formatPrice: fmt, language } = useLocalization();
  const [translatedBullets, setTranslatedBullets] = useState<string[] | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [selectedVariant, setSelectedVariant] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [selectedFlavor, setSelectedFlavor] = useState<string | null>(null);
  const [structuredSelections, setStructuredSelections] = useState<Record<string, string>>({});
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [selectedBundle, setSelectedBundle] = useState<number>(0);

  // Kits: cliente escolhe cor + tamanho (ou sabor) de cada peça do kit
  const KIT_CONFIG: Record<string, { 
    size?: number; 
    labelKey: string; 
    items?: Array<{ name: string; options: string[]; type: "flavor" | "color-size" }> 
  }> = {
    "polo-ducatti-antitranspirante": { size: 3, labelKey: "productPage.kitLabel2for3" },
    "camisa-polo-premium": { size: 5, labelKey: "productPage.kitLabel5polos" },
    "kit-suplementos-completo": { 
      labelKey: "productPage.kitLabelSupplements",
      items: [
        { name: "Designer Whey Protein", options: ["Milk Chocolate", "Vanilla Milk", "Strawberry Cream", "Cookies & Cream", "Neutral", "Banana Milk", "Cinnamon Cereal", "Salted Dark Chocolate"], type: "flavor" },
        { name: "Isoclear Whey Protein Isolate", options: ["Peach Iced Tea", "Lemon Iced Tea", "Green Apple", "Blue Raspberry", "Tropical Punch", "Fresh Cherry", "Blackberry", "Pink Grapefruit"], type: "flavor" },
        { name: "Crank Pre-Workout", options: ["Fresh Berry Juice", "Tropical Punch", "Cola", "Cherry Cola", "Blackberry", "Sour Power"], type: "flavor" },
        { name: "Ultrapure Kreatin Pulver", options: ["Neutral", "Watermelon", "Fizzy Orange", "Fresh Cherry"], type: "flavor" },
        { name: "Daily", options: ["Cactus Fruit", "Apple Cranberry", "Green Apple", "Pineapple Coconut", "Raspberry Iced Tea", "Sour Power"], type: "flavor" },
        { name: "Designer Bar Proteinriegel", options: ["Peanut Caramel", "Hazelnut Nougat", "Fudge Brownie", "Coconut", "Dark Chocolate Raspberry", "White Chocolate Raspberry"], type: "flavor" },
        { name: "Magnesium Complex", options: ["90 Kapseln"], type: "flavor" },
        { name: "Zink Kapseln", options: ["120 Kapseln"], type: "flavor" },
        { name: "Vitamin D3 + K2 Depot", options: ["120 Kapseln"], type: "flavor" },
        { name: "Ashwagandha Kapseln: Ashwa+", options: ["120 Kapseln"], type: "flavor" },
        { name: "Athlete Stack: Men", options: ["210 Kapseln"], type: "flavor" },
        { name: "Athlete Stack: Women", options: ["210 Kapseln"], type: "flavor" },
        { name: "Magnesiumbisglycinat Kapseln", options: ["120 Kapseln"], type: "flavor" }
      ]
    }
  };
  const kitConfig = product ? KIT_CONFIG[product.slug] : undefined;
  const isKitProduct = !!kitConfig;
  const KIT_ITEMS = kitConfig?.items || (kitConfig?.size ? Array(kitConfig.size).fill({ name: "", options: [], type: "color-size" }) : []);
  const KIT_SIZE = KIT_ITEMS.length;

  const [kitSelections, setKitSelections] = useState<Array<{ color: string | null; size: string | null; flavor: string | null }>>(
    Array.from({ length: KIT_SIZE }, (_, i) => ({ 
      color: null, 
      size: null, 
      flavor: kitConfig?.items?.[i]?.options.length === 1 ? kitConfig.items[i].options[0] : null 
    }))
  );
  const [activeKitSlot, setActiveKitSlot] = useState(0);

  const updateKitSlot = (idx: number, patch: Partial<{ color: string; size: string; flavor: string }>) => {
    setKitSelections((prev) => prev.map((s, i) => (i === idx ? { ...s, ...patch } : s)));
  };

  const { addItem } = useCart();
  const navigate = useNavigate();

  useEffect(() => {
    if (product) {
      void trackEvent("product_view");
    }
  }, [product]);

  // Translate the kit bullet points to the active UI language (cached in localStorage).
  useEffect(() => {
    if (!product) return;
    const slug = product.slug;
    const bulletList = productBulletPoints[slug];
    if (!bulletList || bulletList.length === 0) {
      setTranslatedBullets(null);
      return;
    }
    if (language === "pt") {
      setTranslatedBullets(null); // use original (already pt-BR)
      return;
    }
    const cacheKey = `bullets-tr:${slug}:${language}`;
    const cached = localStorage.getItem(cacheKey);
    if (cached) {
      try {
        const arr = JSON.parse(cached);
        if (Array.isArray(arr) && arr.length === bulletList.length) {
          setTranslatedBullets(arr);
          return;
        }
      } catch { /* ignore */ }
    }
    let cancelled = false;
    (async () => {
      try {
        const { data, error } = await supabase.functions.invoke("translate-texts", {
          body: { texts: bulletList.map((b) => b.text), targetLang: language },
        });
        if (cancelled) return;
        if (error || !data?.translations) {
          setTranslatedBullets(null);
          return;
        }
        localStorage.setItem(cacheKey, JSON.stringify(data.translations));
        setTranslatedBullets(data.translations);
      } catch {
        if (!cancelled) setTranslatedBullets(null);
      }
    })();
    return () => { cancelled = true; };
  }, [product, language]);

  if (isLoading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-20 text-center">
          <p className="text-muted-foreground">{t("productPage.loading")}</p>
        </div>
      </Layout>
    );
  }

  if (!product) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-20 text-center">
          <h1 className="mb-4 text-2xl font-heading font-bold">{t("productPage.notFound")}</h1>
          <Link to="/produtos" className="text-primary hover:underline">{t("productPage.viewAllProducts")}</Link>
        </div>
      </Layout>
    );
  }

  // Bundle-aware pricing — when product has bundles, use selected bundle's price
  const activeBundle = product.bundles && product.bundles.length > 0 ? product.bundles[selectedBundle] : null;
  const activePrice = activeBundle ? activeBundle.priceCents / 100 : product.price;
  const activeCompareAt = activeBundle?.originalPriceCents
    ? activeBundle.originalPriceCents / 100
    : product.compareAtPrice;
  const hasDiscount = activeCompareAt && activeCompareAt > activePrice;
  
  // Currency-aware formatter — accepts decimal units (e.g. 31.00) and shows in active currency
  const formatPrice = (decimal: number) => fmt(Math.round(decimal * 100));
  const relatedProducts = filterByCategory(products, product.category).filter((p) => p.id !== product.id).slice(0, 4);
  const productUrl = `${window.location.origin}/produto/${product.slug}`;
  const bullets = productBulletPoints[product.slug];

  // Filter / reorder images based on selected color or active kit slot
  const getFilteredImages = () => {
    const allImages = product.images && product.images.length > 0 ? product.images : [product.image];

    // Kit mode: use the active slot's color image (or the most-recent filled slot)
    if (isKitProduct && product.colors) {
      const slotColor = kitSelections[activeKitSlot]?.color
        || [...kitSelections].reverse().find((s) => s.color)?.color;
      if (slotColor) {
        const found = product.colors.find((c) => c.name === slotColor);
        if (found?.image) {
          return [found.image];
        }
      }
      return allImages;
    }

    // Single color selection — show ONLY the image of the selected color
    if (product.colors && product.colors.length > 0 && selectedColor) {
      const found = product.colors.find((c) => c.name === selectedColor);
      if (found?.image) {
        return [found.image];
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

  const validateKit = (): boolean => {
    if (!isKitProduct) return true;
    const incompleteIdx = kitSelections.findIndex((s, i) => {
      const itemConfig = kitConfig?.items?.[i];
      if (itemConfig?.type === "flavor") return !s.flavor;
      return !s.color || !s.size;
    });
    
    if (incompleteIdx !== -1) {
      const itemConfig = kitConfig?.items?.[incompleteIdx];
      toast({
        title: itemConfig ? `Selecione a opção para ${itemConfig.name}` : t("productPage.kitCompleteShirt", { n: incompleteIdx + 1 }),
        description: t("productPage.kitCompleteDesc", { count: KIT_SIZE }),
        variant: "destructive",
      });
      setActiveKitSlot(incompleteIdx);
      return false;
    }
    return true;
  };

  // Build a product snapshot reflecting the active bundle (price + name suffix)
  const productForCart = activeBundle
    ? {
        ...product,
        price: activeBundle.priceCents / 100,
        compareAtPrice: activeBundle.originalPriceCents ? activeBundle.originalPriceCents / 100 : product.compareAtPrice,
        name: activeBundle.qty > 1 ? `${product.name} (${activeBundle.qty}x)` : product.name,
      }
    : product;

  const getSelections = () => {
    const selections: CartItemSelection[] = [];
    if (selectedColor || selectedSize || selectedFlavor) {
      selections.push({
        color: selectedColor || undefined,
        size: selectedSize || undefined,
        flavor: selectedFlavor || undefined
      });
    }
    const structuredKeys = Object.keys(structuredSelections);
    if (structuredKeys.length > 0) {
      for (const key of structuredKeys) {
        if (structuredSelections[key]) {
          selections.push({ name: key, flavor: structuredSelections[key] });
        }
      }
    }
    return selections.length > 0 ? selections : undefined;
  };

  const handleAddToCart = () => {
    if (isKitProduct) {
      if (!validateKit()) return;
      addItem(product, 1, kitSelections.map((s, i) => {
        const itemConfig = kitConfig?.items?.[i];
        if (itemConfig?.type === "flavor") return { flavor: s.flavor!, name: itemConfig.name };
        return { color: s.color!, size: s.size! };
      }));
      return;
    }
    addItem(productForCart, quantity, getSelections());
  };

  const handleBuyNow = () => {
    if (isKitProduct) {
      if (!validateKit()) return;
      addItem(product, 1, kitSelections.map((s, i) => {
        const itemConfig = kitConfig?.items?.[i];
        if (itemConfig?.type === "flavor") return { flavor: s.flavor!, name: itemConfig.name };
        return { color: s.color!, size: s.size! };
      }));
      navigate("/checkout");
      return;
    }
    addItem(productForCart, quantity, getSelections());
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
          { name: t("productPage.breadcrumbHome"), url: window.location.origin },
          { name: t("productPage.breadcrumbProducts"), url: `${window.location.origin}/produtos` },
          { name: product.name, url: productUrl },
        ]}
      />
      <div className="container mx-auto px-4 py-6">
        <Breadcrumbs
          items={[
            { label: t("productPage.breadcrumbProducts"), href: "/produtos" },
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
              {hasDiscount && <p className="text-sm text-muted-foreground line-through">{formatPrice(activeCompareAt!)}</p>}
              <div className="flex items-center justify-center gap-3 lg:justify-start">
                <span className="text-2xl font-bold text-primary">{formatPrice(activePrice)}</span>
                {hasDiscount && (
                  <span className="flex items-center gap-1 rounded bg-lime px-2 py-1 text-xs font-bold text-foreground">
                    ↓ {getDiscountPercent(activePrice, activeCompareAt!)}%
                  </span>
                )}
              </div>
              {activeBundle && activeBundle.perUnitCents && (
                <p className="text-xs text-muted-foreground">
                  {formatPrice(activeBundle.perUnitCents / 100)} {t("productPage.perUnit", { defaultValue: "por unidade" })}
                </p>
              )}
              
            </div>

            {/* Bundle selector (1 / 2 / 3 unidades) */}
            {product.bundles && product.bundles.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm font-medium">{t("productPage.chooseBundle", { defaultValue: "Escolha sua oferta" })}</p>
                <div className="grid gap-2">
                  {product.bundles.map((b, idx) => {
                    const isSelected = selectedBundle === idx;
                    const perUnit = b.perUnitCents ?? b.priceCents / b.qty;
                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setSelectedBundle(idx)}
                        className={`flex items-center justify-between gap-3 rounded-xl border-2 p-3 text-left transition-all ${
                          isSelected
                            ? "border-primary bg-primary/5 shadow-sm"
                            : "border-border hover:border-primary/40"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 ${
                              isSelected ? "border-primary bg-primary" : "border-border"
                            }`}
                          >
                            {isSelected && <CheckCircle2 size={12} className="text-primary-foreground" />}
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-foreground">{translateBundleLabel(b.label, t)}</p>
                            <p className="text-xs text-muted-foreground">
                              {formatPrice(perUnit / 100)} {t("productPage.perUnit", { defaultValue: "por unidade" })}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-bold text-primary">{formatPrice(b.priceCents / 100)}</p>
                          {b.badge && (
                            <span className="inline-block rounded bg-lime px-1.5 py-0.5 text-[10px] font-bold text-foreground">
                              {translateBundleBadge(b.badge, t)}
                            </span>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* KIT mode: Compre 2 Leve 3 — 3 separate (color + size) selections */}
            {isKitProduct && product.colors && product.sizes && (
              <div className="space-y-3 rounded-xl border-2 border-primary/30 bg-primary/5 p-4">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Gift size={18} className="text-primary" />
                    <p className="text-sm font-bold text-foreground">
                      {t(kitConfig!.labelKey)}
                    </p>
                  </div>
                  <SizeGuideDialog />
                </div>

                {kitSelections.map((slot, idx) => {
                  const itemConfig = kitConfig?.items?.[idx];
                  const isFlavorType = itemConfig?.type === "flavor";
                  const isComplete = isFlavorType ? !!slot.flavor : (!!slot.color && !!slot.size);
                  const isActive = activeKitSlot === idx;
                  
                  return (
                    <div
                      key={idx}
                      className={`rounded-lg border bg-background p-3 transition-all ${
                        isActive ? "border-primary shadow-sm" : "border-border"
                      }`}
                    >
                      <button
                        type="button"
                        onClick={() => setActiveKitSlot(idx)}
                        className="mb-2 flex w-full items-center justify-between text-left"
                      >
                        <span className="text-sm font-semibold text-foreground">
                          {itemConfig?.name || t("productPage.kitShirtLabel", { n: idx + 1 })}
                          {isComplete && (
                            <span className="ml-2 inline-flex items-center gap-1 text-xs font-normal text-primary">
                              <CheckCircle2 size={12} /> {isFlavorType ? slot.flavor : `${slot.color} · ${slot.size}`}
                            </span>
                          )}
                        </span>
                        <span className={`text-xs ${isComplete ? "text-primary" : "text-muted-foreground"}`}>
                          {isComplete ? t("productPage.kitComplete") : isActive ? t("productPage.kitSelecting") : t("productPage.kitTapToChoose")}
                        </span>
                      </button>
                      
                      {isActive && (
                        <div className="space-y-3 pt-1">
                          {isFlavorType ? (
                            <div>
                              <p className="mb-1.5 text-xs font-medium text-muted-foreground">Escolha a opção:</p>
                              <div className="flex flex-wrap gap-1.5">
                                {itemConfig.options.map((flavor) => (
                                  <button
                                    key={flavor}
                                    type="button"
                                    onClick={() => {
                                      updateKitSlot(idx, { flavor });
                                      const next = kitSelections.findIndex((k, i) => {
                                        const nextCfg = kitConfig?.items?.[i];
                                        if (nextCfg?.type === "flavor") return i !== idx && !k.flavor;
                                        return i !== idx && (!k.color || !k.size);
                                      });
                                      if (next !== -1) setActiveKitSlot(next);
                                    }}
                                    className={`rounded-md border px-3 py-1.5 text-xs font-medium transition-colors ${
                                      slot.flavor === flavor
                                        ? "bg-primary text-primary-foreground border-primary"
                                        : "border-primary/40 text-foreground hover:bg-primary/10"
                                    }`}
                                  >
                                    {flavor}
                                  </button>
                                ))}
                              </div>
                            </div>
                          ) : (
                            <>
                              <div>
                                <p className="mb-1.5 text-xs font-medium text-muted-foreground">{t("productPage.kitColor")}</p>
                                <div className="flex flex-wrap gap-1.5">
                                  {product.colors?.map((c) => (
                                    <button
                                      key={c.name}
                                      type="button"
                                      onClick={() => updateKitSlot(idx, { color: c.name })}
                                      title={c.name}
                                      className={`relative h-8 w-8 rounded-full border-2 transition-all ${
                                        slot.color === c.name
                                          ? "border-primary ring-2 ring-primary/30 scale-110"
                                          : "border-border hover:border-primary/50"
                                      }`}
                                      style={{ backgroundColor: c.hex }}
                                    />
                                  ))}
                                </div>
                              </div>
                              <div>
                                <p className="mb-1.5 text-xs font-medium text-muted-foreground">{t("productPage.kitSize")}</p>
                                <div className="flex flex-wrap gap-1.5">
                                  {product.sizes?.map((s) => (
                                    <button
                                      key={s}
                                      type="button"
                                      onClick={() => {
                                        updateKitSlot(idx, { size: s });
                                        if (slot.color) {
                                          const next = kitSelections.findIndex((k, i) => i !== idx && (!k.color || !k.size));
                                          if (next !== -1) setActiveKitSlot(next);
                                        }
                                      }}
                                      className={`min-w-[40px] rounded-md border px-2.5 py-1 text-xs font-medium transition-colors ${
                                        slot.size === s
                                          ? "bg-primary text-primary-foreground border-primary"
                                          : "border-primary/40 text-foreground hover:bg-primary/10"
                                      }`}
                                    >
                                      {s}
                                    </button>
                                  ))}
                                </div>
                              </div>
                            </>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {!isKitProduct && (product.colors || product.sizes || (product.variants && Array.isArray(product.variants) && product.variants.length > 0)) && (
              <div className="space-y-4">
                {product.colors && product.colors.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-sm font-medium">
                      {t("productPage.colorLabel")} <span className="font-normal text-muted-foreground">{selectedColor || t("productPage.selectPlaceholder")}</span>
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {product.colors.map((c) => (
                        <button
                          key={c.name}
                          type="button"
                          onClick={() => setSelectedColor(c.name)}
                          title={c.name}
                          aria-label={t("productPage.kitColorAria", { name: c.name })}
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
                      {t("productPage.sizeLabel")} <span className="font-normal text-muted-foreground">{selectedSize || t("productPage.selectPlaceholder")}</span>
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {product.sizes.map((s) => (
                        <button
                          key={s}
                          type="button"
                          onClick={() => setSelectedSize(s)}
                          className={`min-w-[44px] rounded-md border-2 px-3 py-2 text-sm font-medium transition-all ${
                            selectedSize === s
                              ? "border-primary bg-primary/5 text-primary"
                              : "border-border hover:border-primary/40 text-foreground"
                          }`}
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Variant selectors – ESN-style dropdown */}
                {product.variants && Array.isArray(product.variants) && product.variants.length > 0 && (() => {
                  const isStructured = product.variants.length > 0 && typeof product.variants[0] === 'object' && product.variants[0]?.name && product.variants[0]?.values;
                  
                  if (isStructured) {
                    return (
                      <div className="space-y-3">
                        {(product.variants as Array<{name: string; values: string[]}>).map((opt) => {
                          const selected = structuredSelections[opt.name];
                          const isOpen = openDropdown === opt.name;
                          return (
                            <div key={opt.name} className="relative">
                              <p className="text-xs font-bold text-muted-foreground mb-1 uppercase tracking-wider">{opt.name.replace(' Flavor', '')}</p>
                              <button
                                type="button"
                                onClick={() => setOpenDropdown(isOpen ? null : opt.name)}
                                className={`w-full flex items-center justify-between rounded-xl border-2 px-4 py-3 text-left transition-all hover:border-primary/40 focus:border-primary focus:outline-none ${isOpen ? 'border-primary shadow-md' : 'border-border'}`}
                              >
                                <div className="flex items-center gap-3 min-w-0">
                                  <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center text-primary font-bold text-sm shrink-0">
                                    {opt.name.toLowerCase().includes('isoclear') ? '🧊' : '🥛'}
                                  </div>
                                  <div className="min-w-0">
                                    <p className={`font-semibold text-sm truncate ${selected ? 'text-foreground' : 'text-muted-foreground italic'}`}>
                                      {selected || `${t("productPage.selectPlaceholder")} sabor...`}
                                    </p>
                                    <p className="text-[10px] text-muted-foreground uppercase font-medium">
                                      {opt.values.length} opções disponíveis
                                    </p>
                                  </div>
                                </div>
                                <svg className={`h-5 w-5 text-muted-foreground transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                              </button>
                              
                              {isOpen && (
                                <div className="absolute left-0 right-0 top-[105%] z-[100] max-h-60 overflow-y-auto rounded-xl border-2 border-border bg-background shadow-2xl animate-in fade-in zoom-in-95 duration-200">
                                  {opt.values.map((val: string) => (
                                    <button
                                      key={val}
                                      type="button"
                                      onClick={() => { setStructuredSelections(prev => ({ ...prev, [opt.name]: val })); setOpenDropdown(null); }}
                                      className={`w-full flex items-center gap-3 px-4 py-3 text-left text-sm transition-colors hover:bg-primary/5 ${
                                        selected === val ? 'bg-primary/10 font-bold text-primary' : 'text-foreground border-b border-border/30'
                                      }`}
                                    >
                                      <span className="flex-1">{val}</span>
                                      {selected === val && (
                                        <svg className="h-4 w-4 text-primary shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                                      )}
                                    </button>
                                  ))}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    );
                  }

                  // Flat array – single dropdown
                  const isOpenFlat = openDropdown === '_flat';
                  return (
                    <div className="relative">
                      <p className="text-xs font-bold text-muted-foreground mb-1 uppercase tracking-wider">{t("productPage.flavorLabel", { defaultValue: "Sabor" })}</p>
                      <button
                        type="button"
                        onClick={() => setOpenDropdown(isOpenFlat ? null : '_flat')}
                        className={`w-full flex items-center justify-between rounded-xl border-2 px-4 py-3 text-left transition-all hover:border-primary/40 focus:border-primary focus:outline-none ${isOpenFlat ? 'border-primary shadow-md' : 'border-border'}`}
                      >
                        <div className="min-w-0">
                          <p className={`font-semibold text-sm ${selectedFlavor ? 'text-foreground' : 'text-muted-foreground italic'}`}>
                            {selectedFlavor || `${t("productPage.selectPlaceholder")} sabor...`}
                          </p>
                          <p className="text-[10px] text-muted-foreground uppercase font-medium">
                            {product.variants.length} opções disponíveis
                          </p>
                        </div>
                        <svg className={`h-5 w-5 text-muted-foreground transition-transform ${isOpenFlat ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                      </button>
                      {isOpenFlat && (
                        <div className="absolute left-0 right-0 top-[105%] z-[100] max-h-60 overflow-y-auto rounded-xl border-2 border-border bg-background shadow-2xl animate-in fade-in zoom-in-95 duration-200">
                          {product.variants.map((f: any) => (
                            <button
                              key={String(f)}
                              type="button"
                              onClick={() => { setSelectedFlavor(String(f)); setOpenDropdown(null); }}
                              className={`w-full flex items-center gap-3 px-4 py-3 text-left text-sm transition-colors hover:bg-primary/5 ${
                                selectedFlavor === String(f) ? 'bg-primary/10 font-bold text-primary' : 'text-foreground border-b border-border/30'
                              }`}
                            >
                              <span className="flex-1">{String(f)}</span>
                              {selectedFlavor === String(f) && (
                                <svg className="h-4 w-4 text-primary shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                              )}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })()}
              </div>
            )}


            {product.stock <= 30 && (
              <div>
                <p className="mb-1 text-sm text-muted-foreground">
                  <Trans i18nKey="productPage.stockRemaining" values={{ count: product.stock }} components={{ strong: <strong /> }} />
                </p>
                <div className="h-2.5 w-full overflow-hidden rounded-full bg-muted">
                  <div className="h-full rounded-full bg-lime transition-all" style={{ width: `${Math.min(100, (product.stock / 50) * 100)}%` }} />
                </div>
              </div>
            )}

            <div className="flex items-center gap-3 pt-1">
              {!isKitProduct && (
                <div className="flex items-center overflow-hidden rounded-lg border border-border">
                  <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="px-3 py-2.5 transition-colors hover:bg-muted">
                    <Minus size={16} />
                  </button>
                  <span className="min-w-[40px] px-4 py-2.5 text-center text-sm font-medium">{quantity}</span>
                  <button onClick={() => setQuantity(quantity + 1)} className="px-3 py-2.5 transition-colors hover:bg-muted">
                    <Plus size={16} />
                  </button>
                </div>
              )}

              {!isKitProduct && (
                <Button onClick={handleAddToCart} variant="outline" className="flex-1 py-6 text-sm font-semibold uppercase tracking-wider border-primary text-primary hover:bg-primary/10">
                  {t("productPage.addToCart")}
                </Button>
              )}
            </div>

            {/* Buy Now Button */}
            <Button onClick={handleBuyNow} className="w-full py-6 text-sm font-bold uppercase tracking-wider animate-pulse hover:animate-none">
              {t("productPage.buyNow")}
            </Button>

            {/* Guarantee Badge */}
            <div className="flex items-start gap-3 rounded-lg border-2 border-lime/50 bg-lime/5 p-4">
              <ShieldCheck size={28} className="mt-0.5 shrink-0 text-primary" />
              <div>
                <p className="text-sm font-semibold text-foreground">{t("productPage.guaranteeTitle")}</p>
                <p className="text-xs text-muted-foreground">
                  {t("productPage.guaranteeDesc")}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 rounded-lg border border-border bg-card p-4">
              <Truck size={24} className="mt-0.5 shrink-0 text-primary" />
              <div>
                <p className="text-sm">
                  <span className="font-semibold text-primary">{t("productPage.freeShipping")}</span>{" "}
                  <span className="text-muted-foreground">{t("productPage.freeShippingDesc")}</span>
                </p>
                <p className="text-xs text-muted-foreground">{t("productPage.freeShippingArea")}</p>
              </div>
            </div>

            <CepCalculator />

            <div className="space-y-3 pt-2 text-center">
              <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
                <Shield size={14} /> {t("productPage.securePayment")}
              </div>
              <div className="flex flex-wrap items-center justify-center gap-2">
                {["Mastercard", "Visa", "Amex", "Diners", "Apple Pay", "Google Pay"].map((method) => (
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
          <h3 className="mb-4 text-lg font-heading font-semibold">{t("productPage.productDescription")}</h3>
          {bullets ? (
            <div className="space-y-3">
              <p className="text-sm leading-relaxed text-muted-foreground mb-4">
                {t("productPage.kitIntro")}
              </p>
              <ul className="space-y-3">
                {bullets.map((item, i) => {
                  const Icon = item.icon;
                  return (
                    <li key={i} className="flex items-start gap-3">
                      <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                        <Icon size={16} className="text-primary" />
                      </div>
                      <span className="text-sm leading-relaxed text-muted-foreground">{translatedBullets?.[i] ?? item.text}</span>
                    </li>
                  );
                })}
              </ul>
              <div className="mt-4 flex items-center gap-2 rounded-lg bg-lime/10 p-3">
                <CheckCircle2 size={18} className="shrink-0 text-primary" />
                <p className="text-sm font-medium text-foreground">
                  {t("productPage.kitFooter")}
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
            {t("productPage.customerReviews")}
          </h3>
          <ProductReviews productSlug={product.slug} productId={product.id} />
        </div>

        {/* FAQ Section */}
        <div className="mx-auto mt-12 max-w-3xl border-t border-border pt-8">
          <h3 className="mb-4 flex items-center gap-2 text-lg font-heading font-semibold">
            <HelpCircle size={20} className="text-primary" />
            {t("productPage.faqTitle")}
          </h3>
          <ProductFAQ productName={product.name} productDescription={product.description || ""} />
        </div>

        {relatedProducts.length > 0 && (
          <div className="mt-12 border-t border-border pt-8">
            <h3 className="mb-6 text-center text-xl font-heading font-semibold">{t("productPage.relatedProducts")}</h3>
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
