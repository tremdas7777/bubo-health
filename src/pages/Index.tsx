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
    id: "bubo-combo",
    slug: "combo-bubo-health",
    name: "Combo Completo",
    subtitle: "Sleep + Energy + Slim",
    price: 29100,
    compareAtPrice: 44100,
    image: "/products/bubo-combo.jpg",
    badge: "ECONOMIZE 46%",
    badgeColor: "bg-red-600",
    accent: "#7c3aed",
    bg: "from-purple-900 to-indigo-700",
    tagline: "Kit Completo",
    flavor: "3 produtos",
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
    discount: "33% OFF",
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
    discount: "33% OFF",
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
    discount: "29% OFF",
    discountBg: "bg-green-400",
  },
  {
    slug: "combo-bubo-health",
    bg: "from-[#1e1b4b] via-[#4c1d95] to-[#7c3aed]",
    tag: "🔥 Oferta imperdível",
    title: "Combo Completo\nBubo Health",
    desc: "Os 3 produtos em 1 kit: Sleep + Energy + Slim. Cuide da sua saúde 24 horas por dia!",
    cta: "QUERO O COMBO",
    ctaColor: "bg-[#7c3aed] hover:bg-[#6d28d9]",
    image: "/products/bubo-combo.jpg",
    discount: "46% OFF",
    discountBg: "bg-red-400",
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
    addItem({ id: p.id, name: p.name, slug: p.slug, price: p.price / 100, compareAtPrice: p.compareAtPrice / 100, image: p.image, category: "gummies", description: p.subtitle, stock: 50 });
  };

  return (
    <Layout>
      <PageHead title="Bubo Health — Gummies para Sono, Energia e Emagrecimento" description="Transforme sua rotina com as gummies Bubo Health. Sono profundo, mais energia e emagrecimento saudável com sabor irresistível." />
      <OrganizationJsonLd />

      {/* HERO CAROUSEL — mobile-first */}
      <div
        className={`relative w-full overflow-hidden transition-all duration-700 bg-gradient-to-br ${slide.bg}`}
      >
        {/* Mobile: image top, text bottom. Desktop: text left, image right */}
        <div className="container mx-auto px-4 pt-6 pb-10 md:py-14 flex flex-col md:flex-row items-center gap-2 md:gap-8">
          {/* Image — top on mobile, right on desktop */}
          <div className="w-full md:flex-1 flex items-center justify-center order-1 md:order-2">
            <Link to={`/produto/${slide.slug}`}>
              <img
                src={slide.image}
                alt={slide.title}
                className="w-[170px] sm:w-[220px] md:w-[300px] lg:w-[380px] object-contain hover:scale-105 transition-transform duration-300"
                style={{ filter: "drop-shadow(0 16px 36px rgba(0,0,0,0.45))" }}
              />
            </Link>
          </div>
          {/* Text — bottom on mobile, left on desktop */}
          <div className="flex-1 text-white text-center md:text-left order-2 md:order-1">
            <span className="inline-block bg-white/25 text-white text-[11px] font-bold px-3 py-1.5 rounded-full mb-3">{slide.tag}</span>
            <h1 className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-heading font-black leading-tight mb-3 whitespace-pre-line drop-shadow-lg">
              {slide.title}
            </h1>
            <p className="text-white/85 text-sm md:text-base lg:text-lg mb-5 max-w-sm md:max-w-md leading-relaxed mx-auto md:mx-0">{slide.desc}</p>
            <div className="flex flex-row gap-2 sm:gap-3 justify-center md:justify-start items-center flex-wrap">
              <Link
                to={`/produto/${slide.slug}`}
                className={`${slide.ctaColor} text-white font-black text-xs sm:text-sm uppercase tracking-wider px-5 sm:px-8 py-3 sm:py-4 rounded-full transition-all hover:scale-105 active:scale-95 shadow-2xl flex items-center gap-2`}
              >
                <ShoppingCart size={16} />
                {slide.cta}
              </Link>
              <span className={`${slide.discountBg} text-white font-black text-sm sm:text-lg px-4 py-2.5 rounded-full shadow-lg`}>
                {slide.discount}
              </span>
            </div>
          </div>
        </div>

        {/* Nav arrows — hidden on small screens */}
        <button
          onClick={() => setCurrent(c => (c - 1 + HERO_SLIDES.length) % HERO_SLIDES.length)}
          className="hidden sm:block absolute left-3 top-1/2 -translate-y-1/2 z-20 bg-white/20 hover:bg-white/40 text-white rounded-full p-2 transition-all"
          aria-label="Anterior"
        >
          <ChevronLeft size={22} />
        </button>
        <button
          onClick={() => setCurrent(c => (c + 1) % HERO_SLIDES.length)}
          className="hidden sm:block absolute right-3 top-1/2 -translate-y-1/2 z-20 bg-white/20 hover:bg-white/40 text-white rounded-full p-2 transition-all"
          aria-label="Próximo"
        >
          <ChevronRight size={22} />
        </button>

        {/* Dots */}
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2 z-20">
          {HERO_SLIDES.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className={`h-2 rounded-full transition-all ${i === current ? "w-8 bg-white" : "w-2 bg-white/40"}`}
              aria-label={`Slide ${i + 1}`}
            />
          ))}
        </div>
      </div>

      {/* TRUST BADGES */}
      <div className="bg-white border-b border-gray-100">
        <div className="container mx-auto px-4 py-5">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {BENEFITS.map((b, i) => (
              <div key={i} className="flex items-center gap-3 p-3 rounded-xl hover:bg-purple-50 transition-colors">
                <div className="text-[#7c3aed] shrink-0">{b.icon}</div>
                <div>
                  <p className="font-bold text-sm text-gray-900">{b.title}</p>
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
            <span className="inline-block bg-purple-100 text-[#7c3aed] text-xs font-bold uppercase tracking-widest px-4 py-1.5 rounded-full mb-3">Nossos Produtos</span>
            <h2 className="text-3xl md:text-4xl font-heading font-black text-gray-900 mb-2">Encontre sua Gummie Perfeita</h2>
            <p className="text-gray-500 text-base max-w-md mx-auto">Ciência e sabor em uma só gommie. Cuide da sua saúde de um jeito gostoso!</p>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {PRODUCTS.map((p) => {
              const discount = Math.round(((p.compareAtPrice - p.price) / p.compareAtPrice) * 100);
              const PRODUCT_THEMES: Record<string, string> = {
                "bubo-sleep": "#7c3aed",
                "bubo-energy": "#f59e0b",
                "bubo-slim": "#16a34a",
                "combo-bubo-health": "#7c3aed",
              };
              const accentColor = PRODUCT_THEMES[p.slug] || "#7c3aed";

              return (
                <div key={p.id} className="bg-white rounded-2xl md:rounded-3xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 group/card border border-gray-100 flex flex-col">
                  <Link to={`/produto/${p.slug}`} className="block relative overflow-hidden bg-gray-50 aspect-square">
                    <img src={p.image} alt={p.name} className="w-full h-full object-cover group-hover/card:scale-105 transition-transform duration-500" />
                    <span className={`absolute top-2 left-2 md:top-3 md:left-3 ${p.badgeColor} text-white text-[8px] md:text-[10px] font-black uppercase px-2 py-0.5 md:px-3 md:py-1 rounded-full shadow-lg`}>{p.badge}</span>
                    <span className="absolute top-2 right-2 md:top-3 md:right-3 bg-white text-red-600 text-[9px] md:text-[11px] font-black px-1.5 py-0.5 md:px-2.5 md:py-1 rounded-full shadow-md">-{discount}%</span>
                  </Link>
                  <div className="p-3 md:p-5 flex-1 flex flex-col">
                    <p className="text-[10px] md:text-xs text-gray-400 font-medium uppercase tracking-wide mb-1 line-clamp-1">{p.tagline} • {p.flavor}</p>
                    <Link to={`/produto/${p.slug}`}>
                      <h3 className="font-black text-sm md:text-lg text-gray-900 transition-colors leading-tight mb-1 line-clamp-1" style={{ color: accentColor }}>{p.name}</h3>
                    </Link>
                    <p className="text-[10px] md:text-xs text-gray-500 mb-2 md:mb-4 line-clamp-1 md:line-clamp-2">{p.subtitle}</p>
                    <div className="flex flex-col md:flex-row md:items-baseline gap-0 md:gap-2 mb-3 md:mb-4">
                      <span className="text-lg md:text-2xl font-black" style={{ color: accentColor }}>{formatPrice(p.price)}</span>
                      <span className="text-[10px] md:text-sm text-gray-400 line-through">{formatPrice(p.compareAtPrice)}</span>
                    </div>
                    <button
                      onClick={() => addProduct(p)}
                      className="mt-auto w-full text-white font-black text-[10px] md:text-sm uppercase tracking-wide py-2.5 md:py-3.5 rounded-xl md:rounded-2xl transition-all hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-1 md:gap-2 shadow-md"
                      style={{ backgroundColor: accentColor }}
                    >
                      <ShoppingCart size={14} className="md:w-4 md:h-4" />
                      <span className="hidden xs:inline">ADICIONAR</span>
                      <span className="xs:hidden">COMPRAR</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* COMBO BANNER */}
      <section className="py-6 px-4">
        <div className="container mx-auto">
          <Link to="/produto/combo-bubo-health" className="block relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#1e1b4b] via-[#4c1d95] to-[#7c3aed] shadow-2xl hover:scale-[1.01] transition-transform duration-300">
            <div className="flex flex-col md:flex-row items-center gap-6 p-8 md:p-10">
              <div className="flex-1 text-white text-center md:text-left">
                <span className="inline-block bg-red-500 text-white text-xs font-black px-4 py-1.5 rounded-full mb-4 uppercase tracking-widest animate-pulse">🔥 Oferta exclusiva</span>
                <h2 className="text-3xl md:text-5xl font-heading font-black mb-3 leading-tight">
                  Combo Bubo Health
                  <br /><span className="text-purple-200">Completo</span>
                </h2>
                <p className="text-purple-100 text-lg mb-2">Sleep + Energy + Slim em um kit</p>
                <div className="flex items-center gap-4 justify-center md:justify-start flex-wrap mt-6">
                  <div>
                    <p className="text-purple-300 text-sm line-through">De R$ 463,70</p>
                    <p className="text-white text-4xl font-black">R$ 247,90</p>
                  </div>
                  <span className="bg-red-500 text-white text-xl font-black px-5 py-2.5 rounded-full">46% OFF</span>
                </div>
                <div className="flex gap-4 mt-6 flex-wrap justify-center md:justify-start">
                  {["✅ Sono profundo", "⚡ Mais energia", "🌿 Emagreça"].map((item, i) => (
                    <span key={i} className="text-white text-sm bg-white/15 px-4 py-2 rounded-full">{item}</span>
                  ))}
                </div>
                <button className="mt-8 bg-white text-[#7c3aed] font-black text-sm uppercase tracking-wider px-8 py-4 rounded-full hover:scale-105 transition-all shadow-xl inline-flex items-center gap-2">
                  <ShoppingCart size={18} />
                  QUERO O COMBO AGORA
                </button>
              </div>
              <div className="flex-shrink-0">
                <img src="/products/bubo-combo.jpg" alt="Combo Bubo Health" className="w-[260px] md:w-[320px] object-contain drop-shadow-2xl" />
              </div>
            </div>
          </Link>
        </div>
      </section>

      {/* WHY BUBO */}
      <section className="py-14 bg-[#f5f3ff]">
        <div className="container mx-auto px-4">
          <div className="text-center mb-10">
            <h2 className="text-3xl md:text-4xl font-heading font-black text-gray-900 mb-2">Por que escolher a Bubo Health?</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { icon: <Zap size={36} className="text-amber-500" />, title: "Fórmula Exclusiva", desc: "Desenvolvida com os melhores ingredientes ativos e comprovados cientificamente.", bg: "from-amber-50 to-yellow-50", border: "border-amber-200" },
              { icon: <Moon size={36} className="text-purple-600" />, title: "Ação 24 horas", desc: "Cuide do seu corpo de dia e à noite com a nossa linha completa de gummies.", bg: "from-purple-50 to-indigo-50", border: "border-purple-200" },
              { icon: <Leaf size={36} className="text-green-600" />, title: "Natural e Saboroso", desc: "Ingredientes naturais, sem açúcar adicionado e com sabores deliciosos.", bg: "from-green-50 to-emerald-50", border: "border-green-200" },
            ].map((item, i) => (
              <div key={i} className={`bg-gradient-to-br ${item.bg} border ${item.border} rounded-3xl p-8 text-center hover:shadow-lg transition-all`}>
                <div className="flex justify-center mb-4">{item.icon}</div>
                <h3 className="font-black text-xl text-gray-900 mb-2">{item.title}</h3>
                <p className="text-gray-600 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* REVIEWS */}
      <section className="py-14 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-10">
            <h2 className="text-3xl md:text-4xl font-heading font-black text-gray-900 mb-2">O que nossos clientes dizem</h2>
            <div className="flex items-center justify-center gap-1 mt-3">
              {Array(5).fill(null).map((_, i) => <Star key={i} size={20} fill="#f59e0b" className="text-amber-400" />)}
              <span className="ml-2 text-gray-600 font-semibold">4.9/5 · +10.000 avaliações</span>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {REVIEWS.map((r, i) => (
              <div key={i} className="bg-[#f5f3ff] rounded-2xl p-6 border border-purple-100 hover:shadow-md transition-all">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full bg-[#7c3aed] text-white font-black flex items-center justify-center text-lg">{r.avatar}</div>
                  <div>
                    <p className="font-bold text-sm text-gray-900">{r.name}</p>
                    <p className="text-xs text-purple-600 font-medium">{r.product}</p>
                  </div>
                </div>
                <div className="flex gap-0.5 mb-2">
                  {Array(r.stars).fill(null).map((_, j) => <Star key={j} size={14} fill="#f59e0b" className="text-amber-400" />)}
                </div>
                <p className="text-gray-700 text-sm leading-relaxed">"{r.text}"</p>
                <div className="flex items-center gap-1 mt-3 text-green-600 text-xs font-semibold">
                  <Check size={13} /> Compra verificada
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </Layout>
  );
}
