import { useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { CheckCircle, Package, Truck, Home, ShoppingBag, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import Layout from "@/components/store/Layout";
import { useCart } from "@/contexts/CartContext";

export default function ThankYouPage() {
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get("pedido") || "";
  const method = searchParams.get("metodo") || "card";
  const isPix = method === "pix";
  const { clearCart } = useCart();

  useEffect(() => {
    clearCart();
  }, [clearCart]);

  return (
    <Layout>
      <div className="min-h-[70vh] flex items-center justify-center py-12 px-4">
        <div className="max-w-lg w-full text-center space-y-6">
          {/* Success animation */}
          <div className="relative mx-auto w-24 h-24">
            <div className={`absolute inset-0 rounded-full animate-ping ${isPix ? "bg-amber-500/20" : "bg-emerald-500/20"}`} />
            <div className={`relative w-24 h-24 rounded-full flex items-center justify-center ${isPix ? "bg-amber-500/10" : "bg-emerald-500/10"}`}>
              {isPix ? <Clock size={48} className="text-amber-600" /> : <CheckCircle size={48} className="text-emerald-600" />}
            </div>
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl sm:text-3xl font-heading font-bold text-foreground">
              {isPix ? "PIX gerado com sucesso!" : "Pagamento confirmado!"}
            </h1>
            <p className="text-muted-foreground text-sm">
              {isPix
                ? "Seu pedido será confirmado assim que identificarmos o pagamento do PIX."
                : "Obrigado pela sua compra. Seu pedido está sendo preparado."}
            </p>
          </div>

          {orderId && (
            <div className="bg-muted/50 rounded-xl border border-border p-4">
              <p className="text-xs text-muted-foreground mb-1">Número do pedido</p>
              <p className="font-mono text-sm font-bold text-foreground">{orderId.slice(0, 8).toUpperCase()}</p>
            </div>
          )}

          {/* Timeline */}
          <div className="bg-background rounded-xl border border-border p-5 text-left space-y-4">
            <h2 className="text-sm font-heading font-bold text-foreground">Próximos passos</h2>
            <div className="space-y-3">
              {[
                {
                  icon: isPix ? Clock : CheckCircle,
                  label: isPix ? "Aguardando pagamento PIX" : "Pagamento aprovado",
                  desc: isPix ? "Efetue o pagamento do PIX para confirmar o pedido" : "Seu pagamento foi confirmado com sucesso",
                  done: !isPix,
                  pending: isPix,
                },
                { icon: Package, label: "Preparando pedido", desc: "Estamos separando seus produtos", done: false },
                { icon: Truck, label: "Enviado", desc: "Você receberá o código de rastreio por e-mail", done: false },
                { icon: Home, label: "Entregue", desc: "Produto entregue no seu endereço", done: false },
              ].map((step, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                    step.done ? "bg-emerald-500/10 text-emerald-600" : step.pending ? "bg-amber-500/10 text-amber-600" : "bg-muted text-muted-foreground"
                  }`}>
                    <step.icon size={16} />
                  </div>
                  <div>
                    <p className={`text-sm font-medium ${step.done ? "text-foreground" : step.pending ? "text-amber-600" : "text-muted-foreground"}`}>{step.label}</p>
                    <p className="text-xs text-muted-foreground">{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button asChild className="bg-primary hover:bg-primary/90">
              <Link to="/produtos">
                <ShoppingBag size={16} className="mr-2" />
                Continuar comprando
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link to="/">Voltar ao início</Link>
            </Button>
          </div>
        </div>
      </div>
    </Layout>
  );
}
