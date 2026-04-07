import Layout from "@/components/store/Layout";
import HeroCarousel from "@/components/store/HeroCarousel";
import CollectionsGrid from "@/components/store/CollectionsGrid";
import FeaturedProducts from "@/components/store/FeaturedProducts";
import TrustBadges from "@/components/store/TrustBadges";

const Index = () => {
  return (
    <Layout>
      <HeroCarousel />
      <CollectionsGrid />
      <FeaturedProducts />
      <TrustBadges />
    </Layout>
  );
};

export default Index;
