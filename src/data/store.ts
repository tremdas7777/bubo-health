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
    description:
      "Gummy para apoio ao sono e relaxamento noturno. Fórmula com melatonina, L-teanina e extratos botânicos — 1 gummy por dia.",
    descriptionHtml: `
      <div class="space-y-6">
        <div class="rounded-2xl border border-neutral-200 bg-white p-5">
          <p class="text-[11px] font-semibold uppercase tracking-[0.25em] text-emerald-700/90 mb-2">Suplemento alimentar em gummy</p>
          <h3 class="text-xl md:text-2xl font-semibold tracking-tight text-neutral-950">Menos fome. Mais controle.</h3>
          <p class="text-sm text-neutral-600 mt-2">Um gummy por dia, com fórmula moderna e linguagem limpa. Apoio ao controle de apetite dentro de uma rotina consistente.</p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div class="rounded-2xl border border-neutral-200 bg-white p-4">
            <p class="text-sm font-semibold text-neutral-900">Controle de apetite</p>
            <p class="text-sm text-neutral-600 mt-1">Fibras e composição pensadas para apoiar saciedade ao longo do dia.</p>
          </div>
          <div class="rounded-2xl border border-neutral-200 bg-white p-4">
            <p class="text-sm font-semibold text-neutral-900">Rotina simples</p>
            <p class="text-sm text-neutral-600 mt-1">Uso direto: 1 gummy ao dia. Sem complicação, sem exageros.</p>
          </div>
        </div>

        <div class="rounded-2xl border border-neutral-200 overflow-hidden bg-[#fafbf9]">
          <div class="px-4 py-3 bg-white border-b border-neutral-200">
            <h3 class="text-base font-bold text-neutral-900">INFORMAÇÃO NUTRICIONAL</h3>
            <p class="text-sm text-neutral-500">Porção: 4 g (1 gummy)</p>
          </div>
          <table class="w-full text-sm">
            <tbody class="divide-y divide-neutral-200/90">
              <tr>
                <td class="px-4 py-3 text-neutral-700 font-medium">Valor energético</td>
                <td class="px-4 py-3 text-neutral-600 text-right tabular-nums">10 kcal (1% VD)</td>
              </tr>
              <tr>
                <td class="px-4 py-3 text-neutral-700 font-medium">Carboidratos</td>
                <td class="px-4 py-3 text-neutral-600 text-right tabular-nums">2,5 g (1% VD)</td>
              </tr>
              <tr>
                <td class="px-4 py-3 text-neutral-700 font-medium">Açúcares totais</td>
                <td class="px-4 py-3 text-neutral-600 text-right tabular-nums">0 g (0% VD)</td>
              </tr>
              <tr>
                <td class="px-4 py-3 text-neutral-700 font-medium">Açúcares adicionados</td>
                <td class="px-4 py-3 text-neutral-600 text-right tabular-nums">0 g (0% VD)</td>
              </tr>
              <tr>
                <td class="px-4 py-3 text-neutral-700 font-medium">Polióis</td>
                <td class="px-4 py-3 text-neutral-600 text-right tabular-nums">1,5 g</td>
              </tr>
              <tr>
                <td class="px-4 py-3 text-neutral-700 font-medium">Fibras alimentares</td>
                <td class="px-4 py-3 text-neutral-600 text-right tabular-nums">0,5 g (2% VD)</td>
              </tr>
              <tr>
                <td class="px-4 py-3 text-neutral-700 font-medium">Proteínas</td>
                <td class="px-4 py-3 text-neutral-600 text-right tabular-nums">0 g (0% VD)</td>
              </tr>
              <tr>
                <td class="px-4 py-3 text-neutral-700 font-medium">Gorduras totais</td>
                <td class="px-4 py-3 text-neutral-600 text-right tabular-nums">0 g (0% VD)</td>
              </tr>
              <tr>
                <td class="px-4 py-3 text-neutral-700 font-medium">Gorduras saturadas</td>
                <td class="px-4 py-3 text-neutral-600 text-right tabular-nums">0 g (0% VD)</td>
              </tr>
              <tr>
                <td class="px-4 py-3 text-neutral-700 font-medium">Gorduras trans</td>
                <td class="px-4 py-3 text-neutral-600 text-right tabular-nums">0 g (0% VD)</td>
              </tr>
              <tr>
                <td class="px-4 py-3 text-neutral-700 font-medium">Sódio</td>
                <td class="px-4 py-3 text-neutral-600 text-right tabular-nums">5 mg (0% VD)</td>
              </tr>
              <tr>
                <td class="px-4 py-3 text-neutral-700 font-medium">Melatonina</td>
                <td class="px-4 py-3 text-neutral-600 text-right tabular-nums">0,21 mg</td>
              </tr>
              <tr>
                <td class="px-4 py-3 text-neutral-700 font-medium">Vitamina B6</td>
                <td class="px-4 py-3 text-neutral-600 text-right tabular-nums">1,3 mg (100% VD)</td>
              </tr>
            </tbody>
          </table>
          <div class="px-4 py-3 border-t border-neutral-200 text-xs text-neutral-500 leading-relaxed">
            *%VD com base em uma dieta de 2.000 kcal.
          </div>
        </div>

        <div class="rounded-2xl border border-neutral-200 overflow-hidden bg-[#fafbf9]">
          <div class="px-4 py-3 bg-white border-b border-neutral-200">
            <h3 class="text-base font-bold text-neutral-900">COMPOSIÇÃO</h3>
            <p class="text-sm text-neutral-500">Por porção de 4 g (1 gummy)</p>
          </div>
          <table class="w-full text-sm">
            <tbody class="divide-y divide-neutral-200/90">
              <tr>
                <td class="px-4 py-3 text-neutral-700 font-medium">Melatonina</td>
                <td class="px-4 py-3 text-neutral-600 text-right tabular-nums">0,21 mg</td>
              </tr>
              <tr>
                <td class="px-4 py-3 text-neutral-700 font-medium">L-Teanina</td>
                <td class="px-4 py-3 text-neutral-600 text-right tabular-nums">200 mg</td>
              </tr>
              <tr>
                <td class="px-4 py-3 text-neutral-700 font-medium">Extrato de camomila</td>
                <td class="px-4 py-3 text-neutral-600 text-right tabular-nums">150 mg</td>
              </tr>
              <tr>
                <td class="px-4 py-3 text-neutral-700 font-medium">Extrato de passiflora</td>
                <td class="px-4 py-3 text-neutral-600 text-right tabular-nums">100 mg</td>
              </tr>
              <tr>
                <td class="px-4 py-3 text-neutral-700 font-medium">Vitamina B6</td>
                <td class="px-4 py-3 text-neutral-600 text-right tabular-nums">1,3 mg</td>
              </tr>
            </tbody>
          </table>
          <div class="px-4 py-3 border-t border-neutral-200 text-xs text-neutral-500 leading-relaxed">
            <strong>Excipientes:</strong> eritritol, pectina, aroma natural, ácido cítrico, edulcorante stevia, corante natural.
          </div>
        </div>

        <p class="text-gray-600"><strong>Bubo Sleep</strong> foi pensado para sua rotina noturna: linguagem simples, fórmula objetiva e uso prático. Um gummy por dia, antes de dormir, para apoiar o relaxamento e a qualidade do sono dentro de uma rotina consistente.</p>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div class="bg-purple-50 p-4 rounded-xl border border-purple-100">
            <h4 class="font-bold text-purple-900 mb-1">💤 Sono Profundo</h4>
            <p class="text-sm text-purple-700">Suporte ao descanso noturno com uma composição pensada para o fim do dia.</p>
          </div>
          <div class="bg-purple-50 p-4 rounded-xl border border-purple-100">
            <h4 class="font-bold text-purple-900 mb-1">🌿 Relaxamento Natural</h4>
            <p class="text-sm text-purple-700">Extratos botânicos + L-teanina para um ritual mais leve antes de deitar.</p>
          </div>
        </div>
        <ul class="space-y-2 text-sm text-gray-600">
          <li>✨ Zero açúcar e sem glúten</li>
          <li>✨ Sabor uva</li>
          <li>✨ 30 gummies por pote (30 dias)</li>
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
    description:
      "Gummy de energia e foco para o dia a dia. Cafeína natural + taurina + vitaminas do complexo B — 1 gummy por dia.",
    descriptionHtml: `
      <div class="space-y-6">
        <div class="rounded-2xl border border-neutral-200 overflow-hidden bg-[#fafbf9]">
          <div class="px-4 py-3 bg-white border-b border-neutral-200">
            <h3 class="text-base font-bold text-neutral-900">INFORMAÇÃO NUTRICIONAL</h3>
            <p class="text-sm text-neutral-500">Porção: 4 g (1 gummy)</p>
          </div>
          <table class="w-full text-sm">
            <tbody class="divide-y divide-neutral-200/90">
              <tr>
                <td class="px-4 py-3 text-neutral-700 font-medium">Valor energético</td>
                <td class="px-4 py-3 text-neutral-600 text-right tabular-nums">12 kcal (1% VD)</td>
              </tr>
              <tr>
                <td class="px-4 py-3 text-neutral-700 font-medium">Carboidratos</td>
                <td class="px-4 py-3 text-neutral-600 text-right tabular-nums">3 g (1% VD)</td>
              </tr>
              <tr>
                <td class="px-4 py-3 text-neutral-700 font-medium">Açúcares totais</td>
                <td class="px-4 py-3 text-neutral-600 text-right tabular-nums">0 g (0% VD)</td>
              </tr>
              <tr>
                <td class="px-4 py-3 text-neutral-700 font-medium">Açúcares adicionados</td>
                <td class="px-4 py-3 text-neutral-600 text-right tabular-nums">0 g (0% VD)</td>
              </tr>
              <tr>
                <td class="px-4 py-3 text-neutral-700 font-medium">Polióis</td>
                <td class="px-4 py-3 text-neutral-600 text-right tabular-nums">2 g</td>
              </tr>
              <tr>
                <td class="px-4 py-3 text-neutral-700 font-medium">Fibras alimentares</td>
                <td class="px-4 py-3 text-neutral-600 text-right tabular-nums">0,5 g (2% VD)</td>
              </tr>
              <tr>
                <td class="px-4 py-3 text-neutral-700 font-medium">Proteínas</td>
                <td class="px-4 py-3 text-neutral-600 text-right tabular-nums">0 g (0% VD)</td>
              </tr>
              <tr>
                <td class="px-4 py-3 text-neutral-700 font-medium">Gorduras totais</td>
                <td class="px-4 py-3 text-neutral-600 text-right tabular-nums">0 g (0% VD)</td>
              </tr>
              <tr>
                <td class="px-4 py-3 text-neutral-700 font-medium">Gorduras saturadas</td>
                <td class="px-4 py-3 text-neutral-600 text-right tabular-nums">0 g (0% VD)</td>
              </tr>
              <tr>
                <td class="px-4 py-3 text-neutral-700 font-medium">Gorduras trans</td>
                <td class="px-4 py-3 text-neutral-600 text-right tabular-nums">0 g (0% VD)</td>
              </tr>
              <tr>
                <td class="px-4 py-3 text-neutral-700 font-medium">Sódio</td>
                <td class="px-4 py-3 text-neutral-600 text-right tabular-nums">5 mg (0% VD)</td>
              </tr>
              <tr>
                <td class="px-4 py-3 text-neutral-700 font-medium">Cafeína</td>
                <td class="px-4 py-3 text-neutral-600 text-right tabular-nums">100 mg</td>
              </tr>
              <tr>
                <td class="px-4 py-3 text-neutral-700 font-medium">Vitamina B6</td>
                <td class="px-4 py-3 text-neutral-600 text-right tabular-nums">1,3 mg (100% VD)</td>
              </tr>
              <tr>
                <td class="px-4 py-3 text-neutral-700 font-medium">Vitamina B12</td>
                <td class="px-4 py-3 text-neutral-600 text-right tabular-nums">2,4 mcg (100% VD)</td>
              </tr>
            </tbody>
          </table>
          <div class="px-4 py-3 border-t border-neutral-200 text-xs text-neutral-500 leading-relaxed">
            *%VD com base em uma dieta de 2.000 kcal.
          </div>
        </div>

        <div class="rounded-2xl border border-neutral-200 overflow-hidden bg-[#fafbf9]">
          <div class="px-4 py-3 bg-white border-b border-neutral-200">
            <h3 class="text-base font-bold text-neutral-900">COMPOSIÇÃO</h3>
            <p class="text-sm text-neutral-500">Por porção de 4 g (1 gummy)</p>
          </div>
          <table class="w-full text-sm">
            <tbody class="divide-y divide-neutral-200/90">
              <tr>
                <td class="px-4 py-3 text-neutral-700 font-medium">Cafeína natural</td>
                <td class="px-4 py-3 text-neutral-600 text-right tabular-nums">100 mg</td>
              </tr>
              <tr>
                <td class="px-4 py-3 text-neutral-700 font-medium">Taurina</td>
                <td class="px-4 py-3 text-neutral-600 text-right tabular-nums">500 mg</td>
              </tr>
              <tr>
                <td class="px-4 py-3 text-neutral-700 font-medium">L-Tirosina</td>
                <td class="px-4 py-3 text-neutral-600 text-right tabular-nums">200 mg</td>
              </tr>
              <tr>
                <td class="px-4 py-3 text-neutral-700 font-medium">Extrato de guaraná</td>
                <td class="px-4 py-3 text-neutral-600 text-right tabular-nums">150 mg</td>
              </tr>
              <tr>
                <td class="px-4 py-3 text-neutral-700 font-medium">Vitamina B6</td>
                <td class="px-4 py-3 text-neutral-600 text-right tabular-nums">1,3 mg</td>
              </tr>
              <tr>
                <td class="px-4 py-3 text-neutral-700 font-medium">Vitamina B12</td>
                <td class="px-4 py-3 text-neutral-600 text-right tabular-nums">2,4 mcg</td>
              </tr>
            </tbody>
          </table>
          <div class="px-4 py-3 border-t border-neutral-200 text-xs text-neutral-500 leading-relaxed">
            <strong>Excipientes:</strong> eritritol, pectina, aroma natural, ácido cítrico, edulcorante stevia, corante natural.
          </div>
        </div>

        <p class="text-gray-600"><strong>Bubo Energy</strong> é feito para rotina — trabalho, treino e dias longos. Fórmula objetiva com cafeína natural, taurina e vitaminas do complexo B para apoiar energia e foco quando você precisa.</p>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div class="bg-amber-50 p-4 rounded-xl border border-amber-100">
            <h4 class="font-bold text-amber-900 mb-1">⚡ Energia Instantânea</h4>
            <p class="text-sm text-amber-700">Apoio à disposição ao longo do dia, com uso simples e consistente.</p>
          </div>
          <div class="bg-amber-50 p-4 rounded-xl border border-amber-100">
            <h4 class="font-bold text-amber-900 mb-1">🧠 Foco Mental</h4>
            <p class="text-sm text-amber-700">Para momentos de demanda: estudar, trabalhar ou treinar com mais presença.</p>
          </div>
        </div>
        <ul class="space-y-2 text-sm text-gray-600">
          <li>🔥 Zero açúcar e sem glúten</li>
          <li>🔥 30 gummies por pote (30 dias)</li>
          <li>🔥 Sabor laranja</li>
          <li>🔥 Ideal para treinos e dias intensos</li>
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
    description:
      "Gummy de beleza diária para suporte de cabelos e unhas. Biotina + zinco + vitaminas + colágeno — 1 gummy por dia.",
    descriptionHtml: `
      <div class="space-y-6">
        <div class="rounded-2xl border border-neutral-200 overflow-hidden bg-[#fafbf9]">
          <div class="px-4 py-3 bg-white border-b border-neutral-200">
            <h3 class="text-base font-bold text-neutral-900">INFORMAÇÃO NUTRICIONAL</h3>
            <p class="text-sm text-neutral-500">Porção: 4 g (1 gummy)</p>
          </div>
          <table class="w-full text-sm">
            <tbody class="divide-y divide-neutral-200/90">
              <tr>
                <td class="px-4 py-3 text-neutral-700 font-medium">Valor energético</td>
                <td class="px-4 py-3 text-neutral-600 text-right tabular-nums">12 kcal (1% VD)</td>
              </tr>
              <tr>
                <td class="px-4 py-3 text-neutral-700 font-medium">Carboidratos</td>
                <td class="px-4 py-3 text-neutral-600 text-right tabular-nums">3 g (1% VD)</td>
              </tr>
              <tr>
                <td class="px-4 py-3 text-neutral-700 font-medium">Açúcares totais</td>
                <td class="px-4 py-3 text-neutral-600 text-right tabular-nums">0 g (0% VD)</td>
              </tr>
              <tr>
                <td class="px-4 py-3 text-neutral-700 font-medium">Açúcares adicionados</td>
                <td class="px-4 py-3 text-neutral-600 text-right tabular-nums">0 g (0% VD)</td>
              </tr>
              <tr>
                <td class="px-4 py-3 text-neutral-700 font-medium">Polióis</td>
                <td class="px-4 py-3 text-neutral-600 text-right tabular-nums">2 g</td>
              </tr>
              <tr>
                <td class="px-4 py-3 text-neutral-700 font-medium">Fibras alimentares</td>
                <td class="px-4 py-3 text-neutral-600 text-right tabular-nums">0,5 g (2% VD)</td>
              </tr>
              <tr>
                <td class="px-4 py-3 text-neutral-700 font-medium">Proteínas</td>
                <td class="px-4 py-3 text-neutral-600 text-right tabular-nums">0 g (0% VD)</td>
              </tr>
              <tr>
                <td class="px-4 py-3 text-neutral-700 font-medium">Gorduras totais</td>
                <td class="px-4 py-3 text-neutral-600 text-right tabular-nums">0 g (0% VD)</td>
              </tr>
              <tr>
                <td class="px-4 py-3 text-neutral-700 font-medium">Gorduras saturadas</td>
                <td class="px-4 py-3 text-neutral-600 text-right tabular-nums">0 g (0% VD)</td>
              </tr>
              <tr>
                <td class="px-4 py-3 text-neutral-700 font-medium">Gorduras trans</td>
                <td class="px-4 py-3 text-neutral-600 text-right tabular-nums">0 g (0% VD)</td>
              </tr>
              <tr>
                <td class="px-4 py-3 text-neutral-700 font-medium">Sódio</td>
                <td class="px-4 py-3 text-neutral-600 text-right tabular-nums">5 mg (0% VD)</td>
              </tr>
              <tr>
                <td class="px-4 py-3 text-neutral-700 font-medium">Biotina</td>
                <td class="px-4 py-3 text-neutral-600 text-right tabular-nums">30 mcg (100% VD)</td>
              </tr>
              <tr>
                <td class="px-4 py-3 text-neutral-700 font-medium">Zinco</td>
                <td class="px-4 py-3 text-neutral-600 text-right tabular-nums">7 mg (100% VD)</td>
              </tr>
              <tr>
                <td class="px-4 py-3 text-neutral-700 font-medium">Vitamina C</td>
                <td class="px-4 py-3 text-neutral-600 text-right tabular-nums">45 mg (100% VD)</td>
              </tr>
              <tr>
                <td class="px-4 py-3 text-neutral-700 font-medium">Vitamina E</td>
                <td class="px-4 py-3 text-neutral-600 text-right tabular-nums">10 mg (100% VD)</td>
              </tr>
            </tbody>
          </table>
          <div class="px-4 py-3 border-t border-neutral-200 text-xs text-neutral-500 leading-relaxed">
            *%VD com base em uma dieta de 2.000 kcal.
          </div>
        </div>

        <div class="rounded-2xl border border-neutral-200 overflow-hidden bg-[#fafbf9]">
          <div class="px-4 py-3 bg-white border-b border-neutral-200">
            <h3 class="text-base font-bold text-neutral-900">COMPOSIÇÃO</h3>
            <p class="text-sm text-neutral-500">Por porção de 4 g (1 gummy)</p>
          </div>
          <table class="w-full text-sm">
            <tbody class="divide-y divide-neutral-200/90">
              <tr>
                <td class="px-4 py-3 text-neutral-700 font-medium">Biotina</td>
                <td class="px-4 py-3 text-neutral-600 text-right tabular-nums">30 mcg</td>
              </tr>
              <tr>
                <td class="px-4 py-3 text-neutral-700 font-medium">Zinco</td>
                <td class="px-4 py-3 text-neutral-600 text-right tabular-nums">7 mg</td>
              </tr>
              <tr>
                <td class="px-4 py-3 text-neutral-700 font-medium">Vitamina C</td>
                <td class="px-4 py-3 text-neutral-600 text-right tabular-nums">45 mg</td>
              </tr>
              <tr>
                <td class="px-4 py-3 text-neutral-700 font-medium">Vitamina E</td>
                <td class="px-4 py-3 text-neutral-600 text-right tabular-nums">10 mg</td>
              </tr>
              <tr>
                <td class="px-4 py-3 text-neutral-700 font-medium">Colágeno hidrolisado</td>
                <td class="px-4 py-3 text-neutral-600 text-right tabular-nums">500 mg</td>
              </tr>
              <tr>
                <td class="px-4 py-3 text-neutral-700 font-medium">Ácido hialurônico</td>
                <td class="px-4 py-3 text-neutral-600 text-right tabular-nums">50 mg</td>
              </tr>
            </tbody>
          </table>
          <div class="px-4 py-3 border-t border-neutral-200 text-xs text-neutral-500 leading-relaxed">
            <strong>Excipientes:</strong> eritritol, pectina, aroma natural, ácido cítrico, edulcorante stevia, corante natural.
          </div>
        </div>

        <p class="text-gray-600"><strong>Bubo Hair</strong> foi feito para constância. Uma fórmula completa com biotina, zinco, vitaminas antioxidantes, colágeno e ácido hialurônico — em um gummy prático para o dia a dia.</p>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div class="bg-pink-50 p-4 rounded-xl border border-pink-100">
            <h4 class="font-bold text-pink-900 mb-1">💇‍♀️ Cabelos Fortes</h4>
            <p class="text-sm text-pink-700">Suporte nutricional para sua rotina de cuidados com fios.</p>
          </div>
          <div class="bg-pink-50 p-4 rounded-xl border border-pink-100">
            <h4 class="font-bold text-pink-900 mb-1">💅 Unhas de Aço</h4>
            <p class="text-sm text-pink-700">Apoio ao fortalecimento e aparência das unhas com uso contínuo.</p>
          </div>
        </div>
        <ul class="space-y-2 text-sm text-gray-600">
          <li>💖 Zero açúcar e sem glúten</li>
          <li>💖 30 gummies por pote (30 dias)</li>
          <li>💖 Biotina + zinco + vitaminas C e E</li>
          <li>💖 Sabor frutas vermelhas</li>
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
    description:
      "Gummy para apoio ao controle de apetite. Fibras + extratos botânicos + cromo — uso simples: 1 gummy por dia.",
    descriptionHtml: `
      <div class="space-y-6">
        <div class="rounded-2xl border border-neutral-200 overflow-hidden bg-[#fafbf9]">
          <div class="px-4 py-3 bg-white border-b border-neutral-200">
            <h3 class="text-base font-bold text-neutral-900">INFORMAÇÃO NUTRICIONAL</h3>
            <p class="text-sm text-neutral-500">Porção: 4 g (1 gummy)</p>
          </div>
          <table class="w-full text-sm">
            <tbody class="divide-y divide-neutral-200/90">
              <tr>
                <td class="px-4 py-3 text-neutral-700 font-medium">Valor energético</td>
                <td class="px-4 py-3 text-neutral-600 text-right tabular-nums">10 kcal (1% VD)</td>
              </tr>
              <tr>
                <td class="px-4 py-3 text-neutral-700 font-medium">Carboidratos</td>
                <td class="px-4 py-3 text-neutral-600 text-right tabular-nums">2,5 g (1% VD)</td>
              </tr>
              <tr>
                <td class="px-4 py-3 text-neutral-700 font-medium">Açúcares totais</td>
                <td class="px-4 py-3 text-neutral-600 text-right tabular-nums">0 g (0% VD)</td>
              </tr>
              <tr>
                <td class="px-4 py-3 text-neutral-700 font-medium">Açúcares adicionados</td>
                <td class="px-4 py-3 text-neutral-600 text-right tabular-nums">0 g (0% VD)</td>
              </tr>
              <tr>
                <td class="px-4 py-3 text-neutral-700 font-medium">Polióis</td>
                <td class="px-4 py-3 text-neutral-600 text-right tabular-nums">1,5 g</td>
              </tr>
              <tr>
                <td class="px-4 py-3 text-neutral-700 font-medium">Fibras alimentares</td>
                <td class="px-4 py-3 text-neutral-600 text-right tabular-nums">1 g (4% VD)</td>
              </tr>
              <tr>
                <td class="px-4 py-3 text-neutral-700 font-medium">Proteínas</td>
                <td class="px-4 py-3 text-neutral-600 text-right tabular-nums">0 g (0% VD)</td>
              </tr>
              <tr>
                <td class="px-4 py-3 text-neutral-700 font-medium">Gorduras totais</td>
                <td class="px-4 py-3 text-neutral-600 text-right tabular-nums">0 g (0% VD)</td>
              </tr>
              <tr>
                <td class="px-4 py-3 text-neutral-700 font-medium">Gorduras saturadas</td>
                <td class="px-4 py-3 text-neutral-600 text-right tabular-nums">0 g (0% VD)</td>
              </tr>
              <tr>
                <td class="px-4 py-3 text-neutral-700 font-medium">Gorduras trans</td>
                <td class="px-4 py-3 text-neutral-600 text-right tabular-nums">0 g (0% VD)</td>
              </tr>
              <tr>
                <td class="px-4 py-3 text-neutral-700 font-medium">Sódio</td>
                <td class="px-4 py-3 text-neutral-600 text-right tabular-nums">5 mg (0% VD)</td>
              </tr>
              <tr>
                <td class="px-4 py-3 text-neutral-700 font-medium">Cafeína</td>
                <td class="px-4 py-3 text-neutral-600 text-right tabular-nums">80 mg</td>
              </tr>
              <tr>
                <td class="px-4 py-3 text-neutral-700 font-medium">Cromo</td>
                <td class="px-4 py-3 text-neutral-600 text-right tabular-nums">200 mcg (571% VD)</td>
              </tr>
            </tbody>
          </table>
          <div class="px-4 py-3 border-t border-neutral-200 text-xs text-neutral-500 leading-relaxed">
            *%VD com base em uma dieta de 2.000 kcal.
          </div>
        </div>

        <div class="rounded-2xl border border-neutral-200 overflow-hidden bg-[#fafbf9]">
          <div class="px-4 py-3 bg-white border-b border-neutral-200">
            <h3 class="text-base font-bold text-neutral-900">COMPOSIÇÃO</h3>
            <p class="text-sm text-neutral-500">Por porção de 4 g (1 gummy)</p>
          </div>
          <table class="w-full text-sm">
            <tbody class="divide-y divide-neutral-200/90">
              <tr>
                <td class="px-4 py-3 text-neutral-700 font-medium">Glucomanano</td>
                <td class="px-4 py-3 text-neutral-600 text-right tabular-nums">800 mg</td>
              </tr>
              <tr>
                <td class="px-4 py-3 text-neutral-700 font-medium">Extrato de chá verde</td>
                <td class="px-4 py-3 text-neutral-600 text-right tabular-nums">250 mg</td>
              </tr>
              <tr>
                <td class="px-4 py-3 text-neutral-700 font-medium">Vinagre de maçã em pó</td>
                <td class="px-4 py-3 text-neutral-600 text-right tabular-nums">300 mg</td>
              </tr>
              <tr>
                <td class="px-4 py-3 text-neutral-700 font-medium">Ashwagandha (extrato)</td>
                <td class="px-4 py-3 text-neutral-600 text-right tabular-nums">150 mg</td>
              </tr>
              <tr>
                <td class="px-4 py-3 text-neutral-700 font-medium">Cafeína natural</td>
                <td class="px-4 py-3 text-neutral-600 text-right tabular-nums">80 mg</td>
              </tr>
              <tr>
                <td class="px-4 py-3 text-neutral-700 font-medium">Picolinato de cromo</td>
                <td class="px-4 py-3 text-neutral-600 text-right tabular-nums">200 mcg</td>
              </tr>
            </tbody>
          </table>
          <div class="px-4 py-3 border-t border-neutral-200 text-xs text-neutral-500 leading-relaxed">
            <strong>Excipientes:</strong> eritritol, pectina, aroma natural, ácido cítrico, edulcorante stevia, corante natural.
          </div>
        </div>

        <div class="rounded-2xl border border-neutral-200 bg-white p-4">
          <h3 class="text-base font-bold text-neutral-900">Como funciona</h3>
          <ul class="mt-2 space-y-2 text-sm text-neutral-600">
            <li><strong class="text-neutral-900">Fibras:</strong> aumentam a sensação de saciedade.</li>
            <li><strong class="text-neutral-900">Cafeína e chá verde:</strong> auxiliam o metabolismo de forma complementar à rotina.</li>
            <li><strong class="text-neutral-900">Cromo:</strong> contribui para o controle da compulsão alimentar quando combinado com hábitos saudáveis.</li>
          </ul>
        </div>

        <div class="rounded-2xl border border-neutral-200 bg-white p-4">
          <h3 class="text-base font-bold text-neutral-900">Como usar</h3>
          <p class="text-sm text-neutral-600 mt-1">Consumir <strong>1 gummy ao dia</strong>. Melhor resultado vem de consistência — dentro de uma rotina com alimentação equilibrada e hábitos saudáveis.</p>
        </div>

        <div class="rounded-2xl border border-neutral-200 bg-white p-4">
          <h3 class="text-base font-bold text-neutral-900">Avisos</h3>
          <ul class="mt-2 space-y-1.5 text-sm text-neutral-600">
            <li>Não contém glúten.</li>
            <li>Contém polióis — o consumo excessivo pode causar efeito laxativo.</li>
            <li>Contém cafeína.</li>
            <li>Este produto não é um medicamento.</li>
            <li>Não exceder a recomendação diária.</li>
            <li>Manter fora do alcance de crianças.</li>
          </ul>
        </div>
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
      "Monte seu combo com 3 potes à escolha (Sleep, Energy, Slim ou Hair). Ideal para manter consistência e economizar no kit.",
    descriptionHtml: `
      <div class="space-y-6">
        <p class="text-gray-600">O <strong>Combo 3 Unidades</strong> é a forma mais simples de montar sua rotina: escolha três potes entre Sleep, Energy, Slim e Hair e leve o kit com melhor custo por unidade.</p>
        <ul class="space-y-2 text-sm text-gray-600">
          <li>✨ Você escolhe os 3 potes (pode repetir sabores)</li>
          <li>✨ Frete calculado no checkout</li>
          <li>✨ 30 gummies por pote (90 gummies no total)</li>
        </ul>

        <div class="rounded-2xl border border-neutral-200 bg-white p-4">
          <h3 class="text-base font-bold text-neutral-900">Informação nutricional e composição</h3>
          <p class="text-sm text-neutral-600 mt-1">Abaixo estão os dados por porção (4 g – 1 gummy) dos gummies que podem compor seu combo.</p>
        </div>

        <div class="space-y-4">
          <h4 class="text-base font-semibold text-neutral-900">Bubo Sleep</h4>
          <div class="rounded-2xl border border-neutral-200 overflow-hidden bg-[#fafbf9]">
            <div class="px-4 py-3 bg-white border-b border-neutral-200">
              <h3 class="text-base font-bold text-neutral-900">INFORMAÇÃO NUTRICIONAL</h3>
              <p class="text-sm text-neutral-500">Porção: 4 g (1 gummy)</p>
            </div>
            <table class="w-full text-sm">
              <tbody class="divide-y divide-neutral-200/90">
                <tr><td class="px-4 py-3 text-neutral-700 font-medium">Valor energético</td><td class="px-4 py-3 text-neutral-600 text-right tabular-nums">10 kcal (1% VD)</td></tr>
                <tr><td class="px-4 py-3 text-neutral-700 font-medium">Carboidratos</td><td class="px-4 py-3 text-neutral-600 text-right tabular-nums">2,5 g (1% VD)</td></tr>
                <tr><td class="px-4 py-3 text-neutral-700 font-medium">Açúcares totais</td><td class="px-4 py-3 text-neutral-600 text-right tabular-nums">0 g (0% VD)</td></tr>
                <tr><td class="px-4 py-3 text-neutral-700 font-medium">Açúcares adicionados</td><td class="px-4 py-3 text-neutral-600 text-right tabular-nums">0 g (0% VD)</td></tr>
                <tr><td class="px-4 py-3 text-neutral-700 font-medium">Polióis</td><td class="px-4 py-3 text-neutral-600 text-right tabular-nums">1,5 g</td></tr>
                <tr><td class="px-4 py-3 text-neutral-700 font-medium">Fibras alimentares</td><td class="px-4 py-3 text-neutral-600 text-right tabular-nums">0,5 g (2% VD)</td></tr>
                <tr><td class="px-4 py-3 text-neutral-700 font-medium">Proteínas</td><td class="px-4 py-3 text-neutral-600 text-right tabular-nums">0 g (0% VD)</td></tr>
                <tr><td class="px-4 py-3 text-neutral-700 font-medium">Gorduras totais</td><td class="px-4 py-3 text-neutral-600 text-right tabular-nums">0 g (0% VD)</td></tr>
                <tr><td class="px-4 py-3 text-neutral-700 font-medium">Gorduras saturadas</td><td class="px-4 py-3 text-neutral-600 text-right tabular-nums">0 g (0% VD)</td></tr>
                <tr><td class="px-4 py-3 text-neutral-700 font-medium">Gorduras trans</td><td class="px-4 py-3 text-neutral-600 text-right tabular-nums">0 g (0% VD)</td></tr>
                <tr><td class="px-4 py-3 text-neutral-700 font-medium">Sódio</td><td class="px-4 py-3 text-neutral-600 text-right tabular-nums">5 mg (0% VD)</td></tr>
                <tr><td class="px-4 py-3 text-neutral-700 font-medium">Melatonina</td><td class="px-4 py-3 text-neutral-600 text-right tabular-nums">0,21 mg</td></tr>
                <tr><td class="px-4 py-3 text-neutral-700 font-medium">Vitamina B6</td><td class="px-4 py-3 text-neutral-600 text-right tabular-nums">1,3 mg (100% VD)</td></tr>
              </tbody>
            </table>
            <div class="px-4 py-3 border-t border-neutral-200 text-xs text-neutral-500 leading-relaxed">*%VD com base em uma dieta de 2.000 kcal.</div>
          </div>
          <div class="rounded-2xl border border-neutral-200 overflow-hidden bg-[#fafbf9]">
            <div class="px-4 py-3 bg-white border-b border-neutral-200">
              <h3 class="text-base font-bold text-neutral-900">COMPOSIÇÃO</h3>
              <p class="text-sm text-neutral-500">Por porção de 4 g (1 gummy)</p>
            </div>
            <table class="w-full text-sm">
              <tbody class="divide-y divide-neutral-200/90">
                <tr><td class="px-4 py-3 text-neutral-700 font-medium">Melatonina</td><td class="px-4 py-3 text-neutral-600 text-right tabular-nums">0,21 mg</td></tr>
                <tr><td class="px-4 py-3 text-neutral-700 font-medium">L-Teanina</td><td class="px-4 py-3 text-neutral-600 text-right tabular-nums">200 mg</td></tr>
                <tr><td class="px-4 py-3 text-neutral-700 font-medium">Extrato de camomila</td><td class="px-4 py-3 text-neutral-600 text-right tabular-nums">150 mg</td></tr>
                <tr><td class="px-4 py-3 text-neutral-700 font-medium">Extrato de passiflora</td><td class="px-4 py-3 text-neutral-600 text-right tabular-nums">100 mg</td></tr>
                <tr><td class="px-4 py-3 text-neutral-700 font-medium">Vitamina B6</td><td class="px-4 py-3 text-neutral-600 text-right tabular-nums">1,3 mg</td></tr>
              </tbody>
            </table>
            <div class="px-4 py-3 border-t border-neutral-200 text-xs text-neutral-500 leading-relaxed"><strong>Excipientes:</strong> eritritol, pectina, aroma natural, ácido cítrico, edulcorante stevia, corante natural.</div>
          </div>
        </div>

        <div class="space-y-4">
          <h4 class="text-base font-semibold text-neutral-900">Bubo Energy</h4>
          <div class="rounded-2xl border border-neutral-200 overflow-hidden bg-[#fafbf9]">
            <div class="px-4 py-3 bg-white border-b border-neutral-200">
              <h3 class="text-base font-bold text-neutral-900">INFORMAÇÃO NUTRICIONAL</h3>
              <p class="text-sm text-neutral-500">Porção: 4 g (1 gummy)</p>
            </div>
            <table class="w-full text-sm">
              <tbody class="divide-y divide-neutral-200/90">
                <tr><td class="px-4 py-3 text-neutral-700 font-medium">Valor energético</td><td class="px-4 py-3 text-neutral-600 text-right tabular-nums">12 kcal (1% VD)</td></tr>
                <tr><td class="px-4 py-3 text-neutral-700 font-medium">Carboidratos</td><td class="px-4 py-3 text-neutral-600 text-right tabular-nums">3 g (1% VD)</td></tr>
                <tr><td class="px-4 py-3 text-neutral-700 font-medium">Açúcares totais</td><td class="px-4 py-3 text-neutral-600 text-right tabular-nums">0 g (0% VD)</td></tr>
                <tr><td class="px-4 py-3 text-neutral-700 font-medium">Açúcares adicionados</td><td class="px-4 py-3 text-neutral-600 text-right tabular-nums">0 g (0% VD)</td></tr>
                <tr><td class="px-4 py-3 text-neutral-700 font-medium">Polióis</td><td class="px-4 py-3 text-neutral-600 text-right tabular-nums">2 g</td></tr>
                <tr><td class="px-4 py-3 text-neutral-700 font-medium">Fibras alimentares</td><td class="px-4 py-3 text-neutral-600 text-right tabular-nums">0,5 g (2% VD)</td></tr>
                <tr><td class="px-4 py-3 text-neutral-700 font-medium">Proteínas</td><td class="px-4 py-3 text-neutral-600 text-right tabular-nums">0 g (0% VD)</td></tr>
                <tr><td class="px-4 py-3 text-neutral-700 font-medium">Gorduras totais</td><td class="px-4 py-3 text-neutral-600 text-right tabular-nums">0 g (0% VD)</td></tr>
                <tr><td class="px-4 py-3 text-neutral-700 font-medium">Gorduras saturadas</td><td class="px-4 py-3 text-neutral-600 text-right tabular-nums">0 g (0% VD)</td></tr>
                <tr><td class="px-4 py-3 text-neutral-700 font-medium">Gorduras trans</td><td class="px-4 py-3 text-neutral-600 text-right tabular-nums">0 g (0% VD)</td></tr>
                <tr><td class="px-4 py-3 text-neutral-700 font-medium">Sódio</td><td class="px-4 py-3 text-neutral-600 text-right tabular-nums">5 mg (0% VD)</td></tr>
                <tr><td class="px-4 py-3 text-neutral-700 font-medium">Cafeína</td><td class="px-4 py-3 text-neutral-600 text-right tabular-nums">100 mg</td></tr>
                <tr><td class="px-4 py-3 text-neutral-700 font-medium">Vitamina B6</td><td class="px-4 py-3 text-neutral-600 text-right tabular-nums">1,3 mg (100% VD)</td></tr>
                <tr><td class="px-4 py-3 text-neutral-700 font-medium">Vitamina B12</td><td class="px-4 py-3 text-neutral-600 text-right tabular-nums">2,4 mcg (100% VD)</td></tr>
              </tbody>
            </table>
            <div class="px-4 py-3 border-t border-neutral-200 text-xs text-neutral-500 leading-relaxed">*%VD com base em uma dieta de 2.000 kcal.</div>
          </div>
          <div class="rounded-2xl border border-neutral-200 overflow-hidden bg-[#fafbf9]">
            <div class="px-4 py-3 bg-white border-b border-neutral-200">
              <h3 class="text-base font-bold text-neutral-900">COMPOSIÇÃO</h3>
              <p class="text-sm text-neutral-500">Por porção de 4 g (1 gummy)</p>
            </div>
            <table class="w-full text-sm">
              <tbody class="divide-y divide-neutral-200/90">
                <tr><td class="px-4 py-3 text-neutral-700 font-medium">Cafeína natural</td><td class="px-4 py-3 text-neutral-600 text-right tabular-nums">100 mg</td></tr>
                <tr><td class="px-4 py-3 text-neutral-700 font-medium">Taurina</td><td class="px-4 py-3 text-neutral-600 text-right tabular-nums">500 mg</td></tr>
                <tr><td class="px-4 py-3 text-neutral-700 font-medium">L-Tirosina</td><td class="px-4 py-3 text-neutral-600 text-right tabular-nums">200 mg</td></tr>
                <tr><td class="px-4 py-3 text-neutral-700 font-medium">Extrato de guaraná</td><td class="px-4 py-3 text-neutral-600 text-right tabular-nums">150 mg</td></tr>
                <tr><td class="px-4 py-3 text-neutral-700 font-medium">Vitamina B6</td><td class="px-4 py-3 text-neutral-600 text-right tabular-nums">1,3 mg</td></tr>
                <tr><td class="px-4 py-3 text-neutral-700 font-medium">Vitamina B12</td><td class="px-4 py-3 text-neutral-600 text-right tabular-nums">2,4 mcg</td></tr>
              </tbody>
            </table>
            <div class="px-4 py-3 border-t border-neutral-200 text-xs text-neutral-500 leading-relaxed"><strong>Excipientes:</strong> eritritol, pectina, aroma natural, ácido cítrico, edulcorante stevia, corante natural.</div>
          </div>
        </div>

        <div class="space-y-4">
          <h4 class="text-base font-semibold text-neutral-900">Bubo Slim</h4>
          <div class="rounded-2xl border border-neutral-200 overflow-hidden bg-[#fafbf9]">
            <div class="px-4 py-3 bg-white border-b border-neutral-200">
              <h3 class="text-base font-bold text-neutral-900">INFORMAÇÃO NUTRICIONAL</h3>
              <p class="text-sm text-neutral-500">Porção: 4 g (1 gummy)</p>
            </div>
            <table class="w-full text-sm">
              <tbody class="divide-y divide-neutral-200/90">
                <tr><td class="px-4 py-3 text-neutral-700 font-medium">Valor energético</td><td class="px-4 py-3 text-neutral-600 text-right tabular-nums">10 kcal (1% VD)</td></tr>
                <tr><td class="px-4 py-3 text-neutral-700 font-medium">Carboidratos</td><td class="px-4 py-3 text-neutral-600 text-right tabular-nums">2,5 g (1% VD)</td></tr>
                <tr><td class="px-4 py-3 text-neutral-700 font-medium">Açúcares totais</td><td class="px-4 py-3 text-neutral-600 text-right tabular-nums">0 g (0% VD)</td></tr>
                <tr><td class="px-4 py-3 text-neutral-700 font-medium">Açúcares adicionados</td><td class="px-4 py-3 text-neutral-600 text-right tabular-nums">0 g (0% VD)</td></tr>
                <tr><td class="px-4 py-3 text-neutral-700 font-medium">Polióis</td><td class="px-4 py-3 text-neutral-600 text-right tabular-nums">1,5 g</td></tr>
                <tr><td class="px-4 py-3 text-neutral-700 font-medium">Fibras alimentares</td><td class="px-4 py-3 text-neutral-600 text-right tabular-nums">1 g (4% VD)</td></tr>
                <tr><td class="px-4 py-3 text-neutral-700 font-medium">Proteínas</td><td class="px-4 py-3 text-neutral-600 text-right tabular-nums">0 g (0% VD)</td></tr>
                <tr><td class="px-4 py-3 text-neutral-700 font-medium">Gorduras totais</td><td class="px-4 py-3 text-neutral-600 text-right tabular-nums">0 g (0% VD)</td></tr>
                <tr><td class="px-4 py-3 text-neutral-700 font-medium">Gorduras saturadas</td><td class="px-4 py-3 text-neutral-600 text-right tabular-nums">0 g (0% VD)</td></tr>
                <tr><td class="px-4 py-3 text-neutral-700 font-medium">Gorduras trans</td><td class="px-4 py-3 text-neutral-600 text-right tabular-nums">0 g (0% VD)</td></tr>
                <tr><td class="px-4 py-3 text-neutral-700 font-medium">Sódio</td><td class="px-4 py-3 text-neutral-600 text-right tabular-nums">5 mg (0% VD)</td></tr>
                <tr><td class="px-4 py-3 text-neutral-700 font-medium">Cafeína</td><td class="px-4 py-3 text-neutral-600 text-right tabular-nums">80 mg</td></tr>
                <tr><td class="px-4 py-3 text-neutral-700 font-medium">Cromo</td><td class="px-4 py-3 text-neutral-600 text-right tabular-nums">200 mcg (571% VD)</td></tr>
              </tbody>
            </table>
            <div class="px-4 py-3 border-t border-neutral-200 text-xs text-neutral-500 leading-relaxed">*%VD com base em uma dieta de 2.000 kcal.</div>
          </div>
          <div class="rounded-2xl border border-neutral-200 overflow-hidden bg-[#fafbf9]">
            <div class="px-4 py-3 bg-white border-b border-neutral-200">
              <h3 class="text-base font-bold text-neutral-900">COMPOSIÇÃO</h3>
              <p class="text-sm text-neutral-500">Por porção de 4 g (1 gummy)</p>
            </div>
            <table class="w-full text-sm">
              <tbody class="divide-y divide-neutral-200/90">
                <tr><td class="px-4 py-3 text-neutral-700 font-medium">Glucomanano</td><td class="px-4 py-3 text-neutral-600 text-right tabular-nums">800 mg</td></tr>
                <tr><td class="px-4 py-3 text-neutral-700 font-medium">Extrato de chá verde</td><td class="px-4 py-3 text-neutral-600 text-right tabular-nums">250 mg</td></tr>
                <tr><td class="px-4 py-3 text-neutral-700 font-medium">Vinagre de maçã em pó</td><td class="px-4 py-3 text-neutral-600 text-right tabular-nums">300 mg</td></tr>
                <tr><td class="px-4 py-3 text-neutral-700 font-medium">Ashwagandha (extrato)</td><td class="px-4 py-3 text-neutral-600 text-right tabular-nums">150 mg</td></tr>
                <tr><td class="px-4 py-3 text-neutral-700 font-medium">Cafeína natural</td><td class="px-4 py-3 text-neutral-600 text-right tabular-nums">80 mg</td></tr>
                <tr><td class="px-4 py-3 text-neutral-700 font-medium">Picolinato de cromo</td><td class="px-4 py-3 text-neutral-600 text-right tabular-nums">200 mcg</td></tr>
              </tbody>
            </table>
            <div class="px-4 py-3 border-t border-neutral-200 text-xs text-neutral-500 leading-relaxed"><strong>Excipientes:</strong> eritritol, pectina, aroma natural, ácido cítrico, edulcorante stevia, corante natural.</div>
          </div>
        </div>

        <div class="space-y-4">
          <h4 class="text-base font-semibold text-neutral-900">Bubo Hair</h4>
          <div class="rounded-2xl border border-neutral-200 overflow-hidden bg-[#fafbf9]">
            <div class="px-4 py-3 bg-white border-b border-neutral-200">
              <h3 class="text-base font-bold text-neutral-900">INFORMAÇÃO NUTRICIONAL</h3>
              <p class="text-sm text-neutral-500">Porção: 4 g (1 gummy)</p>
            </div>
            <table class="w-full text-sm">
              <tbody class="divide-y divide-neutral-200/90">
                <tr><td class="px-4 py-3 text-neutral-700 font-medium">Valor energético</td><td class="px-4 py-3 text-neutral-600 text-right tabular-nums">12 kcal (1% VD)</td></tr>
                <tr><td class="px-4 py-3 text-neutral-700 font-medium">Carboidratos</td><td class="px-4 py-3 text-neutral-600 text-right tabular-nums">3 g (1% VD)</td></tr>
                <tr><td class="px-4 py-3 text-neutral-700 font-medium">Açúcares totais</td><td class="px-4 py-3 text-neutral-600 text-right tabular-nums">0 g (0% VD)</td></tr>
                <tr><td class="px-4 py-3 text-neutral-700 font-medium">Açúcares adicionados</td><td class="px-4 py-3 text-neutral-600 text-right tabular-nums">0 g (0% VD)</td></tr>
                <tr><td class="px-4 py-3 text-neutral-700 font-medium">Polióis</td><td class="px-4 py-3 text-neutral-600 text-right tabular-nums">2 g</td></tr>
                <tr><td class="px-4 py-3 text-neutral-700 font-medium">Fibras alimentares</td><td class="px-4 py-3 text-neutral-600 text-right tabular-nums">0,5 g (2% VD)</td></tr>
                <tr><td class="px-4 py-3 text-neutral-700 font-medium">Proteínas</td><td class="px-4 py-3 text-neutral-600 text-right tabular-nums">0 g (0% VD)</td></tr>
                <tr><td class="px-4 py-3 text-neutral-700 font-medium">Gorduras totais</td><td class="px-4 py-3 text-neutral-600 text-right tabular-nums">0 g (0% VD)</td></tr>
                <tr><td class="px-4 py-3 text-neutral-700 font-medium">Gorduras saturadas</td><td class="px-4 py-3 text-neutral-600 text-right tabular-nums">0 g (0% VD)</td></tr>
                <tr><td class="px-4 py-3 text-neutral-700 font-medium">Gorduras trans</td><td class="px-4 py-3 text-neutral-600 text-right tabular-nums">0 g (0% VD)</td></tr>
                <tr><td class="px-4 py-3 text-neutral-700 font-medium">Sódio</td><td class="px-4 py-3 text-neutral-600 text-right tabular-nums">5 mg (0% VD)</td></tr>
                <tr><td class="px-4 py-3 text-neutral-700 font-medium">Biotina</td><td class="px-4 py-3 text-neutral-600 text-right tabular-nums">30 mcg (100% VD)</td></tr>
                <tr><td class="px-4 py-3 text-neutral-700 font-medium">Zinco</td><td class="px-4 py-3 text-neutral-600 text-right tabular-nums">7 mg (100% VD)</td></tr>
                <tr><td class="px-4 py-3 text-neutral-700 font-medium">Vitamina C</td><td class="px-4 py-3 text-neutral-600 text-right tabular-nums">45 mg (100% VD)</td></tr>
                <tr><td class="px-4 py-3 text-neutral-700 font-medium">Vitamina E</td><td class="px-4 py-3 text-neutral-600 text-right tabular-nums">10 mg (100% VD)</td></tr>
              </tbody>
            </table>
            <div class="px-4 py-3 border-t border-neutral-200 text-xs text-neutral-500 leading-relaxed">*%VD com base em uma dieta de 2.000 kcal.</div>
          </div>
          <div class="rounded-2xl border border-neutral-200 overflow-hidden bg-[#fafbf9]">
            <div class="px-4 py-3 bg-white border-b border-neutral-200">
              <h3 class="text-base font-bold text-neutral-900">COMPOSIÇÃO</h3>
              <p class="text-sm text-neutral-500">Por porção de 4 g (1 gummy)</p>
            </div>
            <table class="w-full text-sm">
              <tbody class="divide-y divide-neutral-200/90">
                <tr><td class="px-4 py-3 text-neutral-700 font-medium">Biotina</td><td class="px-4 py-3 text-neutral-600 text-right tabular-nums">30 mcg</td></tr>
                <tr><td class="px-4 py-3 text-neutral-700 font-medium">Zinco</td><td class="px-4 py-3 text-neutral-600 text-right tabular-nums">7 mg</td></tr>
                <tr><td class="px-4 py-3 text-neutral-700 font-medium">Vitamina C</td><td class="px-4 py-3 text-neutral-600 text-right tabular-nums">45 mg</td></tr>
                <tr><td class="px-4 py-3 text-neutral-700 font-medium">Vitamina E</td><td class="px-4 py-3 text-neutral-600 text-right tabular-nums">10 mg</td></tr>
                <tr><td class="px-4 py-3 text-neutral-700 font-medium">Colágeno hidrolisado</td><td class="px-4 py-3 text-neutral-600 text-right tabular-nums">500 mg</td></tr>
                <tr><td class="px-4 py-3 text-neutral-700 font-medium">Ácido hialurônico</td><td class="px-4 py-3 text-neutral-600 text-right tabular-nums">50 mg</td></tr>
              </tbody>
            </table>
            <div class="px-4 py-3 border-t border-neutral-200 text-xs text-neutral-500 leading-relaxed"><strong>Excipientes:</strong> eritritol, pectina, aroma natural, ácido cítrico, edulcorante stevia, corante natural.</div>
          </div>
        </div>
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
    description:
      "Kit completo com 4 potes (Sleep + Energy + Slim + Hair). Uma rotina diária completa — sono, energia, controle de apetite e beleza.",
    descriptionHtml: `
      <div class="space-y-6">
        <div class="bg-indigo-900 text-white p-6 rounded-2xl shadow-xl">
          <h3 class="text-xl font-bold mb-2">💎 Experiência Bubo 360° Total</h3>
          <p class="text-indigo-100 text-sm">Um pote de cada: Sleep, Energy, Slim e Hair. Quatro fórmulas, uma rotina — com linguagem limpa, uso prático e foco em consistência.</p>
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

        <div class="rounded-2xl border border-neutral-200 bg-white p-4">
          <h3 class="text-base font-bold text-neutral-900">Informação nutricional e composição</h3>
          <p class="text-sm text-neutral-600 mt-1">Dados por porção (4 g – 1 gummy) de cada gummy incluído no combo.</p>
        </div>

        <div class="space-y-6">
          <h4 class="text-base font-semibold text-neutral-900">Bubo Sleep</h4>
          <div class="rounded-2xl border border-neutral-200 overflow-hidden bg-[#fafbf9]">
            <div class="px-4 py-3 bg-white border-b border-neutral-200">
              <h3 class="text-base font-bold text-neutral-900">INFORMAÇÃO NUTRICIONAL</h3>
              <p class="text-sm text-neutral-500">Porção: 4 g (1 gummy)</p>
            </div>
            <table class="w-full text-sm">
              <tbody class="divide-y divide-neutral-200/90">
                <tr><td class="px-4 py-3 text-neutral-700 font-medium">Valor energético</td><td class="px-4 py-3 text-neutral-600 text-right tabular-nums">10 kcal (1% VD)</td></tr>
                <tr><td class="px-4 py-3 text-neutral-700 font-medium">Carboidratos</td><td class="px-4 py-3 text-neutral-600 text-right tabular-nums">2,5 g (1% VD)</td></tr>
                <tr><td class="px-4 py-3 text-neutral-700 font-medium">Açúcares totais</td><td class="px-4 py-3 text-neutral-600 text-right tabular-nums">0 g (0% VD)</td></tr>
                <tr><td class="px-4 py-3 text-neutral-700 font-medium">Açúcares adicionados</td><td class="px-4 py-3 text-neutral-600 text-right tabular-nums">0 g (0% VD)</td></tr>
                <tr><td class="px-4 py-3 text-neutral-700 font-medium">Polióis</td><td class="px-4 py-3 text-neutral-600 text-right tabular-nums">1,5 g</td></tr>
                <tr><td class="px-4 py-3 text-neutral-700 font-medium">Fibras alimentares</td><td class="px-4 py-3 text-neutral-600 text-right tabular-nums">0,5 g (2% VD)</td></tr>
                <tr><td class="px-4 py-3 text-neutral-700 font-medium">Proteínas</td><td class="px-4 py-3 text-neutral-600 text-right tabular-nums">0 g (0% VD)</td></tr>
                <tr><td class="px-4 py-3 text-neutral-700 font-medium">Gorduras totais</td><td class="px-4 py-3 text-neutral-600 text-right tabular-nums">0 g (0% VD)</td></tr>
                <tr><td class="px-4 py-3 text-neutral-700 font-medium">Gorduras saturadas</td><td class="px-4 py-3 text-neutral-600 text-right tabular-nums">0 g (0% VD)</td></tr>
                <tr><td class="px-4 py-3 text-neutral-700 font-medium">Gorduras trans</td><td class="px-4 py-3 text-neutral-600 text-right tabular-nums">0 g (0% VD)</td></tr>
                <tr><td class="px-4 py-3 text-neutral-700 font-medium">Sódio</td><td class="px-4 py-3 text-neutral-600 text-right tabular-nums">5 mg (0% VD)</td></tr>
                <tr><td class="px-4 py-3 text-neutral-700 font-medium">Melatonina</td><td class="px-4 py-3 text-neutral-600 text-right tabular-nums">0,21 mg</td></tr>
                <tr><td class="px-4 py-3 text-neutral-700 font-medium">Vitamina B6</td><td class="px-4 py-3 text-neutral-600 text-right tabular-nums">1,3 mg (100% VD)</td></tr>
              </tbody>
            </table>
            <div class="px-4 py-3 border-t border-neutral-200 text-xs text-neutral-500 leading-relaxed">*%VD com base em uma dieta de 2.000 kcal.</div>
          </div>
          <div class="rounded-2xl border border-neutral-200 overflow-hidden bg-[#fafbf9]">
            <div class="px-4 py-3 bg-white border-b border-neutral-200">
              <h3 class="text-base font-bold text-neutral-900">COMPOSIÇÃO</h3>
              <p class="text-sm text-neutral-500">Por porção de 4 g (1 gummy)</p>
            </div>
            <table class="w-full text-sm">
              <tbody class="divide-y divide-neutral-200/90">
                <tr><td class="px-4 py-3 text-neutral-700 font-medium">Melatonina</td><td class="px-4 py-3 text-neutral-600 text-right tabular-nums">0,21 mg</td></tr>
                <tr><td class="px-4 py-3 text-neutral-700 font-medium">L-Teanina</td><td class="px-4 py-3 text-neutral-600 text-right tabular-nums">200 mg</td></tr>
                <tr><td class="px-4 py-3 text-neutral-700 font-medium">Extrato de camomila</td><td class="px-4 py-3 text-neutral-600 text-right tabular-nums">150 mg</td></tr>
                <tr><td class="px-4 py-3 text-neutral-700 font-medium">Extrato de passiflora</td><td class="px-4 py-3 text-neutral-600 text-right tabular-nums">100 mg</td></tr>
                <tr><td class="px-4 py-3 text-neutral-700 font-medium">Vitamina B6</td><td class="px-4 py-3 text-neutral-600 text-right tabular-nums">1,3 mg</td></tr>
              </tbody>
            </table>
            <div class="px-4 py-3 border-t border-neutral-200 text-xs text-neutral-500 leading-relaxed"><strong>Excipientes:</strong> eritritol, pectina, aroma natural, ácido cítrico, edulcorante stevia, corante natural.</div>
          </div>

          <h4 class="text-base font-semibold text-neutral-900 pt-2">Bubo Energy</h4>
          <div class="rounded-2xl border border-neutral-200 overflow-hidden bg-[#fafbf9]">
            <div class="px-4 py-3 bg-white border-b border-neutral-200">
              <h3 class="text-base font-bold text-neutral-900">INFORMAÇÃO NUTRICIONAL</h3>
              <p class="text-sm text-neutral-500">Porção: 4 g (1 gummy)</p>
            </div>
            <table class="w-full text-sm">
              <tbody class="divide-y divide-neutral-200/90">
                <tr><td class="px-4 py-3 text-neutral-700 font-medium">Valor energético</td><td class="px-4 py-3 text-neutral-600 text-right tabular-nums">12 kcal (1% VD)</td></tr>
                <tr><td class="px-4 py-3 text-neutral-700 font-medium">Carboidratos</td><td class="px-4 py-3 text-neutral-600 text-right tabular-nums">3 g (1% VD)</td></tr>
                <tr><td class="px-4 py-3 text-neutral-700 font-medium">Açúcares totais</td><td class="px-4 py-3 text-neutral-600 text-right tabular-nums">0 g (0% VD)</td></tr>
                <tr><td class="px-4 py-3 text-neutral-700 font-medium">Açúcares adicionados</td><td class="px-4 py-3 text-neutral-600 text-right tabular-nums">0 g (0% VD)</td></tr>
                <tr><td class="px-4 py-3 text-neutral-700 font-medium">Polióis</td><td class="px-4 py-3 text-neutral-600 text-right tabular-nums">2 g</td></tr>
                <tr><td class="px-4 py-3 text-neutral-700 font-medium">Fibras alimentares</td><td class="px-4 py-3 text-neutral-600 text-right tabular-nums">0,5 g (2% VD)</td></tr>
                <tr><td class="px-4 py-3 text-neutral-700 font-medium">Proteínas</td><td class="px-4 py-3 text-neutral-600 text-right tabular-nums">0 g (0% VD)</td></tr>
                <tr><td class="px-4 py-3 text-neutral-700 font-medium">Gorduras totais</td><td class="px-4 py-3 text-neutral-600 text-right tabular-nums">0 g (0% VD)</td></tr>
                <tr><td class="px-4 py-3 text-neutral-700 font-medium">Gorduras saturadas</td><td class="px-4 py-3 text-neutral-600 text-right tabular-nums">0 g (0% VD)</td></tr>
                <tr><td class="px-4 py-3 text-neutral-700 font-medium">Gorduras trans</td><td class="px-4 py-3 text-neutral-600 text-right tabular-nums">0 g (0% VD)</td></tr>
                <tr><td class="px-4 py-3 text-neutral-700 font-medium">Sódio</td><td class="px-4 py-3 text-neutral-600 text-right tabular-nums">5 mg (0% VD)</td></tr>
                <tr><td class="px-4 py-3 text-neutral-700 font-medium">Cafeína</td><td class="px-4 py-3 text-neutral-600 text-right tabular-nums">100 mg</td></tr>
                <tr><td class="px-4 py-3 text-neutral-700 font-medium">Vitamina B6</td><td class="px-4 py-3 text-neutral-600 text-right tabular-nums">1,3 mg (100% VD)</td></tr>
                <tr><td class="px-4 py-3 text-neutral-700 font-medium">Vitamina B12</td><td class="px-4 py-3 text-neutral-600 text-right tabular-nums">2,4 mcg (100% VD)</td></tr>
              </tbody>
            </table>
            <div class="px-4 py-3 border-t border-neutral-200 text-xs text-neutral-500 leading-relaxed">*%VD com base em uma dieta de 2.000 kcal.</div>
          </div>
          <div class="rounded-2xl border border-neutral-200 overflow-hidden bg-[#fafbf9]">
            <div class="px-4 py-3 bg-white border-b border-neutral-200">
              <h3 class="text-base font-bold text-neutral-900">COMPOSIÇÃO</h3>
              <p class="text-sm text-neutral-500">Por porção de 4 g (1 gummy)</p>
            </div>
            <table class="w-full text-sm">
              <tbody class="divide-y divide-neutral-200/90">
                <tr><td class="px-4 py-3 text-neutral-700 font-medium">Cafeína natural</td><td class="px-4 py-3 text-neutral-600 text-right tabular-nums">100 mg</td></tr>
                <tr><td class="px-4 py-3 text-neutral-700 font-medium">Taurina</td><td class="px-4 py-3 text-neutral-600 text-right tabular-nums">500 mg</td></tr>
                <tr><td class="px-4 py-3 text-neutral-700 font-medium">L-Tirosina</td><td class="px-4 py-3 text-neutral-600 text-right tabular-nums">200 mg</td></tr>
                <tr><td class="px-4 py-3 text-neutral-700 font-medium">Extrato de guaraná</td><td class="px-4 py-3 text-neutral-600 text-right tabular-nums">150 mg</td></tr>
                <tr><td class="px-4 py-3 text-neutral-700 font-medium">Vitamina B6</td><td class="px-4 py-3 text-neutral-600 text-right tabular-nums">1,3 mg</td></tr>
                <tr><td class="px-4 py-3 text-neutral-700 font-medium">Vitamina B12</td><td class="px-4 py-3 text-neutral-600 text-right tabular-nums">2,4 mcg</td></tr>
              </tbody>
            </table>
            <div class="px-4 py-3 border-t border-neutral-200 text-xs text-neutral-500 leading-relaxed"><strong>Excipientes:</strong> eritritol, pectina, aroma natural, ácido cítrico, edulcorante stevia, corante natural.</div>
          </div>

          <h4 class="text-base font-semibold text-neutral-900 pt-2">Bubo Slim</h4>
          <div class="rounded-2xl border border-neutral-200 overflow-hidden bg-[#fafbf9]">
            <div class="px-4 py-3 bg-white border-b border-neutral-200">
              <h3 class="text-base font-bold text-neutral-900">INFORMAÇÃO NUTRICIONAL</h3>
              <p class="text-sm text-neutral-500">Porção: 4 g (1 gummy)</p>
            </div>
            <table class="w-full text-sm">
              <tbody class="divide-y divide-neutral-200/90">
                <tr><td class="px-4 py-3 text-neutral-700 font-medium">Valor energético</td><td class="px-4 py-3 text-neutral-600 text-right tabular-nums">10 kcal (1% VD)</td></tr>
                <tr><td class="px-4 py-3 text-neutral-700 font-medium">Carboidratos</td><td class="px-4 py-3 text-neutral-600 text-right tabular-nums">2,5 g (1% VD)</td></tr>
                <tr><td class="px-4 py-3 text-neutral-700 font-medium">Açúcares totais</td><td class="px-4 py-3 text-neutral-600 text-right tabular-nums">0 g (0% VD)</td></tr>
                <tr><td class="px-4 py-3 text-neutral-700 font-medium">Açúcares adicionados</td><td class="px-4 py-3 text-neutral-600 text-right tabular-nums">0 g (0% VD)</td></tr>
                <tr><td class="px-4 py-3 text-neutral-700 font-medium">Polióis</td><td class="px-4 py-3 text-neutral-600 text-right tabular-nums">1,5 g</td></tr>
                <tr><td class="px-4 py-3 text-neutral-700 font-medium">Fibras alimentares</td><td class="px-4 py-3 text-neutral-600 text-right tabular-nums">1 g (4% VD)</td></tr>
                <tr><td class="px-4 py-3 text-neutral-700 font-medium">Proteínas</td><td class="px-4 py-3 text-neutral-600 text-right tabular-nums">0 g (0% VD)</td></tr>
                <tr><td class="px-4 py-3 text-neutral-700 font-medium">Gorduras totais</td><td class="px-4 py-3 text-neutral-600 text-right tabular-nums">0 g (0% VD)</td></tr>
                <tr><td class="px-4 py-3 text-neutral-700 font-medium">Gorduras saturadas</td><td class="px-4 py-3 text-neutral-600 text-right tabular-nums">0 g (0% VD)</td></tr>
                <tr><td class="px-4 py-3 text-neutral-700 font-medium">Gorduras trans</td><td class="px-4 py-3 text-neutral-600 text-right tabular-nums">0 g (0% VD)</td></tr>
                <tr><td class="px-4 py-3 text-neutral-700 font-medium">Sódio</td><td class="px-4 py-3 text-neutral-600 text-right tabular-nums">5 mg (0% VD)</td></tr>
                <tr><td class="px-4 py-3 text-neutral-700 font-medium">Cafeína</td><td class="px-4 py-3 text-neutral-600 text-right tabular-nums">80 mg</td></tr>
                <tr><td class="px-4 py-3 text-neutral-700 font-medium">Cromo</td><td class="px-4 py-3 text-neutral-600 text-right tabular-nums">200 mcg (571% VD)</td></tr>
              </tbody>
            </table>
            <div class="px-4 py-3 border-t border-neutral-200 text-xs text-neutral-500 leading-relaxed">*%VD com base em uma dieta de 2.000 kcal.</div>
          </div>
          <div class="rounded-2xl border border-neutral-200 overflow-hidden bg-[#fafbf9]">
            <div class="px-4 py-3 bg-white border-b border-neutral-200">
              <h3 class="text-base font-bold text-neutral-900">COMPOSIÇÃO</h3>
              <p class="text-sm text-neutral-500">Por porção de 4 g (1 gummy)</p>
            </div>
            <table class="w-full text-sm">
              <tbody class="divide-y divide-neutral-200/90">
                <tr><td class="px-4 py-3 text-neutral-700 font-medium">Glucomanano</td><td class="px-4 py-3 text-neutral-600 text-right tabular-nums">800 mg</td></tr>
                <tr><td class="px-4 py-3 text-neutral-700 font-medium">Extrato de chá verde</td><td class="px-4 py-3 text-neutral-600 text-right tabular-nums">250 mg</td></tr>
                <tr><td class="px-4 py-3 text-neutral-700 font-medium">Vinagre de maçã em pó</td><td class="px-4 py-3 text-neutral-600 text-right tabular-nums">300 mg</td></tr>
                <tr><td class="px-4 py-3 text-neutral-700 font-medium">Ashwagandha (extrato)</td><td class="px-4 py-3 text-neutral-600 text-right tabular-nums">150 mg</td></tr>
                <tr><td class="px-4 py-3 text-neutral-700 font-medium">Cafeína natural</td><td class="px-4 py-3 text-neutral-600 text-right tabular-nums">80 mg</td></tr>
                <tr><td class="px-4 py-3 text-neutral-700 font-medium">Picolinato de cromo</td><td class="px-4 py-3 text-neutral-600 text-right tabular-nums">200 mcg</td></tr>
              </tbody>
            </table>
            <div class="px-4 py-3 border-t border-neutral-200 text-xs text-neutral-500 leading-relaxed"><strong>Excipientes:</strong> eritritol, pectina, aroma natural, ácido cítrico, edulcorante stevia, corante natural.</div>
          </div>

          <h4 class="text-base font-semibold text-neutral-900 pt-2">Bubo Hair</h4>
          <div class="rounded-2xl border border-neutral-200 overflow-hidden bg-[#fafbf9]">
            <div class="px-4 py-3 bg-white border-b border-neutral-200">
              <h3 class="text-base font-bold text-neutral-900">INFORMAÇÃO NUTRICIONAL</h3>
              <p class="text-sm text-neutral-500">Porção: 4 g (1 gummy)</p>
            </div>
            <table class="w-full text-sm">
              <tbody class="divide-y divide-neutral-200/90">
                <tr><td class="px-4 py-3 text-neutral-700 font-medium">Valor energético</td><td class="px-4 py-3 text-neutral-600 text-right tabular-nums">12 kcal (1% VD)</td></tr>
                <tr><td class="px-4 py-3 text-neutral-700 font-medium">Carboidratos</td><td class="px-4 py-3 text-neutral-600 text-right tabular-nums">3 g (1% VD)</td></tr>
                <tr><td class="px-4 py-3 text-neutral-700 font-medium">Açúcares totais</td><td class="px-4 py-3 text-neutral-600 text-right tabular-nums">0 g (0% VD)</td></tr>
                <tr><td class="px-4 py-3 text-neutral-700 font-medium">Açúcares adicionados</td><td class="px-4 py-3 text-neutral-600 text-right tabular-nums">0 g (0% VD)</td></tr>
                <tr><td class="px-4 py-3 text-neutral-700 font-medium">Polióis</td><td class="px-4 py-3 text-neutral-600 text-right tabular-nums">2 g</td></tr>
                <tr><td class="px-4 py-3 text-neutral-700 font-medium">Fibras alimentares</td><td class="px-4 py-3 text-neutral-600 text-right tabular-nums">0,5 g (2% VD)</td></tr>
                <tr><td class="px-4 py-3 text-neutral-700 font-medium">Proteínas</td><td class="px-4 py-3 text-neutral-600 text-right tabular-nums">0 g (0% VD)</td></tr>
                <tr><td class="px-4 py-3 text-neutral-700 font-medium">Gorduras totais</td><td class="px-4 py-3 text-neutral-600 text-right tabular-nums">0 g (0% VD)</td></tr>
                <tr><td class="px-4 py-3 text-neutral-700 font-medium">Gorduras saturadas</td><td class="px-4 py-3 text-neutral-600 text-right tabular-nums">0 g (0% VD)</td></tr>
                <tr><td class="px-4 py-3 text-neutral-700 font-medium">Gorduras trans</td><td class="px-4 py-3 text-neutral-600 text-right tabular-nums">0 g (0% VD)</td></tr>
                <tr><td class="px-4 py-3 text-neutral-700 font-medium">Sódio</td><td class="px-4 py-3 text-neutral-600 text-right tabular-nums">5 mg (0% VD)</td></tr>
                <tr><td class="px-4 py-3 text-neutral-700 font-medium">Biotina</td><td class="px-4 py-3 text-neutral-600 text-right tabular-nums">30 mcg (100% VD)</td></tr>
                <tr><td class="px-4 py-3 text-neutral-700 font-medium">Zinco</td><td class="px-4 py-3 text-neutral-600 text-right tabular-nums">7 mg (100% VD)</td></tr>
                <tr><td class="px-4 py-3 text-neutral-700 font-medium">Vitamina C</td><td class="px-4 py-3 text-neutral-600 text-right tabular-nums">45 mg (100% VD)</td></tr>
                <tr><td class="px-4 py-3 text-neutral-700 font-medium">Vitamina E</td><td class="px-4 py-3 text-neutral-600 text-right tabular-nums">10 mg (100% VD)</td></tr>
              </tbody>
            </table>
            <div class="px-4 py-3 border-t border-neutral-200 text-xs text-neutral-500 leading-relaxed">*%VD com base em uma dieta de 2.000 kcal.</div>
          </div>
          <div class="rounded-2xl border border-neutral-200 overflow-hidden bg-[#fafbf9]">
            <div class="px-4 py-3 bg-white border-b border-neutral-200">
              <h3 class="text-base font-bold text-neutral-900">COMPOSIÇÃO</h3>
              <p class="text-sm text-neutral-500">Por porção de 4 g (1 gummy)</p>
            </div>
            <table class="w-full text-sm">
              <tbody class="divide-y divide-neutral-200/90">
                <tr><td class="px-4 py-3 text-neutral-700 font-medium">Biotina</td><td class="px-4 py-3 text-neutral-600 text-right tabular-nums">30 mcg</td></tr>
                <tr><td class="px-4 py-3 text-neutral-700 font-medium">Zinco</td><td class="px-4 py-3 text-neutral-600 text-right tabular-nums">7 mg</td></tr>
                <tr><td class="px-4 py-3 text-neutral-700 font-medium">Vitamina C</td><td class="px-4 py-3 text-neutral-600 text-right tabular-nums">45 mg</td></tr>
                <tr><td class="px-4 py-3 text-neutral-700 font-medium">Vitamina E</td><td class="px-4 py-3 text-neutral-600 text-right tabular-nums">10 mg</td></tr>
                <tr><td class="px-4 py-3 text-neutral-700 font-medium">Colágeno hidrolisado</td><td class="px-4 py-3 text-neutral-600 text-right tabular-nums">500 mg</td></tr>
                <tr><td class="px-4 py-3 text-neutral-700 font-medium">Ácido hialurônico</td><td class="px-4 py-3 text-neutral-600 text-right tabular-nums">50 mg</td></tr>
              </tbody>
            </table>
            <div class="px-4 py-3 border-t border-neutral-200 text-xs text-neutral-500 leading-relaxed"><strong>Excipientes:</strong> eritritol, pectina, aroma natural, ácido cítrico, edulcorante stevia, corante natural.</div>
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
