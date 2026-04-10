import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

interface FAQItem {
  question: string;
  answer: string;
}

const defaultFAQs: FAQItem[] = [
  {
    question: "O kit vem completo conforme a descrição?",
    answer: "Sim! O kit vem com todas as ferramentas listadas na descrição, totalizando 18 kg de equipamentos profissionais, organizados em uma maleta reforçada.",
  },
  {
    question: "A bomba de vácuo é bivolt?",
    answer: "Sim, a bomba de vácuo é bivolt 110/220V, funcionando em qualquer tomada do Brasil.",
  },
  {
    question: "Os manifolds são compatíveis com quais gases?",
    answer: "Os 2 conjuntos Manifold são compatíveis com R134a, R410A, R22, R32 e R404A, cobrindo a grande maioria dos sistemas de refrigeração e ar condicionado.",
  },
  {
    question: "Qual o prazo de entrega?",
    answer: "O envio é feito pelos Correios em até 24h úteis após a confirmação do pagamento. O prazo de entrega varia de 3 a 11 dias úteis dependendo da sua região.",
  },
  {
    question: "Tem garantia?",
    answer: "Sim! Oferecemos garantia de 30 dias contra defeitos de fabricação. Se houver qualquer problema, trocamos sem custo adicional.",
  },
  {
    question: "Posso parcelar no cartão?",
    answer: "Sim! Aceitamos parcelamento em até 6x sem juros no cartão de crédito. No PIX, você ainda ganha desconto adicional.",
  },
];

export default function ProductFAQ() {
  return (
    <Accordion type="single" collapsible className="w-full">
      {defaultFAQs.map((faq, i) => (
        <AccordionItem key={i} value={`faq-${i}`}>
          <AccordionTrigger className="text-sm text-left">
            {faq.question}
          </AccordionTrigger>
          <AccordionContent className="text-sm text-muted-foreground">
            {faq.answer}
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}
