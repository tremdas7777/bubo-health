// Translates bundle labels and badges that come from the database in pt-BR
// into the active UI language. Pure pattern-matching — no network calls.

import type { TFunction } from "i18next";

/**
 * Translate bundle labels like "1 unidade", "2 unidades", "Kit com 3", "Leve 3".
 * Falls back to original string when no pattern matches.
 */
export function translateBundleLabel(label: string, t: TFunction): string {
  if (!label) return label;
  const trimmed = label.trim();

  // "N unidade(s)" / "N unit(s)"
  const unitMatch = trimmed.match(/^(\d+)\s*(unidades?|units?|unidad(?:es)?|unité?s?)\b/i);
  if (unitMatch) {
    const n = Number(unitMatch[1]);
    return t("bundle.units", { count: n, defaultValue: `${n} ${n === 1 ? "unit" : "units"}` });
  }

  // "Compre N leve M" / "Buy N get M"
  const buyGetMatch = trimmed.match(/(?:compre|buy|compra|achetez)\s*(\d+)\s*(?:leve|get|lleva|emporte|levá)\s*(\d+)/i);
  if (buyGetMatch) {
    return t("bundle.buyGet", {
      buy: buyGetMatch[1], get: buyGetMatch[2],
      defaultValue: `Buy ${buyGetMatch[1]}, Get ${buyGetMatch[2]}`,
    });
  }

  // "Kit com N" / "Kit of N"
  const kitMatch = trimmed.match(/^kit\s*(?:com|of|de|avec)\s*(\d+)/i);
  if (kitMatch) {
    return t("bundle.kitOf", { count: Number(kitMatch[1]), defaultValue: `Kit of ${kitMatch[1]}` });
  }

  // Already english-friendly tokens
  return trimmed;
}

/**
 * Translate bundle badges like "Economize 50%", "Mais Vendido", "Melhor Oferta".
 */
export function translateBundleBadge(badge: string, t: TFunction): string {
  if (!badge) return badge;
  const trimmed = badge.trim();

  // "Economize X%" / "Save X%" / "Ahorra X%"
  const saveMatch = trimmed.match(/^(?:economize|save|ahorra|économisez|économise)\s*(\d+)\s*%/i);
  if (saveMatch) {
    return t("bundle.savePercent", { percent: saveMatch[1], defaultValue: `Save ${saveMatch[1]}%` });
  }

  const lower = trimmed.toLowerCase();
  if (/(mais vendido|best ?seller|más vendido|meilleure vente)/.test(lower)) {
    return t("bundle.bestSeller", { defaultValue: "Best Seller" });
  }
  if (/(melhor oferta|best deal|mejor oferta|meilleure offre)/.test(lower)) {
    return t("bundle.bestDeal", { defaultValue: "Best Deal" });
  }
  if (/(mais popular|most popular|más popular|plus populaire)/.test(lower)) {
    return t("bundle.mostPopular", { defaultValue: "Most Popular" });
  }
  if (/(grátis|free|gratis|gratuit)/.test(lower)) {
    return t("bundle.free", { defaultValue: "Free" });
  }
  if (/(oferta|offer|oferta|offre)/.test(lower)) {
    return t("bundle.offer", { defaultValue: "Special Offer" });
  }

  return trimmed;
}
