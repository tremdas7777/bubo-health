const messages = [
  "Bem vindo a nossa loja!",
  "Frete Grátis para todo o Brasil",
  "PARCELE SUAS COMPRAS EM ATÉ 12X",
];

export default function AnnouncementBar() {
  const repeated = [...messages, ...messages, ...messages, ...messages];

  return (
    <div className="bg-primary text-primary-foreground overflow-hidden whitespace-nowrap py-2 text-xs font-medium tracking-wide">
      <div className="animate-marquee inline-flex gap-12">
        {repeated.map((msg, i) => (
          <span key={i} className="inline-flex items-center gap-12">
            <span>{msg}</span>
            <span className="text-lime">•</span>
          </span>
        ))}
      </div>
    </div>
  );
}
