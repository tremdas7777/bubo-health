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

interface ProductFAQProps {
  productName?: string;
  productDescription?: string;
}

function generateFAQs(productName?: string, _desc?: string): FAQItem[] {
  const name = productName || "este produto";

  return [
    {
      question: `O ${name} vem conforme a descrição?`,
      answer: `Sim! O ${name} é enviado exatamente conforme descrito na página do produto, com todas as especificações e acessórios listados.`,
    },
    {
      question: `Qual o prazo de entrega do ${name}?`,
      answer:
        "O envio é feito pelos Correios em até 24h úteis após a confirmação do pagamento. O prazo de entrega varia de 3 a 11 dias úteis dependendo da sua região.",
    },
    {
      question: `O ${name} tem garantia?`,
      answer:
        "Sim! Oferecemos garantia de 30 dias contra defeitos de fabricação. Se houver qualquer problema, trocamos sem custo adicional.",
    },
    {
      question: "Posso parcelar no cartão?",
      answer:
        "Sim! Aceitamos parcelamento em até 6x no cartão de crédito com juros de 2,49% a.m. No PIX, você ainda ganha desconto adicional.",
    },
    {
      question: "Como funciona a devolução?",
      answer:
        "Você tem até 7 dias após o recebimento para solicitar a devolução, conforme o Código de Defesa do Consumidor. Basta entrar em contato pelo WhatsApp ou e-mail.",
    },
    {
      question: "O pagamento é seguro?",
      answer:
        "Sim! Todos os pagamentos são processados por gateways de pagamento seguros com criptografia. Seus dados estão protegidos.",
    },
  ];
}

export default function ProductFAQ({ productName, productDescription }: ProductFAQProps) {
  const faqs = generateFAQs(productName, productDescription);

  return (
    <Accordion type="single" collapsible className="w-full">
      {faqs.map((faq, i) => (
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
