import { useEffect } from "react";

export default function WebSiteJsonLd() {
  useEffect(() => {
    const origin = window.location.origin;
    const schema = {
      "@context": "https://schema.org",
      "@type": "WebSite",
      name: "Bubo Health",
      url: origin,
      description: "De utensílios a eletrônicos, tudo que você precisa em um só lugar. Frete grátis e parcele em até 6x.",
      potentialAction: {
        "@type": "SearchAction",
        target: {
          "@type": "EntryPoint",
          urlTemplate: `${origin}/produtos?q={search_term_string}`,
        },
        "query-input": "required name=search_term_string",
      },
    };

    const script = document.createElement("script");
    script.type = "application/ld+json";
    script.id = "website-jsonld";
    script.textContent = JSON.stringify(schema);

    const existing = document.getElementById("website-jsonld");
    if (existing) existing.remove();
    document.head.appendChild(script);

    return () => {
      const el = document.getElementById("website-jsonld");
      if (el) el.remove();
    };
  }, []);

  return null;
}
