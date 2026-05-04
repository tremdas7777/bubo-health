import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useCart } from "@/contexts/CartContext";
import { useStoreConfig } from "@/hooks/useStoreConfig";
import { X, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function CartAbandonmentDetector() {
  const { t } = useTranslation();
  const { items } = useCart();
  const { config } = useStoreConfig();
  const [showPopup, setShowPopup] = useState(false);

  useEffect(() => {
    if (items.length === 0) return;
    const handleBeforeUnload = () => {
      sessionStorage.setItem("bubohealth-cart-abandoned", "true");
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [items]);

  useEffect(() => {
    const wasAbandoned = sessionStorage.getItem("bubohealth-cart-abandoned");
    if (wasAbandoned && items.length > 0) {
      const timer = setTimeout(() => {
        setShowPopup(true);
        sessionStorage.removeItem("bubohealth-cart-abandoned");
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [items]);

  if (!showPopup || !config.whatsapp_number || items.length === 0) return null;

  const cleanNumber = config.whatsapp_number.replace(/\D/g, "");
  const productNames = items.map((i) => i.product.name).join(", ");
  const message = encodeURIComponent(t("abandonment.wpMessage", { products: productNames }));
  const msgKey = items.length === 1 ? "abandonment.message" : "abandonment.messagePlural";

  return (
    <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center bg-black/40 animate-in fade-in">
      <div className="bg-card rounded-t-2xl sm:rounded-2xl p-6 mx-4 mb-0 sm:mb-0 max-w-md w-full shadow-2xl border border-border">
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-lg font-heading font-bold">{t("abandonment.title")}</h3>
          <button onClick={() => setShowPopup(false)} className="text-muted-foreground hover:text-foreground" aria-label={t("common.close")}>
            <X size={20} />
          </button>
        </div>
        <p className="text-sm text-muted-foreground mb-5">
          {t(msgKey, { count: items.length })}
        </p>
        <div className="flex flex-col gap-2">
          <a href={`https://wa.me/${cleanNumber}?text=${message}`} target="_blank" rel="noopener noreferrer">
            <Button className="w-full bg-[#25D366] hover:bg-[#20bd5a] text-white">
              <MessageCircle size={18} className="mr-2" />
              {t("abandonment.talkOnWhatsApp")}
            </Button>
          </a>
          <Button variant="outline" onClick={() => setShowPopup(false)} className="w-full">
            {t("abandonment.keepBrowsing")}
          </Button>
        </div>
      </div>
    </div>
  );
}
