import { useRef, useState, useCallback, memo } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import { collections } from "@/data/store";

export default memo(function CollectionsCarousel() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);
  const startX = useRef(0);
  const scrollLeft = useRef(0);
  const hasMoved = useRef(false);

  const scroll = (dir: "left" | "right") => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollBy({ left: dir === "left" ? -280 : 280, behavior: "smooth" });
  };

  const onPointerDown = useCallback((e: React.PointerEvent) => {
    if (!scrollRef.current) return;
    isDragging.current = true;
    hasMoved.current = false;
    startX.current = e.clientX;
    scrollLeft.current = scrollRef.current.scrollLeft;
    scrollRef.current.setPointerCapture(e.pointerId);
    scrollRef.current.style.cursor = "grabbing";
  }, []);

  const onPointerMove = useCallback((e: React.PointerEvent) => {
    if (!isDragging.current || !scrollRef.current) return;
    e.preventDefault();
    const delta = e.clientX - startX.current;
    if (Math.abs(delta) > 5) hasMoved.current = true;
    scrollRef.current.scrollLeft = scrollLeft.current - delta;
  }, []);

  const onPointerUp = useCallback((e: React.PointerEvent) => {
    if (!scrollRef.current) return;
    isDragging.current = false;
    scrollRef.current.releasePointerCapture(e.pointerId);
    scrollRef.current.style.cursor = "grab";
  }, []);

  const onClickCapture = useCallback((e: React.MouseEvent) => {
    if (hasMoved.current) {
      e.preventDefault();
      e.stopPropagation();
    }
  }, []);

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
            className="flex gap-4 overflow-x-auto pb-2 select-none"
            style={{
              scrollbarWidth: "none",
              msOverflowStyle: "none",
              cursor: "grab",
              WebkitOverflowScrolling: "touch",
            }}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerLeave={onPointerUp}
          >
            {collections.map((col) => (
              <Link
                key={col.id}
                to={`/colecao/${col.slug}`}
                className="flex-shrink-0 w-[160px] md:w-[185px] group/card"
                onClickCapture={onClickCapture}
                draggable={false}
              >
                <div className="relative overflow-hidden rounded-xl aspect-[3/4]">
                  <img
                    src={col.image}
                    alt={col.name}
                    className="w-full h-full object-cover group-hover/card:scale-110 transition-transform duration-500 pointer-events-none"
                    loading="lazy"
                    decoding="async"
                    draggable={false}
                  />
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
