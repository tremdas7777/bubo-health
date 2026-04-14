import { useEffect } from "react";

interface FAQItem {
  question: string;
  answer: string;
}

export default function FAQJsonLd({ items }: { items: FAQItem[] }) {
  useEffect(() => {
    if (!items.length) return;

    const schema = {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: items.map((item) => ({
        "@type": "Question",
        name: item.question,
        acceptedAnswer: {
          "@type": "Answer",
          text: item.answer,
        },
      })),
    };

    const script = document.createElement("script");
    script.type = "application/ld+json";
    script.id = "faq-jsonld";
    script.textContent = JSON.stringify(schema);

    const existing = document.getElementById("faq-jsonld");
    if (existing) existing.remove();
    document.head.appendChild(script);

    return () => {
      const el = document.getElementById("faq-jsonld");
      if (el) el.remove();
    };
  }, [items]);

  return null;
}
