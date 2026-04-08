import { useParams } from "react-router-dom";
import { useState } from "react";
import Layout from "@/components/store/Layout";
import ProductCard from "@/components/store/ProductCard";
import { products, collections, getProductsByCategory } from "@/data/store";
import PageHead from "@/components/seo/PageHead";
import BreadcrumbJsonLd from "@/components/seo/BreadcrumbJsonLd";

export default function CollectionPage() {
  const { slug } = useParams<{ slug: string }>();
  const collection = collections.find((c) => c.slug === slug);
  const filtered = getProductsByCategory(slug || "");
  const [sortBy, setSortBy] = useState("default");
  const [filterAvail, setFilterAvail] = useState("all");

  let sorted = [...filtered];
  if (sortBy === "price-asc") sorted.sort((a, b) => a.price - b.price);
  if (sortBy === "price-desc") sorted.sort((a, b) => b.price - a.price);
  if (sortBy === "name-asc") sorted.sort((a, b) => a.name.localeCompare(b.name));
  if (filterAvail === "in-stock") sorted = sorted.filter((p) => p.stock > 0);

  const collectionName = collection?.name || "Coleção";
  const collectionUrl = `https://snug-code-space.lovable.app/colecao/${slug}`;

  return (
    <Layout>
      <PageHead
        title={`${collectionName} | Kazoom`}
        description={`Confira os melhores produtos de ${collectionName} na Kazoom. Frete grátis e parcele em até 12x.`}
        canonical={collectionUrl}
      />
      <BreadcrumbJsonLd
        items={[
          { name: "Início", url: "https://snug-code-space.lovable.app" },
          { name: collectionName, url: collectionUrl },
        ]}
      />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl md:text-3xl font-heading font-bold text-center mb-2">
          {collectionName}
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

        {sorted.length === 0 ? (
          <p className="text-center text-muted-foreground py-20">
            Nenhum produto encontrado nesta coleção.
          </p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6 max-w-5xl mx-auto">
            {sorted.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
