import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Loader2, Save, RefreshCw, Globe, DollarSign } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useLocalization, SupportedCurrency } from "@/contexts/LocalizationContext";
import { SUPPORTED_LANGUAGES, SupportedLanguage } from "@/i18n";

const ALL_LANGUAGES: { code: SupportedLanguage; name: string; flag: string }[] = [
  { code: "en", name: "English", flag: "🇺🇸" },
  { code: "es", name: "Español", flag: "🇪🇸" },
  { code: "pt", name: "Português", flag: "🇧🇷" },
  { code: "fr", name: "Français", flag: "🇫🇷" },
];

const ALL_CURRENCIES: { code: SupportedCurrency; symbol: string; name: string }[] = [
  { code: "USD", symbol: "$", name: "US Dollar" },
  { code: "EUR", symbol: "€", name: "Euro" },
  { code: "BRL", symbol: "R$", name: "Brazilian Real" },
  { code: "GBP", symbol: "£", name: "British Pound" },
];

export default function AdminLocalization() {
  const { settings, refresh } = useLocalization();
  const [defaultLanguage, setDefaultLanguage] = useState<SupportedLanguage>("en");
  const [availableLanguages, setAvailableLanguages] = useState<SupportedLanguage[]>([]);
  const [defaultCurrency, setDefaultCurrency] = useState<SupportedCurrency>("USD");
  const [availableCurrencies, setAvailableCurrencies] = useState<SupportedCurrency[]>([]);
  const [exchangeRates, setExchangeRates] = useState<Record<SupportedCurrency, number>>({
    USD: 1, EUR: 0.92, BRL: 5.1, GBP: 0.79,
  });
  const [autoDetect, setAutoDetect] = useState(false);
  const [loading, setLoading] = useState(false);
  const [refreshingRates, setRefreshingRates] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    setDefaultLanguage(settings.default_language);
    setAvailableLanguages(settings.available_languages);
    setDefaultCurrency(settings.default_currency);
    setAvailableCurrencies(settings.available_currencies);
    setExchangeRates(settings.exchange_rates);
    setAutoDetect(settings.auto_detect_by_ip);
  }, [settings]);

  const flash = (m: string) => {
    setMessage(m);
    setTimeout(() => setMessage(""), 3000);
  };

  const toggleLang = (code: SupportedLanguage) => {
    setAvailableLanguages((prev) =>
      prev.includes(code) ? prev.filter((c) => c !== code) : [...prev, code]
    );
  };

  const toggleCur = (code: SupportedCurrency) => {
    setAvailableCurrencies((prev) =>
      prev.includes(code) ? prev.filter((c) => c !== code) : [...prev, code]
    );
  };

  const save = async () => {
    setLoading(true);
    const payload = {
      default_language: defaultLanguage,
      available_languages: availableLanguages,
      default_currency: defaultCurrency,
      available_currencies: availableCurrencies,
      exchange_rates: exchangeRates,
      auto_detect_by_ip: autoDetect,
    };
    const { error } = await supabase.from("store_settings").update(payload).eq("id", settings.id);
    setLoading(false);
    if (error) {
      flash("Error: " + error.message);
    } else {
      flash("Settings saved!");
      await refresh();
    }
  };

  const refreshRates = async () => {
    setRefreshingRates(true);
    try {
      const res = await fetch("https://api.exchangerate.host/latest?base=USD");
      const data = await res.json();
      if (data?.rates) {
        const next: Record<SupportedCurrency, number> = {
          USD: 1,
          EUR: data.rates.EUR ?? exchangeRates.EUR,
          BRL: data.rates.BRL ?? exchangeRates.BRL,
          GBP: data.rates.GBP ?? exchangeRates.GBP,
        };
        setExchangeRates(next);
        flash("Rates updated from API");
      } else {
        flash("API returned no rates");
      }
    } catch (e) {
      flash("Failed to fetch rates");
    }
    setRefreshingRates(false);
  };

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-black text-foreground">Localization</h2>
        <p className="text-xs text-muted-foreground">Manage languages, currencies and exchange rates.</p>
      </div>

      {/* Languages */}
      <Card className="border border-border p-5">
        <div className="mb-3 flex items-center gap-2">
          <Globe size={18} className="text-primary" />
          <h3 className="text-sm font-black text-foreground">Languages</h3>
        </div>

        <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Default language</label>
        <select
          value={defaultLanguage}
          onChange={(e) => setDefaultLanguage(e.target.value as SupportedLanguage)}
          className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
        >
          {ALL_LANGUAGES.map((l) => (
            <option key={l.code} value={l.code}>{l.flag} {l.name}</option>
          ))}
        </select>

        <label className="mt-4 mb-2 block text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Active languages (shown in header)</label>
        <div className="grid grid-cols-2 gap-2">
          {ALL_LANGUAGES.map((l) => {
            const checked = availableLanguages.includes(l.code);
            return (
              <button
                key={l.code}
                onClick={() => toggleLang(l.code)}
                className={`flex items-center gap-2 rounded-lg border-2 px-3 py-2 text-xs font-bold transition-all ${
                  checked ? "border-primary bg-primary/5 text-primary" : "border-border text-muted-foreground"
                }`}
              >
                <span>{l.flag}</span>
                <span>{l.name}</span>
                {checked && <Badge variant="secondary" className="ml-auto text-[9px]">ON</Badge>}
              </button>
            );
          })}
        </div>
      </Card>

      {/* Currencies */}
      <Card className="border border-border p-5">
        <div className="mb-3 flex items-center gap-2">
          <DollarSign size={18} className="text-primary" />
          <h3 className="text-sm font-black text-foreground">Currencies</h3>
        </div>

        <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Default currency</label>
        <select
          value={defaultCurrency}
          onChange={(e) => setDefaultCurrency(e.target.value as SupportedCurrency)}
          className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
        >
          {ALL_CURRENCIES.map((c) => (
            <option key={c.code} value={c.code}>{c.symbol} {c.code} — {c.name}</option>
          ))}
        </select>

        <label className="mt-4 mb-2 block text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Active currencies</label>
        <div className="grid grid-cols-2 gap-2">
          {ALL_CURRENCIES.map((c) => {
            const checked = availableCurrencies.includes(c.code);
            return (
              <button
                key={c.code}
                onClick={() => toggleCur(c.code)}
                className={`flex items-center gap-2 rounded-lg border-2 px-3 py-2 text-xs font-bold transition-all ${
                  checked ? "border-primary bg-primary/5 text-primary" : "border-border text-muted-foreground"
                }`}
              >
                <span>{c.symbol}</span>
                <span>{c.code}</span>
                {checked && <Badge variant="secondary" className="ml-auto text-[9px]">ON</Badge>}
              </button>
            );
          })}
        </div>

        <div className="mt-4 flex items-center justify-between rounded-lg border border-border p-3">
          <div>
            <p className="text-xs font-bold text-foreground">Auto-detect by visitor IP</p>
            <p className="text-[10px] text-muted-foreground">Pre-select a currency based on visitor location</p>
          </div>
          <Switch checked={autoDetect} onCheckedChange={setAutoDetect} />
        </div>
      </Card>

      {/* Exchange rates */}
      <Card className="border border-border p-5">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-sm font-black text-foreground">Exchange rates (base: USD)</h3>
          <Button
            variant="outline"
            size="sm"
            disabled={refreshingRates}
            onClick={refreshRates}
            className="text-xs"
          >
            {refreshingRates ? <Loader2 size={12} className="mr-1 animate-spin" /> : <RefreshCw size={12} className="mr-1" />}
            Update via API
          </Button>
        </div>
        <div className="space-y-2">
          {ALL_CURRENCIES.map((c) => (
            <div key={c.code} className="flex items-center gap-3">
              <span className="w-20 text-xs font-bold text-foreground">1 USD =</span>
              <Input
                type="number"
                step="0.0001"
                value={exchangeRates[c.code] ?? ""}
                disabled={c.code === "USD"}
                onChange={(e) =>
                  setExchangeRates((r) => ({ ...r, [c.code]: parseFloat(e.target.value) || 0 }))
                }
                className="font-mono text-xs"
              />
              <span className="w-12 text-xs font-bold text-muted-foreground">{c.code}</span>
            </div>
          ))}
        </div>
      </Card>

      <Button
        onClick={save}
        disabled={loading}
        className="w-full bg-primary text-xs font-bold text-primary-foreground hover:bg-primary/90"
      >
        {loading ? <Loader2 size={14} className="mr-1.5 animate-spin" /> : <Save size={14} className="mr-1.5" />}
        Save all settings
      </Button>

      {message && (
        <div className="rounded-md bg-emerald-500/10 p-2.5 text-center text-xs font-bold text-emerald-500">
          {message}
        </div>
      )}
    </div>
  );
}
