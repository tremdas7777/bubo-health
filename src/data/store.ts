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
}

export interface Collection {
  id: string;
  name: string;
  slug: string;
  image: string;
}

export const collections: Collection[] = [
  { id: "1", name: "Fitness", slug: "fitness", image: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=600&h=600&fit=crop" },
  { id: "2", name: "Pesca", slug: "pesca", image: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=600&h=600&fit=crop" },
  { id: "3", name: "Saúde e Beleza", slug: "saude-e-beleza", image: "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=600&h=600&fit=crop" },
  { id: "4", name: "Casa e Cozinha", slug: "casa-e-cozinha", image: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=600&h=600&fit=crop" },
  { id: "5", name: "Eletrônicos", slug: "eletronicos", image: "https://images.unsplash.com/photo-1498049794561-7780e7231661?w=600&h=600&fit=crop" },
  { id: "6", name: "Esportes", slug: "esportes", image: "https://images.unsplash.com/photo-1461896836934-bd45ba8a0936?w=600&h=600&fit=crop" },
  { id: "7", name: "Ferramentas", slug: "ferramentas", image: "https://images.unsplash.com/photo-1581783898377-1c85bf937427?w=600&h=600&fit=crop" },
];

export const products: Product[] = [
  {
    id: "1",
    name: "Fone de Ouvido Bluetooth Premium",
    slug: "fone-bluetooth-premium",
    price: 89.90,
    compareAtPrice: 179.90,
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&h=600&fit=crop",
    category: "eletronicos",
    description: "Fone de ouvido bluetooth com cancelamento de ruído ativo, bateria de 30 horas e som cristalino. Design ergonômico para máximo conforto.",
    stock: 25,
    badge: "Economize 50%",
  },
  {
    id: "2",
    name: "Smartwatch Esportivo",
    slug: "smartwatch-esportivo",
    price: 199.90,
    compareAtPrice: 399.90,
    image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&h=600&fit=crop",
    category: "eletronicos",
    description: "Smartwatch com monitor cardíaco, GPS integrado, resistente à água. Acompanhe seus treinos e notificações direto no pulso.",
    stock: 15,
    badge: "Economize 50%",
  },
  {
    id: "3",
    name: "Kit Yoga Completo",
    slug: "kit-yoga-completo",
    price: 129.90,
    compareAtPrice: 259.90,
    image: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=600&h=600&fit=crop",
    category: "fitness",
    description: "Kit completo com tapete antiderrapante, blocos, cinta e bolsa de transporte. Ideal para iniciantes e praticantes avançados.",
    stock: 30,
    badge: "Economize 50%",
  },
  {
    id: "4",
    name: "Conjunto de Panelas Antiaderente",
    slug: "conjunto-panelas-antiaderente",
    price: 249.90,
    compareAtPrice: 499.90,
    image: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=600&h=600&fit=crop",
    category: "casa-e-cozinha",
    description: "Conjunto com 5 peças de panelas antiaderentes de alta qualidade. Revestimento cerâmico, cabos ergonômicos e tampa de vidro temperado.",
    stock: 12,
    badge: "Economize 50%",
  },
  {
    id: "5",
    name: "Caixa de Som Portátil",
    slug: "caixa-som-portatil",
    price: 149.90,
    compareAtPrice: 299.90,
    image: "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=600&h=600&fit=crop",
    category: "eletronicos",
    description: "Caixa de som portátil à prova d'água com 20h de bateria. Som potente 360° e conexão bluetooth 5.0.",
    stock: 40,
    badge: "Economize 50%",
  },
  {
    id: "6",
    name: "Halter Ajustável 24kg",
    slug: "halter-ajustavel-24kg",
    price: 349.90,
    compareAtPrice: 599.90,
    image: "https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=600&h=600&fit=crop",
    category: "fitness",
    description: "Halter ajustável de 2kg a 24kg com sistema de seleção rápida. Substitui até 15 pares de halteres convencionais.",
    stock: 8,
  },
  {
    id: "7",
    name: "Kit Ferramentas 120 Peças",
    slug: "kit-ferramentas-120-pecas",
    price: 189.90,
    compareAtPrice: 379.90,
    image: "https://images.unsplash.com/photo-1581783898377-1c85bf937427?w=600&h=600&fit=crop",
    category: "ferramentas",
    description: "Kit completo com 120 peças em maleta de alumínio. Chaves, alicates, martelo, trena e muito mais.",
    stock: 20,
    badge: "Economize 50%",
  },
  {
    id: "8",
    name: "Kit Skincare Completo",
    slug: "kit-skincare-completo",
    price: 99.90,
    compareAtPrice: 199.90,
    image: "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=600&h=600&fit=crop",
    category: "saude-e-beleza",
    description: "Kit com limpador facial, tônico, sérum e hidratante. Fórmula natural com vitamina C e ácido hialurônico.",
    stock: 35,
    badge: "Economize 50%",
  },
  {
    id: "9",
    name: "Vara de Pesca Carbono",
    slug: "vara-pesca-carbono",
    price: 159.90,
    compareAtPrice: 319.90,
    image: "https://images.unsplash.com/photo-1504309092620-4d0ec726efa4?w=600&h=600&fit=crop",
    category: "pesca",
    description: "Vara de pesca em fibra de carbono ultraleve e resistente. 2.1m telescópica, ideal para pesca em rios e lagos.",
    stock: 18,
    badge: "Economize 50%",
  },
  {
    id: "10",
    name: "Tênis Esportivo Running",
    slug: "tenis-esportivo-running",
    price: 199.90,
    compareAtPrice: 399.90,
    image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&h=600&fit=crop",
    category: "esportes",
    description: "Tênis para corrida com amortecimento em gel, solado antiderrapante e tecido respirável. Conforto máximo para longas distâncias.",
    stock: 50,
    badge: "Economize 50%",
  },
  {
    id: "11",
    name: "Cafeteira Elétrica Inox",
    slug: "cafeteira-eletrica-inox",
    price: 179.90,
    compareAtPrice: 349.90,
    image: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=600&h=600&fit=crop",
    category: "casa-e-cozinha",
    description: "Cafeteira elétrica em aço inox com capacidade para 12 xícaras. Função programável e jarra térmica.",
    stock: 22,
  },
  {
    id: "12",
    name: "Bola de Basquete Oficial",
    slug: "bola-basquete-oficial",
    price: 97.90,
    compareAtPrice: 159.90,
    image: "https://images.unsplash.com/photo-1519861531473-9200262188bf?w=600&h=600&fit=crop",
    category: "esportes",
    description: "Bola de basquete tamanho oficial com couro sintético premium. Grip superior e durabilidade para quadras indoor e outdoor.",
    stock: 45,
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

export function formatPrice(price: number): string {
  return `R$ ${price.toFixed(2).replace('.', ',')}`;
}

export function getInstallmentPrice(price: number, installments: number = 12): string {
  return formatPrice(price / installments);
}

export function getDiscountPercent(price: number, compareAt: number): number {
  return Math.round(((compareAt - price) / compareAt) * 100);
}
