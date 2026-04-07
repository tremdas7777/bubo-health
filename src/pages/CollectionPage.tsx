import { useParams } from "react-router-dom";
import Layout from "@/components/store/Layout";
import ProductCard from "@/components/store/ProductCard";
import { products, collections } from "@/data/store";

export default function CollectionPage() {
  const { slug } = useParams<{ slug: string }>();
  const collection = collections.find((c) => c.slug === slug);
  const filtered = products.filter((p) => p.category === slug);

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl md:text-3xl font-heading font-bold text-center mb-2">
          {collection?.name || "Coleção"}
        </h1>
        <p className="text-center text-muted-foreground text-sm mb-8">
          {filtered.length} produto{filtered.length !== 1 ? "s" : ""}
        </p>

        {filtered.length === 0 ? (
          <p className="text-center text-muted-foreground py-20">
            Nenhum produto encontrado nesta coleção.
          </p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {filtered.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
