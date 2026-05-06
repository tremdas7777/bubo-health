/** Formato igual a `ProductBundle` em `store.ts` (evita import circular). */
export interface BuboBundleRow {
  qty: number;
  label: string;
  priceCents: number;
  originalPriceCents?: number;
  perUnitCents?: number;
  badge?: string;
}

/** Slug do produto “Combo 3 unidades” — bundles só 1 combo / 2 combos derivados do preço base por pote. */
export const COMBO_3_UNIDADES_SLUG = "combo-3-potes" as const;

export const COMBO_BUBO_HEALTH_SLUG = "combo-bubo-health" as const;

export const BUBO_GUMMY_SLUGS = new Set([
  "bubo-sleep",
  "bubo-energy",
  "bubo-slim",
  "bubo-hair",
]);

/** Preço base por pote usado como referência quando não há linha no admin (R$). */
export const DEFAULT_BUBO_UNIT_PRICE = 67.9;

/** Preço do produto Combo 3 Unidades (kit fechado com 3 potes) (R$). */
export const DEFAULT_COMBO_3_KIT_PRICE = 183.33;

/** Unitário implícito usado para exibir “R$ x × 3” no combo 3. */
export const DEFAULT_COMBO_3_IMPLIED_UNIT_PRICE = roundMoney(DEFAULT_COMBO_3_KIT_PRICE / 3);

/** Desconto aplicado no kit do combo completo (4 produtos) quando não há preço no admin. */
export const DEFAULT_COMBO_4_KIT_DISCOUNT_RATE = 0.1;

/** Preço do produto Combo completo (kit fechado com 4 produtos) (R$). */
export const DEFAULT_COMBO_4_KIT_PRICE = roundMoney(4 * DEFAULT_BUBO_UNIT_PRICE * (1 - DEFAULT_COMBO_4_KIT_DISCOUNT_RATE));

/** Unitário implícito do combo completo (para referências de “por unidade”). */
export const DEFAULT_COMBO_4_IMPLIED_UNIT_PRICE = roundMoney(DEFAULT_COMBO_4_KIT_PRICE / 4);

/** Valor riscado para 1 pote (R$). */
export const STRIKE_PRICE_SINGLE_POTE = 147.9;

/** Razão “valor riscado / valor à vista” para 1 pote. */
export const STRIKE_RATIO_SINGLE_POTE = STRIKE_PRICE_SINGLE_POTE / DEFAULT_BUBO_UNIT_PRICE;

/** Valor riscado do combo completo (4 produtos) (R$). */
export const STRIKE_PRICE_COMBO_4 = 588;

/** Para o combo 4 produtos: mantém o valor riscado do storytelling do catálogo fixo. */
export const STRIKE_RATIO_COMBO_4 = STRIKE_PRICE_COMBO_4 / (4 * DEFAULT_BUBO_UNIT_PRICE);

export function roundMoney(n: number): number {
  return Math.round(n * 100) / 100;
}

function moneyLabel(n: number): string {
  return roundMoney(n).toFixed(2).replace(".", ",");
}

/** Aceita linhas antigas onde o preço era o pacote inteiro, não o pote. */
export function normalizeBuboUnitFromRow(slug: string, priceCents: number): number {
  const brl = priceCents / 100;
  // Para combos, alguns cadastros antigos salvavam o preço do kit inteiro.
  // Com o unitário atual (67,90) o kit do combo 3 pode ficar < 200, então usamos um limiar relativo.
  if (slug === COMBO_3_UNIDADES_SLUG && brl > DEFAULT_BUBO_UNIT_PRICE * 2) return roundMoney(brl / 3);
  if (slug === COMBO_BUBO_HEALTH_SLUG && brl > 300) return roundMoney(brl / 4);
  return roundMoney(brl);
}

export function isBuboUnitPricedSlug(slug: string): boolean {
  return BUBO_GUMMY_SLUGS.has(slug) || slug === COMBO_3_UNIDADES_SLUG || slug === COMBO_BUBO_HEALTH_SLUG;
}

/** Descontos sobre o total a preço de pote: 3 potes −10%, 5 potes −20%. */
export const DISCOUNT_3_POTES = 0.1;
export const DISCOUNT_5_POTES = 0.2;

/** Gummies: 1 / 3 / 5 potes — 3 e 5 com desconto percentual sobre o subtotal (n×pote). */
export function buildStandardGummyBundles(unit: number, strikeRatio: number): BuboBundleRow[] {
  const u = roundMoney(unit);
  const R = strikeRatio;
  const gross3 = roundMoney(3 * u);
  const gross5 = roundMoney(5 * u);
  const sale3 = roundMoney(gross3 * (1 - DISCOUNT_3_POTES));
  const sale5 = roundMoney(gross5 * (1 - DISCOUNT_5_POTES));
  return [
    {
      qty: 1,
      label: "1 Pote — Experimente",
      priceCents: u,
      originalPriceCents: roundMoney(u * R),
      perUnitCents: u,
      badge: "PROMOÇÃO",
    },
    {
      qty: 3,
      label: "3 Potes — 10% de desconto no total",
      priceCents: sale3,
      originalPriceCents: roundMoney(3 * u * R),
      perUnitCents: roundMoney(sale3 / 3),
      badge: "MAIS VENDIDO",
    },
    {
      qty: 5,
      label: "5 Potes — 20% de desconto no total",
      priceCents: sale5,
      originalPriceCents: roundMoney(5 * u * R),
      perUnitCents: roundMoney(sale5 / 5),
      badge: "MELHOR VALOR",
    },
  ];
}

/** Combo 3 unidades: só 1 ou 2 combos (3 ou 6 potes). */
export function buildCombo3UnidadesBundles(unit: number, strikeRatio: number): BuboBundleRow[] {
  const u = roundMoney(unit);
  const R = strikeRatio;
  return [
    {
      qty: 1,
      label: `1 Combo — 3 potes (R$ ${moneyLabel(u)} × 3)`,
      priceCents: roundMoney(3 * u),
      originalPriceCents: roundMoney(3 * u * R),
      perUnitCents: u,
      badge: "MAIS VENDIDO",
    },
    {
      qty: 2,
      label: "2 Combos — 6 potes",
      priceCents: roundMoney(6 * u),
      originalPriceCents: roundMoney(6 * u * R),
      perUnitCents: u,
      badge: "ECONOMIA",
    },
  ];
}

/** Combo completo 4 sabores: 1 ou 2 combos (8 produtos). */
export function buildComboBuboHealthBundles(unit: number, compareFullCombo: number): BuboBundleRow[] {
  const u = roundMoney(unit);
  const sale1 = roundMoney(4 * u);
  const sale2 = roundMoney(8 * u);
  const c1 = roundMoney(compareFullCombo);
  const c2 = roundMoney(compareFullCombo * 2);
  return [
    {
      qty: 1,
      label: "1 Combo (4 produtos)",
      priceCents: sale1,
      originalPriceCents: c1,
      perUnitCents: sale1,
      badge: "MELHOR VALOR",
    },
    {
      qty: 2,
      label: "2 Combos (8 produtos) 👫",
      priceCents: sale2,
      originalPriceCents: c2,
      perUnitCents: sale1,
      badge: "RECOMENDADO",
    },
  ];
}

export interface DbPriceRow {
  price_cents: number;
  original_price_cents: number | null;
}

/**
 * Mescla um produto estático do `store` com a linha do Supabase (preço base por pote).
 * Sem linha no banco, devolve o produto estático sem alteração.
 */
export function mergeCatalogProductWithDbRow<T extends { slug: string; price: number; compareAtPrice?: number; bundles?: BuboBundleRow[] }>(
  staticProduct: T,
  row: DbPriceRow | undefined,
): T {
  if (!row || !isBuboUnitPricedSlug(staticProduct.slug)) {
    if (!row) return staticProduct;
    return {
      ...staticProduct,
      price: row.price_cents / 100,
      compareAtPrice: row.original_price_cents != null ? row.original_price_cents / 100 : staticProduct.compareAtPrice,
    };
  }

  const slug = staticProduct.slug;
  const unit = normalizeBuboUnitFromRow(slug, row.price_cents);

  if (BUBO_GUMMY_SLUGS.has(slug)) {
    const R = row.original_price_cents != null ? (row.original_price_cents / 100) / unit : STRIKE_RATIO_SINGLE_POTE;
    return {
      ...staticProduct,
      price: unit,
      compareAtPrice: roundMoney(unit * R),
      bundles: buildStandardGummyBundles(unit, R),
    };
  }

  if (slug === COMBO_3_UNIDADES_SLUG) {
    // O produto "Combo 3 Unidades" tem preço próprio (kit), não necessariamente 3×unit.
    const saleMain = row?.price_cents != null ? roundMoney(3 * unit) : DEFAULT_COMBO_3_KIT_PRICE;
    const R =
      row.original_price_cents != null
        ? (row.original_price_cents / 100) / saleMain
        : STRIKE_RATIO_SINGLE_POTE;
    return {
      ...staticProduct,
      price: saleMain,
      compareAtPrice: roundMoney(saleMain * R),
      bundles: buildCombo3UnidadesBundles(row?.price_cents != null ? unit : DEFAULT_COMBO_3_IMPLIED_UNIT_PRICE, R),
    };
  }

  if (slug === COMBO_BUBO_HEALTH_SLUG) {
    // O produto "Combo completo" tem preço próprio (kit), não necessariamente 4×unit.
    const saleMain = row?.price_cents != null ? roundMoney(4 * unit) : DEFAULT_COMBO_4_KIT_PRICE;
    const compareMain =
      row.original_price_cents != null
        ? row.original_price_cents / 100
        : STRIKE_PRICE_COMBO_4;
    return {
      ...staticProduct,
      price: saleMain,
      compareAtPrice: compareMain,
      bundles: buildComboBuboHealthBundles(row?.price_cents != null ? unit : DEFAULT_COMBO_4_IMPLIED_UNIT_PRICE, compareMain),
    };
  }

  return staticProduct;
}

/** Bundles padrão do catálogo (fallback sem admin). */
export function defaultBundlesForStaticProduct(slug: string): BuboBundleRow[] | undefined {
  const u = DEFAULT_BUBO_UNIT_PRICE;
  if (BUBO_GUMMY_SLUGS.has(slug)) return buildStandardGummyBundles(u, STRIKE_RATIO_SINGLE_POTE);
  if (slug === COMBO_3_UNIDADES_SLUG) return buildCombo3UnidadesBundles(DEFAULT_COMBO_3_IMPLIED_UNIT_PRICE, STRIKE_RATIO_SINGLE_POTE);
  if (slug === COMBO_BUBO_HEALTH_SLUG) {
    const compare = STRIKE_PRICE_COMBO_4;
    return buildComboBuboHealthBundles(DEFAULT_COMBO_4_IMPLIED_UNIT_PRICE, compare);
  }
  return undefined;
}
