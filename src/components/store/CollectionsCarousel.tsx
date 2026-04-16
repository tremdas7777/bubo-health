import { useRef, memo } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import { useDbCollections, useDbProducts } from "@/hooks/useProducts";

export default memo(function CollectionsCarousel() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const { data: collections = [] } = useDbCollections();
  const { data: products = [] } = useDbProducts();

  const fallbackImages: Record<string, string> = {};
  for (const p of products) {
    if (p.category && !fallbackImages[p.category] && p.image) {
      fallbackImages[p.category] = p.image;
    }
  }

  const scroll = (dir: "left" | "right") => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollBy({ left: dir === "left" ? -280 : 280, behavior: "smooth" });
  };

  if (collections.length === 0) return null;

  return (
    <section className="py-10 md:py-14">
      <div className="container mx-auto px-4">
        <h2 className="text-xl md:text-2xl lg:text-3xl font-heading font-semibold text-center mb-8">
          Nossas Coleções
        </h2>

        <div className="relative group/nav">
          <button
            onClick={() => scroll("left")}
            className="absolute -left-2 top-1/2 -translate-y-1/2 z-10 bg-background/90 border border-border rounded-full p-1.5 shadow-md opacity-0 group-hover/nav:opacity-100 transition-opacity hidden md:flex"
            aria-label="Anterior"
          >
            <ChevronLeft size={18} />
          </button>

          <div
            ref={scrollRef}
            className="flex gap-4 overflow-x-auto pb-2 snap-x snap-mandatory"
            style={{
              scrollbarWidth: "none",
              msOverflowStyle: "none",
              WebkitOverflowScrolling: "touch",
            }}
          >
            {collections.map((col) => (
              <Link
                key={col.id}
                to={`/colecao/${col.slug}`}
                className="flex-shrink-0 w-[160px] md:w-[185px] group/card snap-start"
              >
                <div className="relative overflow-hidden rounded-xl aspect-[3/4] bg-muted">
                  {(col.image || fallbackImages[col.slug]) && (
                    <img
                      src={col.image || fallbackImages[col.slug]}
                      alt={col.name}
                      className="w-full h-full object-cover group-hover/card:scale-110 transition-transform duration-500"
                      loading="lazy"
                      decoding="async"
                      draggable={false}
                      width="185"
                      height="247"
                    />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                  <div className="absolute bottom-3 left-0 right-0 px-2">
                    <h3 className="text-white font-heading font-medium text-sm text-center drop-shadow-sm">
                      {col.name}
                    </h3>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          <button
            onClick={() => scroll("right")}
            className="absolute -right-2 top-1/2 -translate-y-1/2 z-10 bg-background/90 border border-border rounded-full p-1.5 shadow-md opacity-0 group-hover/nav:opacity-100 transition-opacity hidden md:flex"
            aria-label="Próximo"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>
    </section>
  );
});
