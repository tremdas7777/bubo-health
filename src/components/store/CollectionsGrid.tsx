import { Link } from "react-router-dom";
import { collections } from "@/data/store";

export default function CollectionsGrid() {
  return (
    <section className="py-12 md:py-16">
      <div className="container mx-auto px-4">
        <h2 className="text-2xl md:text-3xl font-heading font-bold text-center mb-10">
          Nossas Coleções
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-4">
          {collections.map((col) => (
            <Link
              key={col.id}
              to={`/colecao/${col.slug}`}
              className="group relative overflow-hidden rounded-xl aspect-square"
            >
              <img
                src={col.image}
                alt={col.name}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-3">
                <h3 className="text-white font-heading font-semibold text-sm text-center">
                  {col.name}
                </h3>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
