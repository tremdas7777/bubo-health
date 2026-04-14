import { useParams } from "react-router-dom";
import { useState } from "react";
import Layout from "@/components/store/Layout";
import ProductCard from "@/components/store/ProductCard";
import Breadcrumbs from "@/components/store/Breadcrumbs";
import { useDbProducts, useDbCollections, filterByCategory } from "@/hooks/useProducts";
import PageHead from "@/components/seo/PageHead";
import BreadcrumbJsonLd from "@/components/seo/BreadcrumbJsonLd";
import FAQJsonLd from "@/components/seo/FAQJsonLd";

const collectionFAQs: Record<string, { question: string; answer: string }[]> = {
  "casa-e-cozinha": [
    { question: "Quais produtos de casa e cozinha a Kazoom oferece?", answer: "Oferecemos utensílios domésticos práticos como trituradores, vasos decorativos, despertadores e iluminação inteligente, todos com frete grátis." },
    { question: "Os produtos de cozinha têm garantia?", answer: "Sim, todos os produtos possuem garantia de 30 dias com devolução sem burocracia." },
    { question: "Posso parcelar as compras?", answer: "Sim, parcele em até 6x sem juros no cartão ou ganhe desconto extra pagando no PIX." },
  ],
  "eletronicos": [
    { question: "Quais eletrônicos vocês vendem?", answer: "Vendemos smartwatches, consoles portáteis, despertadores digitais e lâmpadas inteligentes com conectividade Wi-Fi." },
    { question: "Os eletrônicos possuem nota fiscal?", answer: "Sim, todos os pedidos acompanham nota fiscal eletrônica enviada por e-mail." },
    { question: "Qual o prazo de entrega dos eletrônicos?", answer: "O envio é feito pelos Correios em 3 a 11 dias úteis com frete grátis para todo o Brasil." },
  ],
  "esportes": [
    { question: "Que tipo de produtos esportivos a Kazoom tem?", answer: "Temos raquetes de beach tennis, óculos de natação, capacetes de ciclismo, óculos esportivos e muito mais." },
    { question: "Os óculos esportivos possuem proteção UV?", answer: "Sim, nossos óculos esportivos contam com lentes com proteção UV400 para máxima segurança." },
    { question: "Vocês oferecem frete grátis para produtos esportivos?", answer: "Sim, todos os produtos da loja possuem frete grátis para todo o Brasil." },
  ],
  "ferramentas": [
    { question: "O kit de ferramentas para refrigeração é profissional?", answer: "Sim, é um kit completo com bomba de vácuo 7 CFM, 2 manifolds, flangeador excêntrico, maçarico e mais de 20 ferramentas profissionais." },
    { question: "As ferramentas são bivolt?", answer: "Sim, a bomba de vácuo e equipamentos elétricos do kit são bivolt (110/220V)." },
    { question: "Qual a garantia das ferramentas?", answer: "Todas as ferramentas possuem garantia de 30 dias. Se não ficar satisfeito, devolvemos seu dinheiro." },
  ],
  "fitness": [
    { question: "Quais equipamentos de fitness vocês oferecem?", answer: "Temos joelheiras profissionais, faixas de treino, exercitadores abdominais, massageadores musculares e powerballs." },
    { question: "Os produtos de fitness são indicados para iniciantes?", answer: "Sim, nossos produtos atendem desde iniciantes até atletas avançados, com diferentes níveis de resistência." },
    { question: "Posso usar os equipamentos em casa?", answer: "Com certeza! Todos os produtos são projetados para uso em casa, academia ou ao ar livre." },
  ],
  "pesca": [
    { question: "Vocês vendem equipamentos de pesca profissional?", answer: "Sim, temos molinetes de 12 rolamentos, carretilhas, linhas multifilamento, coletes e kits de alicates profissionais." },
    { question: "Os molinetes são de boa qualidade?", answer: "Nossos molinetes possuem 12 rolamentos de aço inoxidável, proporcionando operação suave e durabilidade superior." },
    { question: "Vocês entregam em todo o Brasil?", answer: "Sim, enviamos para todo o Brasil com frete grátis via Correios." },
  ],
  "saude-e-beleza": [
    { question: "Os cosméticos são seguros?", answer: "Sim, todos os produtos de beleza são testados dermatologicamente e seguem as normas de segurança da ANVISA." },
    { question: "Quais produtos de beleza vocês vendem?", answer: "Temos sombras, delineadores, pentes volumizadores, preenchedores de sobrancelha, esmaltes espelhados e rímel definidor." },
    { question: "Como funciona a troca de cosméticos?", answer: "Você tem 7 dias para devolver qualquer produto, sem burocracia. Basta entrar em contato pelo WhatsApp." },
  ],
};

const collectionDescriptions: Record<string, string> = {
  "casa-e-cozinha": "Descubra utensílios e acessórios para transformar sua casa. De iluminação inteligente a trituradores práticos, tudo com frete grátis e parcela em até 6x.",
  "eletronicos": "Eletrônicos que fazem a diferença no seu dia a dia. Smartwatches, consoles portáteis, despertadores LED e mais, tudo com garantia de 30 dias.",
  "esportes": "Equipamentos esportivos de alta performance. Raquetes, óculos, capacetes e acessórios para todos os esportes, com envio grátis para todo o Brasil.",
  "ferramentas": "Ferramentas profissionais para refrigeração, construção e manutenção. Kits completos com garantia e frete grátis.",
  "fitness": "Equipamentos de fitness para treinar em casa ou na academia. Faixas, joelheiras, massageadores e mais, com parcela em até 6x.",
  "pesca": "Tudo para pesca esportiva e profissional. Molinetes, carretilhas, linhas e acessórios de alta qualidade com envio grátis.",
  "saude-e-beleza": "Cosméticos e produtos de beleza selecionados. Maquiagem, cuidados com cabelo e unhas, tudo com frete grátis e garantia.",
};

export default function CollectionPage() {
  const { slug } = useParams<{ slug: string }>();
  const { data: products = [] } = useDbProducts();
  const { data: collections = [] } = useDbCollections();
  const collection = collections.find((c) => c.slug === slug);
  const filtered = filterByCategory(products, slug || "");
  const [sortBy, setSortBy] = useState("default");
  const [filterAvail, setFilterAvail] = useState("all");

  let sorted = [...filtered];
  if (sortBy === "price-asc") sorted.sort((a, b) => a.price - b.price);
  if (sortBy === "price-desc") sorted.sort((a, b) => b.price - a.price);
  if (sortBy === "name-asc") sorted.sort((a, b) => a.name.localeCompare(b.name));
  if (filterAvail === "in-stock") sorted = sorted.filter((p) => p.stock > 0);

  const collectionName = collection?.name || "Coleção";
  const origin = window.location.origin;
  const collectionUrl = `${origin}/colecao/${slug}`;
  const seoDescription = (slug && collectionDescriptions[slug]) || `Confira os melhores produtos de ${collectionName} na Kazoom. Frete grátis e parcele em até 6x.`;
  const faqs = (slug && collectionFAQs[slug]) || [];

  return (
    <Layout>
      <PageHead
        title={`${collectionName} | Kazoom`}
        description={seoDescription}
        canonical={collectionUrl}
      />
      <BreadcrumbJsonLd
        items={[
          { name: "Início", url: origin },
          { name: collectionName, url: collectionUrl },
        ]}
      />
      {faqs.length > 0 && <FAQJsonLd items={faqs} />}

      <div className="container mx-auto px-4 py-8">
        <Breadcrumbs items={[{ label: collectionName }]} />

        <h1 className="text-2xl md:text-3xl font-heading font-bold text-center mb-2">
          {collectionName}
        </h1>
        <p className="text-center text-sm text-muted-foreground max-w-xl mx-auto mb-6">
          {seoDescription}
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 my-6 border-y border-border py-4">
          <div className="flex items-center gap-4 text-sm">
            <span className="text-muted-foreground">Filtrar:</span>
            <select
              value={filterAvail}
              onChange={(e) => setFilterAvail(e.target.value)}
              className="border border-border rounded-lg px-3 py-1.5 text-sm bg-background"
            >
              <option value="all">Disponibilidade</option>
              <option value="in-stock">Em estoque</option>
            </select>
          </div>
          <div className="flex items-center gap-4 text-sm">
            <span className="text-muted-foreground">Ordenar por:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="border border-border rounded-lg px-3 py-1.5 text-sm bg-background"
            >
              <option value="default">Ordem alfabética, A–Z</option>
              <option value="name-asc">Nome, A–Z</option>
              <option value="price-asc">Preço, menor para maior</option>
              <option value="price-desc">Preço, maior para menor</option>
            </select>
            <span className="text-muted-foreground">{sorted.length} produtos</span>
          </div>
        </div>

        {sorted.length === 0 ? (
          <p className="text-center text-muted-foreground py-20">
            Nenhum produto encontrado nesta coleção.
          </p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6 max-w-5xl mx-auto">
            {sorted.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}

        {/* FAQ Section for SEO */}
        {faqs.length > 0 && (
          <div className="mt-12 max-w-3xl mx-auto border-t border-border pt-8">
            <h2 className="text-lg font-heading font-semibold mb-4">Perguntas Frequentes sobre {collectionName}</h2>
            <div className="space-y-4">
              {faqs.map((faq, i) => (
                <details key={i} className="group border border-border rounded-lg">
                  <summary className="flex items-center justify-between cursor-pointer p-4 text-sm font-medium hover:text-primary">
                    {faq.question}
                    <span className="ml-2 text-muted-foreground group-open:rotate-180 transition-transform">▼</span>
                  </summary>
                  <p className="px-4 pb-4 text-sm text-muted-foreground leading-relaxed">{faq.answer}</p>
                </details>
              ))}
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
