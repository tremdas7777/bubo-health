import { useHeroColor } from "@/contexts/HeroColorContext";

export default function AnnouncementBar() {
  const { barColor } = useHeroColor();
  
  const messages = [
    "🚚 FRETE GRÁTIS em compras acima de R$ 199",
    "⭐ Mais de 10.000 clientes Bubo Health satisfeitos",
    "🔒 Compra 100% segura",
    "🎁 Brinde nas compras acima de R$ 299"
  ];
  const repeated = [...messages, ...messages, ...messages];

  return (
    <div 
      className="text-white overflow-hidden whitespace-nowrap py-2.5 text-[11px] font-bold tracking-widest uppercase transition-colors duration-700"
      style={{ backgroundColor: barColor }}
    >
      <div className="animate-marquee inline-flex gap-16">
        {repeated.map((msg, i) => (
          <span key={i} className="inline-block">
            {msg}
          </span>
        ))}
      </div>
    </div>
  );
}
