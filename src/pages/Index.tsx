import Layout from "@/components/store/Layout";
import HeroCarousel from "@/components/store/HeroCarousel";
import CollectionsCarousel from "@/components/store/CollectionsCarousel";
import CategoryCarousel from "@/components/store/CategoryCarousel";
import TrustBadges from "@/components/store/TrustBadges";
import { useDbCollections } from "@/hooks/useProducts";
import OrganizationJsonLd from "@/components/seo/OrganizationJsonLd";
import PageHead from "@/components/seo/PageHead";

const Index = () => {
  const { data: collections = [] } = useDbCollections();
  const categoryOrder = collections.map((c) => c.slug);

  return (
    <Layout>
      <PageHead
        title="Kazoom - Tudo que você precisa em um só lugar"
        description="De utensílios a eletrônicos, tudo que você precisa em um só lugar. Frete grátis e parcele em até 6x."
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
