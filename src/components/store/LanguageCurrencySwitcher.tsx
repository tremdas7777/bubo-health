import { useLocalization, SupportedCurrency } from "@/contexts/LocalizationContext";
import { SupportedLanguage } from "@/i18n";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Check, ChevronDown } from "lucide-react";
import { useTranslation } from "react-i18next";

const LANG_LABELS: Record<SupportedLanguage, { code: string; name: string }> = {
  en: { code: "EN", name: "English" },
  es: { code: "ES", name: "Español" },
  pt: { code: "PT", name: "Português" },
  fr: { code: "FR", name: "Français" },
  de: { code: "DE", name: "Deutsch" },
};

const CURRENCY_LABELS: Record<SupportedCurrency, { symbol: string; name: string }> = {
  USD: { symbol: "$", name: "USD" },
  EUR: { symbol: "€", name: "EUR" },
  BRL: { symbol: "R$", name: "BRL" },
  GBP: { symbol: "£", name: "GBP" },
};

export default function LanguageCurrencySwitcher() {
  const { language, setLanguage, currency, setCurrency, settings } = useLocalization();
  const { t } = useTranslation();
  const langInfo = LANG_LABELS[language] ?? LANG_LABELS.en;
  const currInfo = CURRENCY_LABELS[currency] ?? CURRENCY_LABELS.USD;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className="group flex items-center gap-1.5 rounded-full border border-border/60 bg-background/50 px-2.5 py-1 text-xs font-semibold text-foreground transition-all hover:border-primary/40 hover:bg-primary/5 hover:text-primary"
        aria-label={`${t("nav.language")} / ${t("nav.currency")}`}
      >
        <span className="tracking-wide">{langInfo.code}</span>
        <span className="h-3 w-px bg-border" aria-hidden />
        <span className="tracking-wide">{currInfo.symbol}</span>
        <ChevronDown size={12} className="opacity-60 transition-transform group-data-[state=open]:rotate-180" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56 bg-background z-50 p-1">
        <DropdownMenuLabel className="text-[10px] uppercase tracking-widest text-muted-foreground px-2 pt-2 pb-1">
          {t("nav.language")}
        </DropdownMenuLabel>
        {settings.available_languages.map((l) => {
          const info = LANG_LABELS[l];
          const active = l === language;
          return (
            <DropdownMenuItem
              key={l}
              onClick={() => setLanguage(l)}
              className={`cursor-pointer rounded-md text-sm flex items-center justify-between gap-2 ${active ? "bg-primary/10 text-primary font-semibold" : ""}`}
            >
              <span className="flex items-center gap-2">
                <span className="inline-flex h-5 w-7 items-center justify-center rounded bg-muted text-[10px] font-bold tracking-wider">
                  {info?.code ?? l.toUpperCase()}
                </span>
                {info?.name ?? l}
              </span>
              {active && <Check size={14} />}
            </DropdownMenuItem>
          );
        })}
        <DropdownMenuSeparator className="my-1" />
        <DropdownMenuLabel className="text-[10px] uppercase tracking-widest text-muted-foreground px-2 pt-1 pb-1">
          {t("nav.currency")}
        </DropdownMenuLabel>
        {settings.available_currencies.map((c) => {
          const info = CURRENCY_LABELS[c];
          const active = c === currency;
          return (
            <DropdownMenuItem
              key={c}
              onClick={() => setCurrency(c)}
              className={`cursor-pointer rounded-md text-sm flex items-center justify-between gap-2 ${active ? "bg-primary/10 text-primary font-semibold" : ""}`}
            >
              <span className="flex items-center gap-2">
                <span className="inline-flex h-5 w-7 items-center justify-center rounded bg-muted text-[10px] font-bold">
                  {info?.symbol ?? c}
                </span>
                {info?.name ?? c}
              </span>
              {active && <Check size={14} />}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
