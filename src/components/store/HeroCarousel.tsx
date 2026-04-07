import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";

const slides = [
  {
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=1920&h=700&fit=crop",
    title: "de utensílios\nà eletrônicos",
    subtitle: "tudo que você precisa\nem um só lugar.",
    link: "/produtos",
  },
  {
    image: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1920&h=700&fit=crop",
    title: "Ofertas\nImperdíveis",
    subtitle: "até 50% de desconto\nem produtos selecionados.",
    link: "/produtos",
  },
  {
    image: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=1920&h=700&fit=crop",
    title: "Frete Grátis\npara todo Brasil",
    subtitle: "compre agora e receba\nsem custo adicional.",
    link: "/produtos",
  },
];

export default function HeroCarousel() {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((c) => (c + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const prev = () => setCurrent((c) => (c - 1 + slides.length) % slides.length);
  const next = () => setCurrent((c) => (c + 1) % slides.length);

  return (
    <div className="relative w-full h-[300px] sm:h-[400px] md:h-[500px] lg:h-[600px] overflow-hidden bg-primary/10">
      {slides.map((slide, i) => (
        <div
          key={i}
          className={`absolute inset-0 transition-opacity duration-700 ${
            i === current ? "opacity-100" : "opacity-0"
          }`}
        >
          <img
            src={slide.image}
            alt={slide.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-primary/70 to-transparent" />
          <div className="absolute inset-0 flex items-center">
            <div className="container mx-auto px-4">
              <div className="max-w-lg ml-auto text-right">
                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-heading font-bold text-white whitespace-pre-line leading-tight">
                  {slide.title}
                </h2>
                <p className="text-white/80 mt-3 text-sm sm:text-base lg:text-lg whitespace-pre-line">
                  {slide.subtitle}
                </p>
                <Link
                  to={slide.link}
                  className="inline-block mt-6 bg-lime text-foreground font-semibold px-8 py-3 rounded-lg hover:opacity-90 transition-opacity"
                >
                  Ver Ofertas
                </Link>
              </div>
            </div>
          </div>
        </div>
      ))}

      {/* Controls */}
      <button
        onClick={prev}
        className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/20 backdrop-blur-sm rounded-full p-2 text-white hover:bg-white/30 transition"
      >
        <ChevronLeft size={24} />
      </button>
      <button
        onClick={next}
        className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/20 backdrop-blur-sm rounded-full p-2 text-white hover:bg-white/30 transition"
      >
        <ChevronRight size={24} />
      </button>

      {/* Dots */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            className={`w-10 h-1 rounded-full transition-all ${
              i === current ? "bg-white" : "bg-white/40"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
