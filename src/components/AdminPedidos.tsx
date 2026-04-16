import { useState, useEffect, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import {
  CheckCircle, ChevronDown, ChevronUp, Clock, Copy, ExternalLink,
  Loader2, Mail, Package, RefreshCw, Save, Search, ShoppingCart,
  Trash2, Truck, Zap, XCircle, Eye,
} from "lucide-react";
import { formatPrice } from "@/data/store";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { fireWebhookEvent } from "@/lib/webhookManager";

interface OrderItem {
  id: string;
  product_name: string;
  quantity: number;
  price_cents: number;
}

interface Order {
  id: string;
  buyer_name: string | null;
  buyer_email: string | null;
  buyer_phone: string | null;
  buyer_document: string | null;
  amount_cents: number;
  shipping_cost_cents: number | null;
  shipping_method: string | null;
  status: string;
  gateway: string | null;
  tracking_code: string | null;
  qr_code_copied: boolean | null;
  created_at: string;
  updated_at: string;
  items?: OrderItem[];
}

const STATUS_OPTIONS = [
  { value: "pending", label: "Pendente", color: "border-amber-500/30 bg-amber-500/10 text-amber-500" },
  { value: "paid", label: "Pago", color: "border-emerald-500/30 bg-emerald-500/10 text-emerald-500" },
  { value: "shipped", label: "Enviado", color: "border-blue-500/30 bg-blue-500/10 text-blue-500" },
  { value: "delivered", label: "Entregue", color: "border-emerald-600/30 bg-emerald-600/10 text-emerald-600" },
  { value: "cancelled", label: "Cancelado", color: "border-destructive/30 bg-destructive/10 text-destructive" },
];

function getStatusBadge(status: string) {
  const s = STATUS_OPTIONS.find((o) => o.value === status) || STATUS_OPTIONS[0];
  return <Badge className={`text-[10px] ${s.color}`}>{s.label}</Badge>;
}

export default function AdminPedidos() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [sendingEmail, setSendingEmail] = useState<string | null>(null);

  const flash = (msg: string) => {
    setMessage(msg);
    setTimeout(() => setMessage(""), 4000);
  };

  const fetchOrders = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("orders")
      .select("id, buyer_name, buyer_email, buyer_phone, buyer_document, amount_cents, shipping_cost_cents, shipping_method, status, gateway, tracking_code, qr_code_copied, created_at, updated_at")
      .order("created_at", { ascending: false })
      .limit(100);

    const orderList = (data || []) as Order[];

    // Fetch items for all orders
    if (orderList.length > 0) {
      const ids = orderList.map((o) => o.id);
      const { data: itemsData } = await supabase
        .from("order_items")
        .select("id, order_id, product_name, quantity, price_cents")
        .in("order_id", ids);

      if (itemsData) {
        const itemsByOrder: Record<string, OrderItem[]> = {};
        (itemsData as any[]).forEach((item) => {
          if (!itemsByOrder[item.order_id]) itemsByOrder[item.order_id] = [];
          itemsByOrder[item.order_id].push(item);
        });
        orderList.forEach((o) => {
          o.items = itemsByOrder[o.id] || [];
        });
      }
    }

    setOrders(orderList);
    setLoading(false);
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const filteredOrders = useMemo(() => {
    return orders.filter((o) => {
      if (statusFilter !== "all" && o.status !== statusFilter) return false;
      if (search) {
        const q = search.toLowerCase();
        return (
          (o.buyer_name || "").toLowerCase().includes(q) ||
          (o.buyer_email || "").toLowerCase().includes(q) ||
          (o.buyer_phone || "").includes(q) ||
          o.id.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [orders, search, statusFilter]);

  const updateOrderField = (id: string, field: string, value: any) => {
    setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, [field]: value } : o)));
  };

  const handleUpdateStatus = async (order: Order, newStatus: string) => {
    const { error } = await supabase
      .from("orders")
      .update({ status: newStatus, updated_at: new Date().toISOString() })
      .eq("id", order.id);

    if (error) {
      flash("Erro ao atualizar status");
      return;
    }

    updateOrderField(order.id, "status", newStatus);

    if (newStatus === "paid") {
      await fireWebhookEvent("venda_aprovada", {
        source: "loja-ecommerce",
        buyerName: order.buyer_name,
        buyerEmail: order.buyer_email,
        buyerPhone: order.buyer_phone,
        amount: order.amount_cents / 100,
        orderId: order.id,
        gateway: order.gateway,
      });
    }

    flash(`Status atualizado para "${STATUS_OPTIONS.find((s) => s.value === newStatus)?.label}"!`);
  };

  const handleSaveTracking = async (order: Order) => {
    const { error } = await supabase
      .from("orders")
      .update({ tracking_code: order.tracking_code, status: order.tracking_code ? "shipped" : order.status, updated_at: new Date().toISOString() })
      .eq("id", order.id);

    if (error) {
      flash("Erro ao salvar rastreio");
      return;
    }

    if (order.tracking_code) {
      updateOrderField(order.id, "status", "shipped");
    }

    flash("Código de rastreio salvo com sucesso!");
  };

  const handleSendEmail = async (order: Order, type: "status" | "tracking") => {
    if (!order.buyer_email) {
      flash("Cliente não possui email cadastrado");
      return;
    }

    setSendingEmail(order.id);

    try {
      const { error } = await supabase.functions.invoke("send-order-email", {
        body: {
          orderId: order.id,
          buyerEmail: order.buyer_email,
          buyerName: order.buyer_name || "Cliente",
          status: order.status,
          trackingCode: order.tracking_code,
          amountCents: order.amount_cents,
          type,
          items: (order.items || []).map(i => ({
            name: i.product_name,
            quantity: i.quantity,
            priceCents: i.price_cents,
          })),
        },
      });

      if (error) throw error;
      flash(`Email enviado para ${order.buyer_email}!`);
    } catch (err: any) {
      flash(`Erro ao enviar email: ${err?.message || "Erro desconhecido"}`);
    }

    setSendingEmail(null);
  };

  const handleSendWhatsApp = (order: Order, type: "status" | "tracking") => {
    if (!order.buyer_phone) return;
    const phone = order.buyer_phone.replace(/\D/g, "");
    const fullPhone = phone.startsWith("55") ? phone : `55${phone}`;

    let msg = "";
    if (type === "tracking" && order.tracking_code) {
      msg = `📦 Olá ${order.buyer_name || ""}! Seu pedido #${order.id.slice(0, 8).toUpperCase()} foi enviado!\n\nCódigo de rastreio: ${order.tracking_code}\n\nAcompanhe em: https://rastreamento.correios.com.br/app/index.php?objeto=${order.tracking_code}`;
    } else {
      const statusLabel = STATUS_OPTIONS.find((s) => s.value === order.status)?.label || order.status;
      msg = `✅ Olá ${order.buyer_name || ""}! Atualização do seu pedido #${order.id.slice(0, 8).toUpperCase()}:\n\nStatus: ${statusLabel}\nValor: R$ ${(order.amount_cents / 100).toFixed(2).replace(".", ",")}\n\nObrigado pela compra! 🎉`;
    }

    window.open(`https://wa.me/${fullPhone}?text=${encodeURIComponent(msg)}`, "_blank");
  };

  const handleProcessOrder = async (order: Order) => {
    // Determine next status
    const flow = ["pending", "paid", "shipped", "delivered"];
    const currentIdx = flow.indexOf(order.status);
    const nextStatus = currentIdx < flow.length - 1 ? flow[currentIdx + 1] : null;

    if (!nextStatus) {
      flash("Pedido já está no status final");
      return;
    }

    await handleUpdateStatus(order, nextStatus);

    // Send email notification
    if (order.buyer_email) {
      await handleSendEmail(order, nextStatus === "shipped" ? "tracking" : "status");
    }

    // Open WhatsApp if buyer has phone
    if (order.buyer_phone) {
      handleSendWhatsApp(order, nextStatus === "shipped" ? "tracking" : "status");
    }
  };

  const handleClearOrders = async () => {
    if (!window.confirm("Tem certeza que deseja limpar TODOS os pedidos?")) return;
    await supabase.from("orders").delete().neq("id", "00000000-0000-0000-0000-000000000000");
    await fetchOrders();
    flash("Pedidos removidos com sucesso!");
  };

  const counts = useMemo(() => {
    const c: Record<string, number> = { all: orders.length };
    orders.forEach((o) => {
      c[o.status] = (c[o.status] || 0) + 1;
    });
    return c;
  }, [orders]);

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-black text-foreground">Pedidos</h2>
          <p className="text-xs text-muted-foreground">Gerencie pedidos, status e envie notificações</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleClearOrders} variant="outline" size="sm" className="text-xs font-bold text-destructive hover:bg-destructive/10">
            <Trash2 size={14} className="mr-1" /> Limpar
          </Button>
          <Button onClick={fetchOrders} variant="outline" size="sm" className="text-xs font-bold" disabled={loading}>
            <RefreshCw size={14} className={`mr-1 ${loading ? "animate-spin" : ""}`} /> Atualizar
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2 mb-4">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar por nome, email, telefone ou ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8 h-8 text-xs"
          />
        </div>
        <div className="flex gap-1">
          {[
            { value: "all", label: "Todos" },
            { value: "pending", label: "Pendentes" },
            { value: "paid", label: "Pagos" },
            { value: "shipped", label: "Enviados" },
            { value: "delivered", label: "Entregues" },
          ].map((f) => (
            <button
              key={f.value}
              onClick={() => setStatusFilter(f.value)}
              className={`px-2.5 py-1 rounded-md text-[10px] font-bold transition-colors ${
                statusFilter === f.value
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-muted-foreground hover:bg-muted border border-border"
              }`}
            >
              {f.label} ({counts[f.value] || 0})
            </button>
          ))}
        </div>
      </div>

      {loading && (
        <div className="flex justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      )}

      {!loading && filteredOrders.length === 0 && (
        <Card className="border border-border p-8 text-center">
          <ShoppingCart size={32} className="mx-auto mb-3 text-muted-foreground" />
          <p className="text-sm font-bold text-foreground">Nenhum pedido encontrado</p>
          <p className="mt-1 text-xs text-muted-foreground">
            {search || statusFilter !== "all" ? "Tente alterar os filtros" : "Os pedidos aparecerão aqui"}
          </p>
        </Card>
      )}

      {filteredOrders.length > 0 && (
        <div className="space-y-3">
          {filteredOrders.map((order) => {
            const isExpanded = expandedId === order.id;
            const totalProducts = order.items?.reduce((s, i) => s + i.price_cents * i.quantity, 0) || 0;
            const shippingCents = order.shipping_cost_cents || 0;

            return (
              <Card key={order.id} className="border border-border overflow-hidden">
                {/* Header */}
                <div
                  className="p-4 cursor-pointer hover:bg-muted/30 transition-colors"
                  onClick={() => setExpandedId(isExpanded ? null : order.id)}
                >
                  <div className="flex items-start justify-between">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="text-sm font-black text-foreground truncate">{order.buyer_name || "Sem nome"}</p>
                        {getStatusBadge(order.status)}
                        {order.qr_code_copied && (
                          <Badge variant="outline" className="text-[9px] border-emerald-500/30 text-emerald-500">
                            <Copy size={8} className="mr-0.5" /> PIX copiado
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
                        <span>{new Date(order.created_at).toLocaleString("pt-BR")}</span>
                        <span>•</span>
                        <span className="font-mono">{order.id.slice(0, 8).toUpperCase()}</span>
                        {order.gateway && (
                          <>
                            <span>•</span>
                            <span>{order.gateway}</span>
                          </>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-black text-foreground">
                        {formatPrice(order.amount_cents / 100)}
                      </span>
                      {isExpanded ? <ChevronUp size={16} className="text-muted-foreground" /> : <ChevronDown size={16} className="text-muted-foreground" />}
                    </div>
                  </div>
                </div>

                {/* Expanded details */}
                {isExpanded && (
                  <div className="border-t border-border p-4 space-y-4 bg-muted/10">
                    {/* Buyer info */}
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <p className="text-[10px] font-bold text-muted-foreground uppercase mb-1">Comprador</p>
                        <p className="text-xs font-bold">{order.buyer_name || "—"}</p>
                        <p className="text-[11px] text-muted-foreground">{order.buyer_email || "Sem email"}</p>
                        <p className="text-[11px] text-muted-foreground">{order.buyer_phone || "Sem telefone"}</p>
                        {order.buyer_document && (
                          <p className="text-[11px] text-muted-foreground">CPF: {order.buyer_document}</p>
                        )}
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-muted-foreground uppercase mb-1">Valores</p>
                        {totalProducts > 0 && (
                          <p className="text-[11px]">Produtos: {formatPrice(totalProducts / 100)}</p>
                        )}
                        {(shippingCents > 0 || order.shipping_method) && (
                          <p className="text-[11px]">
                            Frete: {formatPrice(shippingCents / 100)}
                            {order.shipping_method && (
                              <span className="text-muted-foreground ml-1">({order.shipping_method})</span>
                            )}
                          </p>
                        )}
                        <p className="text-xs font-bold text-primary mt-1">
                          Total: {formatPrice(order.amount_cents / 100)}
                        </p>
                      </div>
                    </div>

                    {/* Items */}
                    {order.items && order.items.length > 0 && (
                      <div>
                        <p className="text-[10px] font-bold text-muted-foreground uppercase mb-2">Itens do Pedido</p>
                        <div className="space-y-1.5">
                          {order.items.map((item) => (
                            <div key={item.id} className="flex justify-between items-center bg-background rounded-md px-3 py-2 border border-border">
                              <div>
                                <span className="text-xs font-bold">{item.quantity}x</span>{" "}
                                <span className="text-xs">{item.product_name}</span>
                              </div>
                              <span className="text-xs font-bold">{formatPrice((item.price_cents * item.quantity) / 100)}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Status change */}
                    <div>
                      <p className="text-[10px] font-bold text-muted-foreground uppercase mb-2">Alterar Status</p>
                      <div className="flex flex-wrap gap-1.5">
                        {STATUS_OPTIONS.filter((s) => s.value !== order.status).map((s) => (
                          <Button
                            key={s.value}
                            size="sm"
                            variant="outline"
                            className={`h-7 text-[10px] font-bold ${s.color}`}
                            onClick={() => handleUpdateStatus(order, s.value)}
                          >
                            {s.label}
                          </Button>
                        ))}
                      </div>
                    </div>

                    {/* Tracking code */}
                    <div>
                      <p className="text-[10px] font-bold text-muted-foreground uppercase mb-2">Código de Rastreio</p>
                      <div className="flex items-center gap-2">
                        <Truck size={14} className="text-muted-foreground shrink-0" />
                        <Input
                          placeholder="Ex: BR123456789BR"
                          value={order.tracking_code || ""}
                          onChange={(e) => updateOrderField(order.id, "tracking_code", e.target.value)}
                          className="h-8 text-xs flex-1 font-mono"
                        />
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-8 px-3 text-[10px] font-bold"
                          onClick={() => handleSaveTracking(order)}
                        >
                          <Save size={12} className="mr-1" /> Salvar
                        </Button>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-wrap gap-2 pt-2 border-t border-border">
                      {/* Process order - main CTA */}
                      {order.status !== "delivered" && order.status !== "cancelled" && (
                        <Button
                          size="sm"
                          className="bg-primary text-primary-foreground text-xs font-bold"
                          onClick={() => handleProcessOrder(order)}
                        >
                          <CheckCircle size={14} className="mr-1.5" />
                          Processar Pedido
                          <span className="ml-1 opacity-70 text-[10px]">
                            (→ {STATUS_OPTIONS.find((s) => s.value === (["pending", "paid", "shipped", "delivered"][["pending", "paid", "shipped", "delivered"].indexOf(order.status) + 1] || ""))?.label || "—"})
                          </span>
                        </Button>
                      )}

                      {/* Send email */}
                      {order.buyer_email && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-xs font-bold"
                          disabled={sendingEmail === order.id}
                          onClick={() => handleSendEmail(order, order.tracking_code ? "tracking" : "status")}
                        >
                          {sendingEmail === order.id ? (
                            <Loader2 size={12} className="mr-1 animate-spin" />
                          ) : (
                            <Mail size={12} className="mr-1" />
                          )}
                          Enviar Email
                        </Button>
                      )}

                      {/* WhatsApp */}
                      {order.buyer_phone && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-xs font-bold text-emerald-500 border-emerald-500/30 hover:bg-emerald-500/10"
                          onClick={() => handleSendWhatsApp(order, order.tracking_code ? "tracking" : "status")}
                        >
                          <Zap size={12} className="mr-1" /> WhatsApp
                        </Button>
                      )}

                      {/* Track link */}
                      {order.tracking_code && (
                        <a
                          href={`https://rastreamento.correios.com.br/app/index.php?objeto=${order.tracking_code}`}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <Button size="sm" variant="outline" className="text-xs font-bold text-blue-500 border-blue-500/30 hover:bg-blue-500/10">
                            <ExternalLink size={12} className="mr-1" /> Rastrear
                          </Button>
                        </a>
                      )}
                    </div>

                    {/* Dates */}
                    <div className="text-[10px] text-muted-foreground flex gap-4 pt-2 border-t border-border">
                      <span>Criado: {new Date(order.created_at).toLocaleString("pt-BR")}</span>
                      <span>Atualizado: {new Date(order.updated_at).toLocaleString("pt-BR")}</span>
                    </div>
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}

      {/* Status message */}
      {message && (
        <div
          className={`mt-4 rounded-md p-2.5 text-center text-xs font-bold ${
            message.toLowerCase().includes("erro") || message.toLowerCase().includes("falha")
              ? "bg-destructive/10 text-destructive"
              : "bg-emerald-500/10 text-emerald-500"
          }`}
        >
          {message}
        </div>
      )}
    </div>
  );
}
