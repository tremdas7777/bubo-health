import Layout from "@/components/store/Layout";

export default function AboutPage() {
  return (
    <Layout>
      <div className="container mx-auto px-4 py-16 max-w-2xl text-center">
        <h1 className="text-3xl font-heading font-bold mb-6">Sobre nós</h1>
        <p className="text-muted-foreground leading-relaxed mb-4">
          Somos a Bazu, uma loja online que reúne tudo que você precisa em um só lugar.
          De utensílios domésticos a eletrônicos, de equipamentos de fitness a ferramentas,
          nossa missão é oferecer produtos de qualidade com os melhores preços e um atendimento excepcional.
        </p>
        <p className="text-muted-foreground leading-relaxed mb-4">
          Trabalhamos com as melhores marcas e garantimos frete grátis para todo o Brasil,
          além de parcelamento em até 12x no cartão e desconto especial no PIX.
        </p>
        <p className="text-muted-foreground leading-relaxed">
          Nosso compromisso é com a sua satisfação. Conte com nosso suporte de segunda a sexta,
          das 08h às 18h, para qualquer dúvida ou necessidade. É bazu!
        </p>
      </div>
    </Layout>
  );
}
