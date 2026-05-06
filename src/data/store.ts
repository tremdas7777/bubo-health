import {
  buildCombo3UnidadesBundles,
  buildComboBuboHealthBundles,
  buildStandardGummyBundles,
  COMBO_3_UNIDADES_SLUG,
  DEFAULT_BUBO_UNIT_PRICE,
  roundMoney,
  STRIKE_RATIO_COMBO_4,
  STRIKE_RATIO_SINGLE_POTE,
} from "@/lib/buboBundlePricing";

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

export {
  COMBO_3_UNIDADES_SLUG,
  COMBO_BUBO_HEALTH_SLUG,
  DEFAULT_BUBO_UNIT_PRICE,
} from "@/lib/buboBundlePricing";

const BUBO_U = DEFAULT_BUBO_UNIT_PRICE;

export const collections: Collection[] = [
  { id: "1", name: "Gummies", slug: "gummies", image: "/collections/gummies.jpg" },
  { id: "2", name: "Combos", slug: "combos", image: "/collections/combos.jpg" },
];

// Preço base por pote (BUBO_U): pacotes e combos são derivados em `buboBundlePricing.ts` e no admin (Supabase).

/** @deprecated use `buildCombo3UnidadesBundles` — mantido para imports antigos */
export const buildCombo3PotesBundles = () =>
  buildCombo3UnidadesBundles(BUBO_U, STRIKE_RATIO_SINGLE_POTE);

const buildBundles = (): ProductBundle[] => buildStandardGummyBundles(BUBO_U, STRIKE_RATIO_SINGLE_POTE);

export const products: Product[] = [
  {
    id: "bubo-sleep",
    name: "Bubo Sleep",
    slug: "bubo-sleep",
    price: BUBO_U,
    compareAtPrice: roundMoney(BUBO_U * STRIKE_RATIO_SINGLE_POTE),
    image: "/products/bubo-sleep.jpg",
    category: "gummies",
    description: "Gummies do sono profundo. Fórmula exclusiva com melatonina, L-Teanina e Camomila para uma noite de sono revigorante.",
    descriptionHtml: `
      <div class="space-y-6">
        <p class="text-gray-600">Dormir bem é o pilar fundamental de uma vida saudável. <strong>Bubo Sleep</strong> foi desenvolvido para ajudar você a desligar do estresse diário e entrar em um estado de relaxamento profundo.</p>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div class="bg-purple-50 p-4 rounded-xl border border-purple-100">
            <h4 class="font-bold text-purple-900 mb-1">💤 Sono Profundo</h4>
            <p class="text-sm text-purple-700">Auxilia na regulação do ciclo circadiano para um sono sem interrupções.</p>
          </div>
          <div class="bg-purple-50 p-4 rounded-xl border border-purple-100">
            <h4 class="font-bold text-purple-900 mb-1">🌿 Relaxamento Natural</h4>
            <p class="text-sm text-purple-700">Com extratos de Camomila e Maracujá para acalmar a mente.</p>
          </div>
        </div>
        <ul class="space-y-2 text-sm text-gray-600">
          <li>✨ Zero Açúcar e sem Glúten</li>
          <li>✨ Sabor delicioso de Maracujá</li>
          <li>✨ 30 gummies por pote (Tratamento para 1 mês)</li>
        </ul>
      </div>
    `,
    stock: 50,
    badge: "Mais Vendido",
    bundles: buildBundles(),
  },
  {
    id: "bubo-energy",
    name: "Bubo Energy",
    slug: "bubo-energy",
    price: BUBO_U,
    compareAtPrice: roundMoney(BUBO_U * STRIKE_RATIO_SINGLE_POTE),
    image: "/products/bubo-energy.jpg",
    category: "gummies",
    description: "Gummies de energia e disposição. Complexo vitamínico B e cafeína natural para dar aquele gás no seu dia a dia.",
    descriptionHtml: `
      <div class="space-y-6">
        <p class="text-gray-600">Chega de cansaço no meio da tarde. <strong>Bubo Energy</strong> é o combustível natural que seu corpo precisa para manter o foco e a produtividade lá no alto.</p>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div class="bg-amber-50 p-4 rounded-xl border border-amber-100">
            <h4 class="font-bold text-amber-900 mb-1">⚡ Energia Instantânea</h4>
            <p class="text-sm text-amber-700">Liberação gradual para energia constante sem o "crash" do café.</p>
          </div>
          <div class="bg-amber-50 p-4 rounded-xl border border-amber-100">
            <h4 class="font-bold text-amber-900 mb-1">🧠 Foco Mental</h4>
            <p class="text-sm text-amber-700">Melhora a concentração e o desempenho cognitivo.</p>
          </div>
        </div>
        <ul class="space-y-2 text-sm text-gray-600">
          <li>🔥 Zero Açúcar e sem Glúten</li>
          <li>🔥 30 gummies por pote</li>
          <li>🔥 Sabor vibrante de Laranja</li>
          <li>🔥 Ideal para pré-treino ou trabalho intenso</li>
        </ul>
      </div>
    `,
    stock: 50,
    bundles: buildBundles(),
  },
  {
    id: "bubo-hair",
    name: "Bubo Hair",
    slug: "bubo-hair",
    price: BUBO_U,
    compareAtPrice: roundMoney(BUBO_U * STRIKE_RATIO_SINGLE_POTE),
    image: "/products/bubo-hair.png",
    category: "gummies",
    description: "Gummies para cabelos e unhas. Biotina, colágeno e complexo vitamínico para força e brilho extremo.",
    descriptionHtml: `
      <div class="space-y-6">
        <p class="text-gray-600">O segredo para um cabelo de capa de revista e unhas inquebráveis. <strong>Bubo Hair</strong> nutre de dentro para fora com a dose perfeita de Biotina e Colágeno.</p>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div class="bg-pink-50 p-4 rounded-xl border border-pink-100">
            <h4 class="font-bold text-pink-900 mb-1">💇‍♀️ Cabelos Fortes</h4>
            <p class="text-sm text-pink-700">Reduz a queda e estimula o crescimento de novos fios mais resistentes.</p>
          </div>
          <div class="bg-pink-50 p-4 rounded-xl border border-pink-100">
            <h4 class="font-bold text-pink-900 mb-1">💅 Unhas de Aço</h4>
            <p class="text-sm text-pink-700">Fortalece a base das unhas, eliminando a quebra e descamação.</p>
          </div>
        </div>
        <ul class="space-y-2 text-sm text-gray-600">
          <li>💖 Zero Açúcar e sem Glúten</li>
          <li>💖 30 gummies por pote</li>
          <li>💖 Alto teor de Biotina e Zinco</li>
          <li>💖 Sabor irresistível de Frutas Vermelhas</li>
          <li>💖 Resultados visíveis em 30 dias</li>
        </ul>
      </div>
    `,
    stock: 60,
    badge: "Novo",
    bundles: buildBundles(),
  },
  {
    id: "bubo-slim",
    name: "Bubo Slim",
    slug: "bubo-slim",
    price: BUBO_U,
    compareAtPrice: roundMoney(BUBO_U * STRIKE_RATIO_SINGLE_POTE),
    image: "/products/bubo-slim.jpg",
    category: "gummies",
    description: "Gummies de controle de apetite e perda de peso. Picolinato de cromo, fibras e Garcinia para emagrecimento saudável.",
    descriptionHtml: `
      <div class="space-y-6">
        <p class="text-gray-600">Transforme sua jornada de emagrecimento em um momento prazeroso. <strong>Bubo Slim</strong> ajuda a controlar a vontade de doces e acelera o metabolismo de forma natural.</p>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div class="bg-green-50 p-4 rounded-xl border border-green-100">
            <h4 class="font-bold text-green-900 mb-1">🥗 Controle de Apetite</h4>
            <p class="text-sm text-green-700">Sinta-se saciado por mais tempo e reduza a ingestão calórica.</p>
          </div>
          <div class="bg-green-50 p-4 rounded-xl border border-green-100">
            <h4 class="font-bold text-green-900 mb-1">📉 Metabolismo Ativo</h4>
            <p class="text-sm text-green-700">Fórmula que auxilia na quebra de gordura e queima calórica.</p>
          </div>
        </div>
        <ul class="space-y-2 text-sm text-gray-600">
          <li>🍏 Zero Açúcar e sem Glúten</li>
          <li>🍏 30 gummies por pote</li>
          <li>🍏 Rico em Fibras Prebióticas</li>
          <li>🍏 Sabor refrescante de Maçã Verde</li>
          <li>🍏 Reduz a retenção de líquidos</li>
        </ul>
      </div>
    `,
    stock: 45,
    bundles: buildBundles(),
  },
  {
    id: "bubo-combo-3",
    name: "Combo 3 Unidades",
    slug: COMBO_3_UNIDADES_SLUG,
    price: roundMoney(3 * BUBO_U),
    compareAtPrice: roundMoney(3 * BUBO_U * STRIKE_RATIO_SINGLE_POTE),
    image: "/products/combo-3-potes.png",
    images: ["/products/combo-3-potes.png"],
    category: "combos",
    description:
      "Monte seu combo com 3 potes de gummies à sua escolha — Sleep, Energy, Slim ou Hair. Melhor custo-benefício para o seu tratamento.",
    descriptionHtml: `
      <div class="space-y-6">
        <p class="text-gray-600">Escolha <strong>três potes</strong> dos nossos gummies Bubo Health e personalize sua rotina de bem-estar com o melhor preço por unidade.</p>
        <ul class="space-y-2 text-sm text-gray-600">
          <li>✨ Combine os sabores que mais combinam com você</li>
          <li>✨ Frete calculado no checkout</li>
          <li>✨ Qualidade Bubo Health em cada pote</li>
        </ul>
      </div>
    `,
    stock: 100,
    badge: "OFERTA",
    bundles: buildCombo3UnidadesBundles(BUBO_U, STRIKE_RATIO_SINGLE_POTE),
  },
  {
    id: "bubo-combo",
    name: "Combo Bubo Health Completo",
    slug: "combo-bubo-health",
    price: roundMoney(4 * BUBO_U),
    compareAtPrice: roundMoney(4 * BUBO_U * STRIKE_RATIO_COMBO_4),
    image: "/products/bubo-combo.png",
    images: [
      "/products/bubo-combo.png",
      "/products/bubo-sleep.jpg",
      "/products/bubo-energy.jpg",
      "/products/bubo-slim.jpg",
      "/products/bubo-hair.png"
    ],
    category: "combos",
    description: "Transforme sua rotina com o combo completo Bubo Health. Inclui 1 Bubo Sleep + 1 Bubo Energy + 1 Bubo Slim + 1 Bubo Hair.",
    descriptionHtml: `
      <div class="space-y-6">
        <div class="bg-indigo-900 text-white p-6 rounded-2xl shadow-xl">
          <h3 class="text-xl font-bold mb-2">💎 Experiência Bubo 360° Total</h3>
          <p class="text-indigo-100 text-sm">O cuidado máximo que seu corpo merece. Durma melhor, tenha energia, controle o peso e cuide da beleza de cabelos e unhas.</p>
        </div>
        <div class="grid grid-cols-1 gap-3">
          <div class="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-200">
            <span class="w-8 h-8 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center font-bold">1</span>
            <span class="text-sm font-medium">Bubo Sleep: Noites revigorantes</span>
          </div>
          <div class="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-200">
            <span class="w-8 h-8 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center font-bold">2</span>
            <span class="text-sm font-medium">Bubo Energy: Alta performance</span>
          </div>
          <div class="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-200">
            <span class="w-8 h-8 rounded-full bg-green-100 text-green-600 flex items-center justify-center font-bold">3</span>
            <span class="text-sm font-medium">Bubo Slim: Corpo em equilíbrio</span>
          </div>
          <div class="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-200">
            <span class="w-8 h-8 rounded-full bg-pink-100 text-pink-600 flex items-center justify-center font-bold">4</span>
            <span class="text-sm font-medium">Bubo Hair: Cabelos e unhas fortes</span>
          </div>
        </div>
      </div>
    `,
    stock: 100,
    badge: "OFERTA COMPLETA",
    bundles: buildComboBuboHealthBundles(BUBO_U, roundMoney(4 * BUBO_U * STRIKE_RATIO_COMBO_4)),
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
