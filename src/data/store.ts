export interface ProductColor {
  name: string;
  hex: string;
  image?: string;
}

export interface ProductBundle {
  qty: number;
  label: string;
  priceCents: number;
  originalPriceCents?: number;
  perUnitCents?: number;
  badge?: string;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  price: number;
  compareAtPrice?: number;
  image: string;
  images?: string[];
  category: string;
  description: string;
  descriptionHtml?: string;
  stock: number;
  badge?: string;
  variants?: any;
  colors?: ProductColor[];
  sizes?: string[];
  noIndex?: boolean;
  bundles?: ProductBundle[];
}

export interface Collection {
  id: string;
  name: string;
  slug: string;
  image: string;
}

export const collections: Collection[] = [
  { id: "1", name: "Gummies", slug: "gummies", image: "/collections/gummies.jpg" },
  { id: "2", name: "Combos", slug: "combos", image: "/collections/combos.jpg" },
];

// Bundle pricing: R$97 por pote base
// 1 pote: R$ 97,00 (de R$ 147,90)
// 3 potes: R$ 267,00 (R$ 89/pote — 8% desc) (de R$ 443,70)
// 5 potes: R$ 415,00 (R$ 83/pote — 14% desc) (de R$ 739,50)
const buildBundles = (): ProductBundle[] => [
  {
    qty: 1,
    label: "1 Pote — Experimente",
    priceCents: 9700,
    originalPriceCents: 14790,
    perUnitCents: 9700,
    badge: "33% OFF",
  },
  {
    qty: 3,
    label: "3 Potes — Mais Popular 🏆",
    priceCents: 26700,
    originalPriceCents: 44370,
    perUnitCents: 8900,
    badge: "ECONOMIZE R$ 177",
  },
  {
    qty: 5,
    label: "5 Potes — Melhor Custo-Benefício 🔥",
    priceCents: 41500,
    originalPriceCents: 73950,
    perUnitCents: 8300,
    badge: "ECONOMIZE R$ 324",
  },
];

export const products: Product[] = [
  {
    id: "bubo-sleep",
    name: "Bubo Sleep",
    slug: "bubo-sleep",
    price: 97.00,
    compareAtPrice: 147.90,
    image: "/products/bubo-sleep.jpg",
    category: "gummies",
    description: "Gummies do sono profundo. Fórmula exclusiva com melatonina, L-Teanina e Camomila para uma noite de sono revigorante. Sabor maracujá.",
    stock: 50,
    badge: "Mais Vendido",
    bundles: buildBundles(),
  },
  {
    id: "bubo-energy",
    name: "Bubo Energy",
    slug: "bubo-energy",
    price: 97.00,
    compareAtPrice: 147.90,
    image: "/products/bubo-energy.jpg",
    category: "gummies",
    description: "Gummies de energia e disposição. Complexo vitamínico B e cafeína natural para dar aquele gás no seu dia a dia. Sabor laranja.",
    stock: 50,
    bundles: buildBundles(),
  },
  {
    id: "bubo-slim",
    name: "Bubo Slim",
    slug: "bubo-slim",
    price: 97.00,
    compareAtPrice: 147.90,
    image: "/products/bubo-slim.jpg",
    category: "gummies",
    description: "Gummies de controle de apetite e perda de peso. Picolinato de cromo, fibras e Garcinia para emagrecimento saudável. Sabor maçã verde.",
    stock: 45,
    bundles: buildBundles(),
  },
  {
    id: "bubo-combo",
    name: "Combo Bubo Health Completo",
    slug: "combo-bubo-health",
    price: 247.90,
    compareAtPrice: 441.00,
    image: "/products/bubo-combo.jpg",
    images: [
      "/products/bubo-combo.jpg",
      "/products/bubo-sleep.jpg",
      "/products/bubo-energy.jpg",
      "/products/bubo-slim.jpg"
    ],
    category: "combos",
    description: "Transforme sua rotina com o combo completo Bubo Health. Inclui 1 Bubo Sleep + 1 Bubo Energy + 1 Bubo Slim. Cuide da sua saúde 24h por dia!",
    stock: 100,
    badge: "Economize 44%",
    bundles: [
      {
        qty: 1,
        label: "1 Combo (3 produtos)",
        priceCents: 24790,
        originalPriceCents: 44100,
        perUnitCents: 24790,
        badge: "44% OFF",
      },
      {
        qty: 2,
        label: "2 Combos (6 produtos) 👫",
        priceCents: 44900,
        originalPriceCents: 88200,
        perUnitCents: 22450,
        badge: "ECONOMIZE R$ 434",
      },
    ],
  }
];

export const navLinks = [
  { name: "TODOS OS PRODUTOS", href: "/produtos" },
  { name: "GUMMIES", href: "/colecao/gummies" },
  { name: "COMBOS", href: "/colecao/combos" },
  { name: "Sobre nós", href: "/sobre" },
];

export const categoryOrder = [
  "gummies",
  "combos"
];

export function formatPrice(price: number): string {
  return `R$ ${price.toFixed(2).replace('.', ',')}`;
}

export function getInstallmentPrice(price: number, installments: number = 6): string {
  if (installments <= 1) return formatPrice(price);
  const RATE = 0.0249;
  const totalWithInterest = price * Math.pow(1 + RATE, installments);
  return formatPrice(totalWithInterest / installments);
}

export function getDiscountPercent(price: number, compareAt: number): number {
  return Math.round(((compareAt - price) / compareAt) * 100);
}

export function getProductsByCategory(category: string): Product[] {
  return products.filter((p) => p.category === category);
}

export function getCategoryName(slug: string): string {
  const col = collections.find((c) => c.slug === slug);
  return col?.name || slug;
}
