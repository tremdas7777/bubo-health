import { useEffect } from "react";

export default function OrganizationJsonLd() {
  useEffect(() => {
    const schema = {
      "@context": "https://schema.org",
      "@type": "Organization",
      name: "Bazu",
      url: window.location.origin,
      logo: `${window.location.origin}/logo-icon.png`,
      description:
        "Bazu - De utensílios a eletrônicos, tudo que você precisa em um só lugar. Frete grátis e parcele em até 12x.",
      address: {
        "@type": "PostalAddress",
        streetAddress: "Avenida Sete de Setembro, 999, Loja 01",
        addressLocality: "Ipanema",
        addressRegion: "MG",
        postalCode: "36950-000",
        addressCountry: "BR",
      },
      contactPoint: {
        "@type": "ContactPoint",
        contactType: "customer service",
        availableLanguage: "Portuguese",
        email: "cadastrofiscal@escritaonline.cnt.br",
        telephone: "+55-33-99982-9860",
      },
      taxID: "50.301.476/0001-30",
      sameAs: [],
    };

    const script = document.createElement("script");
    script.type = "application/ld+json";
    script.id = "org-jsonld";
    script.textContent = JSON.stringify(schema);

    const existing = document.getElementById("org-jsonld");
    if (existing) existing.remove();
    document.head.appendChild(script);

    return () => {
      const el = document.getElementById("org-jsonld");
      if (el) el.remove();
    };
  }, []);

  return null;
}
