import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { X, Minus, Plus, Trash2, ShoppingBag } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { useCurrency } from "@/contexts/LocalizationContext";
import { Button } from "@/components/ui/button";

export default function CartDrawer() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { items, isOpen, setIsOpen, removeItem, updateQuantity, totalPrice } = useCart();
  const { formatPrice } = useCurrency();

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/40 z-50" onClick={() => setIsOpen(false)} />
      <div className="fixed right-0 top-0 h-full w-full max-w-md bg-background z-50 shadow-2xl flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="font-heading font-semibold text-lg flex items-center gap-2">
            <ShoppingBag size={20} /> {t("cart.title")}
          </h2>
          <button onClick={() => setIsOpen(false)} className="text-muted-foreground hover:text-foreground" aria-label={t("common.close")}>
            <X size={22} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
              <ShoppingBag size={48} className="mb-4 opacity-30" />
              <p>{t("cart.empty")}</p>
            </div>
          ) : (
            <div className="space-y-4">
              {items.map(({ product, quantity, selections, lineId, price }) => (
                <div key={lineId} className="flex gap-3 border-b border-border pb-4">
                  <img src={product.image} alt={product.name} className="w-20 h-20 object-cover rounded-xl" />
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-medium line-clamp-2">{product.name}</h3>
                    {selections && selections.length > 0 && (
                      <ul className="mt-1 space-y-0.5 text-xs text-muted-foreground">
                        {selections.map((s, i) => (
                          <li key={i}>
                            {s.name ? (
                              <><span className="font-medium text-foreground">{s.name}:</span> {s.flavor || s.color}</>
                            ) : (
                              <><span className="font-medium text-foreground">{t("cart.shirt", { n: i + 1 })}:</span> {s.color} · {s.size}</>
                            )}
                          </li>
                        ))}
                      </ul>
                    )}
                    <p className="text-primary font-semibold text-sm mt-1">
                      {formatPrice(price)}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <button onClick={() => updateQuantity(lineId, quantity - 1)} className="w-7 h-7 border border-border rounded flex items-center justify-center hover:bg-muted">
                        <Minus size={14} />
                      </button>
                      <span className="text-sm w-6 text-center">{quantity}</span>
                      <button onClick={() => updateQuantity(lineId, quantity + 1)} className="w-7 h-7 border border-border rounded flex items-center justify-center hover:bg-muted">
                        <Plus size={14} />
                      </button>
                      <button onClick={() => removeItem(lineId)} className="ml-auto text-muted-foreground hover:text-destructive" aria-label={t("cart.remove")}>
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {items.length > 0 && (
          <div className="p-4 border-t border-border space-y-3">
            <div className="flex justify-between font-heading font-semibold text-lg">
              <span>{t("cart.total")}</span>
              <span className="text-primary">{formatPrice(totalPrice)}</span>
            </div>
            <Button
              onClick={() => { setIsOpen(false); navigate("/checkout"); }}
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-6"
            >
              {t("cart.checkout")}
            </Button>
          </div>
        )}
      </div>
    </>
  );
}
