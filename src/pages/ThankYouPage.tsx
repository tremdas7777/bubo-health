import { useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { CheckCircle, Package, Truck, Home, ShoppingBag, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import Layout from "@/components/store/Layout";
import { useCart } from "@/contexts/CartContext";
import PageHead from "@/components/seo/PageHead";

export default function ThankYouPage() {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get("pedido") || searchParams.get("order") || "";
  const { clearCart } = useCart();

  useEffect(() => {
    clearCart();
  }, [clearCart]);

  const steps = [
    { icon: CheckCircle, label: t("thankYou.stepPaymentDone"), desc: t("thankYou.stepPaymentDoneDesc"), done: true },
    { icon: Package, label: t("thankYou.stepPreparing"), desc: t("thankYou.stepPreparingDesc"), done: false },
    { icon: Truck, label: t("thankYou.stepShipped"), desc: t("thankYou.stepShippedDesc"), done: false },
    { icon: Home, label: t("thankYou.stepDelivered"), desc: t("thankYou.stepDeliveredDesc"), done: false },
  ];

  return (
    <Layout>
      <PageHead title={t("thankYou.paymentConfirmed")} description={t("thankYou.thanksMessage")} />
      <div className="min-h-[70vh] flex items-center justify-center py-12 px-4">
        <div className="max-w-lg w-full text-center space-y-6">
          <div className="relative mx-auto w-24 h-24">
            <div className="absolute inset-0 rounded-full animate-ping bg-primary/20" />
            <div className="relative w-24 h-24 rounded-full flex items-center justify-center bg-primary/10">
              <CheckCircle size={48} className="text-primary" />
            </div>
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl sm:text-3xl font-heading font-bold text-foreground">
              {t("thankYou.paymentConfirmed")} 🎉
            </h1>
            <p className="text-muted-foreground text-sm">
              {t("thankYou.thanksMessage")}
            </p>
          </div>

          <div className="bg-primary/5 border-2 border-primary/20 rounded-xl p-5 text-left">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Mail size={20} className="text-primary" />
              </div>
              <div>
                <p className="text-sm font-bold text-foreground mb-1">{t("thankYou.emailHighlightTitle")}</p>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {t("thankYou.emailHighlightDesc")}
                </p>
              </div>
            </div>
          </div>

          {orderId && (
            <div className="bg-muted/50 rounded-xl border border-border p-4">
              <p className="text-xs text-muted-foreground mb-1">{t("thankYou.orderNumber")}</p>
              <p className="font-mono text-sm font-bold text-foreground">{orderId.slice(0, 8).toUpperCase()}</p>
            </div>
          )}

          <div className="bg-background rounded-xl border border-border p-5 text-left space-y-4">
            <h2 className="text-sm font-heading font-bold text-foreground">{t("thankYou.nextSteps")}</h2>
            <div className="space-y-3">
              {steps.map((step, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                    step.done ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
                  }`}>
                    <step.icon size={16} />
                  </div>
                  <div>
                    <p className={`text-sm font-medium ${step.done ? "text-foreground" : "text-muted-foreground"}`}>{step.label}</p>
                    <p className="text-xs text-muted-foreground">{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button asChild className="bg-primary hover:bg-primary/90">
              <Link to="/produtos">
                <ShoppingBag size={16} className="mr-2" />
                {t("thankYou.continueShopping")}
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link to="/">{t("thankYou.backHome")}</Link>
            </Button>
          </div>
        </div>
      </div>
    </Layout>
  );
}
