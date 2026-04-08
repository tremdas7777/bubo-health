import { useEffect } from "react";
import { Product, formatPrice } from "@/data/store";

interface Props {
  product: Product;
  url: string;
}

export default function ProductJsonLd({ product, url }: Props) {
  useEffect(() => {
    const schema = {
      "@context": "https://schema.org",
      "@type": "Product",
      name: product.name,
      description: product.description,
      image: product.image.startsWith("http")
        ? product.image
        : `${window.location.origin}${product.image}`,
      sku: product.id,
      brand: {
        "@type": "Brand",
        name: "Kazoom",
      },
      offers: {
        "@type": "Offer",
        url,
        priceCurrency: "BRL",
        price: product.price.toFixed(2),
        priceValidUntil: new Date(
          Date.now() + 30 * 24 * 60 * 60 * 1000
        )
          .toISOString()
          .split("T")[0],
        itemCondition: "https://schema.org/NewCondition",
        availability:
          product.stock > 0
            ? "https://schema.org/InStock"
            : "https://schema.org/OutOfStock",
        seller: {
          "@type": "Organization",
          name: "Kazoom",
        },
        shippingDetails: {
          "@type": "OfferShippingDetails",
          shippingRate: {
            "@type": "MonetaryAmount",
            value: "0.00",
            currency: "BRL",
          },
          shippingDestination: {
            "@type": "DefinedRegion",
            addressCountry: "BR",
          },
          deliveryTime: {
            "@type": "ShippingDeliveryTime",
            handlingTime: {
              "@type": "QuantitativeValue",
              minValue: 1,
              maxValue: 2,
              unitCode: "DAY",
            },
            transitTime: {
              "@type": "QuantitativeValue",
              minValue: 3,
              maxValue: 11,
              unitCode: "DAY",
            },
          },
        },
        hasMerchantReturnPolicy: {
          "@type": "MerchantReturnPolicy",
          applicableCountry: "BR",
          returnPolicyCategory:
            "https://schema.org/MerchantReturnFiniteReturnWindow",
          merchantReturnDays: 7,
          returnMethod: "https://schema.org/ReturnByMail",
          returnFees: "https://schema.org/FreeReturn",
        },
      },
    };

    const script = document.createElement("script");
    script.type = "application/ld+json";
    script.id = "product-jsonld";
    script.textContent = JSON.stringify(schema);

    const existing = document.getElementById("product-jsonld");
    if (existing) existing.remove();
    document.head.appendChild(script);

    return () => {
      const el = document.getElementById("product-jsonld");
      if (el) el.remove();
    };
  }, [product, url]);

  return null;
}
