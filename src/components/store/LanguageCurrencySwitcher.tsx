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
import { Globe } from "lucide-react";
import { useTranslation } from "react-i18next";

const LANG_LABELS: Record<SupportedLanguage, { flag: string; name: string }> = {
  en: { flag: "🇺🇸", name: "English" },
  es: { flag: "🇪🇸", name: "Español" },
  pt: { flag: "🇧🇷", name: "Português" },
  fr: { flag: "🇫🇷", name: "Français" },
};

const CURRENCY_LABELS: Record<SupportedCurrency, string> = {
  USD: "$ USD",
  EUR: "€ EUR",
  BRL: "R$ BRL",
  GBP: "£ GBP",
};

export default function LanguageCurrencySwitcher() {
  const { language, setLanguage, currency, setCurrency, settings } = useLocalization();
  const { t } = useTranslation();
  const langInfo = LANG_LABELS[language] ?? LANG_LABELS.en;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className="text-foreground hover:text-primary transition-colors flex items-center gap-1 text-xs font-medium"
        aria-label={t("nav.language")}
      >
        <Globe size={18} />
        <span className="hidden sm:inline">{langInfo.flag}</span>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48 bg-background z-50">
        <DropdownMenuLabel className="text-[10px] uppercase tracking-wider text-muted-foreground">
          {t("nav.language")}
        </DropdownMenuLabel>
        {settings.available_languages.map((l) => (
          <DropdownMenuItem
            key={l}
            onClick={() => setLanguage(l)}
            className={`cursor-pointer text-sm ${l === language ? "font-bold text-primary" : ""}`}
          >
            <span className="mr-2">{LANG_LABELS[l]?.flag}</span>
            {LANG_LABELS[l]?.name ?? l}
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator />
        <DropdownMenuLabel className="text-[10px] uppercase tracking-wider text-muted-foreground">
          {t("nav.currency")}
        </DropdownMenuLabel>
        {settings.available_currencies.map((c) => (
          <DropdownMenuItem
            key={c}
            onClick={() => setCurrency(c)}
            className={`cursor-pointer text-sm ${c === currency ? "font-bold text-primary" : ""}`}
          >
            {CURRENCY_LABELS[c] ?? c}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
