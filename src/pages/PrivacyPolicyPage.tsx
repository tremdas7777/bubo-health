import Layout from "@/components/store/Layout";
import PageHead from "@/components/seo/PageHead";

export default function PrivacyPolicyPage() {
  return (
    <Layout>
      <PageHead
        title="Política de Privacidade | Bazu"
        description="Saiba como a Bazu coleta, usa e protege seus dados pessoais."
      />
      <div className="container mx-auto max-w-3xl px-4 py-12">
        <h1 className="mb-8 text-3xl font-heading font-bold">Política de Privacidade</h1>

        <div className="prose prose-sm max-w-none text-muted-foreground space-y-6">
          <p>Última atualização: {new Date().toLocaleDateString("pt-BR")}</p>

          <h2 className="text-lg font-semibold text-foreground">1. Informações que coletamos</h2>
          <p>
            Coletamos informações pessoais que você nos fornece diretamente ao realizar uma compra,
            incluindo: nome completo, endereço de e-mail, telefone, CPF, endereço de entrega e
            dados de pagamento. Também coletamos automaticamente dados de navegação como endereço IP,
            tipo de navegador, páginas visitadas e horários de acesso.
          </p>

          <h2 className="text-lg font-semibold text-foreground">2. Como usamos suas informações</h2>
          <p>Utilizamos seus dados para:</p>
          <ul className="list-disc pl-6 space-y-1">
            <li>Processar e entregar seus pedidos</li>
            <li>Enviar confirmações de pedido e atualizações de envio</li>
            <li>Fornecer suporte ao cliente</li>
            <li>Melhorar nossos produtos e serviços</li>
            <li>Enviar comunicações de marketing (com seu consentimento)</li>
            <li>Cumprir obrigações legais e regulatórias</li>
          </ul>

          <h2 className="text-lg font-semibold text-foreground">3. Compartilhamento de dados</h2>
          <p>
            Seus dados podem ser compartilhados com parceiros de logística para entrega dos produtos,
            gateways de pagamento para processamento de transações e ferramentas de análise para
            melhoria do serviço. Não vendemos seus dados pessoais a terceiros.
          </p>

          <h2 className="text-lg font-semibold text-foreground">4. Segurança dos dados</h2>
          <p>
            Utilizamos medidas de segurança técnicas e organizacionais para proteger seus dados,
            incluindo criptografia SSL/TLS em todas as transmissões de dados e armazenamento seguro
            em servidores protegidos.
          </p>

          <h2 className="text-lg font-semibold text-foreground">5. Cookies</h2>
          <p>
            Utilizamos cookies para melhorar sua experiência de navegação, lembrar suas preferências
            e analisar o tráfego do site. Você pode gerenciar cookies através das configurações do
            seu navegador.
          </p>

          <h2 className="text-lg font-semibold text-foreground">6. Seus direitos (LGPD)</h2>
          <p>
            De acordo com a Lei Geral de Proteção de Dados (LGPD), você tem direito a: acessar seus
            dados pessoais, corrigir dados incompletos ou desatualizados, solicitar a exclusão de
            dados desnecessários, revogar o consentimento e solicitar a portabilidade dos dados.
          </p>

          <h2 className="text-lg font-semibold text-foreground">7. Contato</h2>
          <p>
            Para exercer seus direitos ou esclarecer dúvidas sobre esta política, entre em contato
            pelo e-mail <strong>contato@bazu.com.br</strong> ou pelo nosso WhatsApp.
          </p>
        </div>
      </div>
    </Layout>
  );
}
