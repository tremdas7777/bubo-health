import { Truck, Shield, Headphones, RefreshCw } from "lucide-react";
import { useTranslation } from "react-i18next";

export default function TrustBadges() {
  const { t } = useTranslation();
  const badges = [
    { icon: Truck, title: t("home.trust.shipping"), desc: t("home.trust.shippingDesc") },
    { icon: RefreshCw, title: t("home.trust.returns", { defaultValue: "Easy Returns" }), desc: t("home.trust.returnsDesc", { defaultValue: "30-day return policy" }) },
    { icon: Shield, title: t("home.trust.secure"), desc: t("home.trust.secureDesc") },
    { icon: Headphones, title: t("home.trust.support"), desc: t("home.trust.supportDesc") },
  ];

  return (
    <section className="py-10 border-t border-border">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
          {badges.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="flex flex-col items-center text-center space-y-2">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Icon size={22} className="text-primary" />
              </div>
              <h3 className="font-heading font-semibold text-sm">{title}</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
