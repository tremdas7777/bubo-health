import { useState, useEffect, memo } from "react";
import { Link } from "react-router-dom";
import { ChevronLeft, ChevronRight, Pause, Play } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useIsMobile } from "@/hooks/use-mobile";

const desktopSlides = ["/products/bubo-combo.jpg", "/products/bubo-sleep.jpg", "/products/bubo-energy.jpg", "/products/bubo-slim.jpg"];
const mobileSlides = ["/products/bubo-combo.jpg", "/products/bubo-sleep.jpg", "/products/bubo-energy.jpg", "/products/bubo-slim.jpg"];

const SLIDE_LINKS = ["/produto/combo-bubo-health", "/produto/bubo-sleep", "/produto/bubo-energy", "/produto/bubo-slim"];

export default memo(function HeroCarousel() {
  const { t } = useTranslation();
  const [current, setCurrent] = useState(0);
  const [playing, setPlaying] = useState(true);
  const isMobile = useIsMobile();
  const slides = isMobile ? mobileSlides : desktopSlides;

  useEffect(() => {
    if (!playing) return;
    const timer = setInterval(() => {
      setCurrent((c) => (c + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [playing, slides.length]);

  const prev = () => setCurrent((c) => (c - 1 + slides.length) % slides.length);
  const next = () => setCurrent((c) => (c + 1) % slides.length);

  return (
    <div className={`relative w-full overflow-hidden bg-primary/5 ${isMobile ? "aspect-[4/5] max-h-[85vh]" : "aspect-[21/9] max-h-[600px]"}`}>
      {slides.map((slide, i) => {
        return (
          <div
            key={i}
            className={`absolute inset-0 flex items-center justify-center transition-opacity duration-700 ${
              i === current ? "opacity-100 z-10" : "opacity-0 z-0"
            }`}
          >
            <Link to={SLIDE_LINKS[i]} className="absolute inset-0 z-[5]" aria-label="Bubo Health Product">
               <img
                src={slide}
                alt="Bubo Health"
                className="w-full h-full object-contain md:object-cover mix-blend-multiply md:mix-blend-normal p-4 md:p-0"
                loading={i === 0 ? "eager" : "lazy"}
                decoding={i === 0 ? "sync" : "async"}
                fetchPriority={i === 0 ? "high" : "low"}
              />
            </Link>
          </div>
        );
      })}

      <button
        onClick={prev}
        className="absolute left-3 md:left-6 top-1/2 -translate-y-1/2 z-20 text-foreground/70 hover:text-primary transition-colors bg-background/50 rounded-full p-2"
        aria-label={t("common.previous")}
      >
        <ChevronLeft size={24} />
      </button>

      <button
        onClick={next}
        className="absolute right-3 md:right-6 top-1/2 -translate-y-1/2 z-20 text-foreground/70 hover:text-primary transition-colors bg-background/50 rounded-full p-2"
        aria-label={t("common.next")}
      >
        <ChevronRight size={24} />
      </button>

      <div className="absolute bottom-4 md:bottom-6 left-1/2 -translate-x-1/2 z-20 flex gap-2">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            className={`h-[4px] rounded-full transition-all duration-300 ${
              i === current ? "w-10 bg-primary" : "w-6 bg-primary/40"
            }`}
            aria-label={`Slide ${i + 1}`}
          />
        ))}
      </div>

      <button
        onClick={() => setPlaying(!playing)}
        className="absolute bottom-4 right-4 z-20 text-foreground/60 hover:text-primary transition-colors bg-background/50 rounded-full p-2"
        aria-label={playing ? t("common.pause") : t("common.play")}
      >
        {playing ? <Pause size={14} /> : <Play size={14} />}
      </button>
    </div>
  );
});
