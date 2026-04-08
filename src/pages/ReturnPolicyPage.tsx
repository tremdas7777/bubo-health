import Layout from "@/components/store/Layout";
import PageHead from "@/components/seo/PageHead";

export default function ReturnPolicyPage() {
  return (
    <Layout>
      <PageHead
        title="Política de Trocas e Devoluções | Kazoom"
        description="Saiba como funciona o processo de trocas e devoluções na Kazoom."
      />
      <div className="container mx-auto max-w-3xl px-4 py-12">
        <h1 className="mb-8 text-3xl font-heading font-bold">Política de Trocas e Devoluções</h1>

        <div className="prose prose-sm max-w-none text-muted-foreground space-y-6">
          <p>Última atualização: {new Date().toLocaleDateString("pt-BR")}</p>

          <h2 className="text-lg font-semibold text-foreground">1. Direito de Arrependimento</h2>
          <p>
            De acordo com o Código de Defesa do Consumidor (Art. 49), você tem até 7 (sete) dias
            corridos após o recebimento do produto para solicitar a devolução, sem necessidade de
            justificativa. O produto deve estar em sua embalagem original, sem sinais de uso.
          </p>

          <h2 className="text-lg font-semibold text-foreground">2. Produtos com Defeito</h2>
          <p>
            Se o produto apresentar defeito de fabricação, você pode solicitar a troca ou devolução
            em até 30 (trinta) dias corridos após o recebimento. Envie fotos do defeito pelo nosso
            WhatsApp ou e-mail para agilizar o processo.
          </p>

          <h2 className="text-lg font-semibold text-foreground">3. Como solicitar</h2>
          <ul className="list-disc pl-6 space-y-1">
            <li>Entre em contato pelo e-mail suporte@kazoombrasil.com.br ou WhatsApp (77) 9138-1192</li>
            <li>Informe o número do pedido e o motivo da solicitação</li>
            <li>Aguarde as instruções de envio da nossa equipe</li>
            <li>Envie o produto de volta conforme as orientações</li>
          </ul>

          <h2 className="text-lg font-semibold text-foreground">4. Reembolso</h2>
          <p>
            Após recebermos e verificarmos o produto devolvido, o reembolso será processado em até
            10 (dez) dias úteis. O valor será estornado pelo mesmo método de pagamento utilizado na
            compra. Para pagamentos via PIX, o reembolso será feito em até 5 dias úteis.
          </p>

          <h2 className="text-lg font-semibold text-foreground">5. Custos de Envio</h2>
          <p>
            Em caso de defeito ou erro no envio, a Kazoom arcará com todos os custos de frete para
            devolução. Em caso de arrependimento, o frete de devolução é gratuito (primeira troca).
          </p>

          <h2 className="text-lg font-semibold text-foreground">6. Exceções</h2>
          <p>
            Produtos personalizados ou sob medida não são elegíveis para troca por arrependimento.
            Itens com sinais de uso, mau uso ou sem embalagem original podem ter a devolução recusada.
          </p>
        </div>
      </div>
    </Layout>
  );
}
