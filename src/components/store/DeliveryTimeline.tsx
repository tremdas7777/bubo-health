import { CreditCard, PackageCheck, Plane, Home } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useLocalization } from "@/contexts/LocalizationContext";

const LOCALE_BY_LANG: Record<string, string> = {
  en: "en-US", es: "es-ES", pt: "pt-BR", fr: "fr-FR",
};

export default function DeliveryTimeline() {
  const { t } = useTranslation();
  const { language } = useLocalization();
  const today = new Date();
  const formatDate = (date: Date) =>
    date.toLocaleDateString(LOCALE_BY_LANG[language] || "en-US", { day: "numeric", month: "short" });

  const paymentDate = today;
  const shipDate = new Date(today); shipDate.setDate(today.getDate() + 1);
  const deliveryStart = new Date(today); deliveryStart.setDate(today.getDate() + 5);
  const deliveryEnd = new Date(today); deliveryEnd.setDate(today.getDate() + 9);

  const steps = [
    { icon: CreditCard, date: formatDate(paymentDate), label: t("delivery.payment") },
    { icon: PackageCheck, date: t("delivery.in24h"), label: t("delivery.shipped") },
    { icon: Plane, date: `${formatDate(shipDate)} - ${formatDate(deliveryStart)}`, label: t("delivery.inTransit") },
    { icon: Home, date: `${formatDate(deliveryStart)} - ${formatDate(deliveryEnd)}`, label: t("delivery.delivered") },
  ];

  return (
    <div className="rounded-xl border border-primary/20 bg-gradient-to-br from-primary/5 to-accent/5 p-4">
      <div className="flex items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <p className="text-xs font-bold text-foreground">{t("delivery.expressTitle")}</p>
        </div>
        <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-500/15 text-emerald-600 px-2 py-0.5 rounded-full">
          {t("delivery.freeShipping")}
        </span>
      </div>
      <div className="flex items-start justify-between gap-1">
        {steps.map((step, i) => (
          <div key={i} className="flex items-start flex-1 min-w-0">
            <div className="flex flex-col items-center text-center flex-1 min-w-0">
              <div className="w-10 h-10 rounded-full bg-primary/10 ring-2 ring-primary/20 flex items-center justify-center mb-1.5">
                <step.icon size={16} className="text-primary" />
              </div>
              <p className="text-[10px] font-bold text-foreground leading-tight truncate w-full">{step.date}</p>
              <p className="text-[9px] text-muted-foreground leading-tight">{step.label}</p>
            </div>
            {i < steps.length - 1 && (
              <div className="flex-shrink-0 w-4 h-0.5 bg-primary/30 mt-5" />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
