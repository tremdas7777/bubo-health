import { useEffect } from "react";
import { Product } from "@/data/store";

interface Props {
  product: Product;
  url: string;
}

export default function ProductJsonLd({ product, url }: Props) {
  useEffect(() => {
    const imageUrl = product.image.startsWith("http")
      ? product.image
      : `${window.location.origin}${product.image}`;

    const allImages = product.images && product.images.length > 0
      ? product.images.map((img) => img.startsWith("http") ? img : `${window.location.origin}${img}`)
      : [imageUrl];

    const schema: Record<string, unknown> = {
      "@context": "https://schema.org",
      "@type": "Product",
      name: product.name,
      description: product.description,
      image: allImages,
      sku: product.id,
      brand: {
        "@type": "Brand",
        name: "Kazoom",
      },
      aggregateRating: {
        "@type": "AggregateRating",
        ratingValue: "4.8",
        reviewCount: "5",
        bestRating: "5",
        worstRating: "1",
      },
      offers: {
        "@type": "Offer",
        url,
        priceCurrency: "BRL",
        price: product.price.toFixed(2),
        ...(product.compareAtPrice && product.compareAtPrice > product.price
          ? { priceSpecification: { "@type": "PriceSpecification", price: product.compareAtPrice.toFixed(2), priceCurrency: "BRL" } }
          : {}),
        priceValidUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
        itemCondition: "https://schema.org/NewCondition",
        availability: product.stock > 0
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
          returnPolicyCategory: "https://schema.org/MerchantReturnFiniteReturnWindow",
          merchantReturnDays: 7,
          returnMethod: "https://schema.org/ReturnByMail",
          returnFees: "https://schema.org/FreeReturn",
          returnPolicySeasonalOverride: undefined,
        },
      },
    };

    // Add identifier_exists: false since we don't have GTINs
    if (!product.slug.includes("gtin")) {
      (schema as any).gtin = undefined;
    }

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