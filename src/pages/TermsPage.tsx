import Layout from "@/components/store/Layout";
import PageHead from "@/components/seo/PageHead";

export default function TermsPage() {
  return (
    <Layout>
      <PageHead
        title="Termos de Uso | Kazoom"
        description="Termos e condições de uso da loja Kazoom."
      />
      <div className="container mx-auto max-w-3xl px-4 py-12">
        <h1 className="mb-8 text-3xl font-heading font-bold">Termos de Uso</h1>

        <div className="prose prose-sm max-w-none text-muted-foreground space-y-6">
          <p>Última atualização: {new Date().toLocaleDateString("pt-BR")}</p>

          <h2 className="text-lg font-semibold text-foreground">1. Aceitação dos Termos</h2>
          <p>
            Ao acessar e utilizar o site da Kazoom, você concorda com estes Termos de Uso.
            Se não concordar com qualquer parte destes termos, não utilize nosso site.
          </p>

          <h2 className="text-lg font-semibold text-foreground">2. Produtos e Preços</h2>
          <p>
            Todos os preços são apresentados em Reais (BRL) e incluem impostos aplicáveis.
            Reservamo-nos o direito de alterar preços sem aviso prévio. As imagens dos produtos
            são ilustrativas e podem apresentar pequenas variações em relação ao produto real.
          </p>

          <h2 className="text-lg font-semibold text-foreground">3. Pedidos e Pagamento</h2>
          <p>
            Ao realizar um pedido, você declara que as informações fornecidas são verdadeiras
            e completas. Aceitamos pagamento via PIX e cartão de crédito. O pedido só é confirmado
            após a aprovação do pagamento.
          </p>

          <h2 className="text-lg font-semibold text-foreground">4. Entrega</h2>
          <p>
            Os prazos de entrega são estimados e contam a partir da confirmação do pagamento.
            O prazo padrão é de 3 a 11 dias úteis, podendo variar de acordo com a região.
            Oferecemos frete grátis para todo o Brasil em compras que atendam ao valor mínimo.
          </p>

          <h2 className="text-lg font-semibold text-foreground">5. Propriedade Intelectual</h2>
          <p>
            Todo o conteúdo do site, incluindo textos, imagens, logotipos e layout, é propriedade
            da Kazoom e protegido por leis de propriedade intelectual. É proibida a reprodução sem
            autorização prévia.
          </p>

          <h2 className="text-lg font-semibold text-foreground">6. Limitação de Responsabilidade</h2>
          <p>
            A Kazoom não se responsabiliza por danos indiretos decorrentes do uso do site.
            Faremos o possível para manter o site disponível, mas não garantimos acesso
            ininterrupto.
          </p>

          <h2 className="text-lg font-semibold text-foreground">7. Legislação Aplicável</h2>
          <p>
            Estes termos são regidos pelas leis brasileiras. O Código de Defesa do Consumidor
            (Lei nº 8.078/90) se aplica a todas as relações de consumo realizadas neste site.
          </p>
        </div>
      </div>
    </Layout>
  );
}
