import Layout from "@/components/store/Layout";
import { useWishlist } from "@/contexts/WishlistContext";
import { useCart } from "@/contexts/CartContext";
import { formatPrice } from "@/data/store";
import { Heart, ShoppingBag, Trash2 } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import PageHead from "@/components/seo/PageHead";

export default function WishlistPage() {
  const { items, removeItem } = useWishlist();
  const { addItem } = useCart();

  return (
    <Layout>
      <PageHead title="Favoritos | Kazoom" description="Seus produtos favoritos na Kazoom" />
      <div className="container mx-auto px-4 py-10">
        <h1 className="text-3xl font-heading font-bold mb-8 flex items-center gap-3">
          <Heart className="text-primary" size={28} />
          Meus Favoritos
        </h1>

        {items.length === 0 ? (
          <div className="text-center py-20">
            <Heart size={64} className="mx-auto text-muted-foreground mb-4" />
            <p className="text-lg text-muted-foreground mb-6">
              Você ainda não tem favoritos.
            </p>
            <Link to="/produtos">
              <Button>Explorar Produtos</Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {items.map((product) => (
              <div key={product.id} className="bg-card rounded-lg border border-border overflow-hidden group">
                <Link to={`/produto/${product.slug}`} className="block">
                  <div className="aspect-square overflow-hidden">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      loading="lazy"
                    />
                  </div>
                </Link>
                <div className="p-4">
                  <Link to={`/produto/${product.slug}`}>
                    <h3 className="font-medium text-sm mb-2 line-clamp-2 hover:text-primary transition-colors">
                      {product.name}
                    </h3>
                  </Link>
                  <p className="text-lg font-bold text-primary">
                    {formatPrice(product.price)}
                  </p>
                  <div className="flex gap-2 mt-3">
                    <Button
                      size="sm"
                      className="flex-1"
                      onClick={() => addItem(product)}
                    >
                      <ShoppingBag size={14} className="mr-1" />
                      Comprar
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => removeItem(product.id)}
                    >
                      <Trash2 size={14} />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
