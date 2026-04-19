import { useTranslation } from "react-i18next";
import Layout from "@/components/store/Layout";
import HeroCarousel from "@/components/store/HeroCarousel";
import CollectionsCarousel from "@/components/store/CollectionsCarousel";
import CategoryCarousel from "@/components/store/CategoryCarousel";
import BestSellers from "@/components/store/BestSellers";
import HomeReviews from "@/components/store/HomeReviews";
import Newsletter from "@/components/store/Newsletter";
import TrustBadges from "@/components/store/TrustBadges";

import { useDbCollections } from "@/hooks/useProducts";
import OrganizationJsonLd from "@/components/seo/OrganizationJsonLd";
import WebSiteJsonLd from "@/components/seo/WebSiteJsonLd";
import PageHead from "@/components/seo/PageHead";

const Index = () => {
  const { t } = useTranslation();
  const { data: collections = [] } = useDbCollections();
  const categoryOrder = collections.map((c) => c.slug);

  return (
    <Layout>
      <PageHead title={t("home.title")} description={t("home.description")} />
      
      <OrganizationJsonLd />
      <WebSiteJsonLd />
      <HeroCarousel />
      <CollectionsCarousel />
      <BestSellers />
      {categoryOrder.map((cat) => (
        <CategoryCarousel key={cat} category={cat} />
      ))}
      <HomeReviews />
      <Newsletter />
      <TrustBadges />
    </Layout>
  );
};

export default Index;
