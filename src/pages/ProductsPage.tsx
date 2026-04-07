import Layout from "@/components/store/Layout";
import ProductCard from "@/components/store/ProductCard";
import { products } from "@/data/store";

export default function ProductsPage() {
  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl md:text-3xl font-heading font-bold text-center mb-2">
          Produtos
        </h1>
        <p className="text-center text-muted-foreground text-sm mb-8">
          {products.length} produtos
        </p>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </Layout>
  );
}
