import { useEffect } from "react";

export default function OrganizationJsonLd() {
  useEffect(() => {
    const schema = {
      "@context": "https://schema.org",
      "@type": "Organization",
      name: "Kazoom",
      url: window.location.origin,
      logo: `${window.location.origin}/logo-icon.png`,
      description:
        "Kazoom - De utensílios a eletrônicos, tudo que você precisa em um só lugar. Frete grátis e parcele em até 12x.",
      address: {
        "@type": "PostalAddress",
        streetAddress: "Avenida Larissa Cavalcante, 11",
        addressLocality: "Vitória da Conquista",
        addressRegion: "BA",
        postalCode: "45027-400",
        addressCountry: "BR",
      },
      contactPoint: {
        "@type": "ContactPoint",
        contactType: "customer service",
        availableLanguage: "Portuguese",
        email: "suporte@kazoombrasil.com.br",
        telephone: "+55-77-9138-1192",
      },
      taxID: "60.105.125/0001-08",
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
