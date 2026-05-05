import { useState, useEffect, useRef, useMemo } from "react";
import { Search, X } from "lucide-react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useDbProducts } from "@/hooks/useProducts";
import { useCurrency } from "@/contexts/LocalizationContext";
import { Input } from "@/components/ui/input";

interface SearchOverlayProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SearchOverlay({ isOpen, onClose }: SearchOverlayProps) {
  const { t } = useTranslation();
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const { data: products = [] } = useDbProducts();
  const { formatPrice } = useCurrency();

  useEffect(() => {
    if (isOpen) {
      setQuery("");
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) document.addEventListener("keydown", handleEsc);
    return () => document.removeEventListener("keydown", handleEsc);
  }, [isOpen, onClose]);

  const results = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase();
    return products
      .filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q)
      )
      .slice(0, 8);
  }, [query, products]);

  if (!isOpen) return null;

  const resultsKey = results.length === 1 ? "search.results" : "search.resultsPlural";

  return (
    <div className="fixed inset-0 z-50 bg-background/95 backdrop-blur-sm">
      <div className="container mx-auto px-4 pt-6">
        <div className="flex items-center gap-3 max-w-2xl mx-auto">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              ref={inputRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t("search.placeholder")}
              className="pl-11 h-12 text-base"
            />
          </div>
          <button onClick={onClose} className="p-2 text-muted-foreground hover:text-foreground transition-colors" aria-label={t("search.close")}>
            <X size={24} />
          </button>
        </div>

        <div className="max-w-2xl mx-auto mt-6">
          {query.trim() && results.length === 0 && (
            <p className="text-center text-muted-foreground py-12">
              {t("search.noResults", { query })}
            </p>
          )}

          {results.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs text-muted-foreground mb-3">
                {t(resultsKey, { count: results.length })}
              </p>
              {results.map((product) => (
                <Link
                  key={product.id}
                  to={`/produto/${product.slug}`}
                  onClick={onClose}
                  className="flex items-center gap-4 p-3 rounded-lg hover:bg-muted/50 transition-colors border border-transparent hover:border-border"
                >
                  <img src={product.image} alt={product.name} className="w-14 h-14 rounded-xl object-cover flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{product.name}</p>
                    <p className="text-xs text-muted-foreground truncate">{product.category}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-sm font-bold text-primary">{formatPrice(Math.round(product.price * 100))}</p>
                    {product.compareAtPrice && (
                      <p className="text-[10px] text-muted-foreground line-through">
                        {formatPrice(Math.round(product.compareAtPrice * 100))}
                      </p>
                    )}
                  </div>
                </Link>
              ))}
              {query.trim() && (
                <Link
                  to={`/produtos?q=${encodeURIComponent(query)}`}
                  onClick={onClose}
                  className="block text-center text-sm text-primary hover:underline py-3"
                >
                  {t("search.viewAllResults")}
                </Link>
              )}
            </div>
          )}

          {!query.trim() && (
            <p className="text-center text-muted-foreground py-12 text-sm">
              {t("search.typeToSearch")}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
