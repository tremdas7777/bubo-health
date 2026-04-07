const messages = [
  "BEM VINDO A NOSSA LOJA!",
  "FRETE GRÁTIS PARA TODO O BRASIL",
  "PARCELE SUAS COMPRAS EM ATÉ 12X",
];

export default function AnnouncementBar() {
  // Repeat messages enough for seamless loop
  const repeated = [...messages, ...messages, ...messages, ...messages, ...messages, ...messages];

  return (
    <div className="bg-primary text-primary-foreground overflow-hidden whitespace-nowrap py-2.5 text-[11px] font-normal tracking-widest uppercase">
      <div className="animate-marquee inline-flex">
        {repeated.map((msg, i) => (
          <span key={i} className="mx-8 inline-block">
            {msg}
          </span>
        ))}
      </div>
    </div>
  );
}
