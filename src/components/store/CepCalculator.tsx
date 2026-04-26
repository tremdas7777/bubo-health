import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, MapPin, Truck } from "lucide-react";

/**
 * Global postal code lookup using Zippopotam.us (free, no API key, 60+ countries).
 * Detects default country by active language and lets the user override.
 */

type CountryDef = {
  code: string;        // ISO-2 used by Zippopotam
  label: string;       // shown in selector
  example: string;     // placeholder hint
  pattern: RegExp;     // basic client-side validation
  maxLen: number;
};

const COUNTRIES: CountryDef[] = [
  { code: "us", label: "United States", example: "90210", pattern: /^\d{5}(-\d{4})?$/, maxLen: 10 },
  { code: "gb", label: "United Kingdom", example: "SW1A 1AA", pattern: /^[A-Z]{1,2}\d[A-Z\d]?\s*\d[A-Z]{2}$/i, maxLen: 8 },
  { code: "ca", label: "Canada", example: "K1A 0B1", pattern: /^[A-Z]\d[A-Z]\s*\d[A-Z]\d$/i, maxLen: 7 },
  { code: "au", label: "Australia", example: "2000", pattern: /^\d{4}$/, maxLen: 4 },
  { code: "de", label: "Germany", example: "10115", pattern: /^\d{5}$/, maxLen: 5 },
  { code: "fr", label: "France", example: "75001", pattern: /^\d{5}$/, maxLen: 5 },
  { code: "es", label: "Spain", example: "28001", pattern: /^\d{5}$/, maxLen: 5 },
  { code: "it", label: "Italy", example: "00118", pattern: /^\d{5}$/, maxLen: 5 },
  { code: "pt", label: "Portugal", example: "1100-148", pattern: /^\d{4}-?\d{3}$/, maxLen: 8 },
  { code: "nl", label: "Netherlands", example: "1011 AA", pattern: /^\d{4}\s*[A-Z]{2}$/i, maxLen: 7 },
  { code: "br", label: "Brazil", example: "01310-100", pattern: /^\d{5}-?\d{3}$/, maxLen: 9 },
  { code: "mx", label: "Mexico", example: "01000", pattern: /^\d{5}$/, maxLen: 5 },
  { code: "ar", label: "Argentina", example: "1001", pattern: /^[A-Z]?\d{4}([A-Z]{3})?$/i, maxLen: 8 },
  { code: "jp", label: "Japan", example: "100-0001", pattern: /^\d{3}-?\d{4}$/, maxLen: 8 },
];

const LANG_TO_COUNTRY: Record<string, string> = {
  en: "us",
  es: "es",
  pt: "br",
  fr: "fr",
  de: "de",
};

interface LookupResult {
  city: string;
  state: string;
  country: string;
}

export default function CepCalculator() {
  const { t, i18n } = useTranslation();
  const lang = (i18n.language || "en").slice(0, 2);

  const [country, setCountry] = useState<string>(LANG_TO_COUNTRY[lang] || "us");
  const [zip, setZip] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<LookupResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const countryDef = useMemo(
    () => COUNTRIES.find((c) => c.code === country) ?? COUNTRIES[0],
    [country]
  );

  const handleCalculate = async () => {
    setError(null);
    setResult(null);
    const trimmed = zip.trim();
    if (!trimmed) return;
    if (!countryDef.pattern.test(trimmed)) {
      setError(t("cep.invalid", { example: countryDef.example }));
      return;
    }

    setLoading(true);
    try {
      const cleaned = trimmed.replace(/\s+/g, "").toUpperCase();
      const res = await fetch(`https://api.zippopotam.us/${countryDef.code}/${encodeURIComponent(cleaned)}`);
      if (!res.ok) {
        setError(t("cep.notFound"));
        return;
      }
      const data = await res.json();
      const place = data.places?.[0];
      setResult({
        city: place?.["place name"] ?? "",
        state: place?.["state"] ?? place?.["state abbreviation"] ?? "",
        country: data["country"] ?? countryDef.label,
      });
    } catch {
      setError(t("cep.networkError"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="border border-border rounded-lg p-4 space-y-3">
      <h4 className="text-sm font-semibold flex items-center gap-2">
        <Truck className="h-4 w-4" />
        {t("cep.title")}
      </h4>

      <div className="grid grid-cols-[140px_1fr_auto] gap-2">
        <Select value={country} onValueChange={(v) => { setCountry(v); setResult(null); setError(null); }}>
          <SelectTrigger className="h-10">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="max-h-72">
            {COUNTRIES.map((c) => (
              <SelectItem key={c.code} value={c.code}>{c.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Input
          type="text"
          placeholder={countryDef.example}
          value={zip}
          onChange={(e) => setZip(e.target.value.slice(0, countryDef.maxLen))}
          onKeyDown={(e) => e.key === "Enter" && handleCalculate()}
          aria-label={t("cep.placeholder")}
        />

        <Button onClick={handleCalculate} disabled={loading} variant="outline" className="font-semibold">
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : t("cep.calculate")}
        </Button>
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      {result && (
        <div className="rounded-md bg-muted/50 p-3 space-y-1">
          <p className="text-sm flex items-center gap-2 font-medium">
            <MapPin className="h-4 w-4 text-primary" />
            {[result.city, result.state, result.country].filter(Boolean).join(", ")}
          </p>
          <p className="text-sm text-primary font-medium">{t("cep.result")}</p>
        </div>
      )}
    </div>
  );
}
