// Helpers for international (locale-aware) checkout behavior.
// Country detection by IP, and country → field-label heuristics.

export interface DetectedLocale {
  countryCode: string; // ISO-2 lowercase, e.g. "us", "br"
  countryName: string;
  city?: string;
  region?: string;
  postal?: string;
  callingCode?: string; // e.g. "+1"
  currency?: string;
}

const FALLBACK: DetectedLocale = {
  countryCode: "us",
  countryName: "United States",
  callingCode: "+1",
  currency: "USD",
};

let cached: DetectedLocale | null = null;
let inflight: Promise<DetectedLocale> | null = null;

/**
 * Detects the visitor location using ipapi.co (free, no key, ~30k req/day).
 * Result is memoized in module + sessionStorage for the rest of the visit.
 */
export async function detectVisitorLocale(): Promise<DetectedLocale> {
  if (cached) return cached;
  try {
    const stored = sessionStorage.getItem("visitor-locale");
    if (stored) {
      cached = JSON.parse(stored) as DetectedLocale;
      return cached;
    }
  } catch { /* ignore */ }

  if (inflight) return inflight;
  inflight = (async () => {
    try {
      const res = await fetch("https://ipapi.co/json/", { cache: "force-cache" });
      if (!res.ok) throw new Error("ipapi failed");
      const data = await res.json() as {
        country_code?: string;
        country_name?: string;
        city?: string;
        region?: string;
        postal?: string;
        country_calling_code?: string;
        currency?: string;
      };
      const out: DetectedLocale = {
        countryCode: (data.country_code || "US").toLowerCase(),
        countryName: data.country_name || "United States",
        city: data.city,
        region: data.region,
        postal: data.postal,
        callingCode: data.country_calling_code,
        currency: data.currency,
      };
      cached = out;
      try { sessionStorage.setItem("visitor-locale", JSON.stringify(out)); } catch { /* ignore */ }
      return out;
    } catch {
      cached = FALLBACK;
      return FALLBACK;
    } finally {
      inflight = null;
    }
  })();
  return inflight;
}

/**
 * Returns the localized tax-ID label for a given country code.
 * Always optional — used as placeholder/label only.
 */
export function getTaxIdLabel(countryCode: string): string {
  const c = countryCode.toLowerCase();
  switch (c) {
    case "br": return "CPF / CNPJ";
    case "pt": return "NIF";
    case "es": return "NIF / DNI";
    case "fr": return "Numéro fiscal";
    case "de": return "Steuer-ID";
    case "it": return "Codice Fiscale";
    case "us": return "SSN / EIN";
    case "gb": return "VAT / UTR";
    case "mx": return "RFC";
    case "ar": return "CUIT / CUIL";
    default: return "Tax ID";
  }
}

/**
 * Whether installments (parcelamento) make sense for this country.
 * Brazil has a strong installment culture; most other markets don't.
 */
export function supportsInstallments(countryCode: string, language: string): boolean {
  return countryCode.toLowerCase() === "br" || language.toLowerCase().startsWith("pt");
}

/**
 * Country → ISO-2 used by react-phone-number-input default selection.
 */
export function defaultPhoneCountry(countryCode: string): string {
  return (countryCode || "us").toUpperCase();
}
