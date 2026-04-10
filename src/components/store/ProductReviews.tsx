import { Star } from "lucide-react";
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

const defaultReviews: Review[] = [
  {
    name: "Carlos M.",
    rating: 5,
    date: "12/03/2025",
    text: "Kit completo demais! Chegou tudo certinho, ferramentas de boa qualidade. A bomba de vácuo funciona perfeitamente. Recomendo para quem trabalha na área.",
    image: reviewImg1,
    verified: true,
  },
  {
    name: "Rafael S.",
    rating: 5,
    date: "28/02/2025",
    text: "Manifold excelente, mangueiras de qualidade profissional. Já usei em 3 instalações e tudo funcionando perfeitamente. Melhor custo-benefício que encontrei.",
    image: reviewImg2,
    verified: true,
  },
  {
    name: "Anderson P.",
    rating: 5,
    date: "15/02/2025",
    text: "Maleta organizadora top, tudo encaixado perfeitamente. Flangeador com rotação 360° faz um acabamento impecável. Vale cada centavo.",
    image: reviewImg3,
    verified: true,
  },
  {
    name: "Marcos L.",
    rating: 4,
    date: "03/02/2025",
    text: "Ferramentas muito boas para o preço. Bomba de vácuo potente, manifolds bem calibrados. O maçarico é potente e as curvadoras facilitam muito o trabalho.",
    image: reviewImg4,
    verified: true,
  },
  {
    name: "João V.",
    rating: 5,
    date: "20/01/2025",
    text: "Comprei e não me arrependi! Kit super completo, veio tudo que prometeram. Já estava precisando trocar minhas ferramentas antigas e esse kit resolveu tudo.",
    image: reviewImg5,
    verified: true,
  },
];

function Stars({ count }: { count: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          size={14}
          className={i < count ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground/30"}
        />
      ))}
    </div>
  );
}

export default function ProductReviews({ productSlug }: { productSlug: string }) {
  // Reviews with photos are only for the kit product
  if (productSlug !== "kit-ferramentas-refrigeracao") {
    return null;
  }

  const reviews = defaultReviews;
  const avg = reviews.reduce((s, r) => s + r.rating, 0) / reviews.length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col items-center gap-2 sm:flex-row sm:gap-4">
        <div className="flex items-center gap-2">
          <Stars count={Math.round(avg)} />
          <span className="text-lg font-bold">{avg.toFixed(1)}</span>
        </div>
        <span className="text-sm text-muted-foreground">
          Baseado em {reviews.length} avaliações verificadas
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
                    ✓ Compra verificada
                  </span>
                )}
              </div>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">{review.text}</p>
            {review.image && (
              <img
                src={review.image}
                alt={`Foto do produto por ${review.name}`}
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
