import { memo } from "react";
import { Star, Quote } from "lucide-react";
import { useTranslation } from "react-i18next";

export default memo(function HomeReviews() {
  const { t } = useTranslation();
  const testimonials = [
    { name: "Maria C.", text: t("home.testimonials.t1Text"), rating: 5, product: t("home.testimonials.t1Product") },
    { name: "Lucas R.", text: t("home.testimonials.t2Text"), rating: 5, product: t("home.testimonials.t2Product") },
    { name: "Juliana S.", text: t("home.testimonials.t3Text"), rating: 5, product: t("home.testimonials.t3Product") },
    { name: "André M.", text: t("home.testimonials.t4Text"), rating: 4, product: t("home.testimonials.t4Product") },
  ];

  return (
    <section className="py-10 bg-muted/30">
      <div className="container mx-auto px-4">
        <h2 className="text-xl md:text-2xl font-heading font-semibold text-center mb-8">
          {t("home.reviews")}
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 max-w-[1100px] mx-auto">
          {testimonials.map((tt, i) => (
            <div key={i} className="bg-card rounded-xl border border-border p-5 flex flex-col gap-3">
              <Quote size={20} className="text-primary/40" />
              <p className="text-sm text-foreground/80 leading-relaxed flex-1">
                "{tt.text}"
              </p>
              <div className="flex gap-0.5">
                {Array.from({ length: 5 }).map((_, j) => (
                  <Star key={j} size={14} className={j < tt.rating ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground/30"} />
                ))}
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">{tt.name}</p>
                <p className="text-[11px] text-muted-foreground">{t("home.testimonials.about")} {tt.product}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
});
