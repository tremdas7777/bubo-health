import { useState, useEffect, memo } from "react";
import { Link } from "react-router-dom";
import { ChevronLeft, ChevronRight, Pause, Play } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useIsMobile } from "@/hooks/use-mobile";
import hero1 from "@/assets/hero-1.jpg";
import hero2 from "@/assets/hero-2.jpg";
import hero3 from "@/assets/hero-3.jpg";
import heroEsn from "@/assets/hero-esn-combo.jpg";
import hero1Mobile from "@/assets/hero-1-mobile.jpg";
import hero2Mobile from "@/assets/hero-2-mobile.jpg";
import hero3Mobile from "@/assets/hero-3-mobile.jpg";
import heroEsnMobile from "@/assets/hero-esn-combo-mobile.jpg";

const desktopSlides = [hero1, hero2, hero3, heroEsn];
const mobileSlides = [hero1Mobile, hero2Mobile, hero3Mobile, heroEsnMobile];

const SLIDE_KEYS = ["tech", "sports", "beauty", "esn"] as const;
const SLIDE_LINKS = ["/colecao/electronics", "/colecao/sports", "/colecao/health-beauty", "/produto/esn-elite-leistung-combo-1"];

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
    <div className={`relative w-full overflow-hidden ${isMobile ? "aspect-[9/16] max-h-[85vh]" : "aspect-[16/7] max-h-[600px]"}`}>
      {slides.map((slide, i) => {
        const slideKey = SLIDE_KEYS[i];
        const align = isMobile ? "items-end pb-24" : i === 1 ? "items-center justify-start pl-12 md:pl-24" : "items-center justify-end pr-12 md:pr-24";
        const textAlign = isMobile ? "text-center" : i === 1 ? "text-left" : "text-right";
        return (
          <div
            key={i}
            className={`absolute inset-0 transition-opacity duration-700 ${
              i === current ? "opacity-100 z-10" : "opacity-0 z-0"
            }`}
          >
            <img
              src={slide}
              alt={t(`hero.${slideKey}.alt`)}
              className="w-full h-full object-cover"
              width={isMobile ? 768 : 1920}
              height={isMobile ? 1365 : 864}
              loading={i === 0 ? "eager" : "lazy"}
              decoding={i === 0 ? "sync" : "async"}
              fetchPriority={i === 0 ? "high" : "low"}
            />
            {/* Overlay gradient for legibility */}
            {slideKey !== "esn" && (
              <div
                className={`absolute inset-0 ${
                  isMobile
                    ? "bg-gradient-to-t from-black/70 via-black/30 to-transparent"
                    : "bg-gradient-to-r from-black/50 via-black/10 to-transparent"
                }`}
                aria-hidden="true"
              />
            )}
            {/* Translatable text overlay - hidden for slides with embedded text */}
            {slideKey !== "esn" && (
              <div className={`absolute inset-0 z-[5] flex justify-center ${align}`}>
                <div className={`max-w-xl px-6 ${textAlign}`}>
                  <p className="text-white/90 text-[10px] md:text-xs font-bold uppercase tracking-[0.25em] mb-2 md:mb-3 drop-shadow-lg">
                    {t(`hero.${slideKey}.eyebrow`)}
                  </p>
                  <h1 className="text-white text-3xl md:text-5xl lg:text-6xl font-heading font-bold leading-tight mb-3 md:mb-5 drop-shadow-2xl">
                    {t(`hero.${slideKey}.title`)}
                  </h1>
                  <p className="text-white/90 text-sm md:text-base lg:text-lg mb-5 md:mb-7 drop-shadow-lg">
                    {t(`hero.${slideKey}.subtitle`)}
                  </p>
                  <Link
                    to={SLIDE_LINKS[i]}
                    className="inline-block bg-primary hover:bg-primary/90 text-primary-foreground text-xs md:text-sm font-bold uppercase tracking-wider px-7 md:px-9 py-3 md:py-4 rounded-full transition-all hover:scale-105 shadow-2xl"
                  >
                    {t(`hero.${slideKey}.cta`)}
                  </Link>
                </div>
              </div>
            )}
            {slideKey === "esn" && (
              <Link to={SLIDE_LINKS[i]} className="absolute inset-0 z-[5]" aria-label="ESN Elite Leistung Combo" />
            )}
          </div>
        );
      })}

      <button
        onClick={prev}
        className="absolute left-3 md:left-6 top-1/2 -translate-y-1/2 z-20 text-white/70 hover:text-white transition-colors"
        aria-label={t("common.previous")}
      >
        <ChevronLeft size={32} />
      </button>

      <button
        onClick={next}
        className="absolute right-3 md:right-6 top-1/2 -translate-y-1/2 z-20 text-white/70 hover:text-white transition-colors"
        aria-label={t("common.next")}
      >
        <ChevronRight size={32} />
      </button>

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

      <button
        onClick={() => setPlaying(!playing)}
        className="absolute bottom-4 right-4 z-20 text-white/60 hover:text-white transition-colors"
        aria-label={playing ? t("common.pause") : t("common.play")}
      >
        {playing ? <Pause size={18} /> : <Play size={18} />}
      </button>
    </div>
  );
});
