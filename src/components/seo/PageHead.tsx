import { useEffect } from "react";

interface Props {
  title: string;
  description: string;
  canonical?: string;
  ogImage?: string;
  ogType?: string;
  noIndex?: boolean;
}

const DEFAULT_OG_IMAGE = "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/61c5f034-ba9c-4f63-92e8-331dd365c01b/id-preview-20d5464f--49403296-0e09-413f-bf28-4e311008ad2a.lovable.app-1775603652267.png";

export default function PageHead({ title, description, canonical, ogImage, ogType = "website", noIndex = false }: Props) {
  useEffect(() => {
    document.title = title;

    const setMeta = (name: string, content: string, attr = "name") => {
      let el = document.querySelector(`meta[${attr}="${name}"]`) as HTMLMetaElement | null;
      if (!el) {
        el = document.createElement("meta");
        el.setAttribute(attr, name);
        document.head.appendChild(el);
      }
      el.content = content;
    };

    const href = canonical || window.location.href.split("?")[0].split("#")[0];

    setMeta("description", description);
    setMeta("robots", noIndex ? "noindex, nofollow" : "index, follow");

    // Open Graph
    setMeta("og:title", title, "property");
    setMeta("og:description", description, "property");
    setMeta("og:url", href, "property");
    setMeta("og:type", ogType, "property");
    setMeta("og:site_name", "Bubo Health", "property");
    setMeta("og:locale", "pt_BR", "property");
    setMeta("og:image", ogImage || DEFAULT_OG_IMAGE, "property");

    // Twitter
    setMeta("twitter:card", "summary_large_image");
    setMeta("twitter:title", title);
    setMeta("twitter:description", description);
    setMeta("twitter:image", ogImage || DEFAULT_OG_IMAGE);

    // Canonical
    let link = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    if (!link) {
      link = document.createElement("link");
      link.rel = "canonical";
      document.head.appendChild(link);
    }
    link.href = href;

    return () => {};
  }, [title, description, canonical, ogImage, ogType]);

  return null;
}
