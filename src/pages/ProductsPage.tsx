import { useState } from "react";
import Layout from "@/components/store/Layout";
import ProductCard from "@/components/store/ProductCard";
import { products } from "@/data/store";
import PageHead from "@/components/seo/PageHead";

export default function ProductsPage() {
  const [sortBy, setSortBy] = useState("default");
  const [filterAvail, setFilterAvail] = useState("all");

  let sorted = [...products];
  if (sortBy === "price-asc") sorted.sort((a, b) => a.price - b.price);
  if (sortBy === "price-desc") sorted.sort((a, b) => b.price - a.price);
  if (sortBy === "name-asc") sorted.sort((a, b) => a.name.localeCompare(b.name));
  if (filterAvail === "in-stock") sorted = sorted.filter((p) => p.stock > 0);

  return (
    <Layout>
      <PageHead
        title="Todos os Produtos | Bazu"
        description="Explore todos os produtos da Bazu. Frete grátis, parcele em até 12x e 5% de desconto no PIX."
        canonical="https://snug-code-space.lovable.app/produtos"
      />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl md:text-3xl font-heading font-bold text-center mb-2">
          Produtos
        </h1>

        {/* Filters bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 my-6 border-y border-border py-4">
          <div className="flex items-center gap-4 text-sm">
            <span className="text-muted-foreground">Filtrar:</span>
            <select
              value={filterAvail}
              onChange={(e) => setFilterAvail(e.target.value)}
              className="border border-border rounded-lg px-3 py-1.5 text-sm bg-background"
            >
              <option value="all">Disponibilidade</option>
              <option value="in-stock">Em estoque</option>
            </select>
          </div>
          <div className="flex items-center gap-4 text-sm">
            <span className="text-muted-foreground">Ordenar por:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="border border-border rounded-lg px-3 py-1.5 text-sm bg-background"
            >
              <option value="default">Ordem alfabética, A–Z</option>
              <option value="name-asc">Nome, A–Z</option>
              <option value="price-asc">Preço, menor para maior</option>
              <option value="price-desc">Preço, maior para menor</option>
            </select>
            <span className="text-muted-foreground">{sorted.length} produtos</span>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {sorted.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </Layout>
  );
}
