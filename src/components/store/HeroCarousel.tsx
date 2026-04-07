import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Pause, Play } from "lucide-react";
import hero1 from "@/assets/hero-1.jpg";
import hero2 from "@/assets/hero-2.jpg";
import hero3 from "@/assets/hero-3.jpg";

const slides = [
  {
    image: hero1,
    title: "de utensílios\nà eletrônicos",
    subtitle: "tudo que você precisa\nem um só lugar.",
  },
  {
    image: hero2,
    title: "Ofertas\nImperdíveis",
    subtitle: "até 50% de desconto\nem produtos selecionados.",
  },
  {
    image: hero3,
    title: "Frete Grátis\npara todo Brasil",
    subtitle: "compre agora e receba\nsem custo adicional.",
  },
];

export default function HeroCarousel() {
  const [current, setCurrent] = useState(0);
  const [playing, setPlaying] = useState(true);

  useEffect(() => {
    if (!playing) return;
    const timer = setInterval(() => {
      setCurrent((c) => (c + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [playing]);

  const prev = () => setCurrent((c) => (c - 1 + slides.length) % slides.length);
  const next = () => setCurrent((c) => (c + 1) % slides.length);

  return (
    <div className="relative w-full aspect-[16/7] max-h-[600px] overflow-hidden">
      {slides.map((slide, i) => (
        <div
          key={i}
          className={`absolute inset-0 transition-opacity duration-700 ${
            i === current ? "opacity-100 z-10" : "opacity-0 z-0"
          }`}
        >
          <img
            src={slide.image}
            alt=""
            className="w-full h-full object-cover"
            width={1920}
            height={700}
          />
          {/* Text overlay on right side — matching the reference's right-aligned text */}
          <div className="absolute inset-0 flex items-center justify-end">
            <div className="pr-8 md:pr-16 lg:pr-24 text-right max-w-[50%]">
              <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-heading font-bold text-white whitespace-pre-line leading-[1.1] drop-shadow-lg">
                {slide.title}
              </h2>
              <p className="text-white/90 mt-2 md:mt-4 text-xs sm:text-sm md:text-base lg:text-lg whitespace-pre-line drop-shadow-md">
                {slide.subtitle}
              </p>
            </div>
          </div>
        </div>
      ))}

      {/* Navigation arrow — left */}
      <button
        onClick={prev}
        className="absolute left-3 md:left-6 top-1/2 -translate-y-1/2 z-20 text-white/70 hover:text-white transition-colors"
        aria-label="Slide anterior"
      >
        <ChevronLeft size={32} />
      </button>

      {/* Navigation arrow — right */}
      <button
        onClick={next}
        className="absolute right-3 md:right-6 top-1/2 -translate-y-1/2 z-20 text-white/70 hover:text-white transition-colors"
        aria-label="Próximo slide"
      >
        <ChevronRight size={32} />
      </button>

      {/* Dots — bottom center */}
      <div className="absolute bottom-4 md:bottom-6 left-1/2 -translate-x-1/2 z-20 flex gap-2">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            className={`h-[3px] rounded-full transition-all duration-300 ${
              i === current ? "w-10 bg-white" : "w-6 bg-white/40"
            }`}
            aria-label={`Slide ${i + 1}`}
          />
        ))}
      </div>

      {/* Pause/Play button — bottom right like reference */}
      <button
        onClick={() => setPlaying(!playing)}
        className="absolute bottom-4 right-4 z-20 text-white/60 hover:text-white transition-colors"
        aria-label={playing ? "Pausar" : "Reproduzir"}
      >
        {playing ? <Pause size={18} /> : <Play size={18} />}
      </button>
    </div>
  );
}
