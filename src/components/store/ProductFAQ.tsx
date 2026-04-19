import { useTranslation } from "react-i18next";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

interface ProductFAQProps {
  productName?: string;
  productDescription?: string;
}

export default function ProductFAQ({ productName }: ProductFAQProps) {
  const { t } = useTranslation();
  const name = productName || t("product.thisProduct");

  const faqs = [
    { question: t("productFaq.q1", { name }), answer: t("productFaq.a1", { name }) },
    { question: t("productFaq.q2", { name }), answer: t("productFaq.a2") },
    { question: t("productFaq.q3", { name }), answer: t("productFaq.a3") },
    { question: t("productFaq.q4"), answer: t("productFaq.a4") },
    { question: t("productFaq.q5"), answer: t("productFaq.a5") },
    { question: t("productFaq.q6"), answer: t("productFaq.a6") },
  ];

  return (
    <Accordion type="single" collapsible className="w-full">
      {faqs.map((faq, i) => (
        <AccordionItem key={i} value={`faq-${i}`}>
          <AccordionTrigger className="text-sm text-left">{faq.question}</AccordionTrigger>
          <AccordionContent className="text-sm text-muted-foreground">{faq.answer}</AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}
