import Layout from "@/components/store/Layout";
import PageHead from "@/components/seo/PageHead";
import { useTranslation } from "react-i18next";

export default function ReturnPolicyPage() {
  const { t, i18n } = useTranslation();
  const locale = (i18n.language || "en").startsWith("pt") ? "pt-BR" : i18n.language;

  return (
    <Layout>
      <PageHead title={`${t("pages.returns.title")} | Bubo Health`} description={t("pages.returns.title")} />
      <div className="container mx-auto max-w-3xl px-4 py-12">
        <h1 className="mb-8 text-3xl font-heading font-bold">{t("pages.returns.title")}</h1>
        <div className="prose prose-sm max-w-none text-muted-foreground space-y-6">
          <p>{t("pages.returns.lastUpdate")} {new Date().toLocaleDateString(locale)}</p>

          {[1, 2].map((n) => (
            <div key={n}>
              <h2 className="text-lg font-semibold text-foreground">{t(`pages.returns.s${n}Title`)}</h2>
              <p>{t(`pages.returns.s${n}`)}</p>
            </div>
          ))}

          <h2 className="text-lg font-semibold text-foreground">{t("pages.returns.s3Title")}</h2>
          <ul className="list-disc pl-6 space-y-1">
            <li>{t("pages.returns.s3i1")}</li>
            <li>{t("pages.returns.s3i2")}</li>
            <li>{t("pages.returns.s3i3")}</li>
            <li>{t("pages.returns.s3i4")}</li>
          </ul>

          {[4, 5, 6].map((n) => (
            <div key={n}>
              <h2 className="text-lg font-semibold text-foreground">{t(`pages.returns.s${n}Title`)}</h2>
              <p>{t(`pages.returns.s${n}`)}</p>
            </div>
          ))}
        </div>
      </div>
    </Layout>
  );
}
