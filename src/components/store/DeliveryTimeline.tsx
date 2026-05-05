import { CreditCard, PackageCheck, Plane, Home } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useLocalization } from "@/contexts/LocalizationContext";

const LOCALE_BY_LANG: Record<string, string> = {
  en: "en-US", es: "es-ES", pt: "pt-BR", fr: "fr-FR",
};

export default function DeliveryTimeline({ color }: { color?: string }) {
  const { t } = useTranslation();
  const { language } = useLocalization();
  const today = new Date();
  const formatDate = (date: Date) =>
    date.toLocaleDateString(LOCALE_BY_LANG[language] || "en-US", { day: "numeric", month: "short" });

  const paymentDate = today;
  const shipDate = new Date(today); shipDate.setDate(today.getDate() + 1);
  const deliveryStart = new Date(today); deliveryStart.setDate(today.getDate() + 2);
  const deliveryEnd = new Date(today); deliveryEnd.setDate(today.getDate() + 5);

  const steps = [
    { icon: CreditCard, date: formatDate(paymentDate), label: t("delivery.payment") },
    { icon: PackageCheck, date: t("delivery.in24h"), label: t("delivery.shipped") },
    { icon: Plane, date: `${formatDate(shipDate)} - ${formatDate(deliveryStart)}`, label: t("delivery.inTransit") },
    { icon: Home, date: `${formatDate(deliveryStart)} - ${formatDate(deliveryEnd)}`, label: t("delivery.delivered") },
  ];

  const accentColor = color || "#7c3aed";

  return (
    <div 
      className="rounded-xl border p-4" 
      style={{ borderColor: `${accentColor}33`, backgroundImage: `linear-gradient(to bottom right, ${accentColor}0D, #ffffff00)` }}
    >
      <div className="flex items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: accentColor }} />
          <p className="text-xs font-bold text-foreground">{t("delivery.expressTitle")}</p>
        </div>
        <span 
          className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full"
          style={{ backgroundColor: `${accentColor}26`, color: accentColor }}
        >
          {t("delivery.freeShipping")}
        </span>
      </div>
      <div className="flex items-start justify-between gap-1">
        {steps.map((step, i) => (
          <div key={i} className="flex items-start flex-1 min-w-0">
            <div className="flex flex-col items-center text-center flex-1 min-w-0">
              <div 
                className="w-10 h-10 rounded-full flex items-center justify-center mb-1.5 ring-2"
                style={{ backgroundColor: `${accentColor}1A`, ['--tw-ring-color' as any]: `${accentColor}33` }}
              >
                <step.icon size={16} style={{ color: accentColor }} />
              </div>
              <p className="text-[10px] font-bold text-foreground leading-tight truncate w-full">{step.date}</p>
              <p className="text-[9px] text-muted-foreground leading-tight">{step.label}</p>
            </div>
            {i < steps.length - 1 && (
              <div className="flex-shrink-0 w-4 h-0.5 mt-5" style={{ backgroundColor: `${accentColor}4D` }} />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
