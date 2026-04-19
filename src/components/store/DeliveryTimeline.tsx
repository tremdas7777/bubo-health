import { ShoppingCart, Package, Gift } from "lucide-react";
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
  const processingStart = new Date(today); processingStart.setDate(today.getDate() + 1);
  const processingEnd = new Date(today); processingEnd.setDate(today.getDate() + 2);
  const deliveryStart = new Date(today); deliveryStart.setDate(today.getDate() + 7);
  const deliveryEnd = new Date(today); deliveryEnd.setDate(today.getDate() + 21);

  return (
    <div className="flex items-center justify-between py-4">
      <div className="flex flex-col items-center text-center flex-1">
        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-2">
          <ShoppingCart size={20} className="text-primary" />
        </div>
        <p className="text-xs font-semibold">{formatDate(paymentDate)}</p>
        <p className="text-[10px] text-muted-foreground">{t("delivery.payment")}</p>
      </div>
      <div className="flex-1 h-0.5 bg-primary/20 -mt-6 mx-1" />
      <div className="flex flex-col items-center text-center flex-1">
        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-2">
          <Package size={20} className="text-primary" />
        </div>
        <p className="text-xs font-semibold">{formatDate(processingStart)} - {formatDate(processingEnd)}</p>
        <p className="text-[10px] text-muted-foreground">{t("delivery.orderReady")}</p>
      </div>
      <div className="flex-1 h-0.5 bg-primary/20 -mt-6 mx-1" />
      <div className="flex flex-col items-center text-center flex-1">
        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-2">
          <Gift size={20} className="text-primary" />
        </div>
        <p className="text-xs font-semibold">{formatDate(deliveryStart)} - {formatDate(deliveryEnd)}</p>
        <p className="text-[10px] text-muted-foreground">{t("delivery.delivered")}</p>
      </div>
    </div>
  );
}
