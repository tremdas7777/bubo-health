import { memo } from "react";
import { Star, Quote } from "lucide-react";

const testimonials = [
  {
    name: "Maria C.",
    text: "Entrega super rápida e o produto veio exatamente como na foto. Já é minha segunda compra!",
    rating: 5,
    product: "Kit Ferramentas Refrigeração",
  },
  {
    name: "Lucas R.",
    text: "Fiquei impressionado com a qualidade. O preço é muito bom comparado a outras lojas. Recomendo!",
    rating: 5,
    product: "Smartwatch Esportivo Pro",
  },
  {
    name: "Juliana S.",
    text: "Atendimento excelente pelo WhatsApp. Tive uma dúvida e responderam na hora. Produto top!",
    rating: 5,
    product: "Massageador Muscular",
  },
  {
    name: "André M.",
    text: "Comprei pra presentear e chegou antes do prazo. Embalagem muito bem feita. Parabéns!",
    rating: 4,
    product: "Sombra Delineadora Arábica",
  },
];

export default memo(function HomeReviews() {
  return (
    <section className="py-10 bg-muted/30">
      <div className="container mx-auto px-4">
        <h2 className="text-xl md:text-2xl font-heading font-semibold text-center mb-8">
          O que nossos clientes dizem
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 max-w-[1100px] mx-auto">
          {testimonials.map((t, i) => (
            <div key={i} className="bg-card rounded-xl border border-border p-5 flex flex-col gap-3">
              <Quote size={20} className="text-primary/40" />
              <p className="text-sm text-foreground/80 leading-relaxed flex-1">
                "{t.text}"
              </p>
              <div className="flex gap-0.5">
                {Array.from({ length: 5 }).map((_, j) => (
                  <Star
                    key={j}
                    size={14}
                    className={j < t.rating ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground/30"}
                  />
                ))}
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">{t.name}</p>
                <p className="text-[11px] text-muted-foreground">sobre {t.product}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
});
