import { useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { CheckCircle, Package, Truck, Home, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import Layout from "@/components/store/Layout";
import { useCart } from "@/contexts/CartContext";

export default function ThankYouPage() {
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get("pedido") || "";
  const { clearCart } = useCart();

  useEffect(() => {
    clearCart();
  }, [clearCart]);

  return (
    <Layout>
      <div className="min-h-[70vh] flex items-center justify-center py-12 px-4">
        <div className="max-w-lg w-full text-center space-y-6">
          <div className="relative mx-auto w-24 h-24">
            <div className="absolute inset-0 rounded-full animate-ping bg-emerald-500/20" />
            <div className="relative w-24 h-24 rounded-full flex items-center justify-center bg-emerald-500/10">
              <CheckCircle size={48} className="text-emerald-600" />
            </div>
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl sm:text-3xl font-heading font-bold text-foreground">
              Payment confirmed!
            </h1>
            <p className="text-muted-foreground text-sm">
              Thank you for your purchase. Your order is being prepared.
            </p>
          </div>

          {orderId && (
            <div className="bg-muted/50 rounded-xl border border-border p-4">
              <p className="text-xs text-muted-foreground mb-1">Order number</p>
              <p className="font-mono text-sm font-bold text-foreground">{orderId.slice(0, 8).toUpperCase()}</p>
            </div>
          )}

          <div className="bg-background rounded-xl border border-border p-5 text-left space-y-4">
            <h2 className="text-sm font-heading font-bold text-foreground">Next steps</h2>
            <div className="space-y-3">
              {[
                { icon: CheckCircle, label: "Payment approved", desc: "Your payment was successfully confirmed", done: true },
                { icon: Package, label: "Preparing order", desc: "We're packing your products", done: false },
                { icon: Truck, label: "Shipped", desc: "You'll receive the tracking code by email", done: false },
                { icon: Home, label: "Delivered", desc: "Product delivered to your address", done: false },
              ].map((step, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                    step.done ? "bg-emerald-500/10 text-emerald-600" : "bg-muted text-muted-foreground"
                  }`}>
                    <step.icon size={16} />
                  </div>
                  <div>
                    <p className={`text-sm font-medium ${step.done ? "text-foreground" : "text-muted-foreground"}`}>{step.label}</p>
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
                Continue shopping
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link to="/">Back to home</Link>
            </Button>
          </div>
        </div>
      </div>
    </Layout>
  );
}
