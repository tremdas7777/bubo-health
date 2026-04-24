import { useParams } from "react-router-dom";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import Layout from "@/components/store/Layout";
import ProductCard from "@/components/store/ProductCard";
import Breadcrumbs from "@/components/store/Breadcrumbs";
import { useDbProducts, useDbCollections, filterByCategory } from "@/hooks/useProducts";
import PageHead from "@/components/seo/PageHead";
import BreadcrumbJsonLd from "@/components/seo/BreadcrumbJsonLd";
import FAQJsonLd from "@/components/seo/FAQJsonLd";

// Maps collection slug to i18n key in collections.*
const SLUG_TO_I18N: Record<string, string> = {
  "home-kitchen": "homeKitchen",
  "electronics": "electronics",
  "sports": "sports",
  "tools": "tools",
  "fitness": "fitness",
  "fishing": "fishing",
  "health-beauty": "healthBeauty",
  "suplementos": "suplementos",
};

export default function CollectionPage() {
  const { slug } = useParams<{ slug: string }>();
  const { t } = useTranslation();
  const { data: products = [] } = useDbProducts();
  const { data: collections = [] } = useDbCollections();
  const collection = collections.find((c) => c.slug === slug);
  const filtered = filterByCategory(products, slug || "");
  const [sortBy, setSortBy] = useState("default");
  const [filterAvail, setFilterAvail] = useState("all");

  let sorted = [...filtered];
  if (sortBy === "price-asc") sorted.sort((a, b) => a.price - b.price);
  if (sortBy === "price-desc") sorted.sort((a, b) => b.price - a.price);
  if (sortBy === "name-asc") sorted.sort((a, b) => a.name.localeCompare(b.name));
  if (filterAvail === "in-stock") sorted = sorted.filter((p) => p.stock > 0);

  const i18nKey = slug ? SLUG_TO_I18N[slug] : null;
  const collectionName = i18nKey ? t(`collections.${i18nKey}`) : (collection?.name || "");
  const origin = window.location.origin;
  const collectionUrl = `${origin}/colecao/${slug}`;
  const seoDescription = (slug && t(`collectionPage.descriptions.${slug}`, { defaultValue: "" })) ||
    t("collectionPage.fallbackDesc", { name: collectionName });
  const faqsRaw = slug ? t(`collectionPage.faqs.${slug}`, { returnObjects: true, defaultValue: [] }) : [];
  const faqs = (Array.isArray(faqsRaw) ? faqsRaw : []) as { q: string; a: string }[];

  return (
    <Layout>
      <PageHead
        title={`${collectionName} | Kazoom`}
        description={seoDescription}
        canonical={collectionUrl}
      />
      <BreadcrumbJsonLd
        items={[
          { name: t("collectionPage.home"), url: origin },
          { name: collectionName, url: collectionUrl },
        ]}
      />
      {faqs.length > 0 && (
        <FAQJsonLd items={faqs.map((f) => ({ question: f.q, answer: f.a }))} />
      )}

      <div className="container mx-auto px-4 py-8">
        <Breadcrumbs items={[{ label: collectionName }]} />

        <h1 className="text-2xl md:text-3xl font-heading font-bold text-center mb-2">
          {collectionName}
        </h1>
        <p className="text-center text-sm text-muted-foreground max-w-xl mx-auto mb-6">
          {seoDescription}
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 my-6 border-y border-border py-4">
          <div className="flex items-center gap-4 text-sm">
            <span className="text-muted-foreground">{t("collectionPage.filter")}</span>
            <select
              value={filterAvail}
              onChange={(e) => setFilterAvail(e.target.value)}
              className="border border-border rounded-lg px-3 py-1.5 text-sm bg-background"
            >
              <option value="all">{t("collectionPage.availability")}</option>
              <option value="in-stock">{t("collectionPage.inStock")}</option>
            </select>
          </div>
          <div className="flex items-center gap-4 text-sm">
            <span className="text-muted-foreground">{t("collectionPage.sortBy")}</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="border border-border rounded-lg px-3 py-1.5 text-sm bg-background"
            >
              <option value="default">{t("collectionPage.sortDefault")}</option>
              <option value="name-asc">{t("collectionPage.sortNameAsc")}</option>
              <option value="price-asc">{t("collectionPage.sortPriceAsc")}</option>
              <option value="price-desc">{t("collectionPage.sortPriceDesc")}</option>
            </select>
            <span className="text-muted-foreground">{t("collectionPage.productsCount", { count: sorted.length })}</span>
          </div>
        </div>

        {sorted.length === 0 ? (
          <p className="text-center text-muted-foreground py-20">
            {t("collectionPage.empty")}
          </p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6 max-w-5xl mx-auto">
            {sorted.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}

        {faqs.length > 0 && (
          <div className="mt-12 max-w-3xl mx-auto border-t border-border pt-8">
            <h2 className="text-lg font-heading font-semibold mb-4">
              {t("collectionPage.faqTitle", { name: collectionName })}
            </h2>
            <div className="space-y-4">
              {faqs.map((faq, i) => (
                <details key={i} className="group border border-border rounded-lg">
                  <summary className="flex items-center justify-between cursor-pointer p-4 text-sm font-medium hover:text-primary">
                    {faq.q}
                    <span className="ml-2 text-muted-foreground group-open:rotate-180 transition-transform">▼</span>
                  </summary>
                  <p className="px-4 pb-4 text-sm text-muted-foreground leading-relaxed">{faq.a}</p>
                </details>
              ))}
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
