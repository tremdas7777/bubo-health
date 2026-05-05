import { Link } from "react-router-dom";
import Layout from "@/components/store/Layout";
import PageHead from "@/components/seo/PageHead";
import OrganizationJsonLd from "@/components/seo/OrganizationJsonLd";
import { useCart } from "@/contexts/CartContext";
import { useCurrency } from "@/contexts/LocalizationContext";
import { useHeroColor } from "@/contexts/HeroColorContext";
import { useState, useEffect, useRef } from "react";
import { ChevronLeft, ChevronRight, ShoppingCart, Check, Truck, Shield, Star, Zap, Moon, Leaf, Package } from "lucide-react";

const HERO_COLORS = [
  { bar: "#4c1d95" },  // sleep — deep purple
  { bar: "#b45309" },  // energy — amber
  { bar: "#15803d" },  // slim — green
  { bar: "#db2777" },  // hair — pink
  { bar: "#3730a3" },  // combo — indigo
];

const PRODUCTS = [
  {
    id: "bubo-sleep",
    slug: "bubo-sleep",
    name: "Bubo Sleep",
    subtitle: "Gummies do Sono Profundo",
    price: 9700,
    compareAtPrice: 14790,
    image: "/products/bubo-sleep.jpg",
    badge: "MAIS VENDIDO",
    badgeColor: "bg-purple-600",
    accent: "#7c3aed",
    bg: "from-purple-900 to-purple-700",
    tagline: "Melatonina",
    flavor: "Sabor Maracujá",
  },
  {
    id: "bubo-energy",
    slug: "bubo-energy",
    name: "Bubo Energy",
    subtitle: "Gummies de Energia e Disposição",
    price: 9700,
    compareAtPrice: 14790,
    image: "/products/bubo-energy.jpg",
    badge: "LANÇAMENTO",
    badgeColor: "bg-amber-500",
    accent: "#f59e0b",
    bg: "from-amber-700 to-yellow-500",
    tagline: "Vitaminas do Complexo B",
    flavor: "Sabor Laranja",
  },
  {
    id: "bubo-slim",
    slug: "bubo-slim",
    name: "Bubo Slim",
    subtitle: "Controle de Apetite e Perda de Peso",
    price: 9700,
    compareAtPrice: 14790,
    image: "/products/bubo-slim.jpg",
    badge: "NOVIDADE",
    badgeColor: "bg-green-600",
    accent: "#16a34a",
    bg: "from-green-800 to-green-500",
    tagline: "Cromo + Fibras",
    flavor: "Sabor Maçã Verde",
  },
  {
    id: "bubo-hair",
    slug: "bubo-hair",
    name: "Bubo Hair",
    subtitle: "Gummies para Cabelo e Unhas",
    price: 9700,
    compareAtPrice: 14790,
    image: "/products/bubo-hair.png",
    badge: "LANÇAMENTO",
    badgeColor: "bg-pink-500",
    accent: "#db2777",
    bg: "from-pink-700 to-rose-400",
    tagline: "Biotina + Colágeno",
    flavor: "Sabor Frutas Vermelhas",
  },
  {
    id: "bubo-combo-2",
    slug: "combo-2-potes",
    name: "Combo 2 Potes",
    subtitle: "Escolha 2 produtos",
    price: 19400,
    compareAtPrice: 29400,
    image: "/products/bubo-combo.png",
    badge: "OFERTA",
    badgeColor: "bg-blue-600",
    accent: "#3b82f6",
    bg: "from-blue-900 to-blue-700",
    tagline: "2 potes",
    flavor: "2 produtos",
  },
  {
    id: "bubo-combo-3",
    slug: "combo-3-potes",
    name: "Combo 3 Potes",
    subtitle: "Escolha 3 produtos",
    price: 29100,
    compareAtPrice: 44100,
    image: "/products/bubo-combo.png",
    badge: "OFERTA",
    badgeColor: "bg-indigo-600",
    accent: "#4f46e5",
    bg: "from-indigo-900 to-indigo-700",
    tagline: "3 potes",
    flavor: "3 produtos",
  },
  {
    id: "bubo-combo",
    slug: "combo-bubo-health",
    name: "Combo Completo 4 Potes",
    subtitle: "Sleep + Energy + Slim + Hair",
    price: 38800,
    compareAtPrice: 58800,
    image: "/products/bubo-combo.png",
    badge: "OFERTA COMPLETA",
    badgeColor: "bg-red-600",
    accent: "#7c3aed",
    bg: "from-purple-900 to-indigo-700",
    tagline: "Kit Total 360°",
    flavor: "4 produtos",
  },
];

const HERO_SLIDES = [
  {
    slug: "bubo-sleep",
    bg: "from-[#2e1065] via-[#4c1d95] to-[#6d28d9]",
    tag: "🌙 Para uma noite perfeita",
    title: "Durma Melhor,\nViva Melhor",
    desc: "Gummies do sono profundo com Melatonina, L-Teanina e Camomila. Sabor Maracujá.",
    cta: "COMPRAR AGORA",
    ctaColor: "bg-[#7c3aed] hover:bg-[#6d28d9]",
    image: "/products/bubo-sleep.jpg",
    discount: "R$ 97,00",
    discountBg: "bg-purple-400",
  },
  {
    slug: "bubo-energy",
    bg: "from-[#78350f] via-[#b45309] to-[#f59e0b]",
    tag: "⚡ Energia o dia todo",
    title: "Potencialize\nSeu Dia",
    desc: "Gummies de energia com Complexo B, Cafeína e Vitamina C. Sabor Laranja.",
    cta: "COMPRAR AGORA",
    ctaColor: "bg-[#f59e0b] hover:bg-[#d97706]",
    image: "/products/bubo-energy.jpg",
    discount: "R$ 97,00",
    discountBg: "bg-amber-400",
  },
  {
    slug: "bubo-slim",
    bg: "from-[#14532d] via-[#15803d] to-[#4ade80]",
    tag: "🌿 Para seu corpo ideal",
    title: "Emagreça com\nSaúde e Sabor",
    desc: "Gummies para controle de apetite com Cromo, Fibras e Garcinia. Sabor Maçã Verde.",
    cta: "COMPRAR AGORA",
    ctaColor: "bg-[#16a34a] hover:bg-[#15803d]",
    image: "/products/bubo-slim.jpg",
    discount: "R$ 97,00",
    discountBg: "bg-green-400",
  },
  {
    slug: "bubo-hair",
    bg: "from-[#831843] via-[#db2777] to-[#fb7185]",
    tag: "💖 Beleza de dentro para fora",
    title: "Cabelos e Unhas\nFortes e Brilhantes",
    desc: "Gummies com Biotina e Colágeno para fortalecer fios e unhas. Sabor Frutas Vermelhas.",
    cta: "COMPRAR AGORA",
    ctaColor: "bg-[#db2777] hover:bg-[#be185d]",
    image: "/products/bubo-hair.png",
    discount: "R$ 97,00",
    discountBg: "bg-pink-400",
  },
  {
    slug: "combo-2-potes",
    bg: "from-[#1e3a8a] via-[#3b82f6] to-[#60a5fa]",
    tag: "💙 Escolha 2 produtos",
    title: "Combo 2 Potes\nLeve 2 por R$ 194",
    desc: "Monte seu combo com 2 potes de gummies à sua escolha. Aproveite!",
    cta: "QUERO MEU COMBO",
    ctaColor: "bg-[#3b82f6] hover:bg-[#2563eb]",
    image: "/products/bubo-combo.png",
    discount: "R$ 194,00",
    discountBg: "bg-blue-400",
  },
  {
    slug: "combo-3-potes",
    bg: "from-[#312e81] via-[#4f46e5] to-[#818cf8]",
    tag: "💜 Escolha 3 produtos",
    title: "Combo 3 Potes\nLeve 3 por R$ 291",
    desc: "Monte seu combo com 3 potes de gummies à sua escolha. Melhor custo-benefício!",
    cta: "QUERO MEU COMBO",
    ctaColor: "bg-[#4f46e5] hover:bg-[#4338ca]",
    image: "/products/bubo-combo.png",
    discount: "R$ 291,00",
    discountBg: "bg-indigo-400",
  },
  {
    slug: "combo-bubo-health",
    bg: "from-[#1e1b4b] via-[#4c1d95] to-[#7c3aed]",
    tag: "🔥 Oferta imperdível",
    title: "Combo Completo 4 Potes\nBubo Health Total",
    desc: "A experiência máxima: Sleep + Energy + Slim + Hair. O cuidado total que seu corpo merece!",
    cta: "GARANTIR MEU COMBO",
    ctaColor: "bg-[#7c3aed] hover:bg-[#6d28d9]",
    image: "/products/bubo-combo.png",
    discount: "R$ 388,00",
    discountBg: "bg-indigo-400",
  },
];

const BENEFITS = [
  { icon: <Truck size={28} />, title: "Frete Grátis", desc: "Em compras acima de R$ 199" },
  { icon: <Shield size={28} />, title: "Garantia de 30 dias", desc: "Satisfação ou devolvemos" },
  { icon: <Star size={28} />, title: "5 estrelas", desc: "Mais de 10.000 avaliações" },
  { icon: <Package size={28} />, title: "Entrega Rápida", desc: "Em até 5 dias úteis" },
];

const REVIEWS = [
  { name: "Mariana S.", stars: 5, text: "O Bubo Sleep mudou minha vida! Durmo muito melhor e acordo disposta.", product: "Bubo Sleep", avatar: "M" },
  { name: "Rafael M.", stars: 5, text: "Bubo Energy é incrível, sem aquele nervosismo do café! Energizado o dia todo.", product: "Bubo Energy", avatar: "R" },
  { name: "Carla T.", stars: 5, text: "Já perdi 4kg em 2 meses com o Bubo Slim. E ainda é gostoso!", product: "Bubo Slim", avatar: "C" },
  { name: "Juliana R.", stars: 5, text: "Meu cabelo nunca cresceu tão rápido! O Bubo Hair é milagroso.", product: "Bubo Hair", avatar: "J" },
  { name: "Lucas P.", stars: 5, text: "Comprei o combo e foi a melhor decisão. Recomendo demais!", product: "Combo Completo", avatar: "L" },
];

export default function Index() {
  const { addItem } = useCart();
  const { formatPrice } = useCurrency();
  const { setBarColor } = useHeroColor();
  const [current, setCurrent] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const { scrollLeft, clientWidth } = scrollRef.current;
      const scrollTo = direction === 'left' ? scrollLeft - clientWidth : scrollLeft + clientWidth;
      scrollRef.current.scrollTo({ left: scrollTo, behavior: 'smooth' });
    }
  };

  useEffect(() => {
    const t = setInterval(() => setCurrent(c => (c + 1) % HERO_SLIDES.length), 5000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    setBarColor(HERO_COLORS[current]?.bar || "#4c1d95");
  }, [current, setBarColor]);

  const slide = HERO_SLIDES[current];

  const addProduct = (p: typeof PRODUCTS[0]) => {
    addItem({ 
      id: p.id, 
      name: p.name, 
      slug: p.slug, 
      price: p.price / 100, 
      compareAtPrice: p.compareAtPrice / 100, 
      image: p.image, 
      category: "gummies", 
      description: p.subtitle, 
      stock: 50 
    });
  };

  return (
    <Layout>
      <PageHead 
        title="Bubo Health — Gummies para Sono, Energia e Emagrecimento" 
        description="Transforme sua rotina com as gummies Bubo Health. Sono profundo, mais energia e emagrecimento saudável com o sabor das nossas vitaminas em goma."
      />
      <OrganizationJsonLd />

      {/* HERO CAROUSEL — modern card style */}
      <div className="container mx-auto px-4 pt-4 pb-2">
        <div
          className={`relative w-full overflow-hidden transition-all duration-700 bg-gradient-to-br ${slide.bg} rounded-[2.5rem] md:rounded-[4rem] shadow-2xl`}
        >
          {/* Mobile: image top, text bottom. Desktop: text left, image right */}
          <div className="container mx-auto px-6 sm:px-10 pt-8 pb-12 md:py-20 flex flex-col md:flex-row items-center gap-8 md:gap-16 min-h-[550px] md:min-h-[750px]">
            
            {/* Image — top on mobile, right on desktop */}
            <div className="w-full md:flex-[1.2] flex items-center justify-center order-1 md:order-2 relative group">
              {/* Decorative glows / aurora effect */}
              <div className="absolute inset-0 bg-white/20 blur-[120px] rounded-full scale-110 animate-pulse opacity-50" />
              <div className="absolute inset-0 bg-white/10 blur-[60px] rounded-full scale-75 opacity-30" />
              
              <Link to={`/produto/${slide.slug}`} className="relative z-10 w-full flex justify-center">
                <img
                  src={slide.image}
                  alt={slide.title}
                  className="w-[280px] sm:w-[380px] md:w-[550px] lg:w-[700px] xl:w-[850px] 2xl:w-[950px] max-w-none object-contain hover:scale-105 transition-all duration-700 cursor-pointer drop-shadow-[0_45px_70px_rgba(0,0,0,0.7)]"
                />
              </Link>
            </div>

            {/* Text — bottom on mobile, left on desktop */}
            <div className="flex-1 text-white text-center md:text-left order-2 md:order-1 relative z-10">
              <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md text-white text-[12px] md:text-sm font-black px-5 py-2.5 rounded-full mb-6 border border-white/20 shadow-xl">
                <span className="flex h-2 w-2 rounded-full bg-white animate-ping" />
                {slide.tag}
              </div>
              <h1 className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-heading font-black leading-[1] mb-6 whitespace-pre-line drop-shadow-[0_5px_15px_rgba(0,0,0,0.3)]">
                {slide.title}
              </h1>
              <p className="text-white/90 text-base md:text-xl lg:text-2xl mb-10 max-w-sm md:max-w-lg leading-relaxed mx-auto md:mx-0 drop-shadow-md">
                {slide.desc}
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start items-center">
                <Link
                  to={`/produto/${slide.slug}`}
                  className={`${slide.ctaColor} text-white font-black text-sm sm:text-lg uppercase tracking-widest px-10 sm:px-14 py-5 sm:py-6 rounded-full transition-all hover:scale-105 active:scale-95 shadow-[0_25px_60px_rgba(0,0,0,0.4)] flex items-center gap-3 group`}
                >
                  <ShoppingCart size={22} className="group-hover:rotate-12 transition-transform" />
                  {slide.cta}
                </Link>
                <div className={`${slide.discountBg} text-white font-black text-xl sm:text-3xl px-8 py-4 rounded-[1.5rem] shadow-2xl border border-white/30 -rotate-3 hover:rotate-0 transition-transform`}>
                  {slide.discount}
                </div>
              </div>
            </div>
          </div>

          {/* Nav arrows */}
          <button
            onClick={() => setCurrent(c => (c - 1 + HERO_SLIDES.length) % HERO_SLIDES.length)}
            className="hidden sm:flex absolute left-8 top-1/2 -translate-y-1/2 z-20 bg-white/10 hover:bg-white/30 backdrop-blur-md border border-white/20 text-white rounded-full p-4 transition-all hover:scale-110 active:scale-90"
            aria-label="Anterior"
          >
            <ChevronLeft size={32} />
          </button>
          <button
            onClick={() => setCurrent(c => (c + 1) % HERO_SLIDES.length)}
            className="hidden sm:flex absolute right-8 top-1/2 -translate-y-1/2 z-20 bg-white/10 hover:bg-white/30 backdrop-blur-md border border-white/20 text-white rounded-full p-4 transition-all hover:scale-110 active:scale-90"
            aria-label="Próximo"
          >
            <ChevronRight size={32} />
          </button>

          {/* Dots */}
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-4 z-20 bg-black/10 backdrop-blur-md px-6 py-3 rounded-full border border-white/10">
            {HERO_SLIDES.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrent(i)}
                className={`h-3 rounded-full transition-all duration-300 ${i === current ? "w-12 bg-white" : "w-3 bg-white/40 hover:bg-white/60"}`}
                aria-label={`Slide ${i + 1}`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* TRUST BADGES */}
      <div className="bg-white border-b border-gray-100">
        <div className="container mx-auto px-4 py-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {BENEFITS.map((b, i) => (
              <div key={i} className="flex items-center gap-4 p-4 rounded-2xl transition-all hover:bg-gray-50">
                <div className="shrink-0" style={{ color: HERO_COLORS[current]?.bar }}>{b.icon}</div>
                <div>
                  <p className="font-black text-sm md:text-base text-gray-900 leading-tight">{b.title}</p>
                  <p className="text-xs text-gray-500">{b.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* PRODUCTS SECTION */}
      <section className="py-14 bg-gradient-to-b from-purple-50 to-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-10">
            <span className="inline-block bg-purple-100 text-[#7c3aed] text-xs font-black uppercase tracking-widest px-4 py-1.5 rounded-full mb-3">Nossos Produtos</span>
            <h2 className="text-3xl md:text-5xl font-heading font-black text-gray-900">Encontre sua Gummy</h2>
          </div>

          <div className="relative group">
            {/* Nav Arrows for Product Carousel */}
            <button 
              onClick={() => scroll('left')}
              className="hidden md:flex absolute -left-5 top-1/2 -translate-y-1/2 z-10 bg-white text-gray-900 p-3 rounded-full shadow-xl border border-gray-100 hover:scale-110 active:scale-95 transition-all opacity-0 group-hover:opacity-100"
            >
              <ChevronLeft size={24} />
            </button>
            <button 
              onClick={() => scroll('right')}
              className="hidden md:flex absolute -right-5 top-1/2 -translate-y-1/2 z-10 bg-white text-gray-900 p-3 rounded-full shadow-xl border border-gray-100 hover:scale-110 active:scale-95 transition-all opacity-0 group-hover:opacity-100"
            >
              <ChevronRight size={24} />
            </button>

            {/* Product Carousel / Grid */}
            <div 
              ref={scrollRef}
              className="flex overflow-x-auto snap-x snap-mandatory gap-4 pb-8 sm:grid sm:grid-cols-2 lg:grid-cols-5 sm:gap-6 sm:pb-0 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] -mx-4 px-4 sm:mx-0 sm:px-0"
            >
              {PRODUCTS.map((p) => {
                const discount = Math.round(((p.compareAtPrice - p.price) / p.compareAtPrice) * 100);
                const accentColor = p.accent;
                
                return (
                  <div key={p.id} className="min-w-[85vw] sm:min-w-0 snap-center shrink-0 bg-white rounded-3xl border border-gray-100 shadow-sm hover:shadow-2xl transition-all duration-500 flex flex-col group/card overflow-hidden">
                    <Link to={`/produto/${p.slug}`} className="relative block bg-gray-50 pt-[100%] overflow-hidden">
                      <img 
                        src={p.image} 
                        alt={p.name} 
                        className="absolute inset-0 w-full h-full object-contain p-6 group-hover/card:scale-110 transition-transform duration-700" 
                      />
                      <span className={`absolute top-3 left-3 text-white text-[10px] font-black px-3 py-1 rounded-full shadow-lg ${p.badgeColor}`}>{p.badge}</span>
                      <span className="absolute top-3 right-3 bg-white text-red-600 text-[10px] font-black px-2 py-1 rounded-full shadow-md">-{discount}%</span>
                    </Link>
                    <div className="p-5 flex-1 flex flex-col">
                      <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-1">{p.tagline} • {p.flavor}</p>
                      <Link to={`/produto/${p.slug}`}>
                        <h3 className="font-black text-lg text-gray-900 transition-colors leading-tight mb-1" style={{ color: accentColor }}>{p.name}</h3>
                      </Link>
                      <p className="text-xs text-gray-500 mb-4 line-clamp-2">{p.subtitle}</p>
                      <div className="flex items-baseline gap-2 mb-5">
                        <span className="text-2xl font-black" style={{ color: accentColor }}>{formatPrice(p.price)}</span>
                        <span className="text-sm text-gray-400 line-through">{formatPrice(p.compareAtPrice)}</span>
                      </div>
                      <button
                        onClick={() => addProduct(p)}
                        className="mt-auto w-full text-white font-black text-xs uppercase tracking-widest py-4 rounded-2xl transition-all hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-2 shadow-xl"
                        style={{ backgroundColor: accentColor }}
                      >
                        <ShoppingCart size={18} />
                        ADICIONAR
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

{/* COMBO BANNER */}
<section className="py-6 px-4">
  <div className="container mx-auto">
    <Link to="/produto/combo-bubo-health" className="block relative overflow-hidden rounded-[2.5rem] bg-gradient-to-r from-[#1e1b4b] via-[#4c1d95] to-[#7c3aed] shadow-2xl hover:scale-[1.01] transition-transform duration-300">
      <div className="flex flex-col md:flex-row items-center gap-8 p-10 md:p-14">
        <div className="flex-1 text-white text-center md:text-left">
          <span className="inline-block bg-red-500 text-white text-xs font-black px-5 py-2 rounded-full mb-6 uppercase tracking-widest animate-pulse shadow-lg">🔥 Oferta exclusiva</span>
          <h2 className="text-4xl md:text-6xl font-heading font-black mb-4 leading-tight">
            Combo Bubo Health
            <br /><span className="text-purple-300">Completo 360°</span>
          </h2>
          <p className="text-purple-100 text-xl mb-6">Sleep + Energy + Slim + Hair em um kit especial</p>
          <div className="flex items-center gap-6 justify-center md:justify-start flex-wrap mb-8">
            <div>
              <p className="text-purple-300 text-sm md:text-base line-through">De R$ 588,00</p>
              <p className="text-white text-5xl md:text-6xl font-black">R$ 388,00</p>
            </div>
            <span className="bg-red-500 text-white text-2xl font-black px-6 py-3 rounded-2xl shadow-xl">34% OFF</span>
          </div>
          <div className="flex gap-4 mb-8 flex-wrap justify-center md:justify-start">
            {["✅ 2 Potens R$ 194", "✅ 3 Potens R$ 291", "✅ 4 Potens R$ 388"].map((item, i) => (
              <span key={i} className="text-white text-sm font-bold bg-white/20 backdrop-blur-md px-5 py-2.5 rounded-full border border-white/10">{item}</span>
            ))}
          </div>
          <button className="bg-white text-[#7c3aed] font-black text-base uppercase tracking-widest px-10 py-5 rounded-full hover:scale-105 transition-all shadow-[0_20px_50px_rgba(0,0,0,0.3)] inline-flex items-center gap-3">
            <ShoppingCart size={22} />
            QUERO MEU COMBO AGORA
          </button>
        </div>
        <div className="flex-shrink-0 relative">
          <div className="absolute inset-0 bg-white/20 blur-[100px] rounded-full scale-110" />
          <img src="/products/bubo-combo.png" alt="Combo Bubo Health" className="w-[300px] md:w-[450px] object-contain drop-shadow-[0_35px_60px_rgba(0,0,0,0.5)] relative z-10" />
        </div>
      </div>
    </Link>
  </div>
</section>

      {/* WHY BUBO */}
      <section className="py-20 bg-[#f5f3ff]">
        <div className="container mx-auto px-4">
          <div className="text-center mb-14">
            <span className="inline-block bg-purple-100 text-[#7c3aed] text-xs font-black uppercase tracking-widest px-4 py-1.5 rounded-full mb-3">Qualidade Premium</span>
            <h2 className="text-3xl md:text-5xl font-heading font-black text-gray-900 leading-tight">Por que escolher a Bubo Health?</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: <Zap size={40} className="text-amber-500" />, title: "Fórmula Exclusiva", desc: "Desenvolvida com os melhores ingredientes ativos e comprovados cientificamente para máxima eficácia.", bg: "from-amber-50 to-yellow-50", border: "border-amber-100" },
              { icon: <Moon size={40} className="text-purple-600" />, title: "Ação 24 horas", desc: "Cuide do seu corpo em todos os momentos, do despertar ao sono profundo com nossa linha completa.", bg: "from-purple-50 to-indigo-50", border: "border-purple-100" },
              { icon: <Leaf size={40} className="text-green-600" />, title: "Natural e Saboroso", desc: "Gummies veganas, sem açúcar adicionado, glúten ou corantes artificiais. O sabor real da saúde.", bg: "from-green-50 to-emerald-50", border: "border-green-100" },
            ].map((item, i) => (
              <div key={i} className={`bg-gradient-to-br ${item.bg} border ${item.border} rounded-[2.5rem] p-10 text-center hover:shadow-xl transition-all duration-300`}>
                <div className="flex justify-center mb-6">{item.icon}</div>
                <h3 className="font-black text-2xl text-gray-900 mb-4">{item.title}</h3>
                <p className="text-gray-600 leading-relaxed text-lg">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* REVIEWS */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-5xl font-heading font-black text-gray-900 mb-4">O que nossos clientes dizem</h2>
            <div className="flex items-center justify-center gap-1.5">
              {Array(5).fill(null).map((_, i) => <Star key={i} size={24} fill="#f59e0b" className="text-amber-400" />)}
              <span className="ml-3 text-gray-600 font-bold text-lg">4.9/5 · +10.000 avaliações</span>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {REVIEWS.map((r, i) => (
              <div key={i} className="bg-[#f5f3ff] rounded-3xl p-8 border border-purple-50 hover:shadow-xl transition-all duration-300">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#7c3aed] to-[#4c1d95] text-white font-black flex items-center justify-center text-xl shadow-lg">{r.avatar}</div>
                  <div>
                    <p className="font-black text-base text-gray-900 leading-tight">{r.name}</p>
                    <p className="text-xs text-purple-600 font-bold uppercase tracking-wider">{r.product}</p>
                  </div>
                </div>
                <div className="flex gap-0.5 mb-3">
                  {Array(r.stars).fill(null).map((_, j) => <Star key={j} size={16} fill="#f59e0b" className="text-amber-400" />)}
                </div>
                <p className="text-gray-700 leading-relaxed italic">"{r.text}"</p>
                <div className="flex items-center gap-1.5 mt-4 text-green-600 text-xs font-black uppercase tracking-widest">
                  <Check size={14} strokeWidth={3} /> Compra verificada
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </Layout>
  );
}
