import { useState } from "react";
import { Search, Package, Clock, CheckCircle, Truck, AlertCircle, ExternalLink } from "lucide-react";
import Layout from "@/components/store/Layout";
import PageHead from "@/components/seo/PageHead";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { formatPrice } from "@/data/store";

interface OrderData {
  id: string;
  status: string;
  amount_cents: number;
  created_at: string;
  tracking_code: string | null;
  buyer_name: string | null;
  shipping_cost_cents: number | null;
  gateway: string | null;
  items: { product_name: string; quantity: number; price_cents: number }[];
}

const STATUS_MAP: Record<string, { label: string; color: string; icon: typeof Package }> = {
  pending: { label: "Aguardando pagamento", color: "text-amber-500", icon: Clock },
  paid: { label: "Pagamento confirmado", color: "text-emerald-500", icon: CheckCircle },
  approved: { label: "Pagamento aprovado", color: "text-emerald-500", icon: CheckCircle },
  shipped: { label: "Enviado", color: "text-blue-500", icon: Truck },
  delivered: { label: "Entregue", color: "text-emerald-600", icon: Package },
  cancelled: { label: "Cancelado", color: "text-destructive", icon: AlertCircle },
  refunded: { label: "Reembolsado", color: "text-muted-foreground", icon: AlertCircle },
};

export default function TrackOrderPage() {
  const [orderId, setOrderId] = useState("");
  const [order, setOrder] = useState<OrderData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSearch = async () => {
    const cleanId = orderId.trim();
    if (!cleanId) return;

    setLoading(true);
    setError("");
    setOrder(null);

    try {
      const { data: orderData, error: orderError } = await supabase
        .from("orders")
        .select("id, status, amount_cents, created_at, tracking_code, buyer_name, shipping_cost_cents, gateway")
        .eq("id", cleanId)
        .maybeSingle();

      if (orderError || !orderData) {
        setError("Pedido não encontrado. Verifique o código e tente novamente.");
        setLoading(false);
        return;
      }

      // Try to fetch order items (may fail due to RLS for anonymous users)
      let items: OrderData["items"] = [];
      try {
        const { data: itemsData } = await supabase
          .from("order_items")
          .select("product_name, quantity, price_cents")
          .eq("order_id", cleanId);
        if (itemsData) items = itemsData;
      } catch {
        // ignore - items may not be accessible
      }

      setOrder({ ...orderData, items });
    } catch {
      setError("Erro ao buscar pedido. Tente novamente.");
    }

    setLoading(false);
  };

  const statusInfo = order ? STATUS_MAP[order.status] || STATUS_MAP.pending : null;
  const StatusIcon = statusInfo?.icon || Package;

  return (
    <Layout>
      <PageHead
        title="Rastrear Pedido | Kazoom"
        description="Acompanhe o status do seu pedido na Kazoom. Insira o código do pedido para verificar o andamento."
        canonical="https://snug-code-space.lovable.app/rastrear"
      />
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-lg mx-auto">
          <h1 className="text-2xl md:text-3xl font-heading font-bold text-center mb-2">
            Rastrear Pedido
          </h1>
          <p className="text-sm text-muted-foreground text-center mb-8">
            Insira o código do seu pedido para acompanhar o status
          </p>

          <div className="flex gap-2 mb-8">
            <Input
              value={orderId}
              onChange={(e) => setOrderId(e.target.value)}
              placeholder="Código do pedido"
              className="flex-1"
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            />
            <Button onClick={handleSearch} disabled={loading || !orderId.trim()}>
              {loading ? (
                <span className="animate-spin mr-1">⏳</span>
              ) : (
                <Search size={16} className="mr-1" />
              )}
              Buscar
            </Button>
          </div>

          {error && (
            <div className="bg-destructive/10 text-destructive text-sm font-medium rounded-lg p-4 text-center mb-6">
              {error}
            </div>
          )}

          {order && statusInfo && (
            <div className="bg-background rounded-xl border border-border p-6 space-y-6">
              {/* Status */}
              <div className="text-center space-y-2">
                <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto bg-muted`}>
                  <StatusIcon size={32} className={statusInfo.color} />
                </div>
                <h2 className={`text-lg font-bold ${statusInfo.color}`}>
                  {statusInfo.label}
                </h2>
                <p className="text-xs text-muted-foreground">
                  Pedido realizado em{" "}
                  {new Date(order.created_at).toLocaleDateString("pt-BR", {
                    day: "2-digit",
                    month: "long",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>

              {/* Timeline */}
              <div className="space-y-3">
                {["pending", "paid", "shipped", "delivered"].map((s, i) => {
                  const stepStatuses = ["pending", "paid", "shipped", "delivered"];
                  const currentIndex = stepStatuses.indexOf(order.status);
                  const isActive = i <= currentIndex;
                  const info = STATUS_MAP[s];
                  const Icon = info.icon;
                  return (
                    <div key={s} className="flex items-center gap-3">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                          isActive ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                        }`}
                      >
                        <Icon size={14} />
                      </div>
                      <span
                        className={`text-sm ${
                          isActive ? "font-medium text-foreground" : "text-muted-foreground"
                        }`}
                      >
                        {info.label}
                      </span>
                      {i < 3 && (
                        <div
                          className={`flex-1 h-px ${
                            i < currentIndex ? "bg-primary" : "bg-border"
                          }`}
                        />
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Tracking code */}
              {order.tracking_code && (
                <div className="bg-muted/50 rounded-lg p-4 space-y-2">
                  <p className="text-xs font-semibold text-muted-foreground">Código de rastreio</p>
                  <div className="flex items-center gap-2">
                    <code className="text-sm font-mono font-bold flex-1">
                      {order.tracking_code}
                    </code>
                    <a
                      href={`https://www.linkcorreios.com.br/?id=${order.tracking_code}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline text-xs flex items-center gap-1"
                    >
                      Rastrear <ExternalLink size={12} />
                    </a>
                  </div>
                </div>
              )}

              {/* Order details */}
              <div className="border-t border-border pt-4 space-y-2">
                <p className="text-xs font-semibold text-muted-foreground">Detalhes do pedido</p>
                <div className="text-sm space-y-1">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Código</span>
                    <span className="font-mono text-xs">{order.id.slice(0, 8)}...</span>
                  </div>
                  {order.buyer_name && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Comprador</span>
                      <span>{order.buyer_name}</span>
                    </div>
                  )}
                  <div className="flex justify-between font-bold pt-1 border-t border-border">
                    <span>Total</span>
                    <span className="text-primary">
                      {formatPrice(order.amount_cents / 100)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Items */}
              {order.items.length > 0 && (
                <div className="border-t border-border pt-4 space-y-2">
                  <p className="text-xs font-semibold text-muted-foreground">Itens</p>
                  {order.items.map((item, i) => (
                    <div key={i} className="flex justify-between text-sm">
                      <span>
                        {item.quantity}x {item.product_name}
                      </span>
                      <span className="font-medium">
                        {formatPrice((item.price_cents * item.quantity) / 100)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
