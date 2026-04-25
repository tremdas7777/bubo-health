import { Star } from "lucide-react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { supabase } from "@/integrations/supabase/client";
import { useLocalization } from "@/contexts/LocalizationContext";
import reviewImg1 from "@/assets/reviews/review-kit-1.webp";
import reviewImg2 from "@/assets/reviews/review-kit-2.webp";
import reviewImg3 from "@/assets/reviews/review-kit-3.webp";
import reviewImg4 from "@/assets/reviews/review-kit-4.webp";
import reviewImg5 from "@/assets/reviews/review-kit-5.webp";

interface Review {
  name: string;
  rating: number;
  date: string;
  text: string;
  image?: string;
  verified: boolean;
}

const LOCALE_BY_LANG: Record<string, string> = { en: "en-US", es: "es-ES", pt: "pt-BR", fr: "fr-FR" };

const kitReviews: Review[] = [
  { name: "Carlos M.", rating: 5, date: "2025-03-12", text: "Kit completo demais! Chegou tudo certinho, ferramentas de boa qualidade. A bomba de vácuo funciona perfeitamente. Recomendo para quem trabalha na área.", image: reviewImg1, verified: true },
  { name: "Rafael S.", rating: 5, date: "2025-02-28", text: "Manifold excelente, mangueiras de qualidade profissional. Já usei em 3 instalações e tudo funcionando perfeitamente. Melhor custo-benefício que encontrei.", image: reviewImg2, verified: true },
  { name: "Anderson P.", rating: 5, date: "2025-02-15", text: "Maleta organizadora top, tudo encaixado perfeitamente. Flangeador com rotação 360° faz um acabamento impecável. Vale cada centavo.", image: reviewImg3, verified: true },
  { name: "Marcos L.", rating: 4, date: "2025-02-03", text: "Ferramentas muito boas para o preço. Bomba de vácuo potente, manifolds bem calibrados. O maçarico é potente e as curvadoras facilitam muito o trabalho.", image: reviewImg4, verified: true },
  { name: "João V.", rating: 5, date: "2025-01-20", text: "Comprei e não me arrependi! Kit super completo, veio tudo que prometeram.", image: reviewImg5, verified: true },
  { name: "Fernando R.", rating: 5, date: "2025-01-10", text: "Entrega rápida e bem embalado. As ferramentas são robustas e de boa qualidade. O flangeador é muito superior ao que eu usava antes. Nota 10!", verified: true },
  { name: "Diego A.", rating: 5, date: "2025-01-05", text: "Sou técnico há 8 anos e esse kit me surpreendeu. Tudo que preciso no dia a dia está aqui. O multímetro com capacímetro é um diferencial enorme.", verified: true },
  { name: "Leandro F.", rating: 4, date: "2024-12-28", text: "Kit muito bom, só achei a maleta um pouco pesada, mas é porque vem muita coisa mesmo. Curvadoras e cortador de tubo excelentes.", verified: true },
  { name: "Thiago B.", rating: 5, date: "2024-12-20", text: "Melhor investimento que fiz para minha oficina. Parei de ficar pedindo ferramenta emprestada. Tudo funcionando perfeitamente após 2 meses de uso intenso.", verified: true },
  { name: "Roberto C.", rating: 5, date: "2024-12-15", text: "Produto excelente! Fiz 5 instalações de split com esse kit e não tive nenhum problema. A bomba de vácuo é silenciosa e eficiente.", verified: true },
  { name: "Gustavo N.", rating: 4, date: "2024-12-10", text: "Bom custo-benefício. As mangueiras são de boa qualidade e os manifolds vêm bem calibrados. Recomendo para quem está começando na área.", verified: true },
  { name: "Paulo H.", rating: 5, date: "2024-12-01", text: "Comprei para meu filho que está fazendo curso de refrigeração. Ele ficou impressionado com a qualidade. Kit profissional de verdade.", verified: true },
  { name: "Edson M.", rating: 5, date: "2024-11-25", text: "Já é meu segundo kit, comprei outro para um funcionário. Durabilidade excelente, uso diariamente há mais de 6 meses sem problemas.", verified: true },
];

const esnReviews: Review[] = [
  { name: "Lukas B.", rating: 5, date: "2025-04-10", text: "Bestes Bundle, das ich bisher gekauft habe. Das Designer Whey schmeckt in 'Milk Chocolate' einfach überragend und löst sich perfekt auf.", verified: true },
  { name: "Sarah M.", rating: 5, date: "2025-04-05", text: "Endlich ein komplettes Set für mein Training. Isoclear ist super erfrischend nach dem Gym. Der Preis für 99€ ist unschlagbar.", verified: true },
  { name: "Kevin S.", rating: 5, date: "2025-03-28", text: "Der Crank Booster gibt ordentlich Energie ohne den typischen Crash danach. Versand war extrem schnell, innerhalb von 2 Tagen war alles da.", verified: true },
  { name: "Julia K.", rating: 5, date: "2025-03-20", text: "Top Qualität! Kreatin und Magnesium sind jetzt fester Bestandteil meiner Routine. Die Designer Bars sind der Wahnsinn als Snack.", verified: true },
  { name: "Marc T.", rating: 4, date: "2025-03-15", text: "Alles super, nur die Auswahl der Geschmacksrichtungen war so groß, dass ich mich kaum entscheiden konnte. Geschmacklich 10/10.", verified: true },
  { name: "Dennis H.", rating: 5, date: "2025-03-10", text: "Hammer Preis-Leistungs-Verhältnis. Alles drin was man braucht. ESN ist einfach die beste Marke auf dem Markt.", verified: true },
  { name: "Elena G.", rating: 5, date: "2025-03-05", text: "Die Daily Kapseln und Ashwa+ helfen mir sehr bei der Regeneration. Fühle mich morgens viel fitter.", verified: true },
];

function Stars({ count }: { count: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star key={i} size={14} className={i < count ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground/30"} />
      ))}
    </div>
  );
}

const SOURCE_LANG_BY_PRODUCT = (slug: string): string => {
  if (slug === "kit-ferramentas-refrigeracao") return "pt";
  if (slug === "esn-elite-leistung-combo-1") return "de";
  return "en";
};

async function translateBatch(texts: string[], targetLang: string, cacheKey: string): Promise<string[]> {
  const cached = localStorage.getItem(cacheKey);
  if (cached) {
    try {
      const arr = JSON.parse(cached);
      if (Array.isArray(arr) && arr.length === texts.length) return arr;
    } catch {}
  }
  try {
    const { data, error } = await supabase.functions.invoke("translate-texts", {
      body: { texts, targetLang },
    });
    if (error || !data?.translations) return texts;
    localStorage.setItem(cacheKey, JSON.stringify(data.translations));
    return data.translations;
  } catch {
    return texts;
  }
}

export default function ProductReviews({ productSlug, productId }: { productSlug: string; productId?: string }) {
  const { t } = useTranslation();
  const { language } = useLocalization();
  const [reviews, setReviews] = useState<Review[] | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      let baseReviews: Review[] = [];
      if (productSlug === "kit-ferramentas-refrigeracao") {
        baseReviews = kitReviews;
      } else if (productSlug === "esn-elite-leistung-combo-1") {
        baseReviews = esnReviews;
      } else if (productId) {
        const { data } = await supabase
          .from("product_reviews")
          .select("*")
          .eq("product_id", productId)
          .eq("approved", true)
          .order("created_at", { ascending: false });
        if (data && data.length > 0) {
          baseReviews = data.map((r) => ({
            name: r.reviewer_name,
            rating: r.rating,
            date: r.created_at,
            text: r.review_text || "",
            image: r.review_image_url || undefined,
            verified: r.verified_purchase ?? false,
          }));
        }
      }

      if (baseReviews.length === 0) {
        if (!cancelled) setReviews([]);
        return;
      }

      // Translate if target language differs from source
      const sourceLang = SOURCE_LANG_BY_PRODUCT(productSlug);
      let texts = baseReviews.map((r) => r.text);
      if (language !== sourceLang) {
        const cacheKey = `reviews-tr:${productSlug}:${language}`;
        texts = await translateBatch(texts, language, cacheKey);
      }

      const locale = LOCALE_BY_LANG[language] || "en-US";
      const formatted = baseReviews.map((r, i) => ({
        ...r,
        text: texts[i] || r.text,
        date: new Date(r.date).toLocaleDateString(locale, { day: "2-digit", month: "2-digit", year: "numeric" }),
      }));
      // Reviews with photo first
      formatted.sort((a, b) => (!!a.image !== !!b.image ? (a.image ? -1 : 1) : 0));

      if (!cancelled) setReviews(formatted);
    }

    load();
    return () => { cancelled = true; };
  }, [productId, productSlug, language]);

  if (!reviews || reviews.length === 0) return null;

  const avg = reviews.reduce((s, r) => s + r.rating, 0) / reviews.length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col items-center gap-2 sm:flex-row sm:gap-4">
        <div className="flex items-center gap-2">
          <Stars count={Math.round(avg)} />
          <span className="text-lg font-bold">{avg.toFixed(1)}</span>
        </div>
        <span className="text-sm text-muted-foreground">
          {t("productReviews.basedOn", { count: reviews.length, defaultValue: `Based on ${reviews.length} verified reviews` })}
        </span>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {reviews.map((review, i) => (
          <div key={i} className="rounded-xl border border-border bg-card p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold">{review.name}</p>
                <p className="text-xs text-muted-foreground">{review.date}</p>
              </div>
              <div className="flex flex-col items-end gap-1">
                <Stars count={review.rating} />
                {review.verified && (
                  <span className="rounded bg-lime/20 px-1.5 py-0.5 text-[10px] font-bold text-primary">
                    ✓ {t("productReviews.verified", { defaultValue: "Verified purchase" })}
                  </span>
                )}
              </div>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">{review.text}</p>
            {review.image && (
              <img
                src={review.image}
                alt={`Photo by ${review.name}`}
                className="w-full rounded-lg object-cover aspect-video"
                loading="lazy"
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
