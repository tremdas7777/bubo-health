export interface Product {
  id: string;
  name: string;
  slug: string;
  price: number;
  compareAtPrice?: number;
  image: string;
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
  { id: "1", name: "Casa e Cozinha", slug: "casa-e-cozinha", image: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=500&h=650&fit=crop" },
  { id: "2", name: "Eletrônicos", slug: "eletronicos", image: "https://images.unsplash.com/photo-1498049794561-7780e7231661?w=500&h=650&fit=crop" },
  { id: "3", name: "Esportes", slug: "esportes", image: "https://images.unsplash.com/photo-1461896836934-bd45ba8a0936?w=500&h=650&fit=crop" },
  { id: "4", name: "Ferramentas", slug: "ferramentas", image: "https://images.unsplash.com/photo-1581783898377-1c85bf937427?w=500&h=650&fit=crop" },
  { id: "5", name: "Fitness", slug: "fitness", image: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=500&h=650&fit=crop" },
  { id: "6", name: "Pesca", slug: "pesca", image: "https://images.unsplash.com/photo-1504309092620-4d0ec726efa4?w=500&h=650&fit=crop" },
  { id: "7", name: "Saúde e Beleza", slug: "saude-e-beleza", image: "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=500&h=650&fit=crop" },
];

export const products: Product[] = [
  // ========== Casa e Cozinha ==========
  {
    id: "c1", name: "Lâmpada Inteligente", slug: "lampada-inteligente",
    price: 116.90, compareAtPrice: 159.90,
    image: "https://images.unsplash.com/photo-1550985616-10810253b84d?w=533&h=533&fit=crop",
    category: "casa-e-cozinha",
    description: "Lâmpada inteligente RGB com controle por app e voz. Compatível com Alexa e Google Home. 16 milhões de cores e temperatura ajustável.",
    stock: 18, variants: ["Branca", "RGB"],
  },
  {
    id: "c2", name: "Utensílios para Cozinha", slug: "utensilios-cozinha",
    price: 96.90, compareAtPrice: 139.90,
    image: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=533&h=533&fit=crop",
    category: "casa-e-cozinha",
    description: "Kit com 6 utensílios de cozinha em silicone e bambu. Antiaderente, resistente ao calor até 230°C e fácil de limpar.",
    stock: 35,
  },
  {
    id: "c3", name: "Mini Triturador Manual", slug: "mini-triturador-manual",
    price: 97.90, compareAtPrice: 222.90,
    image: "https://images.unsplash.com/photo-1585515320310-259814833e62?w=533&h=533&fit=crop",
    category: "casa-e-cozinha",
    description: "Mini triturador manual multifuncional para alho, cebola, legumes e frutas. Lâminas em aço inox, fácil de limpar e compacto.",
    stock: 30,
  },
  {
    id: "c4", name: "Difusor de Aroma", slug: "difusor-de-aroma",
    price: 99.90, compareAtPrice: 199.90,
    image: "https://images.unsplash.com/photo-1602928321679-560bb453f190?w=533&h=533&fit=crop",
    category: "casa-e-cozinha",
    description: "Difusor de aroma ultrassônico com LED colorido. Capacidade de 300ml, timer automático e modo noturno silencioso.",
    stock: 25, badge: "Economize 50%",
  },
  {
    id: "c5", name: "Vaso de Flores Artificiais", slug: "vaso-flores-artificiais",
    price: 79.90, compareAtPrice: 149.90,
    image: "https://images.unsplash.com/photo-1487530811176-3780de880c2d?w=533&h=533&fit=crop",
    category: "casa-e-cozinha",
    description: "Vaso decorativo com flores artificiais de alta qualidade. Material premium que imita flores reais. Ideal para sala e escritório.",
    stock: 40,
  },

  // ========== Eletrônicos ==========
  {
    id: "e1", name: "Game Portátil X39 IPS FULL HD", slug: "game-portatil-x39",
    price: 236.97, compareAtPrice: 569.90,
    image: "https://images.unsplash.com/photo-1531525645387-7f14be1bdbbd?w=533&h=533&fit=crop",
    category: "eletronicos",
    description: "Console de jogos portátil com tela IPS Full HD de 4.3 polegadas. Mais de 5000 jogos clássicos incluídos, bateria de longa duração.",
    stock: 15, badge: "Economize 58%",
  },
  {
    id: "e2", name: "Microfone USB para PC", slug: "microfone-usb-pc",
    price: 197.90, compareAtPrice: 389.90,
    image: "https://images.unsplash.com/photo-1590602847861-f357a9332bbc?w=533&h=533&fit=crop",
    category: "eletronicos",
    description: "Microfone condensador USB profissional para streaming, podcast e gravação. Padrão cardioide com filtro anti-pop integrado.",
    stock: 20, badge: "Economize 49%",
  },
  {
    id: "e3", name: "Despertador Digital Led", slug: "despertador-digital-led",
    price: 67.90, compareAtPrice: 139.90,
    image: "https://images.unsplash.com/photo-1563861826100-9cb868fdbe1c?w=533&h=533&fit=crop",
    category: "eletronicos",
    description: "Despertador digital com display LED grande, espelhado, mostra hora, temperatura e umidade. Modo noturno com brilho ajustável.",
    stock: 45, badge: "Economize 51%",
  },
  {
    id: "e4", name: "Fone Bluetooth", slug: "fone-bluetooth",
    price: 149.90, compareAtPrice: 379.90,
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=533&h=533&fit=crop",
    category: "eletronicos",
    description: "Fone de ouvido bluetooth over-ear com cancelamento de ruído ativo. Bateria de 30 horas, som Hi-Fi e microfone integrado.",
    stock: 25, badge: "Economize 60%",
  },
  {
    id: "e5", name: "IWO 7 Pro", slug: "iwo-7-pro",
    price: 199.90, compareAtPrice: 359.90,
    image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=533&h=533&fit=crop",
    category: "eletronicos",
    description: "Smartwatch IWO 7 Pro com tela infinita, monitor cardíaco, oxímetro, GPS e mais de 100 modos esportivos. Resistente à água.",
    stock: 18, badge: "Economize 44%",
  },

  // ========== Esportes ==========
  {
    id: "s1", name: "Raquete Beach Tênis", slug: "raquete-beach-tenis",
    price: 265.00, compareAtPrice: 597.00,
    image: "https://images.unsplash.com/photo-1554068865-24cecd4e34b8?w=533&h=533&fit=crop",
    category: "esportes",
    description: "Raquete profissional para beach tennis em fibra de carbono 3K. Núcleo em EVA soft, controle e potência superiores.",
    stock: 12, badge: "Economize 55%",
  },
  {
    id: "s2", name: "Óculos para Natação Profissional", slug: "oculos-natacao",
    price: 137.90, compareAtPrice: 227.90,
    image: "https://images.unsplash.com/photo-1560089000-7433a4ebbd64?w=533&h=533&fit=crop",
    category: "esportes",
    description: "Óculos de natação profissional com lentes antiembaçantes, proteção UV e vedação em silicone macio. Ajuste regulável.",
    stock: 35,
  },
  {
    id: "s3", name: "Tênis Esportivo", slug: "tenis-esportivo",
    price: 119.90, compareAtPrice: 217.90,
    image: "https://images.unsplash.com/photo-1491553895911-0055eca6402d?w=533&h=533&fit=crop",
    category: "esportes",
    description: "Tênis esportivo casual com design moderno, solado em borracha antiderrapante e palmilha confortável para uso diário.",
    stock: 40,
  },
  {
    id: "s4", name: "Óculos para Esportes", slug: "oculos-esportes",
    price: 97.90, compareAtPrice: 159.90,
    image: "https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=533&h=533&fit=crop",
    category: "esportes",
    description: "Óculos esportivo com lentes polarizadas, proteção UV400 e armação flexível resistente a impactos. Ideal para ciclismo e corrida.",
    stock: 28,
  },
  {
    id: "s5", name: "Capacete Ultraleve Ciclismo", slug: "capacete-ciclismo",
    price: 149.90, compareAtPrice: 352.90,
    image: "https://images.unsplash.com/photo-1557803175-2f6e70e6f906?w=533&h=533&fit=crop",
    category: "esportes",
    description: "Capacete ultraleve para ciclismo com 18 aberturas de ventilação, ajuste traseiro micrométrico e viseira removível.",
    stock: 15, badge: "Economize 57%",
  },

  // ========== Ferramentas ==========
  {
    id: "t1", name: "Parafusadeira Elétrica", slug: "parafusadeira-eletrica",
    price: 115.90, compareAtPrice: 369.00,
    image: "https://images.unsplash.com/photo-1504148455328-c376907d081c?w=533&h=533&fit=crop",
    category: "ferramentas",
    description: "Parafusadeira elétrica sem fio com bateria de lítio recarregável. Kit com 45 bits, LED integrado e maleta de transporte.",
    stock: 20, badge: "Economize 68%",
  },
  {
    id: "t2", name: "Alicate Multifuncional", slug: "alicate-multifuncional",
    price: 68.90,
    image: "https://images.unsplash.com/photo-1586864387967-d02ef85d93e8?w=533&h=533&fit=crop",
    category: "ferramentas",
    description: "Alicate multifuncional 14 em 1 com lâmina, serra, chave de fenda, abridor e mais. Aço inox resistente com bainha em nylon.",
    stock: 50,
  },
  {
    id: "t3", name: "Kit Completo Ferramentas", slug: "kit-completo-ferramentas",
    price: 235.00, compareAtPrice: 459.00,
    image: "https://images.unsplash.com/photo-1581783898377-1c85bf937427?w=533&h=533&fit=crop",
    category: "ferramentas",
    description: "Kit completo com mais de 120 peças em maleta de alumínio. Chaves allen, torx, phillips, alicates, martelo, trena e muito mais.",
    stock: 15, badge: "Economize 48%",
  },
  {
    id: "t4", name: "Mini Motosserra", slug: "mini-motosserra",
    price: 135.00, compareAtPrice: 296.00,
    image: "https://images.unsplash.com/photo-1572981779307-38b8cabb2407?w=533&h=533&fit=crop",
    category: "ferramentas",
    description: "Mini motosserra elétrica portátil com bateria de lítio. Ideal para poda de galhos e corte de madeira. 2 baterias incluídas.",
    stock: 10, badge: "Economize 54%",
  },
  {
    id: "t5", name: "Mini Alicate para Friso", slug: "mini-alicate-friso",
    price: 120.00, compareAtPrice: 265.00,
    image: "https://images.unsplash.com/photo-1530124566582-a45a7e3f4b79?w=533&h=533&fit=crop",
    category: "ferramentas",
    description: "Mini alicate para friso profissional em aço cromo-vanádio. Corte preciso e cabo emborrachado para maior aderência.",
    stock: 22, badge: "Economize 54%",
  },

  // ========== Fitness ==========
  {
    id: "f1", name: "Joelheira para Treino", slug: "joelheira-treino",
    price: 79.90, compareAtPrice: 235.90,
    image: "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=533&h=533&fit=crop",
    category: "fitness",
    description: "Joelheira esportiva com suporte de compressão 3D. Proteção anti-impacto, tecido respirável e ajuste anatômico.",
    stock: 55, badge: "Economize 66%",
  },
  {
    id: "f2", name: "Faixas para Treino", slug: "faixas-treino",
    price: 59.90, compareAtPrice: 120.00,
    image: "https://images.unsplash.com/photo-1517963879433-6ad2b056d712?w=533&h=533&fit=crop",
    category: "fitness",
    description: "Kit com 5 faixas elásticas de resistência variada. Perfeito para treinos em casa, pilates, yoga e fisioterapia.",
    stock: 75, badge: "Economize 50%",
  },
  {
    id: "f3", name: "Exercitador Abdominal", slug: "exercitador-abdominal",
    price: 137.50, compareAtPrice: 265.00,
    image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=533&h=533&fit=crop",
    category: "fitness",
    description: "Roda de exercício abdominal com sistema de retorno automático. Pegadores antiderrapantes e tapete para joelhos incluído.",
    stock: 30, badge: "Economize 48%",
  },
  {
    id: "f4", name: "Massageador Muscular", slug: "massageador-muscular",
    price: 99.00, compareAtPrice: 219.00,
    image: "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=533&h=533&fit=crop",
    category: "fitness",
    description: "Massageador muscular elétrico tipo pistola com 6 cabeças intercambiáveis e 20 níveis de intensidade. Bateria de 6h.",
    stock: 20, badge: "Economize 54%",
  },
  {
    id: "f5", name: "Powerball", slug: "powerball",
    price: 200.00, compareAtPrice: 350.00,
    image: "https://images.unsplash.com/photo-1598289431512-b97b0917affc?w=533&h=533&fit=crop",
    category: "fitness",
    description: "Powerball giroscópica para fortalecimento de pulso, antebraço e mão. Com LED e contador digital de rotações.",
    stock: 25, badge: "Economize 42%",
  },

  // ========== Pesca ==========
  {
    id: "p1", name: "Colete Camuflado para Pesca", slug: "colete-pesca",
    price: 95.90, compareAtPrice: 165.90,
    image: "https://images.unsplash.com/photo-1564769662533-4f00a87b4056?w=533&h=533&fit=crop",
    category: "pesca",
    description: "Colete camuflado multibolsos para pesca. Tecido respirável, secagem rápida e múltiplos compartimentos para acessórios.",
    stock: 18,
  },
  {
    id: "p2", name: "Molinete 12 Rolamentos", slug: "molinete-12-rolamentos",
    price: 117.90, compareAtPrice: 237.90,
    image: "https://images.unsplash.com/photo-1540979388789-6cee28a1cdc9?w=533&h=533&fit=crop",
    category: "pesca",
    description: "Molinete profissional com 12 rolamentos de aço inoxidável. Corpo em alumínio, sistema anti-corrosão para água salgada.",
    stock: 22, badge: "Economize 50%",
  },
  {
    id: "p3", name: "Linha para Pesca", slug: "linha-pesca",
    price: 67.90, compareAtPrice: 127.90,
    image: "https://images.unsplash.com/photo-1504309092620-4d0ec726efa4?w=533&h=533&fit=crop",
    category: "pesca",
    description: "Linha de pesca multifilamento trançada de alta resistência. 300 metros, 4 fios, disponível em várias libragens.",
    stock: 80,
  },
  {
    id: "p4", name: "Carretilha Shimano Profissional", slug: "carretilha-shimano",
    price: 239.90, compareAtPrice: 427.90,
    image: "https://images.unsplash.com/photo-1516483638261-f4dbaf036963?w=533&h=533&fit=crop",
    category: "pesca",
    description: "Carretilha profissional com freio magnético, 7 rolamentos e relação 7.2:1. Corpo em alumínio usinado.",
    stock: 10, badge: "Economize 43%",
  },
  {
    id: "p5", name: "Kit Alicates para Pesca", slug: "kit-alicates-pesca",
    price: 97.90, compareAtPrice: 139.90,
    image: "https://images.unsplash.com/photo-1571068316344-75bc76f77890?w=533&h=533&fit=crop",
    category: "pesca",
    description: "Kit com 3 alicates para pesca: bico fino, corte e extrator de anzol. Aço inox com cabo emborrachado e cordão de segurança.",
    stock: 35,
  },

  // ========== Saúde e Beleza ==========
  {
    id: "b1", name: "Skin Care", slug: "skin-care",
    price: 136.90, compareAtPrice: 229.90,
    image: "https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=533&h=533&fit=crop",
    category: "saude-e-beleza",
    description: "Kit completo de skincare com limpador facial, tônico, sérum vitamina C, hidratante e protetor solar. Fórmula vegana.",
    stock: 28,
  },
  {
    id: "b2", name: "Batom Popfell", slug: "batom-popfell",
    price: 99.00, compareAtPrice: 169.00,
    image: "https://images.unsplash.com/photo-1512496015851-a90fb38ba796?w=533&h=533&fit=crop",
    category: "saude-e-beleza",
    description: "Kit com 6 batons Popfell em tons variados. Textura matte aveludada, longa duração e fórmula hidratante com vitamina E.",
    stock: 42,
  },
  {
    id: "b3", name: "Maleta Maquiagem Profissional", slug: "maleta-maquiagem",
    price: 223.00, compareAtPrice: 360.00,
    image: "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=533&h=533&fit=crop",
    category: "saude-e-beleza",
    description: "Maleta profissional completa com paleta de sombras, batons, pincéis, blush, iluminador e corretivos. 88 peças.",
    stock: 15,
  },
  {
    id: "b4", name: "Kit Depiladores Elétricos", slug: "kit-depiladores",
    price: 227.99, compareAtPrice: 459.90,
    image: "https://images.unsplash.com/photo-1522338140262-f46f5913618a?w=533&h=533&fit=crop",
    category: "saude-e-beleza",
    description: "Kit 5 em 1 com depilador elétrico, aparador, escova facial, massageador e polidor. Recarregável via USB, à prova d'água.",
    stock: 20, badge: "Economize 50%",
  },
  {
    id: "b5", name: "Esponja Removedora de Pelos", slug: "esponja-removedora",
    price: 89.90, compareAtPrice: 135.90,
    image: "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=533&h=533&fit=crop",
    category: "saude-e-beleza",
    description: "Esponja removedora de pelos indolor com nanotecnologia cristalina. Remove pelos sem irritação, reutilizável e lavável.",
    stock: 60,
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
