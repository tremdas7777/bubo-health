import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { supabase } from "@/integrations/supabase/client";
import i18n, { SUPPORTED_LANGUAGES, SupportedLanguage } from "@/i18n";

export type SupportedCurrency = "USD" | "EUR" | "BRL" | "GBP";

export interface StoreSettings {
  id: string;
  default_language: SupportedLanguage;
  available_languages: SupportedLanguage[];
  default_currency: SupportedCurrency;
  available_currencies: SupportedCurrency[];
  exchange_rates: Record<SupportedCurrency, number>;
  auto_detect_by_ip: boolean;
}

const DEFAULT_SETTINGS: StoreSettings = {
  id: "",
  default_language: "en",
  available_languages: ["en", "es", "pt", "fr", "de"],
  default_currency: "USD",
  available_currencies: ["USD", "EUR", "BRL", "GBP"],
  exchange_rates: { USD: 1, EUR: 0.92, BRL: 5.1, GBP: 0.79 },
  auto_detect_by_ip: false,
};

interface Ctx {
  settings: StoreSettings;
  loading: boolean;
  language: SupportedLanguage;
  currency: SupportedCurrency;
  setLanguage: (l: SupportedLanguage) => void;
  setCurrency: (c: SupportedCurrency) => void;
  /** Convert price in USD cents → display value in active currency (decimal units) */
  convert: (usdCents: number) => number;
  /** Format USD cents directly into active currency string */
  formatPrice: (usdCents: number, currencyOverride?: SupportedCurrency) => string;
  refresh: () => Promise<void>;
}

const LocalizationContext = createContext<Ctx | null>(null);

const LOCALE_BY_LANG: Record<SupportedLanguage, string> = {
  en: "en-US",
  es: "es-ES",
  pt: "pt-BR",
  fr: "fr-FR",
  de: "de-DE",
};

export function LocalizationProvider({ children }: { children: ReactNode }) {
  const { i18n: i18nInst } = useTranslation();
  const [settings, setSettings] = useState<StoreSettings>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [currency, setCurrencyState] = useState<SupportedCurrency>(() => {
    return (localStorage.getItem("kazoom_currency") as SupportedCurrency) || "USD";
  });

  const fetchSettings = useCallback(async () => {
    const { data } = await supabase.from("store_settings").select("*").maybeSingle();
    if (data) {
      const s: StoreSettings = {
        id: data.id,
        default_language: data.default_language as SupportedLanguage,
        available_languages: data.available_languages as SupportedLanguage[],
        default_currency: data.default_currency as SupportedCurrency,
        available_currencies: data.available_currencies as SupportedCurrency[],
        exchange_rates: data.exchange_rates as Record<SupportedCurrency, number>,
        auto_detect_by_ip: data.auto_detect_by_ip,
      };
      setSettings(s);

      // First-time language: if no localStorage, use default from settings
      if (!localStorage.getItem("kazoom_lang")) {
        const navLang = navigator.language.slice(0, 2) as SupportedLanguage;
        const initial = s.available_languages.includes(navLang) ? navLang : s.default_language;
        i18nInst.changeLanguage(initial);
      }
      // First-time currency
      if (!localStorage.getItem("kazoom_currency")) {
        setCurrencyState(s.default_currency);
        localStorage.setItem("kazoom_currency", s.default_currency);
      }
    }
    setLoading(false);
  }, [i18nInst]);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const setLanguage = useCallback(
    (l: SupportedLanguage) => {
      i18nInst.changeLanguage(l);
      localStorage.setItem("kazoom_lang", l);
      document.documentElement.lang = l;
    },
    [i18nInst]
  );

  const setCurrency = useCallback((c: SupportedCurrency) => {
    setCurrencyState(c);
    localStorage.setItem("kazoom_currency", c);
  }, []);

  const convert = useCallback(
    (usdCents: number) => {
      const rate = settings.exchange_rates[currency] ?? 1;
      return (usdCents / 100) * rate;
    },
    [settings.exchange_rates, currency]
  );

  const formatPrice = useCallback(
    (usdCents: number, currencyOverride?: SupportedCurrency) => {
      const cur = currencyOverride ?? currency;
      const rate = settings.exchange_rates[cur] ?? 1;
      const value = (usdCents / 100) * rate;
      const lang = (i18nInst.language as SupportedLanguage) || "en";
      const locale = LOCALE_BY_LANG[lang] ?? "en-US";
      try {
        return new Intl.NumberFormat(locale, {
          style: "currency",
          currency: cur,
          maximumFractionDigits: 2,
        }).format(value);
      } catch {
        return `${cur} ${value.toFixed(2)}`;
      }
    },
    [currency, settings.exchange_rates, i18nInst.language]
  );

  useEffect(() => {
    document.documentElement.lang = i18nInst.language;
  }, [i18nInst.language]);

  return (
    <LocalizationContext.Provider
      value={{
        settings,
        loading,
        language: (i18nInst.language as SupportedLanguage) || "en",
        currency,
        setLanguage,
        setCurrency,
        convert,
        formatPrice,
        refresh: fetchSettings,
      }}
    >
      {children}
    </LocalizationContext.Provider>
  );
}

export function useLocalization() {
  const ctx = useContext(LocalizationContext);
  if (!ctx) throw new Error("useLocalization must be used within LocalizationProvider");
  return ctx;
}

export function useCurrency() {
  const { currency, setCurrency, formatPrice, convert, settings } = useLocalization();
  return { currency, setCurrency, formatPrice, convert, available: settings.available_currencies };
}

export { SUPPORTED_LANGUAGES };
