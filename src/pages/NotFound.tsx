import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import PageHead from "@/components/seo/PageHead";

const NotFound = () => {
  const location = useLocation();
  const { t } = useTranslation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted">
      <PageHead title={`${t("pages.notFound.title")} | Kazoom`} description={t("pages.notFound.subtitle")} />
      <div className="text-center">
        <h1 className="mb-4 text-6xl font-heading font-bold text-foreground">404</h1>
        <p className="mb-4 text-xl text-muted-foreground">{t("pages.notFound.title")}</p>
        <Link to="/" className="text-primary underline hover:text-primary/90">
          {t("pages.notFound.backHome")}
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
