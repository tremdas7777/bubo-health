import Layout from "@/components/store/Layout";
import PageHead from "@/components/seo/PageHead";

export default function AboutPage() {
  return (
    <Layout>
      <PageHead
        title="Sobre Nós | Kazoom"
        description="Conheça a Kazoom – loja online de Vitória da Conquista/BA com produtos de qualidade e frete grátis para todo o Brasil."
      />
      <div className="container mx-auto px-4 py-16 max-w-2xl">
        <h1 className="text-3xl font-heading font-bold mb-6 text-center">Sobre nós</h1>

        <div className="text-muted-foreground leading-relaxed space-y-4">
          <p>
            Somos a <strong className="text-foreground">Kazoom</strong>, uma loja online que reúne tudo que você precisa em um só lugar.
            De utensílios domésticos a eletrônicos, de equipamentos de fitness a ferramentas,
            nossa missão é oferecer produtos de qualidade com os melhores preços e um atendimento excepcional.
          </p>
          <p>
            Trabalhamos com as melhores marcas e garantimos frete grátis para todo o Brasil,
            além de parcelamento em até 12x no cartão e desconto especial no PIX.
          </p>
          <p>
            Nosso compromisso é com a sua satisfação. Conte com nosso suporte de segunda a sexta,
            das 08h às 18h, para qualquer dúvida ou necessidade. É Kazoom!
          </p>

          <hr className="my-6 border-border" />

          <h2 className="text-lg font-heading font-semibold text-foreground">Dados da Empresa</h2>
          <ul className="space-y-1 text-sm">
            <li><strong>Razão Social:</strong> 60.105.125 Giovany Matos Dias</li>
            <li><strong>CNPJ:</strong> 60.105.125/0001-08</li>
            <li><strong>Endereço:</strong> Av. Larissa Cavalcante, 11 – Boa Vista, Vitória da Conquista – BA, CEP 45027-400</li>
            <li><strong>E-mail:</strong> suporte@kazoombrasil.com.br</li>
            <li><strong>Telefone:</strong> (77) 99138-1192</li>
          </ul>
        </div>
      </div>
    </Layout>
  );
}
