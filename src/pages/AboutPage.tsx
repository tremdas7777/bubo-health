import Layout from "@/components/store/Layout";
import PageHead from "@/components/seo/PageHead";
import { Trans, useTranslation } from "react-i18next";

export default function AboutPage() {
  const { t } = useTranslation();
  return (
    <Layout>
      <PageHead title={`${t("pages.about.title")} | Bubo Health`} description={t("home.description")} />
      <div className="container mx-auto px-4 py-16 max-w-2xl">
        <h1 className="text-3xl font-heading font-bold mb-6 text-center">{t("pages.about.title")}</h1>

        <div className="text-muted-foreground leading-relaxed space-y-4">
          <p><Trans i18nKey="pages.about.p1" components={{ strong: <strong className="text-foreground" /> }} /></p>
          <p>{t("pages.about.p2")}</p>
          <p>{t("pages.about.p3")}</p>

          <hr className="my-6 border-border" />

          <h2 className="text-lg font-heading font-semibold text-foreground">{t("pages.about.companyData")}</h2>
          <ul className="space-y-1 text-sm">
            <li><strong>{t("pages.about.companyName")}:</strong> Bubo Health</li>
            <li><strong>{t("pages.about.address")}:</strong> Your Company Address</li>
            <li><strong>{t("pages.about.emailLabel")}:</strong> support@bubohealth.com</li>
            <li><strong>{t("pages.about.phoneLabel")}:</strong> +1 (000) 000-0000</li>
          </ul>
        </div>
      </div>
    </Layout>
  );
}
