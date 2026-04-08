import Layout from "@/components/store/Layout";
import PageHead from "@/components/seo/PageHead";

export default function AboutPage() {
  return (
    <Layout>
      <PageHead
        title="Sobre Nós | Bazu"
        description="Conheça a Bazu – loja online de Ipanema/MG com produtos de qualidade e frete grátis para todo o Brasil."
      />
      <div className="container mx-auto px-4 py-16 max-w-2xl">
        <h1 className="text-3xl font-heading font-bold mb-6 text-center">Sobre nós</h1>

        <div className="text-muted-foreground leading-relaxed space-y-4">
          <p>
            Somos a <strong className="text-foreground">Bazu</strong>, uma loja online que reúne tudo que você precisa em um só lugar.
            De utensílios domésticos a eletrônicos, de equipamentos de fitness a ferramentas,
            nossa missão é oferecer produtos de qualidade com os melhores preços e um atendimento excepcional.
          </p>
          <p>
            Trabalhamos com as melhores marcas e garantimos frete grátis para todo o Brasil,
            além de parcelamento em até 12x no cartão e desconto especial no PIX.
          </p>
          <p>
            Nosso compromisso é com a sua satisfação. Conte com nosso suporte de segunda a sexta,
            das 08h às 18h, para qualquer dúvida ou necessidade. É bazu!
          </p>

          <hr className="my-6 border-border" />

          <h2 className="text-lg font-heading font-semibold text-foreground">Dados da Empresa</h2>
          <ul className="space-y-1 text-sm">
            <li><strong>Razão Social:</strong> Loja Tudo LTDA</li>
            <li><strong>CNPJ:</strong> 50.301.476/0001-30</li>
            <li><strong>Endereço:</strong> Av. Sete de Setembro, 999, Loja 01 – Centro, Ipanema – MG, CEP 36950-000</li>
            <li><strong>E-mail:</strong> cadastrofiscal@escritaonline.cnt.br</li>
            <li><strong>Telefone/WhatsApp:</strong> (33) 99982-9860</li>
          </ul>
        </div>
      </div>
    </Layout>
  );
}
