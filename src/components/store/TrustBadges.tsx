import { Truck, CreditCard, Shield, Headphones } from "lucide-react";

const badges = [
  { icon: Truck, title: "Frete Grátis", desc: "Frete Grátis para todo o Brasil!" },
  { icon: CreditCard, title: "Pagamento Facilitado", desc: "Parcele suas compras em até 6x no cartão" },
  { icon: Shield, title: "Pagamento Seguro", desc: "Ambiente Seguro para compras online" },
  { icon: Headphones, title: "Suporte", desc: "Atendimento de Segunda a Sexta das 08h às 18h" },
];

export default function TrustBadges() {
  return (
    <section className="py-10 border-t border-border">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
          {badges.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="flex flex-col items-center text-center space-y-2">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Icon size={22} className="text-primary" />
              </div>
              <h3 className="font-heading font-semibold text-sm">{title}</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
