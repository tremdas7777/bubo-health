import Layout from "@/components/store/Layout";
import HeroCarousel from "@/components/store/HeroCarousel";
import CollectionsCarousel from "@/components/store/CollectionsCarousel";
import CategoryCarousel from "@/components/store/CategoryCarousel";
import TrustBadges from "@/components/store/TrustBadges";
import { categoryOrder } from "@/data/store";
import OrganizationJsonLd from "@/components/seo/OrganizationJsonLd";
import PageHead from "@/components/seo/PageHead";

const Index = () => {
  return (
    <Layout>
      <PageHead
        title="Kazoom - Tudo que você precisa em um só lugar"
        description="De utensílios a eletrônicos, tudo que você precisa em um só lugar. Frete grátis e parcele em até 12x."
      />
      <OrganizationJsonLd />
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
