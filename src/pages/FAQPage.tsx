import Layout from "@/components/store/Layout";
import PageHead from "@/components/seo/PageHead";
import FAQJsonLd from "@/components/seo/FAQJsonLd";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    question: "Qual o prazo de entrega?",
    answer: "O prazo de entrega varia de 7 a 15 dias úteis para todo o Brasil. Em regiões metropolitanas, a entrega pode ser mais rápida. Após a confirmação do pagamento, você receberá o código de rastreamento por e-mail.",
  },
  {
    question: "Quais as formas de pagamento?",
    answer: "Aceitamos PIX (com 5% de desconto), cartão de crédito (Visa, Mastercard, Elo, American Express, Hipercard) em até 6x. Parcelas acima de 1x possuem juros de 2,49% ao mês.",
  },
  {
    question: "O frete é realmente grátis?",
    answer: "Sim! Oferecemos frete grátis para todo o Brasil em todos os pedidos, sem valor mínimo.",
  },
  {
    question: "Como faço para trocar ou devolver um produto?",
    answer: "Você tem até 7 dias corridos após o recebimento para solicitar a troca ou devolução, conforme o Código de Defesa do Consumidor. Basta entrar em contato pelo WhatsApp ou e-mail informando o número do pedido.",
  },
  {
    question: "Os produtos possuem garantia?",
    answer: "Sim, todos os produtos possuem garantia mínima de 30 dias contra defeitos de fabricação. Alguns produtos possuem garantia estendida conforme especificado na descrição.",
  },
  {
    question: "É seguro comprar na Bubo Health?",
    answer: "Totalmente seguro! Utilizamos criptografia SSL em todo o site, seus dados de pagamento são processados por gateways certificados e nunca armazenamos dados de cartão. Possuímos CNPJ ativo e endereço físico.",
  },
  {
    question: "Posso comprar sem criar conta?",
    answer: "Sim! Você pode finalizar sua compra sem criar uma conta. Se preferir, pode criar uma conta para acompanhar seus pedidos e salvar seus dados para compras futuras.",
  },
  {
    question: "Como acompanho meu pedido?",
    answer: "Após o envio, você receberá um e-mail com o código de rastreamento. Também pode acompanhar pela sua conta no site, na seção 'Meus Pedidos'.",
  },
];

const FAQPage = () => {
  return (
    <Layout>
      <PageHead
        title="Perguntas Frequentes - Bubo Health"
        description="Tire suas dúvidas sobre entrega, pagamento, trocas e devoluções na Bubo Health."
      />
      <FAQJsonLd
        items={faqs.map((f) => ({
          question: f.question,
          answer: f.answer,
        }))}
      />

      <div className="container mx-auto px-4 py-10 max-w-[800px]">
        <h1 className="text-2xl md:text-3xl font-heading font-bold text-center mb-8">
          Perguntas Frequentes
        </h1>

        <Accordion type="single" collapsible className="space-y-2">
          {faqs.map((faq, i) => (
            <AccordionItem key={i} value={`faq-${i}`} className="border border-border rounded-lg px-4">
              <AccordionTrigger className="text-sm font-medium text-left hover:no-underline">
                {faq.question}
              </AccordionTrigger>
              <AccordionContent className="text-sm text-muted-foreground leading-relaxed">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </Layout>
  );
};

export default FAQPage;
