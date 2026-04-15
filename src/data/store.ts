// Product image imports
import imgLampada from "@/assets/products/lampada-inteligente.jpg";
import imgTriturador from "@/assets/products/mini-triturador.jpg";
import imgVasoFlores from "@/assets/products/vaso-flores.jpg";
import imgGamePortatil from "@/assets/products/game-portatil.jpg";
import imgDespertador from "@/assets/products/despertador-digital.jpg";
import imgSmartwatch from "@/assets/products/smartwatch.jpg";
import imgRaquete from "@/assets/products/raquete-beach.jpg";
import imgOculosNatacao from "@/assets/products/oculos-natacao.jpg";
import imgOculosEsportes from "@/assets/products/oculos-esportes.jpg";
import imgCapacete from "@/assets/products/capacete-ciclismo.jpg";
import imgMotosserra from "@/assets/products/mini-motosserra.jpg";
import imgAlicateFriso from "@/assets/products/mini-alicate-friso.jpg";
import imgKitRefrigeracao from "@/assets/products/kit-refrigeracao.jpg";
import imgKitRefrigeracao2 from "@/assets/products/kit-refrigeracao-2.webp";
import imgKitRefrigeracaoManifold from "@/assets/products/kit-refrigeracao-manifold.jpg";
import imgKitRefrigeracaoFlangeador from "@/assets/products/kit-refrigeracao-flangeador.jpg";
import imgKitRefrigeracaoCurvadoras from "@/assets/products/kit-refrigeracao-curvadoras.jpg";
import imgKitRefrigeracaoUso from "@/assets/products/kit-refrigeracao-uso.jpg";
import imgJoelheira from "@/assets/products/joelheira.jpg";
import imgFaixas from "@/assets/products/faixas-treino.jpg";
import imgExercitador from "@/assets/products/exercitador-abdominal.jpg";
import imgMassageador from "@/assets/products/massageador.jpg";
import imgPowerball from "@/assets/products/powerball.jpg";
import imgColetePesca from "@/assets/products/colete-pesca.jpg";
import imgMolinete from "@/assets/products/molinete.jpg";
import imgLinhaPesca from "@/assets/products/linha-pesca.jpg";
import imgCarretilha from "@/assets/products/carretilha.jpg";
import imgAlicatesPesca from "@/assets/products/alicates-pesca.jpg";
import imgSombraDelineadora from "@/assets/products/sombra-delineadora.jpg";
import imgPenteVolumizador from "@/assets/products/pente-volumizador.jpg";
import imgPreenchedorSobrancelha from "@/assets/products/preenchedor-sobrancelha.jpg";
import imgEsmalteEspelhado from "@/assets/products/esmalte-espelhado.jpg";
import imgRimelDefinidor from "@/assets/products/rimel-definidor.jpg";

// Collection image imports
import collCasaCozinha from "@/assets/collection-casa-cozinha.jpg";
import collEletronicos from "@/assets/collection-eletronicos.jpg";
import collEsportes from "@/assets/collection-esportes.jpg";
import collFerramentas from "@/assets/collection-ferramentas.jpg";
import collFitness from "@/assets/collection-fitness.jpg";
import collPesca from "@/assets/collection-pesca.jpg";
import collSaudeBeleza from "@/assets/collection-saude-beleza.jpg";


export interface Product {
  id: string;
  name: string;
  slug: string;
  price: number;
  compareAtPrice?: number;
  image: string;
  images?: string[];
  category: string;
  description: string;
  stock: number;
  badge?: string;
  variants?: string[];
  noIndex?: boolean;
}

export interface Collection {
  id: string;
  name: string;
  slug: string;
  image: string;
}

export const collections: Collection[] = [
  { id: "1", name: "Casa e Cozinha", slug: "casa-e-cozinha", image: collCasaCozinha },
  { id: "2", name: "Eletrônicos", slug: "eletronicos", image: collEletronicos },
  { id: "3", name: "Esportes", slug: "esportes", image: collEsportes },
  { id: "4", name: "Ferramentas", slug: "ferramentas", image: collFerramentas },
  { id: "5", name: "Fitness", slug: "fitness", image: collFitness },
  { id: "6", name: "Pesca", slug: "pesca", image: collPesca },
  { id: "7", name: "Saúde e Beleza", slug: "saude-e-beleza", image: collSaudeBeleza },
];

export const products: Product[] = [
  // ========== Casa e Cozinha ==========
  {
    id: "c1", name: "Lâmpada Inteligente", slug: "lampada-inteligente",
    price: 116.90, compareAtPrice: 159.90,
    image: imgLampada,
    category: "casa-e-cozinha",
    description: "Lâmpada inteligente RGB com controle por app e voz. Compatível com Alexa e Google Home. 16 milhões de cores e temperatura ajustável.",
    stock: 18, variants: ["Branca", "RGB"],
  },
  {
    id: "c3", name: "Mini Triturador Manual", slug: "mini-triturador-manual",
    price: 97.90, compareAtPrice: 222.90,
    image: imgTriturador,
    category: "casa-e-cozinha",
    description: "Mini triturador manual multifuncional para alho, cebola, legumes e frutas. Lâminas em aço inox, fácil de limpar e compacto.",
    stock: 30,
  },
  {
    id: "c5", name: "Vaso de Flores Artificiais", slug: "vaso-flores-artificiais",
    price: 79.90, compareAtPrice: 149.90,
    image: imgVasoFlores,
    category: "casa-e-cozinha",
    description: "Vaso decorativo com flores artificiais de alta qualidade. Material premium que imita flores reais. Ideal para sala e escritório.",
    stock: 40,
  },

  // ========== Eletrônicos ==========
  {
    id: "e1", name: "Game Portátil X39 IPS FULL HD", slug: "game-portatil-x39",
    price: 236.97, compareAtPrice: 569.90,
    image: imgGamePortatil,
    category: "eletronicos",
    description: "Console de jogos portátil com tela IPS Full HD de 4.3 polegadas. Mais de 5000 jogos clássicos incluídos, bateria de longa duração.",
    stock: 15, badge: "Economize 58%",
  },
  {
    id: "e3", name: "Despertador Digital Led", slug: "despertador-digital-led",
    price: 67.90, compareAtPrice: 139.90,
    image: imgDespertador,
    category: "eletronicos",
    description: "Despertador digital com display LED grande, espelhado, mostra hora, temperatura e umidade. Modo noturno com brilho ajustável.",
    stock: 45, badge: "Economize 51%",
  },
  {
    id: "e5", name: "Smartwatch Esportivo Pro", slug: "smartwatch-esportivo-pro",
    price: 199.90, compareAtPrice: 359.90,
    image: imgSmartwatch,
    category: "eletronicos",
    description: "Smartwatch esportivo com tela infinita, monitor cardíaco, oxímetro, GPS integrado e mais de 100 modos esportivos. Resistente à água IP68.",
    stock: 18, badge: "Economize 44%",
  },

  // ========== Esportes ==========
  {
    id: "s1", name: "Raquete Beach Tênis", slug: "raquete-beach-tenis",
    price: 265.00, compareAtPrice: 597.00,
    image: imgRaquete,
    category: "esportes",
    description: "Raquete profissional para beach tennis em fibra de carbono 3K. Núcleo em EVA soft, controle e potência superiores.",
    stock: 12, badge: "Economize 55%",
  },
  {
    id: "s2", name: "Óculos para Natação Profissional", slug: "oculos-natacao",
    price: 137.90, compareAtPrice: 227.90,
    image: imgOculosNatacao,
    category: "esportes",
    description: "Óculos de natação profissional com lentes antiembaçantes, proteção UV e vedação em silicone macio. Ajuste regulável.",
    stock: 35,
  },
  {
    id: "s4", name: "Óculos para Esportes", slug: "oculos-esportes",
    price: 97.90, compareAtPrice: 159.90,
    image: imgOculosEsportes,
    category: "esportes",
    description: "Óculos esportivo com lentes polarizadas, proteção UV400 e armação flexível resistente a impactos. Ideal para ciclismo e corrida.",
    stock: 28,
  },
  {
    id: "s5", name: "Capacete Ultraleve Ciclismo", slug: "capacete-ciclismo",
    price: 149.90, compareAtPrice: 352.90,
    image: imgCapacete,
    category: "esportes",
    description: "Capacete ultraleve para ciclismo com 18 aberturas de ventilação, ajuste traseiro micrométrico e viseira removível.",
    stock: 15, badge: "Economize 57%",
  },

  // ========== Ferramentas ==========
  {
    id: "t4", name: "Mini Motosserra", slug: "mini-motosserra",
    price: 135.00, compareAtPrice: 296.00,
    image: imgMotosserra,
    category: "ferramentas",
    description: "Mini motosserra elétrica portátil com bateria de lítio. Ideal para poda de galhos e corte de madeira. 2 baterias incluídas.",
    stock: 10, badge: "Economize 54%",
  },
  {
    id: "t5", name: "Mini Alicate para Friso", slug: "mini-alicate-friso",
    price: 120.00, compareAtPrice: 265.00,
    image: imgAlicateFriso,
    category: "ferramentas",
    description: "Mini alicate para friso profissional em aço cromo-vanádio. Corte preciso e cabo emborrachado para maior aderência.",
    stock: 22, badge: "Economize 54%",
  },
  {
    id: "t6", name: "Kit Ferramentas 7 CFM P/ Refrigeração Ar Condicionado, 2 Manifolds", slug: "kit-ferramentas-refrigeracao",
    price: 597.00, compareAtPrice: 997.00,
    image: imgKitRefrigeracao,
    images: [imgKitRefrigeracao, imgKitRefrigeracao2, imgKitRefrigeracaoManifold, imgKitRefrigeracaoFlangeador, imgKitRefrigeracaoCurvadoras, imgKitRefrigeracaoUso],
    category: "ferramentas",
    description: "Pare de perder dinheiro comprando ferramentas avulsas. Este Kit Profissional reúne TUDO para Refrigeração e Ar Condicionado em uma única maleta: Bomba de Vácuo 7 CFM Duplo Estágio de alta performance, 2 Conjuntos Manifold completos (R134 e R410 — compatíveis com R22, R32, R404A e R134a), flangeador excêntrico com rotação 360° para acabamentos perfeitos, cortador e alargador de tubos de cobre, escareador, 5 curvadoras de tubo em medidas diferentes, multímetro digital com capacímetro, termômetro digital, alicate amperímetro, caneta detectora de tensão, maçarico portátil para solda até 1.200°C, 2 chaves inglesas, kit chave Allen completo, mangueiras profissionais para todos os gases, pasta fluxo 50g, varetas Foscoper e maleta organizadora reforçada. São 18 kg de ferramentas profissionais, bivolt 110/220V, prontas para você trabalhar em qualquer instalação, manutenção, limpeza ou recarga. O técnico que tem esse kit na mão não precisa de mais nada.",
    stock: 5, badge: "Economize 65%",
  },

  // ========== Fitness ==========
  {
    id: "f1", name: "Joelheira para Treino", slug: "joelheira-treino",
    price: 79.90, compareAtPrice: 235.90,
    image: imgJoelheira,
    category: "fitness",
    description: "Joelheira esportiva com suporte de compressão 3D. Proteção anti-impacto, tecido respirável e ajuste anatômico.",
    stock: 55, badge: "Economize 66%",
  },
  {
    id: "f2", name: "Faixas para Treino", slug: "faixas-treino",
    price: 59.90, compareAtPrice: 120.00,
    image: imgFaixas,
    category: "fitness",
    description: "Kit com 5 faixas elásticas de resistência variada. Perfeito para treinos em casa, pilates, yoga e fisioterapia.",
    stock: 75, badge: "Economize 50%",
  },
  {
    id: "f3", name: "Exercitador Abdominal", slug: "exercitador-abdominal",
    price: 137.50, compareAtPrice: 265.00,
    image: imgExercitador,
    category: "fitness",
    description: "Roda de exercício abdominal com sistema de retorno automático. Pegadores antiderrapantes e tapete para joelhos incluído.",
    stock: 30, badge: "Economize 48%",
  },
  {
    id: "f4", name: "Massageador Muscular", slug: "massageador-muscular",
    price: 99.00, compareAtPrice: 219.00,
    image: imgMassageador,
    category: "fitness",
    description: "Massageador muscular elétrico tipo pistola com 6 cabeças intercambiáveis e 20 níveis de intensidade. Bateria de 6h.",
    stock: 20, badge: "Economize 54%",
  },
  {
    id: "f5", name: "Bola Giroscópica para Pulso", slug: "bola-giroscopica-pulso",
    price: 200.00, compareAtPrice: 350.00,
    image: imgPowerball,
    category: "fitness",
    description: "Bola giroscópica para fortalecimento de pulso, antebraço e mão. Com LED indicador e contador digital de rotações. Ideal para reabilitação e treino.",
    stock: 25, badge: "Economize 42%",
  },

  // ========== Pesca ==========
  {
    id: "p1", name: "Colete Camuflado para Pesca", slug: "colete-pesca",
    price: 95.90, compareAtPrice: 165.90,
    image: imgColetePesca,
    category: "pesca",
    description: "Colete camuflado multibolsos para pesca. Tecido respirável, secagem rápida e múltiplos compartimentos para acessórios.",
    stock: 18,
  },
  {
    id: "p2", name: "Molinete 12 Rolamentos", slug: "molinete-12-rolamentos",
    price: 117.90, compareAtPrice: 237.90,
    image: imgMolinete,
    category: "pesca",
    description: "Molinete profissional com 12 rolamentos de aço inoxidável. Corpo em alumínio, sistema anti-corrosão para água salgada.",
    stock: 22, badge: "Economize 50%",
  },
  {
    id: "p3", name: "Linha para Pesca", slug: "linha-pesca",
    price: 67.90, compareAtPrice: 127.90,
    image: imgLinhaPesca,
    category: "pesca",
    description: "Linha de pesca multifilamento trançada de alta resistência. 300 metros, 4 fios, disponível em várias libragens.",
    stock: 80,
  },
  {
    id: "p4", name: "Carretilha Profissional", slug: "carretilha-profissional",
    price: 239.90, compareAtPrice: 427.90,
    image: imgCarretilha,
    category: "pesca",
    description: "Carretilha profissional com freio magnético, 7 rolamentos e relação 7.2:1. Corpo em alumínio usinado.",
    stock: 10, badge: "Economize 43%",
  },
  {
    id: "p5", name: "Kit Alicates para Pesca", slug: "kit-alicates-pesca",
    price: 97.90, compareAtPrice: 139.90,
    image: imgAlicatesPesca,
    category: "pesca",
    description: "Kit com 3 alicates para pesca: bico fino, corte e extrator de anzol. Aço inox com cabo emborrachado e cordão de segurança.",
    stock: 35,
  },

  // ========== Saúde e Beleza ==========
  {
    id: "sb1", name: "Sombra Delineadora Arábica", slug: "sombra-delineadora-arabica",
    price: 69.99, compareAtPrice: 239.99,
    image: imgSombraDelineadora,
    category: "saude-e-beleza",
    description: "Sombra delineadora com pigmentação intensa e acabamento cintilante. Fórmula de longa duração, à prova d'água. Ideal para looks sofisticados e marcantes.",
    stock: 30, badge: "Economize 70%",
  },
  {
    id: "sb2", name: "Pente Volumizador", slug: "pente-volumizador",
    price: 59.99, compareAtPrice: 129.99,
    image: imgPenteVolumizador,
    category: "saude-e-beleza",
    description: "Pente volumizador profissional que cria volume instantâneo nos cabelos. Design ergonômico com cerdas flexíveis, ideal para todos os tipos de cabelo.",
    stock: 35, badge: "Economize 53%",
  },
  {
    id: "sb3", name: "Preenchedor de Sobrancelha Profissional", slug: "preenchedor-sobrancelha",
    price: 59.99, compareAtPrice: 199.99,
    image: imgPreenchedorSobrancelha,
    category: "saude-e-beleza",
    description: "Preenchedor de sobrancelha com ponta micro-fina para traços realistas fio a fio. Resistente à água e ao suor, duração de até 24 horas.",
    stock: 40, badge: "Economize 70%",
  },
  {
    id: "sb4", name: "Esmalte Espelhado", slug: "esmalte-espelhado",
    price: 49.99, compareAtPrice: 159.99,
    image: imgEsmalteEspelhado,
    category: "saude-e-beleza",
    description: "Esmalte com efeito espelhado cromado de alta durabilidade. Acabamento metalizado brilhante, secagem rápida e fórmula livre de componentes tóxicos.",
    stock: 50, badge: "Economize 68%",
  },
  {
    id: "sb5", name: "Rímel Definidor de Cílios", slug: "rimel-definidor-cilios",
    price: 109.99, compareAtPrice: 219.99,
    image: imgRimelDefinidor,
    category: "saude-e-beleza",
    description: "Rímel definidor com escova curvada que alonga e separa cada cílio. Fórmula à prova d'água com fibras de extensão para volume extremo.",
    stock: 25, badge: "Economize 50%",
  },
];
export const navLinks = [
  { name: "Página inicial", href: "/" },
  { name: "Casa e Cozinha", href: "/colecao/casa-e-cozinha" },
  { name: "Eletrônicos", href: "/colecao/eletronicos" },
  { name: "Ferramentas", href: "/colecao/ferramentas" },
  { name: "Fitness", href: "/colecao/fitness" },
  { name: "Pesca", href: "/colecao/pesca" },
  { name: "Saúde e Beleza", href: "/colecao/saude-e-beleza" },
  { name: "Sobre nós", href: "/sobre" },
];

export const categoryOrder = [
  "casa-e-cozinha",
  "eletronicos",
  "esportes",
  "ferramentas",
  "fitness",
  "pesca",
  "saude-e-beleza",
];

export function formatPrice(price: number): string {
  return `R$ ${price.toFixed(2).replace('.', ',')}`;
}

export function getInstallmentPrice(price: number, installments: number = 6): string {
  if (installments <= 1) return formatPrice(price);
  const RATE = 0.0249;
  const totalWithInterest = price * Math.pow(1 + RATE, installments);
  return formatPrice(totalWithInterest / installments);
}

export function getDiscountPercent(price: number, compareAt: number): number {
  return Math.round(((compareAt - price) / compareAt) * 100);
}

export function getProductsByCategory(category: string): Product[] {
  return products.filter((p) => p.category === category);
}

export function getCategoryName(slug: string): string {
  const col = collections.find((c) => c.slug === slug);
  return col?.name || slug;
}
