import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  RefreshCw,
  MessageCircle,
  Mail,
  Copy,
  CheckCircle2,
  XCircle,
  Loader2,
  ShoppingCart,
  Activity,
} from "lucide-react";

interface AbandonedRow {
  id: string;
  buyer_name: string | null;
  buyer_email: string | null;
  buyer_phone: string | null;
  amount_cents: number;
  status: string;
  checkout_step: string | null;
  checkout_step_updated_at: string | null;
  created_at: string;
  updated_at: string;
  recovery_email_sent: boolean | null;
  abandoned_recovered: boolean | null;
}

const WINDOWS = [
  { label: "1h", minutes: 60 },
  { label: "24h", minutes: 60 * 24 },
  { label: "7d", minutes: 60 * 24 * 7 },
  { label: "30d", minutes: 60 * 24 * 30 },
];

const STEP_LABEL: Record<string, string> = {
  identification: "Identificação",
  shipping: "Endereço",
  payment: "Pagamento",
};

const STEP_COLOR: Record<string, string> = {
  identification: "bg-amber-500/10 text-amber-600",
  shipping: "bg-blue-500/10 text-blue-600",
  payment: "bg-orange-500/10 text-orange-600",
};

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const min = Math.floor(diff / 60000);
  if (min < 1) return "agora";
  if (min < 60) return `${min}min atrás`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}h atrás`;
  return `${Math.floor(hr / 24)}d atrás`;
}

function formatBRL(cents: number) {
  return (cents / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export default function AdminAbandonedCarts() {
  const [windowMin, setWindowMin] = useState(60 * 24);
  const [rows, setRows] = useState<AbandonedRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [recovering, setRecovering] = useState<string>("");
  const [message, setMessage] = useState("");
  const [tab, setTab] = useState<"live" | "abandoned">("live");

  const fetchData = useCallback(async () => {
    setLoading(true);
    const cutoff = new Date(Date.now() - windowMin * 60 * 1000).toISOString();
    const { data } = await supabase
      .from("orders")
      .select(
        "id,buyer_name,buyer_email,buyer_phone,amount_cents,status,checkout_step,checkout_step_updated_at,created_at,updated_at,recovery_email_sent,abandoned_recovered"
      )
      .in("status", ["draft", "pending"])
      .gte("created_at", cutoff)
      .order("checkout_step_updated_at", { ascending: false, nullsFirst: false });
    setRows((data as AbandonedRow[]) || []);
    setLoading(false);
  }, [windowMin]);

  useEffect(() => {
    void fetchData();
    const id = window.setInterval(fetchData, 15000);
    return () => window.clearInterval(id);
  }, [fetchData]);

  const flash = (m: string) => {
    setMessage(m);
    window.setTimeout(() => setMessage(""), 3000);
  };

  const liveRows = rows.filter((r) => {
    const last = r.checkout_step_updated_at || r.updated_at || r.created_at;
    return Date.now() - new Date(last).getTime() < 5 * 60 * 1000 && r.status === "draft";
  });

  const abandonedRows = rows.filter((r) => !liveRows.includes(r) && !r.abandoned_recovered);

  const handleWhatsApp = (row: AbandonedRow) => {
    if (!row.buyer_phone) return flash("Sem telefone");
    const phone = row.buyer_phone.replace(/\D/g, "");
    const full = phone.startsWith("55") ? phone : `55${phone}`;
    const msg = encodeURIComponent(
      `Olá ${row.buyer_name || ""}! Vi que você começou um pedido na Kazoom 🛒. Posso te ajudar a finalizar? Valor: ${formatBRL(row.amount_cents)}.`
    );
    window.open(`https://wa.me/${full}?text=${msg}`, "_blank");
  };

  const handleEmail = async (row: AbandonedRow) => {
    if (!row.buyer_email) return flash("Sem email");
    setRecovering(row.id);
    try {
      const { data: items } = await supabase
        .from("order_items")
        .select("product_name, quantity, price_cents")
        .eq("order_id", row.id);

      await supabase.functions.invoke("send-order-email", {
        body: {
          orderId: row.id,
          buyerEmail: row.buyer_email,
          buyerName: row.buyer_name || "Cliente",
          status: "pending",
          amountCents: row.amount_cents,
          type: "recovery",
          items: (items || []).map((i) => ({
            name: i.product_name,
            quantity: i.quantity,
            priceCents: i.price_cents,
          })),
        },
      });
      await supabase
        .from("orders")
        .update({
          recovery_email_sent: true,
          recovery_email_sent_at: new Date().toISOString(),
        })
        .eq("id", row.id);
      flash("Email de recuperação enviado!");
      void fetchData();
    } catch (e) {
      console.error(e);
      flash("Erro ao enviar email");
    } finally {
      setRecovering("");
    }
  };

  const handleCopy = async (row: AbandonedRow) => {
    const text = [
      `Nome: ${row.buyer_name || "-"}`,
      `Email: ${row.buyer_email || "-"}`,
      `Telefone: ${row.buyer_phone || "-"}`,
      `Valor: ${formatBRL(row.amount_cents)}`,
    ].join("\n");
    await navigator.clipboard.writeText(text);
    flash("Dados copiados!");
  };

  const handleMark = async (row: AbandonedRow, recovered: boolean) => {
    await supabase
      .from("orders")
      .update({ abandoned_recovered: recovered })
      .eq("id", row.id);
    flash(recovered ? "Marcado como recuperado" : "Marcado como perdido");
    void fetchData();
  };

  const renderRow = (row: AbandonedRow, isLive: boolean) => {
    const step = row.checkout_step || "identification";
    return (
      <Card key={row.id} className="p-4 mb-2 border border-border">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <span className="text-sm font-bold text-foreground truncate">
                {row.buyer_name || "Sem nome"}
              </span>
              <Badge className={`text-[10px] ${STEP_COLOR[step] || "bg-muted"}`}>
                {STEP_LABEL[step] || step}
              </Badge>
              {row.status === "pending" && (
                <Badge className="text-[10px] bg-orange-500/10 text-orange-600">PIX gerado</Badge>
              )}
              {isLive && (
                <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-600">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  AO VIVO
                </span>
              )}
              {row.recovery_email_sent && (
                <Badge variant="secondary" className="text-[10px]">Email enviado</Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground truncate">{row.buyer_email || "—"}</p>
            <p className="text-xs text-muted-foreground">{row.buyer_phone || "—"}</p>
            <p className="text-[11px] text-muted-foreground mt-1">
              {timeAgo(row.checkout_step_updated_at || row.updated_at || row.created_at)} · #{row.id.slice(0, 8)}
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm font-black text-primary">{formatBRL(row.amount_cents)}</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-1.5">
          <Button
            size="sm"
            variant="outline"
            className="h-7 text-[11px]"
            onClick={() => handleWhatsApp(row)}
            disabled={!row.buyer_phone}
          >
            <MessageCircle size={12} className="mr-1" /> WhatsApp
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="h-7 text-[11px]"
            onClick={() => handleEmail(row)}
            disabled={!row.buyer_email || recovering === row.id}
          >
            {recovering === row.id ? (
              <Loader2 size={12} className="mr-1 animate-spin" />
            ) : (
              <Mail size={12} className="mr-1" />
            )}
            Email
          </Button>
          <Button size="sm" variant="outline" className="h-7 text-[11px]" onClick={() => handleCopy(row)}>
            <Copy size={12} className="mr-1" /> Copiar
          </Button>
          {!isLive && (
            <>
              <Button
                size="sm"
                variant="outline"
                className="h-7 text-[11px] text-emerald-600 border-emerald-500/30 hover:bg-emerald-500/10"
                onClick={() => handleMark(row, true)}
              >
                <CheckCircle2 size={12} className="mr-1" /> Recuperado
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="h-7 text-[11px] text-destructive border-destructive/30 hover:bg-destructive/10"
                onClick={() => handleMark(row, false)}
              >
                <XCircle size={12} className="mr-1" /> Perdido
              </Button>
            </>
          )}
        </div>
      </Card>
    );
  };

  return (
    <div>
      <div className="mb-3 flex items-start justify-between flex-wrap gap-2">
        <div>
          <h2 className="text-xl font-black text-foreground">Carrinhos Abandonados</h2>
          <p className="text-xs text-muted-foreground">
            Atualiza a cada 15 segundos · {liveRows.length} ao vivo · {abandonedRows.length} abandonados
          </p>
        </div>
        <Button onClick={fetchData} size="sm" variant="outline" className="h-8 text-xs">
          {loading ? <Loader2 size={12} className="mr-1 animate-spin" /> : <RefreshCw size={12} className="mr-1" />}
          Atualizar
        </Button>
      </div>

      <div className="mb-4 flex items-center gap-2 flex-wrap">
        <span className="text-xs font-bold text-muted-foreground">Janela:</span>
        {WINDOWS.map((w) => (
          <button
            key={w.minutes}
            onClick={() => setWindowMin(w.minutes)}
            className={`rounded-md px-3 py-1.5 text-xs font-bold transition-colors ${
              windowMin === w.minutes
                ? "bg-primary text-primary-foreground"
                : "border border-border bg-secondary text-muted-foreground hover:bg-muted"
            }`}
          >
            {w.label}
          </button>
        ))}
      </div>

      <div className="mb-4 flex border-b border-border">
        <button
          onClick={() => setTab("live")}
          className={`flex items-center gap-1.5 px-4 py-2 text-xs font-bold border-b-2 ${
            tab === "live" ? "border-primary text-primary" : "border-transparent text-muted-foreground"
          }`}
        >
          <Activity size={12} /> Ao vivo ({liveRows.length})
        </button>
        <button
          onClick={() => setTab("abandoned")}
          className={`flex items-center gap-1.5 px-4 py-2 text-xs font-bold border-b-2 ${
            tab === "abandoned" ? "border-primary text-primary" : "border-transparent text-muted-foreground"
          }`}
        >
          <ShoppingCart size={12} /> Abandonados ({abandonedRows.length})
        </button>
      </div>

      {message && (
        <div className="mb-3 rounded-md bg-emerald-500/10 p-2 text-center text-xs font-bold text-emerald-600">
          {message}
        </div>
      )}

      {tab === "live" && (
        <div>
          {liveRows.length === 0 ? (
            <p className="rounded-md border border-dashed border-border py-8 text-center text-xs text-muted-foreground">
              Nenhum cliente no checkout agora
            </p>
          ) : (
            liveRows.map((r) => renderRow(r, true))
          )}
        </div>
      )}

      {tab === "abandoned" && (
        <div>
          {abandonedRows.length === 0 ? (
            <p className="rounded-md border border-dashed border-border py-8 text-center text-xs text-muted-foreground">
              Nenhum carrinho abandonado nesta janela
            </p>
          ) : (
            abandonedRows.map((r) => renderRow(r, false))
          )}
        </div>
      )}
    </div>
  );
}
