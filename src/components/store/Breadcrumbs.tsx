import { Link } from "react-router-dom";
import { ChevronRight, Home } from "lucide-react";
import { useTranslation } from "react-i18next";

interface BreadcrumbItem {
  label: string;
  href?: string;
}

export default function Breadcrumbs({ items }: { items: BreadcrumbItem[] }) {
  const { t } = useTranslation();
  return (
    <nav aria-label="Breadcrumb" className="mb-4 flex flex-wrap items-center gap-1 text-xs text-muted-foreground">
      <Link to="/" className="hover:text-primary flex items-center gap-1">
        <Home size={12} />
        <span>{t("nav.home")}</span>
      </Link>
      {items.map((item, i) => (
        <span key={i} className="flex items-center gap-1">
          <ChevronRight size={12} />
          {item.href ? (
            <Link to={item.href} className="hover:text-primary">
              {item.label}
            </Link>
          ) : (
            <span className="text-foreground font-medium">{item.label}</span>
          )}
        </span>
      ))}
    </nav>
  );
}
