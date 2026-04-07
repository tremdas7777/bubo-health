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
}

export interface Collection {
  id: string;
  name: string;
  slug: string;
  image: string;
}

export const collections: Collection[] = [
  { id: "1", name: "Casa e Cozinha", slug: "casa-e-cozinha", image: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=600&h=600&fit=crop" },
  { id: "2", name: "Eletrônicos", slug: "eletronicos", image: "https://images.unsplash.com/photo-1498049794561-7780e7231661?w=600&h=600&fit=crop" },
  { id: "3", name: "Esportes", slug: "esportes", image: "https://images.unsplash.com/photo-1461896836934-bd45ba8a0936?w=600&h=600&fit=crop" },
  { id: "4", name: "Ferramentas", slug: "ferramentas", image: "https://images.unsplash.com/photo-1581783898377-1c85bf937427?w=600&h=600&fit=crop" },
  { id: "5", name: "Fitness", slug: "fitness", image: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=600&h=600&fit=crop" },
  { id: "6", name: "Pesca", slug: "pesca", image: "https://images.unsplash.com/photo-1504309092620-4d0ec726efa4?w=600&h=600&fit=crop" },
  { id: "7", name: "Saúde e Beleza", slug: "saude-e-beleza", image: "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=600&h=600&fit=crop" },
];

export const products: Product[] = [
  // Casa e Cozinha
  {
    id: "c1", name: "Mini Triturador Manual", slug: "mini-triturador-manual",
    price: 97.90, compareAtPrice: 222.90,
    image: "https://images.unsplash.com/photo-1585515320310-259814833e62?w=600&h=600&fit=crop",
    category: "casa-e-cozinha",
    description: "Mini triturador manual multifuncional para alho, cebola, legumes e frutas. Lâminas em aço inox, fácil de limpar e compacto para guardar.",
    stock: 30,
  },
  {
    id: "c2", name: "Difusor de Aroma", slug: "difusor-de-aroma",
    price: 99.90, compareAtPrice: 199.90,
    image: "https://images.unsplash.com/photo-1602928321679-560bb453f190?w=600&h=600&fit=crop",
    category: "casa-e-cozinha",
    description: "Difusor de aroma ultrassônico com LED colorido. Capacidade de 300ml, timer automático e modo noturno silencioso.",
    stock: 25, badge: "Economize 50%",
  },
  {
    id: "c3", name: "Vaso de Flores Artificiais", slug: "vaso-flores-artificiais",
    price: 79.90, compareAtPrice: 149.90,
    image: "https://images.unsplash.com/photo-1487530811176-3780de880c2d?w=600&h=600&fit=crop",
    category: "casa-e-cozinha",
    description: "Vaso decorativo com flores artificiais de alta qualidade. Material premium que imita flores reais. Ideal para sala, quarto e escritório.",
    stock: 40,
  },
  {
    id: "c4", name: "Lâmpada Inteligente", slug: "lampada-inteligente",
    price: 116.90, compareAtPrice: 159.90,
    image: "https://images.unsplash.com/photo-1550985616-10810253b84d?w=600&h=600&fit=crop",
    category: "casa-e-cozinha",
    description: "Lâmpada inteligente RGB com controle por app e voz. Compatível com Alexa e Google Home. 16 milhões de cores.",
    stock: 18, variants: ["Branca", "RGB"],
  },
  {
    id: "c5", name: "Utensílios para Cozinha", slug: "utensilios-cozinha",
    price: 96.90, compareAtPrice: 139.90,
    image: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=600&h=600&fit=crop",
    category: "casa-e-cozinha",
    description: "Kit com 6 utensílios de cozinha em silicone e bambu. Antiaderente, resistente ao calor e fácil de limpar.",
    stock: 35,
  },
  {
    id: "c6", name: "Conjunto de Panelas Antiaderente", slug: "conjunto-panelas",
    price: 249.90, compareAtPrice: 499.90,
    image: "https://images.unsplash.com/photo-1584990347449-a5d9f800c7d1?w=600&h=600&fit=crop",
    category: "casa-e-cozinha",
    description: "Conjunto com 5 peças de panelas antiaderentes de alta qualidade. Revestimento cerâmico e cabos ergonômicos.",
    stock: 12, badge: "Economize 50%",
  },

  // Eletrônicos
  {
    id: "e1", name: "Fone de Ouvido Bluetooth Premium", slug: "fone-bluetooth-premium",
    price: 89.90, compareAtPrice: 179.90,
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&h=600&fit=crop",
    category: "eletronicos",
    description: "Fone de ouvido bluetooth com cancelamento de ruído ativo, bateria de 30 horas e som cristalino.",
    stock: 25, badge: "Economize 50%",
  },
  {
    id: "e2", name: "Smartwatch Esportivo", slug: "smartwatch-esportivo",
    price: 199.90, compareAtPrice: 399.90,
    image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&h=600&fit=crop",
    category: "eletronicos",
    description: "Smartwatch com monitor cardíaco, GPS integrado e resistente à água. Acompanhe seus treinos e notificações.",
    stock: 15, badge: "Economize 50%",
  },
  {
    id: "e3", name: "Caixa de Som Portátil", slug: "caixa-som-portatil",
    price: 149.90, compareAtPrice: 299.90,
    image: "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=600&h=600&fit=crop",
    category: "eletronicos",
    description: "Caixa de som portátil à prova d'água com 20h de bateria. Som potente 360° e bluetooth 5.0.",
    stock: 40, badge: "Economize 50%",
  },
  {
    id: "e4", name: "Carregador Portátil 20000mAh", slug: "carregador-portatil",
    price: 119.90, compareAtPrice: 239.90,
    image: "https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?w=600&h=600&fit=crop",
    category: "eletronicos",
    description: "Power bank de 20000mAh com carregamento rápido. 2 portas USB e 1 porta USB-C. Compatível com todos os smartphones.",
    stock: 50, badge: "Economize 50%",
  },
  {
    id: "e5", name: "Webcam Full HD 1080p", slug: "webcam-full-hd",
    price: 139.90, compareAtPrice: 259.90,
    image: "https://images.unsplash.com/photo-1587826080692-f439cd0b70da?w=600&h=600&fit=crop",
    category: "eletronicos",
    description: "Webcam Full HD 1080p com microfone integrado e correção automática de luz. Ideal para reuniões e streaming.",
    stock: 20,
  },
  {
    id: "e6", name: "Mouse Gamer RGB", slug: "mouse-gamer-rgb",
    price: 79.90, compareAtPrice: 159.90,
    image: "https://images.unsplash.com/photo-1527814050087-3793815479db?w=600&h=600&fit=crop",
    category: "eletronicos",
    description: "Mouse gamer com sensor óptico de 12000 DPI, 7 botões programáveis e iluminação RGB personalizável.",
    stock: 60, badge: "Economize 50%",
  },

  // Fitness
  {
    id: "f1", name: "Kit Yoga Completo", slug: "kit-yoga-completo",
    price: 129.90, compareAtPrice: 259.90,
    image: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=600&h=600&fit=crop",
    category: "fitness",
    description: "Kit completo com tapete antiderrapante, blocos, cinta e bolsa de transporte.",
    stock: 30, badge: "Economize 50%",
  },
  {
    id: "f2", name: "Halter Ajustável 24kg", slug: "halter-ajustavel-24kg",
    price: 349.90, compareAtPrice: 599.90,
    image: "https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=600&h=600&fit=crop",
    category: "fitness",
    description: "Halter ajustável de 2kg a 24kg com sistema de seleção rápida. Substitui até 15 pares de halteres.",
    stock: 8,
  },
  {
    id: "f3", name: "Corda de Pular Profissional", slug: "corda-pular-profissional",
    price: 49.90, compareAtPrice: 99.90,
    image: "https://images.unsplash.com/photo-1598289431512-b97b0917affc?w=600&h=600&fit=crop",
    category: "fitness",
    description: "Corda de pular com rolamento de aço, cabo ajustável e pegadores antiderrapantes. Ideal para treinos HIIT.",
    stock: 100, badge: "Economize 50%",
  },
  {
    id: "f4", name: "Faixa Elástica Kit 5 Peças", slug: "faixa-elastica-kit",
    price: 69.90, compareAtPrice: 139.90,
    image: "https://images.unsplash.com/photo-1517963879433-6ad2b056d712?w=600&h=600&fit=crop",
    category: "fitness",
    description: "Kit com 5 faixas elásticas de resistência variada. Perfeito para treinos em casa, pilates e fisioterapia.",
    stock: 75, badge: "Economize 50%",
  },
  {
    id: "f5", name: "Garrafa Térmica Esportiva", slug: "garrafa-termica-esportiva",
    price: 59.90, compareAtPrice: 119.90,
    image: "https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=600&h=600&fit=crop",
    category: "fitness",
    description: "Garrafa térmica de 750ml em aço inox. Mantém bebidas geladas por 24h e quentes por 12h.",
    stock: 90, badge: "Economize 50%",
  },
  {
    id: "f6", name: "Luvas para Academia", slug: "luvas-academia",
    price: 44.90, compareAtPrice: 89.90,
    image: "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=600&h=600&fit=crop",
    category: "fitness",
    description: "Luvas para musculação com reforço em couro sintético, ventilação e apoio de pulso ajustável.",
    stock: 55, badge: "Economize 50%",
  },

  // Esportes
  {
    id: "s1", name: "Tênis Esportivo Running", slug: "tenis-esportivo-running",
    price: 199.90, compareAtPrice: 399.90,
    image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&h=600&fit=crop",
    category: "esportes",
    description: "Tênis para corrida com amortecimento em gel, solado antiderrapante e tecido respirável.",
    stock: 50, badge: "Economize 50%",
  },
  {
    id: "s2", name: "Bola de Basquete Oficial", slug: "bola-basquete-oficial",
    price: 97.90, compareAtPrice: 159.90,
    image: "https://images.unsplash.com/photo-1519861531473-9200262188bf?w=600&h=600&fit=crop",
    category: "esportes",
    description: "Bola de basquete tamanho oficial com couro sintético premium. Grip superior para quadras indoor e outdoor.",
    stock: 45,
  },
  {
    id: "s3", name: "Óculos para Natação Profissional", slug: "oculos-natacao",
    price: 137.90, compareAtPrice: 227.90,
    image: "https://images.unsplash.com/photo-1560089000-7433a4ebbd64?w=600&h=600&fit=crop",
    category: "esportes",
    description: "Óculos de natação profissional com lentes antiembaçantes, proteção UV e vedação em silicone.",
    stock: 35,
  },
  {
    id: "s4", name: "Tênis Esportivo", slug: "tenis-esportivo",
    price: 119.90, compareAtPrice: 217.90,
    image: "https://images.unsplash.com/photo-1491553895911-0055eca6402d?w=600&h=600&fit=crop",
    category: "esportes",
    description: "Tênis esportivo casual com design moderno, solado em borracha e palmilha confortável.",
    stock: 40,
  },
  {
    id: "s5", name: "Óculos para Esportes", slug: "oculos-esportes",
    price: 97.90, compareAtPrice: 159.90,
    image: "https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=600&h=600&fit=crop",
    category: "esportes",
    description: "Óculos esportivo com lentes polarizadas, proteção UV400 e armação flexível resistente a impactos.",
    stock: 28,
  },
  {
    id: "s6", name: "Capacete Ultraleve Ciclismo", slug: "capacete-ciclismo",
    price: 149.90, compareAtPrice: 352.90,
    image: "https://images.unsplash.com/photo-1557803175-2f6e70e6f906?w=600&h=600&fit=crop",
    category: "esportes",
    description: "Capacete ultraleve para ciclismo com ventilação integrada, ajuste traseiro e viseira removível.",
    stock: 15, badge: "Economize 57%",
  },

  // Ferramentas
  {
    id: "t1", name: "Kit Ferramentas 120 Peças", slug: "kit-ferramentas-120",
    price: 189.90, compareAtPrice: 379.90,
    image: "https://images.unsplash.com/photo-1581783898377-1c85bf937427?w=600&h=600&fit=crop",
    category: "ferramentas",
    description: "Kit completo com 120 peças em maleta de alumínio. Chaves, alicates, martelo, trena e muito mais.",
    stock: 20, badge: "Economize 50%",
  },
  {
    id: "t2", name: "Furadeira sem Fio 21V", slug: "furadeira-sem-fio",
    price: 229.90, compareAtPrice: 459.90,
    image: "https://images.unsplash.com/photo-1504148455328-c376907d081c?w=600&h=600&fit=crop",
    category: "ferramentas",
    description: "Furadeira/parafusadeira sem fio 21V com 2 baterias de lítio, maleta e kit de 30 brocas e bits.",
    stock: 12, badge: "Economize 50%",
  },
  {
    id: "t3", name: "Trena a Laser 40m", slug: "trena-laser-40m",
    price: 149.90, compareAtPrice: 299.90,
    image: "https://images.unsplash.com/photo-1572981779307-38b8cabb2407?w=600&h=600&fit=crop",
    category: "ferramentas",
    description: "Medidor a laser digital com alcance de 40 metros. Display LCD, memória para 20 medições e nível integrado.",
    stock: 25, badge: "Economize 50%",
  },
  {
    id: "t4", name: "Alicate Multifuncional", slug: "alicate-multifuncional",
    price: 68.90,
    image: "https://images.unsplash.com/photo-1586864387967-d02ef85d93e8?w=600&h=600&fit=crop",
    category: "ferramentas",
    description: "Alicate multifuncional 14 em 1 com lâmina, serra, chave de fenda, abridor e muito mais. Aço inox resistente.",
    stock: 50,
  },
  {
    id: "t5", name: "Serra Tico-Tico 500W", slug: "serra-tico-tico",
    price: 179.90, compareAtPrice: 349.90,
    image: "https://images.unsplash.com/photo-1572981779307-38b8cabb2407?w=600&h=600&fit=crop",
    category: "ferramentas",
    description: "Serra tico-tico elétrica de 500W com velocidade variável, guia a laser e sistema de troca rápida de lâmina.",
    stock: 10,
  },
  {
    id: "t6", name: "Nível a Laser 360°", slug: "nivel-laser-360",
    price: 199.90, compareAtPrice: 399.90,
    image: "https://images.unsplash.com/photo-1504148455328-c376907d081c?w=600&h=600&fit=crop",
    category: "ferramentas",
    description: "Nível a laser autonivelante com projeção 360° em linhas horizontais e verticais. Alcance de 20 metros.",
    stock: 8, badge: "Economize 50%",
  },

  // Pesca
  {
    id: "p1", name: "Vara de Pesca Carbono", slug: "vara-pesca-carbono",
    price: 159.90, compareAtPrice: 319.90,
    image: "https://images.unsplash.com/photo-1504309092620-4d0ec726efa4?w=600&h=600&fit=crop",
    category: "pesca",
    description: "Vara de pesca em fibra de carbono ultraleve e resistente. 2.1m telescópica, ideal para rios e lagos.",
    stock: 18, badge: "Economize 50%",
  },
  {
    id: "p2", name: "Molinete Profissional", slug: "molinete-profissional",
    price: 129.90, compareAtPrice: 259.90,
    image: "https://images.unsplash.com/photo-1540979388789-6cee28a1cdc9?w=600&h=600&fit=crop",
    category: "pesca",
    description: "Molinete profissional com 13 rolamentos, corpo em alumínio e sistema anti-corrosão para água salgada.",
    stock: 22, badge: "Economize 50%",
  },
  {
    id: "p3", name: "Kit Anzóis 500 Peças", slug: "kit-anzois-500",
    price: 49.90, compareAtPrice: 99.90,
    image: "https://images.unsplash.com/photo-1504309092620-4d0ec726efa4?w=600&h=600&fit=crop",
    category: "pesca",
    description: "Kit com 500 anzóis variados em aço carbono. 10 tamanhos diferentes com caixa organizadora.",
    stock: 80, badge: "Economize 50%",
  },
  {
    id: "p4", name: "Barraca de Pesca 2 Pessoas", slug: "barraca-pesca",
    price: 189.90, compareAtPrice: 379.90,
    image: "https://images.unsplash.com/photo-1478827536114-da961b7f86d2?w=600&h=600&fit=crop",
    category: "pesca",
    description: "Barraca para pesca e camping para 2 pessoas. Impermeável, montagem rápida e proteção UV.",
    stock: 10, badge: "Economize 50%",
  },
  {
    id: "p5", name: "Cooler Térmico 36L", slug: "cooler-termico-36l",
    price: 139.90, compareAtPrice: 279.90,
    image: "https://images.unsplash.com/photo-1571068316344-75bc76f77890?w=600&h=600&fit=crop",
    category: "pesca",
    description: "Cooler térmico de 36 litros com isolamento de alta densidade. Mantém gelo por até 5 dias.",
    stock: 15, badge: "Economize 50%",
  },

  // Saúde e Beleza
  {
    id: "b1", name: "Kit Skincare Completo", slug: "kit-skincare-completo",
    price: 99.90, compareAtPrice: 199.90,
    image: "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=600&h=600&fit=crop",
    category: "saude-e-beleza",
    description: "Kit com limpador facial, tônico, sérum e hidratante. Fórmula natural com vitamina C e ácido hialurônico.",
    stock: 35, badge: "Economize 50%",
  },
  {
    id: "b2", name: "Escova Facial Elétrica", slug: "escova-facial-eletrica",
    price: 89.90, compareAtPrice: 179.90,
    image: "https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=600&h=600&fit=crop",
    category: "saude-e-beleza",
    description: "Escova facial elétrica com 3 velocidades e 4 cabeças intercambiáveis. Limpeza profunda e esfoliação suave.",
    stock: 28, badge: "Economize 50%",
  },
  {
    id: "b3", name: "Massageador Corporal", slug: "massageador-corporal",
    price: 149.90, compareAtPrice: 299.90,
    image: "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=600&h=600&fit=crop",
    category: "saude-e-beleza",
    description: "Massageador elétrico com 6 cabeças intercambiáveis e 20 níveis de intensidade. Alivia tensões musculares.",
    stock: 20, badge: "Economize 50%",
  },
  {
    id: "b4", name: "Kit Maquiagem Profissional", slug: "kit-maquiagem",
    price: 179.90, compareAtPrice: 359.90,
    image: "https://images.unsplash.com/photo-1512496015851-a90fb38ba796?w=600&h=600&fit=crop",
    category: "saude-e-beleza",
    description: "Maleta de maquiagem profissional com paleta de sombras, batons, pincéis e acessórios. 48 peças.",
    stock: 15, badge: "Economize 50%",
  },
  {
    id: "b5", name: "Secador de Cabelo Iônico", slug: "secador-ionico",
    price: 129.90, compareAtPrice: 259.90,
    image: "https://images.unsplash.com/photo-1522338140262-f46f5913618a?w=600&h=600&fit=crop",
    category: "saude-e-beleza",
    description: "Secador profissional com tecnologia iônica, 2200W, 3 temperaturas e 2 velocidades. Cabo de 2.5m.",
    stock: 32, badge: "Economize 50%",
  },
];

export const navLinks = [
  { name: "Página inicial", href: "/" },
  { name: "Casa e Cozinha", href: "/colecao/casa-e-cozinha" },
  { name: "Eletrônicos", href: "/colecao/eletronicos", hasDropdown: true },
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

export function getInstallmentPrice(price: number, installments: number = 12): string {
  return formatPrice(price / installments);
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
