import { useParams, Link, useNavigate } from "react-router-dom";
import { useEffect, useState, useMemo } from "react";
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
import { products as staticProducts, formatPrice as formatBRL, getInstallmentPrice, getDiscountPercent } from "@/data/store";
// pix removed
import { useCart, type CartItemSelection } from "@/contexts/CartContext";
import { useLocalization } from "@/contexts/LocalizationContext";
import { useHeroColor } from "@/contexts/HeroColorContext";
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
  const { data: dbProducts = [], isLoading } = useDbProducts();
  
  const product = useMemo(() => {
    // 1. Check static products first (especially for Bubo products)
    const staticP = staticProducts.find((p) => p.slug === slug);
    if (staticP) return staticP;

    // 2. Check DB products
    const p = dbProducts.find((prod) => prod.slug === slug);
    if (!p) return null;

    if (p.slug === 'esn-elite-leistung-combo-1') {
      return {
        ...p,
        image: "/esn-combo-main.jpg",
        images: ["/esn-combo-main.jpg"],
        variants: [
          { name: "Designer Whey Protein Flavor", values: ["Honey Cereal", "Apple Strudel", "Germknödel", "Peanutbutter Cup", "Birthday Cake", "Almond Coconut", "Vanilla Speculoos", "Banana Milk", "Cherry Yogurt", "Chicken Waffle", "Cinnamon Cereal", "Dark Cookies & Cream", "KiBa", "Leons Cereal", "Milk Chocolate", "Milky Hazelnut", "Neutral", "Peach Yogurt", "Salted Dark Chocolate", "Stracciatella", "Strawberry Cream", "Stroopwafel", "Vanilla Ice Cream", "Vanilla Milk", "Vanilla Speculoos V2", "White Chocolate Pistachio", "Blueberry Cheesecake"] },
          { name: "Isoclear Whey Protein Isolate Flavor", values: ["Royal Candy", "Pina Colada", "Tropical Punch", "Mojito", "Cactus Ice", "Icy Pear", "Peach Rings", "Blackberry", "Bloody Orange", "Spiced Orange", "Fresh Orange", "Fresh Lemon", "Cactus Fruit", "Cherry Lemonade", "Cola Orange", "Green Apple", "Green Tea Honey", "Lemon Iced Tea", "Mango Peach Iced Tea", "Peach Iced Tea", "Pink Grapefruit", "Red Apple Lime", "Sour Power", "Strawberry Lime", "Gummy Bear (limited)"] },
          { name: "Crank Pre-Workout Flavor", values: ["Fresh Berry Juice", "Tropical Punch", "Cola", "Cherry Cola", "Blackberry", "Sour Power"] },
          { name: "Designer Protein Bar Flavor", values: ["Dark Chocolate Raspberry", "White Chocolate Raspberry", "Almond Coconut", "Cinnamon Cereal", "Dark Cookie White Choc", "Fudge Brownie", "Hazelnut Nougat", "Peanut Caramel", "Salted Caramel", "White Chocolate Almond", "White Chocolate Pistachio"] },
          { name: "ESN Daily Flavor", values: ["Cactus Fruit", "Apple Cranberry", "Green Apple", "Raspberry Iced Tea", "Sour Power"] }
        ] as any,
        descriptionHtml: `
<div class="space-y-6">
  <div class="bg-primary/5 border border-primary/20 rounded-2xl p-6">
    <h3 class="text-lg font-bold text-primary mb-3">🚀 Hol dir das ultimative Performance-Paket!</h3>
    <p class="text-sm leading-relaxed text-muted-foreground">
      Optimiere dein Training und deine Regeneration mit dem <strong>ESN Elite Leistung Combo</strong>. Dieses exklusive Paket wurde zusammengestellt, um dir alles zu bieten, was du für maximale Erfolge im Fitnessstudio und im Alltag benötigst. Von hochwertigem Protein über kraftvolle Pre-Workouts bis hin zu essentiellen Mikronährstoffen – hier ist alles drin!
    </p>
  </div>

  <div>
    <h4 class="font-bold text-foreground mb-4 flex items-center gap-2">
      <span class="bg-primary text-primary-foreground w-6 h-6 rounded-full flex items-center justify-center text-xs">8</span>
      Premium-Produkte enthalten:
    </h4>
    <ul class="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
      <li class="flex items-center gap-2 p-2 rounded-lg bg-muted/50 border border-border">✅ Designer Whey (908g)</li>
      <li class="flex items-center gap-2 p-2 rounded-lg bg-muted/50 border border-border">✅ Isoclear Isolate</li>
      <li class="flex items-center gap-2 p-2 rounded-lg bg-muted/50 border border-border">✅ Crank Pre-Workout</li>
      <li class="flex items-center gap-2 p-2 rounded-lg bg-muted/50 border border-border">✅ Designer Protein Bar</li>
      <li class="flex items-center gap-2 p-2 rounded-lg bg-muted/50 border border-border">✅ ESN Daily (Vitamins)</li>
      <li class="flex items-center gap-2 p-2 rounded-lg bg-muted/50 border border-border">✅ Ultrapure Creatine</li>
      <li class="flex items-center gap-2 p-2 rounded-lg bg-muted/50 border border-border">✅ Ashwa+ Capsules</li>
      <li class="flex items-center gap-2 p-2 rounded-lg bg-muted/50 border border-border">✅ Magnesium Complex</li>
    </ul>
  </div>

  <div class="border-t border-border pt-6 text-sm text-muted-foreground italic">
    * Nur für begrenzte Zeit zum Vorteilspreis von 99€ verfügbar. Wähle jetzt deine Lieblingsgeschmacksrichtungen aus und starte durch!
  </div>
</div>
`
      };
    }
    if (p.slug.includes('bubo') || p.slug.includes('combo')) {
      const isCombo = p.slug.includes('combo');
      const unitPrice = 9700;
      const baseBundles = isCombo ? [
        {
          qty: 1,
          label: "1 Combo (4 produtos)",
          priceCents: 38800,
          originalPriceCents: 58800,
          perUnitCents: 38800,
          badge: "MELHOR VALOR",
        },
        {
          qty: 2,
          label: "2 Combos (8 produtos) 👫",
          priceCents: 77600,
          originalPriceCents: 117600,
          perUnitCents: 38800,
          badge: "RECOMENDADO",
        }
      ] : [
        {
          qty: 1,
          label: "1 Pote — Experimente",
          priceCents: 9700,
          originalPriceCents: 14790,
          perUnitCents: 9700,
          badge: "PROMOÇÃO",
        },
        {
          qty: 3,
          label: "3 Potes — Tratamento Médio",
          priceCents: 29100,
          originalPriceCents: 44370,
          perUnitCents: 9700,
          badge: "97/unid.",
        },
        {
          qty: 5,
          label: "5 Potes — Tratamento Completo",
          priceCents: 48500,
          originalPriceCents: 73950,
          perUnitCents: 9700,
          badge: "97/unid.",
        }
      ];

      return {
        ...p,
        price: isCombo ? 29100 : 9700,
        bundles: baseBundles
      };
    }
    return p;
  }, [dbProducts, slug, t]);

  const { formatPrice: fmt, language, settings } = useLocalization();
  
  // If it's a Bubo product, we might have it in staticProducts even if isLoading is true
  const isBuboProduct = slug?.startsWith('bubo-') || slug === 'combo-bubo-health';
  const showLoading = isLoading && (!isBuboProduct || !product);

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
  };
  const kitConfig = product ? KIT_CONFIG[product.slug] : undefined;
  const isKitProduct = !!kitConfig;
  const ESN_FIXED_ITEMS = product?.slug === 'esn-elite-leistung-combo-1' ? [
    { name: t("productPage.esnItems.whey"), image: "https://cdn.shopify.com/s/files/1/0983/5246/4147/files/DesignerWhey_908g_AlmondCoconutFlavor_2024x2024_shop-iCbreuNy_c640bbf7-d33b-4e04-9670-3ab420c5176d.webp?v=1777061872" },
    { name: t("productPage.esnItems.isoclear"), image: "https://cdn.shopify.com/s/files/1/0983/5246/4147/files/IsoClear_908g_LessSweet_FreshCherryFlavor_2024x2024_shop-s-lH3aTm_d20958b4-86e5-4f29-8f19-a219ad289092.webp?v=1777061872" },
    { name: t("productPage.esnItems.crank"), image: "https://cdn.shopify.com/s/files/1/0983/5246/4147/files/Crank_380g_BlackberryFlavor_2024x2024_shop-Ky6j3hay_e04a4802-9642-4856-ad9b-69379cd8f308.webp?v=1777061872" },
    { name: t("productPage.esnItems.proteinBar"), image: "https://cdn.shopify.com/s/files/1/0983/5246/4147/files/DesignerBar_45g_Tray_DarkChocolateSaltedAlmondFlavor_2024x2024_shop-4mvbqa9t_ff7823ec-c07e-4039-80a7-f3bf95d0638a.webp?v=1777061873" },
    { name: t("productPage.esnItems.daily"), image: "https://cdn.shopify.com/s/files/1/0983/5246/4147/files/Daily_480g_CactusFruitFlavor_2024x2024_shop-ZTJBj2Ln_f6c0fd1b-c9af-43b4-9ff0-00a180714e8b.webp?v=1777061872" },
    { name: t("productPage.esnItems.creatine"), image: "https://cdn.shopify.com/s/files/1/0845/1358/7515/files/UltrapureCreatine_500g_Beutel_NeutralFlavor_2024x2024_shop-6v02cWzQ_a41b1095-1dad-4771-9e1b-4d233d8f358b.jpg?v=1757496135" },
    { name: t("productPage.esnItems.ashwa"), image: "https://cdn.shopify.com/s/files/1/0845/1358/7515/files/Ashwa__120Caps_2024x2024_shop-ZiGfqmvZ_617765a7-6ae0-4a08-8e92-cc92773b2760.jpg?v=1762335543" },
    { name: t("productPage.esnItems.magnesium"), image: "https://cdn.shopify.com/s/files/1/0845/1358/7515/files/MagnesiumComplex_90VeganCaps_2024x2024_shop-Nyzniicd_ab59e585-d0b9-45e7-92f6-a9ee5b94598a.jpg?v=1739874672" }
  ] : [];

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

  const navigate = useNavigate();
  const { addItem } = useCart();
  const { setBarColor } = useHeroColor();

  if (showLoading) {
    return (
      <Layout>
        <div className="flex h-[60vh] items-center justify-center">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#7c3aed] border-t-transparent" />
        </div>
      </Layout>
    );
  }

  if (!product) {
    return (
      <Layout>
        <div className="flex h-[60vh] flex-col items-center justify-center text-center px-4">
          <h2 className="text-2xl font-black mb-2 text-gray-900">Produto não encontrado</h2>
          <p className="text-gray-600 mb-6">Desculpe, não conseguimos localizar o produto que você está procurando.</p>
          <Link to="/" className="bg-[#7c3aed] text-white px-8 py-3 rounded-full font-bold hover:scale-105 transition-all shadow-lg">
            Voltar para a Home
          </Link>
        </div>
      </Layout>
    );
  }


  useEffect(() => {
    if (product) {
      void trackEvent("product_view", product.slug);
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



  // Bundle-aware pricing — when product has bundles, use selected bundle's price
  const activeBundle = product.bundles && product.bundles.length > 0 ? product.bundles[selectedBundle] : null;

  // Variant-aware pricing — when a structured variant has per-value prices, use the selected one
  const variantPriceOverride = (() => {
    if (!product.variants || !Array.isArray(product.variants)) return null;
    for (const opt of product.variants as any[]) {
      if (opt && typeof opt === "object" && opt.prices && opt.name) {
        const sel = structuredSelections[opt.name];
        if (sel && opt.prices[sel]) {
          return {
            priceCents: Number(opt.prices[sel].priceCents) || 0,
            originalPriceCents: opt.prices[sel].originalPriceCents
              ? Number(opt.prices[sel].originalPriceCents)
              : undefined,
          };
        }
      }
    }
    return null;
  })();

  const activePrice = variantPriceOverride
    ? variantPriceOverride.priceCents / 100
    : activeBundle
    ? activeBundle.priceCents / 100
    : product.price;
  const activeCompareAt = variantPriceOverride
    ? variantPriceOverride.originalPriceCents
      ? variantPriceOverride.originalPriceCents / 100
      : undefined
    : activeBundle?.originalPriceCents
    ? activeBundle.originalPriceCents / 100
    : product.compareAtPrice;
  const hasDiscount = activeCompareAt && activeCompareAt > activePrice;
  
  // Currency-aware formatter — accepts decimal units (e.g. 31.00) and shows in active currency
  const formatPrice = (decimal: number) => fmt(Math.round(decimal * 100));
  const relatedProducts = filterByCategory(dbProducts, product.category).filter((p) => p.id !== product.id).slice(0, 4);
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

  // Build a product snapshot reflecting the active bundle / variant price
  const productForCart = variantPriceOverride
    ? {
        ...product,
        price: variantPriceOverride.priceCents / 100,
        compareAtPrice: variantPriceOverride.originalPriceCents
          ? variantPriceOverride.originalPriceCents / 100
          : product.compareAtPrice,
      }
    : activeBundle
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

  const validateSelections = (): boolean => {
    if (isKitProduct) return validateKit();

    // Check standard colors/sizes
    if (product.colors && product.colors.length > 0 && !selectedColor) {
      toast({ title: t("product.selectVariant"), description: t("productPage.colorLabel"), variant: "destructive" });
      return false;
    }
    if (product.sizes && product.sizes.length > 0 && !selectedSize) {
      toast({ title: t("product.selectVariant"), description: t("productPage.sizeLabel"), variant: "destructive" });
      return false;
    }

    // Check structured or flat variants
    if (product.variants && Array.isArray(product.variants) && product.variants.length > 0) {
      const firstVariant = product.variants[0] as any;
      const isStructured = typeof firstVariant === 'object' && firstVariant !== null && firstVariant.name;
      if (isStructured) {
        for (const opt of (product.variants as unknown as Array<{name: string; values: string[]}>)) {
          if (!structuredSelections[opt.name]) {
            toast({
              title: t("productPage.requiredSelectionTitle"),
              description: t("productPage.requiredSelectionDesc", { name: opt.name.replace(/\s*[Ff]lavor/g, '') }),
              variant: "destructive",
            });
            setOpenDropdown(opt.name);
            return false;
          }
        }
      } else if (!selectedFlavor) {
        toast({ 
          title: t("productPage.requiredSelectionTitle"), 
          description: t("productPage.requiredSelectionGeneral"), 
          variant: "destructive" 
        });
        setOpenDropdown('_flat');
        return false;
      }
    }

    return true;
  };

  const handleAddToCart = () => {
    if (!validateSelections()) return;
    
    if (isKitProduct) {
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
    if (!validateSelections()) return;

    if (product?.slug === 'esn-elite-leistung-combo-1') {
      void trackEvent("checkout", product.slug);
      window.location.href = "https://checkout.flowspays.com/checkout/cmodkt6sb00i31rp0obulz7pa?offer=ZW5X4XQ";
      return;
    }

    if (isKitProduct) {
      addItem(product, 1, kitSelections.map((s, i) => {
        const itemConfig = kitConfig?.items?.[i];
        if (itemConfig?.type === "flavor") return { flavor: s.flavor!, name: itemConfig.name };
        return { color: s.color!, size: s.size! };
      }));
      navigate("/checkout");
      return;
    }
    if (product.slug === 'esn-elite-leistung-combo-1') {
      window.location.href = "https://checkout.flowspays.com/checkout/cmodkt6sb00i31rp0obulz7pa?offer=ZW5X4XQ";
      return;
    }
    addItem(productForCart, quantity, getSelections());
    navigate("/checkout");
  };

  // Map product slugs to color themes
  const PRODUCT_THEMES: Record<string, { bg: string; accent: string; tag: string }> = {
    "bubo-sleep": { bg: "from-purple-900 to-purple-700", accent: "#7c3aed", tag: "🌙 Gummies do Sono" },
    "bubo-energy": { bg: "from-amber-700 to-yellow-500", accent: "#f59e0b", tag: "⚡ Gummies de Energia" },
    "bubo-slim": { bg: "from-green-800 to-green-500", accent: "#16a34a", tag: "🌿 Gummies Emagrecimento" },
    "bubo-hair": { bg: "from-pink-800 to-rose-500", accent: "#db2777", tag: "💖 Cabelo & Unhas" },
    "combo-bubo-health": { bg: "from-indigo-900 to-purple-700", accent: "#7c3aed", tag: "🔥 Kit Completo" },
  };
  const theme = PRODUCT_THEMES[product.slug] || { bg: "from-purple-900 to-purple-700", accent: "#7c3aed", tag: "✨ Bubo Health" };

  useEffect(() => {
    setBarColor(theme.accent);
  }, [theme.accent, setBarColor]);

  return (
    <Layout>
      <PageHead
        title={`${product.name} | Bubo Health`}
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

      {/* Hero banner in product color - hidden on mobile */}
      <div className={`hidden md:block bg-gradient-to-r ${theme.bg} py-8 px-4 mb-8`}>
        <div className="container mx-auto">
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="flex-1 text-white text-center md:text-left order-2 md:order-1">
              <span className="inline-block bg-white/20 text-white text-xs font-bold px-4 py-1.5 rounded-full mb-3">{theme.tag}</span>
              <h1 className="text-4xl md:text-5xl font-heading font-black text-white mb-2">{product.name}</h1>
              <p className="text-white/80 text-base mb-4">{product.description.slice(0, 80)}...</p>
              <div className="flex items-baseline gap-3 justify-center md:justify-start">
                <span className="text-4xl font-black text-white">{formatPrice(activePrice)}</span>
                {hasDiscount && (
                  <>
                    <span className="text-white/60 text-lg line-through">{formatPrice(activeCompareAt!)}</span>
                    <span className="bg-red-500 text-white font-black text-sm px-3 py-1 rounded-full">
                      -{getDiscountPercent(activePrice, activeCompareAt!)}%
                    </span>
                  </>
                )}
              </div>
              {activeBundle && activeBundle.perUnitCents && (
                <p className="text-white/70 text-sm mt-1">
                  {formatPrice(activeBundle.perUnitCents / 100)} por unidade
                </p>
              )}
            </div>
            <div className="flex-shrink-0 order-1 md:order-2">
              <img
                src={displayImages[0]}
                alt={product.name}
                className="w-[180px] md:w-[240px] object-contain drop-shadow-2xl"
                style={{ filter: "drop-shadow(0 20px 40px rgba(0,0,0,0.4))" }}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 pb-6">
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
            <h2 className="text-center text-2xl font-heading font-black lg:text-left lg:text-3xl" style={{ color: theme.accent }}>{product.name}</h2>

            {/* Rating summary - dynamic from DB */}
            <ProductRatingSummary productId={product.id} />

            <div className="space-y-1 text-center lg:text-left rounded-2xl p-4 transition-colors" style={{ backgroundColor: `${theme.accent}10` }}>
              {hasDiscount && <p className="text-sm text-gray-400 line-through">{formatPrice(activeCompareAt!)}</p>}
              <div className="flex items-center justify-center gap-3 lg:justify-start">
                <span className="text-3xl font-black" style={{ color: theme.accent }}>{formatPrice(activePrice)}</span>
                {hasDiscount && (
                  <span className="flex items-center gap-1 rounded-full bg-red-500 text-white px-3 py-1 text-sm font-black">
                    -{getDiscountPercent(activePrice, activeCompareAt!)}%
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
                          className={`flex items-center justify-between gap-3 rounded-[1.8rem] border-2 p-4 text-left transition-all duration-300 ${
                            isSelected
                              ? "shadow-lg scale-[1.02]"
                              : "border-border hover:border-gray-300"
                          }`}
                          style={isSelected ? { borderColor: theme.accent, backgroundColor: `${theme.accent}10` } : {}}
                        >
                          <div className="flex items-center gap-4">
                            <div
                              className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 transition-colors ${
                                isSelected ? "" : "border-border"
                              }`}
                              style={isSelected ? { borderColor: theme.accent, backgroundColor: theme.accent } : {}}
                            >
                              {isSelected && <Check size={14} className="text-white" />}
                            </div>
                            <div>
                              <p className={`text-sm font-bold transition-colors ${isSelected ? "text-gray-900" : "text-gray-600"}`}>
                                {translateBundleLabel(b.label, t)}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-lg font-black" style={{ color: theme.accent }}>{formatPrice(b.priceCents / 100)}</p>
                            {b.badge && (
                              <span 
                                className="inline-block rounded-full px-3 py-1 text-[10px] font-black text-white shadow-md animate-pulse"
                                style={{ backgroundColor: theme.accent }}
                              >
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
            {isKitProduct && (
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
                          {itemConfig?.name.replace(/\s*[Ff]lavor/g, '') || t("productPage.kitShirtLabel", { n: idx + 1 })}
                          {isComplete && (
                            <span className="ml-2 inline-flex items-center gap-1 text-xs font-normal text-primary">
                              <CheckCircle2 size={12} /> {isFlavorType ? slot.flavor : `${slot.color} · ${slot.size}`}
                            </span>
                          )}
                        </span>
                        <span className={`text-xs ${isComplete ? "text-primary" : "text-muted-foreground"}`}>
                          {isComplete ? t("productPage.kitComplete") : isActive ? t("productPage.kitSelecting") : `escolher sabor:`}
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
                                      className={`rounded-full border px-4 py-2 text-xs font-bold transition-all ${
                                        slot.flavor === flavor
                                          ? "text-white"
                                          : "text-foreground hover:bg-gray-50"
                                      }`}
                                      style={slot.flavor === flavor ? { backgroundColor: theme.accent, borderColor: theme.accent } : { borderColor: `${theme.accent}40` }}
                                    >
                                      {flavor.replace(/\s*[Ff]lavor/g, '')}
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
                                      className={`relative h-10 w-10 rounded-full border-2 transition-all ${
                                        slot.color === c.name
                                          ? "scale-110 shadow-lg"
                                          : "border-border hover:border-gray-400"
                                      }`}
                                      style={slot.color === c.name ? { backgroundColor: c.hex, borderColor: theme.accent } : { backgroundColor: c.hex }}
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
                  const firstVariant = product.variants[0] as any;
                  const isStructured = product.variants.length > 0 && typeof firstVariant === 'object' && firstVariant !== null && firstVariant.name && firstVariant.values;
                  
                  if (isStructured) {
                    return (
                      <div className="space-y-3">
                        {(product.variants as unknown as Array<{name: string; values: string[]}>).map((opt) => {
                          const selected = structuredSelections[opt.name];
                          const isOpen = openDropdown === opt.name;
                          return (
                            <div key={opt.name} className="relative">
                              <p className="text-xs font-bold text-muted-foreground mb-1 uppercase tracking-wider">{opt.name.replace(/\s*[Ff]lavor/g, '')}</p>
                              <button
                                type="button"
                                onClick={() => setOpenDropdown(isOpen ? null : opt.name)}
                                className={`w-full flex items-center justify-between rounded-xl border-2 px-4 py-3 text-left transition-all hover:border-primary/40 focus:border-primary focus:outline-none ${isOpen ? 'border-primary shadow-md' : 'border-border'}`}
                              >
                                <div className="flex items-center gap-3 min-w-0">
                                  <div className="h-12 w-12 rounded-xl overflow-hidden shrink-0 border border-border shadow-sm">
                                    <img 
                                      src={
                                        product.slug === 'esn-elite-leistung-combo-1' ? (
                                          opt.name.toLowerCase().includes('designer') && opt.name.toLowerCase().includes('whey')
                                            ? "https://cdn.shopify.com/s/files/1/0983/5246/4147/files/DesignerWhey_908g_AlmondCoconutFlavor_2024x2024_shop-iCbreuNy_c640bbf7-d33b-4e04-9670-3ab420c5176d.webp?v=1777061872"
                                            : opt.name.toLowerCase().includes('isoclear')
                                            ? "https://cdn.shopify.com/s/files/1/0983/5246/4147/files/IsoClear_908g_LessSweet_FreshCherryFlavor_2024x2024_shop-s-lH3aTm_d20958b4-86e5-4f29-8f19-a219ad289092.webp?v=1777061872"
                                            : opt.name.toLowerCase().includes('crank')
                                            ? "https://cdn.shopify.com/s/files/1/0983/5246/4147/files/Crank_380g_BlackberryFlavor_2024x2024_shop-Ky6j3hay_e04a4802-9642-4856-ad9b-69379cd8f308.webp?v=1777061872"
                                            : opt.name.toLowerCase().includes('bar')
                                            ? "https://cdn.shopify.com/s/files/1/0983/5246/4147/files/DesignerBar_45g_Tray_DarkChocolateSaltedAlmondFlavor_2024x2024_shop-4mvbqa9t_ff7823ec-c07e-4039-80a7-f3bf95d0638a.webp?v=1777061873"
                                            : "https://cdn.shopify.com/s/files/1/0983/5246/4147/files/Daily_480g_CactusFruitFlavor_2024x2024_shop-ZTJBj2Ln_f6c0fd1b-c9af-43b4-9ff0-00a180714e8b.webp?v=1777061872"
                                        ) : (product.image || displayImages[0])
                                      } 
                                      alt={opt.name}
                                      className="h-full w-full object-cover"
                                    />
                                  </div>
                                  <div className="min-w-0">
                                    <p className={`font-semibold text-sm truncate ${selected ? 'text-foreground' : 'text-muted-foreground italic'}`}>
                                      {selected || (opt.name.toLowerCase().includes('flavor') 
                                        ? t("productPage.chooseFlavor")
                                        : `${t("productPage.selectPlaceholder")} ${opt.name.replace(/\s*[Ff]lavor/g, '')}...`)}
                                    </p>
                                    <p className="text-[10px] text-muted-foreground uppercase font-medium">
                                      {t("productPage.optionsAvailable", { count: opt.values.length })}
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
                                      <span className="flex-1">{val.replace(/\s*[Ff]lavor/g, '')}</span>
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

                        {ESN_FIXED_ITEMS.length > 0 && (
                          <div className="mt-6 pt-6 border-t border-border">
                            <p className="text-xs font-bold text-muted-foreground mb-4 uppercase tracking-wider">{t("productPage.includedInCombo")}</p>
                            <div className="space-y-3">
                              {ESN_FIXED_ITEMS.map((item, idx) => (
                                <div key={idx} className="flex items-center gap-4 p-3 rounded-xl border border-border bg-muted/20">
                                  <div className="h-12 w-12 rounded-xl overflow-hidden shrink-0 border border-border bg-background">
                                    <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
                                  </div>
                                  <p className="text-sm font-semibold text-foreground">{item.name}</p>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
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
                            {selectedFlavor ? selectedFlavor.replace(/\s*[Ff]lavor/g, '') : `Escolher sabor ${product.name.replace(/\s*[Ff]lavor/g, '')}`}
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
                              <span className="flex-1">{String(f).replace(/\s*[Ff]lavor/g, '')}</span>
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
              {!isKitProduct && product?.slug !== 'esn-elite-leistung-combo-1' && (
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

              {!isKitProduct && product?.slug !== 'esn-elite-leistung-combo-1' && (
                <Button 
                  onClick={handleAddToCart} 
                  variant="outline" 
                  className="flex-1 py-6 text-sm font-semibold uppercase tracking-wider rounded-2xl"
                  style={{ borderColor: theme.accent, color: theme.accent }}
                >
                  {t("productPage.addToCart")}
                </Button>
              )}
            </div>

            {/* Buy Now Button */}
            <Button 
              onClick={handleBuyNow} 
              className="w-full py-7 text-base font-black text-white uppercase tracking-widest transition-all hover:scale-[1.03] active:scale-95 rounded-full shadow-xl"
              style={{ backgroundColor: theme.accent }}
            >
              <ShoppingCart size={20} className="mr-2" />
              {t("productPage.buyNow")}
            </Button>

            {/* Guarantee Badge */}
            <div className="flex items-start gap-3 rounded-xl border-2 p-4 transition-all" style={{ borderColor: `${theme.accent}4D`, backgroundColor: `${theme.accent}0D` }}>
              <ShieldCheck size={28} className="mt-0.5 shrink-0" style={{ color: theme.accent }} />
              <div>
                <p className="text-sm font-bold text-foreground">{t("productPage.guaranteeTitle")}</p>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {t("productPage.guaranteeDesc")}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 rounded-xl border border-border bg-card p-4">
              <Truck size={24} className="mt-0.5 shrink-0" style={{ color: theme.accent }} />
              <div>
                <p className="text-sm">
                  <span className="font-bold" style={{ color: theme.accent }}>{t("productPage.freeShipping")}</span>{" "}
                  <span className="text-muted-foreground">{t("productPage.freeShippingDesc")}</span>
                </p>
                <p className="text-xs text-muted-foreground leading-tight">{t("productPage.freeShippingArea")}</p>
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

            <DeliveryTimeline color={theme.accent} />
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
                      <div 
                        className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg"
                        style={{ backgroundColor: `${theme.accent}1A` }}
                      >
                        <Icon size={16} style={{ color: theme.accent }} />
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
