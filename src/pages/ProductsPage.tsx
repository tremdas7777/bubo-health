import { useState, useMemo, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Search } from "lucide-react";
import Layout from "@/components/store/Layout";
import ProductCard from "@/components/store/ProductCard";
import { useDbProducts, useDbCollections } from "@/hooks/useProducts";
import PageHead from "@/components/seo/PageHead";
import { Input } from "@/components/ui/input";

export default function ProductsPage() {
  const { data: products = [] } = useDbProducts();
  const { data: collections = [] } = useDbCollections();
  const [sortBy, setSortBy] = useState("default");
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterPriceRange, setFilterPriceRange] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const q = searchParams.get("q");
    if (q) setSearchQuery(q);
  }, [searchParams]);

  const filtered = useMemo(() => {
    let list = [...products];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q)
      );
    }

    if (filterCategory !== "all") {
      list = list.filter((p) => p.category === filterCategory);
    }

    if (filterPriceRange === "0-100") list = list.filter((p) => p.price <= 100);
    else if (filterPriceRange === "100-200") list = list.filter((p) => p.price > 100 && p.price <= 200);
    else if (filterPriceRange === "200+") list = list.filter((p) => p.price > 200);

    if (sortBy === "price-asc") list.sort((a, b) => a.price - b.price);
    if (sortBy === "price-desc") list.sort((a, b) => b.price - a.price);
    if (sortBy === "name-asc") list.sort((a, b) => a.name.localeCompare(b.name));

    return list;
  }, [products, sortBy, filterCategory, filterPriceRange, searchQuery]);

  return (
    <Layout>
      <PageHead
        title="Todos os Produtos | Bubo Health"
        description="Explore all Bubo Health products. Free shipping worldwide and secure card payment."
        canonical="https://snug-code-space.lovable.app/produtos"
      />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl md:text-3xl font-heading font-bold text-center mb-2">Produtos</h1>

        <div className="relative max-w-md mx-auto my-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar produtos..."
            className="pl-10"
          />
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 my-6 border-y border-border py-4">
          <div className="flex items-center gap-3 text-sm flex-wrap">
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="border border-border rounded-lg px-3 py-1.5 text-sm bg-background"
            >
              <option value="all">Todas as categorias</option>
              {collections.map((c) => (
                <option key={c.slug} value={c.slug}>{c.name}</option>
              ))}
            </select>
            <select
              value={filterPriceRange}
              onChange={(e) => setFilterPriceRange(e.target.value)}
              className="border border-border rounded-lg px-3 py-1.5 text-sm bg-background"
            >
              <option value="all">Faixa de preço</option>
              <option value="0-100">Até R$ 100</option>
              <option value="100-200">R$ 100 – R$ 200</option>
              <option value="200+">Acima de R$ 200</option>
            </select>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="border border-border rounded-lg px-3 py-1.5 text-sm bg-background"
            >
              <option value="default">Ordenar por</option>
              <option value="name-asc">Nome, A–Z</option>
              <option value="price-asc">Preço, menor para maior</option>
              <option value="price-desc">Preço, maior para menor</option>
            </select>
            <span className="text-muted-foreground">{filtered.length} produtos</span>
          </div>
        </div>

        {filtered.length === 0 ? (
          <p className="text-center text-muted-foreground py-12">Nenhum produto encontrado para "{searchQuery}"</p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6 max-w-5xl mx-auto">
            {filtered.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
