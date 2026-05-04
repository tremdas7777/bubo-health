import Layout from "@/components/store/Layout";
import PageHead from "@/components/seo/PageHead";
import { useTranslation } from "react-i18next";

export default function TermsPage() {
  const { t, i18n } = useTranslation();
  const locale = (i18n.language || "en").startsWith("pt") ? "pt-BR" : i18n.language;

  return (
    <Layout>
      <PageHead title={`${t("pages.terms.title")} | Bubo Health`} description={t("pages.terms.title")} />
      <div className="container mx-auto max-w-3xl px-4 py-12">
        <h1 className="mb-8 text-3xl font-heading font-bold">{t("pages.terms.title")}</h1>
        <div className="prose prose-sm max-w-none text-muted-foreground space-y-6">
          <p>{t("pages.terms.lastUpdate")} {new Date().toLocaleDateString(locale)}</p>
          {[1, 2, 3, 4, 5, 6, 7].map((n) => (
            <div key={n}>
              <h2 className="text-lg font-semibold text-foreground">{t(`pages.terms.s${n}Title`)}</h2>
              <p>{t(`pages.terms.s${n}`)}</p>
            </div>
          ))}
        </div>
      </div>
    </Layout>
  );
}
