import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface Props {
  images: string[];
  name: string;
  badge?: string;
}

export default function ProductImageGallery({ images, name, badge }: Props) {
  const [selected, setSelected] = useState(0);

  if (images.length === 0) return null;

  const prev = () => setSelected((s) => (s === 0 ? images.length - 1 : s - 1));
  const next = () => setSelected((s) => (s === images.length - 1 ? 0 : s + 1));

  return (
    <div className="space-y-3">
      <div className="relative overflow-hidden rounded-xl bg-muted">
        <img
          src={images[selected]}
          alt={`${name} - Imagem ${selected + 1}`}
          className="aspect-square w-full object-cover"
        />
        {badge && (
          <span className="absolute right-4 top-4 flex items-center gap-1 rounded-full bg-lime px-3 py-1.5 text-xs font-bold text-foreground">
            ✓ {badge}
          </span>
        )}
        {images.length > 1 && (
          <>
            <button
              onClick={prev}
              className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-background/80 p-1.5 shadow-md transition-colors hover:bg-background"
            >
              <ChevronLeft size={20} />
            </button>
            <button
              onClick={next}
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-background/80 p-1.5 shadow-md transition-colors hover:bg-background"
            >
              <ChevronRight size={20} />
            </button>
          </>
        )}
      </div>

      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {images.map((img, i) => (
            <button
              key={i}
              onClick={() => setSelected(i)}
              className={`shrink-0 overflow-hidden rounded-lg border-2 transition-all ${
                i === selected
                  ? "border-primary ring-1 ring-primary"
                  : "border-transparent opacity-60 hover:opacity-100"
              }`}
            >
              <img
                src={img}
                alt={`${name} - Miniatura ${i + 1}`}
                className="h-16 w-16 object-cover sm:h-20 sm:w-20"
                loading="lazy"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
