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

const buboReviews: Record<string, Review[]> = {
  "bubo-sleep": [
    { name: "Mariana S.", rating: 5, date: "2025-05-10", text: "Minha rotina mudou completamente. Durmo em 15 minutos!", verified: true },
    { name: "Joana F.", rating: 5, date: "2025-05-08", text: "Acordo muito mais disposta. Recomendo!", verified: true },
    { name: "Carlos T.", rating: 5, date: "2025-05-05", text: "Finalmente algo que funciona sem deixar grogue no dia seguinte.", verified: true },
    { name: "Luciana B.", rating: 5, date: "2025-05-02", text: "Sabor de maracujá é delicioso. Amo minhas gummies!", verified: true },
    { name: "Pedro H.", rating: 4, date: "2025-04-30", text: "Muito bom, entrega rápida e produto lacrado.", verified: true },
    { name: "Ana Paula R.", rating: 5, date: "2025-04-28", text: "Não vivo mais sem. Melhor melatonina que já tomei.", verified: true },
    { name: "Ricardo G.", rating: 5, date: "2025-04-25", text: "Minha esposa também está usando e adorando.", verified: true },
    { name: "Sandra M.", rating: 5, date: "2025-04-22", text: "Ajuda muito a relaxar depois de um dia estressante.", verified: true },
    { name: "Bruna L.", rating: 5, date: "2025-04-20", text: "Perfeito para quem tem insônia leve.", verified: true },
    { name: "Felipe J.", rating: 4, date: "2025-04-18", text: "Gostei bastante do resultado.", verified: true },
    { name: "Tatiana K.", rating: 5, date: "2025-04-15", text: "Produto de altíssima qualidade. Parabéns!", verified: true },
    { name: "Marcelo D.", rating: 5, date: "2025-04-12", text: "O sono é profundo e reparador.", verified: true },
    { name: "Gabriela V.", rating: 5, date: "2025-04-10", text: "Adoro o ritual de comer minha gummie antes de dormir.", verified: true },
    { name: "Juliana O.", rating: 5, date: "2025-04-08", text: "Resultado incrível desde a primeira noite.", verified: true },
    { name: "Roberto F.", rating: 5, date: "2025-04-05", text: "Entrega super rápida, chegou em 3 dias.", verified: true },
  ],
  "bubo-energy": [
    { name: "Rafael M.", rating: 5, date: "2025-05-12", text: "Energia pura! Tomo antes de ir para o trabalho.", verified: true },
    { name: "Lucas P.", rating: 5, date: "2025-05-10", text: "Melhor que café, não me deixa ansioso.", verified: true },
    { name: "Fernanda G.", rating: 5, date: "2025-05-07", text: "Foco total nos estudos. Amei!", verified: true },
    { name: "Gustavo R.", rating: 5, date: "2025-05-05", text: "Uso como pré-treino e o pump é excelente.", verified: true },
    { name: "Beatriz S.", rating: 4, date: "2025-05-02", text: "Gostinho de laranja muito bom.", verified: true },
    { name: "Diego C.", rating: 5, date: "2025-04-29", text: "Me sinto muito mais produtivo durante o dia.", verified: true },
    { name: "Vanessa A.", rating: 5, date: "2025-04-27", text: "Adeus preguiça matinal!", verified: true },
    { name: "Rodrigo T.", rating: 5, date: "2025-04-24", text: "Excelente para quem trabalha em home office.", verified: true },
    { name: "Amanda L.", rating: 5, date: "2025-04-21", text: "Qualidade nota 10.", verified: true },
    { name: "Igor B.", rating: 5, date: "2025-04-19", text: "Já é meu segundo pote. Recomendo muito.", verified: true },
    { name: "Clara M.", rating: 4, date: "2025-04-16", text: "Energia duradoura, muito bom.", verified: true },
    { name: "Matheus F.", rating: 5, date: "2025-04-14", text: "O sabor é surpreendente.", verified: true },
    { name: "Camila R.", rating: 5, date: "2025-04-11", text: "Me ajuda a manter o pique até o final do dia.", verified: true },
    { name: "Thiago S.", rating: 5, date: "2025-04-09", text: "Vale cada centavo pela disposição que dá.", verified: true },
    { name: "Letícia N.", rating: 5, date: "2025-04-06", text: "Chegou antes do prazo, produto excelente.", verified: true },
  ],
  "bubo-slim": [
    { name: "Carla T.", rating: 5, date: "2025-05-15", text: "Já perdi 3kg sem sofrimento. Ajuda muito no controle do apetite.", verified: true },
    { name: "Juliana R.", rating: 5, date: "2025-05-13", text: "A vontade de comer doce sumiu! Impressionante.", verified: true },
    { name: "Monique S.", rating: 5, date: "2025-05-11", text: "O sabor de maçã verde é viciante. Adorei!", verified: true },
    { name: "Patrícia B.", rating: 5, date: "2025-05-08", text: "Sinto meu metabolismo muito mais acelerado.", verified: true },
    { name: "Renata L.", rating: 4, date: "2025-05-06", text: "Produto de confiança, resultados aparecendo.", verified: true },
    { name: "Fabiana M.", rating: 5, date: "2025-05-03", text: "Estou me sentindo muito menos inchada.", verified: true },
    { name: "Daniela G.", rating: 5, date: "2025-05-01", text: "Melhor aliado na minha dieta.", verified: true },
    { name: "Aline V.", rating: 5, date: "2025-04-28", text: "Resultados reais! Recomendo para todas as amigas.", verified: true },
    { name: "Cristina O.", rating: 5, date: "2025-04-26", text: "Auxilia muito a segurar a fome à noite.", verified: true },
    { name: "Sônia F.", rating: 5, date: "2025-04-23", text: "Gostei muito da composição natural.", verified: true },
    { name: "Milena D.", rating: 4, date: "2025-04-21", text: "Entrega ok, produto conforme o anúncio.", verified: true },
    { name: "Priscila S.", rating: 5, date: "2025-04-18", text: "Sabor maravilhoso e cumpre o que promete.", verified: true },
    { name: "Viviane K.", rating: 5, date: "2025-04-15", text: "Minha calça já está mais larga!", verified: true },
    { name: "Kelly P.", rating: 5, date: "2025-04-13", text: "Perfeito para quem quer emagrecer com saúde.", verified: true },
    { name: "Lúcia H.", rating: 5, date: "2025-04-10", text: "Estou no segundo pote e muito feliz com o resultado.", verified: true },
  ],
  "combo-bubo-health": [
    { name: "Lucas P.", rating: 5, date: "2025-05-14", text: "O combo é a melhor opção. Cuidado completo!", verified: true },
    { name: "Marcos V.", rating: 5, date: "2025-05-11", text: "Parei de comprar suplementos separados, esse combo resolve tudo.", verified: true },
    { name: "Julia B.", rating: 5, date: "2025-05-09", text: "Economizei muito comprando o kit completo.", verified: true },
    { name: "André S.", rating: 5, date: "2025-05-06", text: "Uso os três e me sinto outra pessoa.", verified: true },
    { name: "Larissa F.", rating: 5, date: "2025-05-04", text: "Entrega impecável e produtos maravilhosos.", verified: true },
    { name: "Bruno G.", rating: 5, date: "2025-05-01", text: "Recomendo para quem quer uma transformação real.", verified: true },
    { name: "Sophia M.", rating: 5, date: "2025-04-29", text: "Minha família toda está usando agora.", verified: true },
    { name: "Arthur R.", rating: 5, date: "2025-04-26", text: "O melhor investimento em saúde que já fiz.", verified: true },
    { name: "Elena T.", rating: 5, date: "2025-04-24", text: "Adorei os sabores e os resultados.", verified: true },
    { name: "Gabriel O.", rating: 5, date: "2025-04-21", text: "Muito prático ter tudo em gummies.", verified: true },
    { name: "Hugo C.", rating: 4, date: "2025-04-19", text: "Qualidade premium, vale muito a pena.", verified: true },
    { name: "Isabela D.", rating: 5, date: "2025-04-16", text: "Os potes são lindos e o conteúdo é melhor ainda.", verified: true },
    { name: "Kevin J.", rating: 5, date: "2025-04-14", text: "Fiz o tratamento de 3 meses e os resultados são visíveis.", verified: true },
    { name: "Laura N.", rating: 5, date: "2025-04-11", text: "Excelente atendimento e pós-venda.", verified: true },
    { name: "Nando K.", rating: 5, date: "2025-04-09", text: "Produtos de primeira linha. Bubo é top!", verified: true },
  ]
};

const esnReviews: Review[] = [
  { name: "Maximilian W.", rating: 5, date: "2025-04-10", text: "Bestes Bundle, das ich bisher gekauft habe. Das Designer Whey schmeckt in 'Milk Chocolate' einfach überragend und löst sich perfekt auf.", verified: true },
  { name: "Laura S.", rating: 5, date: "2025-04-05", text: "Endlich ein komplettes Set für mein Training. Isoclear ist super erfrischend nach dem Gym. Der Preis für 99€ ist unschlagbar.", verified: true },
  { name: "Alexander K.", rating: 5, date: "2025-03-28", text: "Der Crank Booster gibt ordentlich Energie ohne den typischen Crash danach. Versand war extrem schnell, innerhalb von 2 Tagen war alles da.", verified: true },
  { name: "Katharina M.", rating: 5, date: "2025-03-20", text: "Top Qualität! Kreatin und Magnesium sind jetzt fester Bestandteil meiner Routine. Die Designer Bars sind der Wahnsinn als Snack.", verified: true },
  { name: "Christian L.", rating: 4, date: "2025-03-15", text: "Alles super, nur die Auswahl der Geschmacksrichtungen war so groß, dass ich mich kaum entscheiden konnte. Geschmacklich 10/10.", verified: true },
  { name: "Sebastian H.", rating: 5, date: "2025-03-10", text: "Hammer Preis-Leistungs-Verhältnis. Alles drin was man braucht. ESN ist einfach die beste Marke auf dem Markt.", verified: true },
  { name: "Leonie G.", rating: 5, date: "2025-03-05", text: "Die Daily Kapseln und Ashwa+ helfen mir sehr bei der Regeneration. Fühle mich morgens viel fitter.", verified: true },
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
  if (slug === "kit-ferramentas-refrigeracao" || slug.includes("bubo") || slug.includes("combo")) return "pt";
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
      } else if (buboReviews[productSlug]) {
        baseReviews = buboReviews[productSlug];
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
