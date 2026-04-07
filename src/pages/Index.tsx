import Layout from "@/components/store/Layout";
import HeroCarousel from "@/components/store/HeroCarousel";
import CollectionsCarousel from "@/components/store/CollectionsCarousel";
import CategoryCarousel from "@/components/store/CategoryCarousel";
import TrustBadges from "@/components/store/TrustBadges";
import { categoryOrder } from "@/data/store";

const Index = () => {
  return (
    <Layout>
      <HeroCarousel />
      <CollectionsCarousel />
      {categoryOrder.map((cat) => (
        <CategoryCarousel key={cat} category={cat} />
      ))}
      <TrustBadges />
    </Layout>
  );
};

export default Index;
