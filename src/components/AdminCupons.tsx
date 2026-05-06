import { useEffect, useState } from "react";
import { Plus, Save, Trash2, Tag } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { adminWrite } from "@/lib/adminApi";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";

interface Coupon {
  id: string;
  code: string;
  discount_type: string;
  discount_value: number;
  min_order_cents: number;
  max_uses: number | null;
  used_count: number;
  active: boolean;
  expires_at: string | null;
  free_shipping: boolean;
}

export default function AdminCupons() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [message, setMessage] = useState("");

  const [newCode, setNewCode] = useState("");
  const [newType, setNewType] = useState<"percent" | "fixed">("percent");
  const [newValue, setNewValue] = useState("");
  const [newMinOrder, setNewMinOrder] = useState("");
  const [newMaxUses, setNewMaxUses] = useState("");
  const [newExpires, setNewExpires] = useState("");

  const flash = (msg: string) => {
    setMessage(msg);
    setTimeout(() => setMessage(""), 3000);
  };

  const load = async () => {
    const { data } = await supabase.from("coupons").select("*").order("created_at", { ascending: false });
    setCoupons((data as Coupon[]) || []);
  };

  useEffect(() => { void load(); }, []);

  const handleAdd = async () => {
    if (!newCode.trim() || !newValue) return;
    const result = await adminWrite({
      table: "coupons",
      op: "insert",
      payload: {
        code: newCode.trim().toUpperCase(),
        discount_type: newType,
        discount_value: parseInt(newValue),
        min_order_cents: newMinOrder ? parseInt(newMinOrder) * 100 : 0,
        max_uses: newMaxUses ? parseInt(newMaxUses) : null,
        expires_at: newExpires || null,
      },
    });
    if (!result.ok) { flash("Erro: " + result.error); return; }
    flash("Cupom criado com sucesso!");
    setNewCode(""); setNewValue(""); setNewMinOrder(""); setNewMaxUses(""); setNewExpires("");
    await load();
  };

  const toggleActive = async (id: string, active: boolean) => {
    const result = await adminWrite({ table: "coupons", op: "update", payload: { active }, match: { id } });
    if (!result.ok) { flash("Erro: " + result.error); return; }
    await load();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Excluir este cupom?")) return;
    const result = await adminWrite({ table: "coupons", op: "delete", match: { id } });
    if (!result.ok) { flash("Erro: " + result.error); return; }
    flash("Cupom excluído!");
    await load();
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-black text-foreground">Cupons de Desconto</h2>

      {/* Add form */}
      <Card className="p-5 border border-border space-y-3">
        <h3 className="text-sm font-bold flex items-center gap-2"><Tag size={16} /> Novo Cupom</h3>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Código</label>
            <Input value={newCode} onChange={(e) => setNewCode(e.target.value)} placeholder="EX: Bubo Health10" className="mt-1 text-xs font-mono uppercase" />
          </div>
          <div>
            <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Tipo</label>
            <select value={newType} onChange={(e) => setNewType(e.target.value as "percent" | "fixed")} className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-xs">
              <option value="percent">Percentual (%)</option>
              <option value="fixed">Valor fixo (centavos)</option>
            </select>
          </div>
          <div>
            <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              {newType === "percent" ? "Desconto (%)" : "Desconto (centavos)"}
            </label>
            <Input type="number" value={newValue} onChange={(e) => setNewValue(e.target.value)} placeholder={newType === "percent" ? "10" : "1000"} className="mt-1 text-xs" />
          </div>
          <div>
            <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Pedido mínimo (R$)</label>
            <Input type="number" value={newMinOrder} onChange={(e) => setNewMinOrder(e.target.value)} placeholder="0" className="mt-1 text-xs" />
          </div>
          <div>
            <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Máx. usos (vazio = ilimitado)</label>
            <Input type="number" value={newMaxUses} onChange={(e) => setNewMaxUses(e.target.value)} placeholder="100" className="mt-1 text-xs" />
          </div>
          <div>
            <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Expira em</label>
            <Input type="datetime-local" value={newExpires} onChange={(e) => setNewExpires(e.target.value)} className="mt-1 text-xs" />
          </div>
        </div>
        <Button onClick={handleAdd} className="w-full bg-emerald-500 text-white text-xs font-bold hover:bg-emerald-500/90">
          <Plus size={14} className="mr-1.5" /> Criar Cupom
        </Button>
      </Card>

      {message && (
        <div className={`rounded-md p-2.5 text-center text-xs font-bold ${message.includes("sucesso") || message.includes("Cupom excl") ? "bg-emerald-500/10 text-emerald-500" : "bg-destructive/10 text-destructive"}`}>
          {message}
        </div>
      )}

      {/* List */}
      <div className="space-y-3">
        {coupons.map((c) => (
          <Card key={c.id} className="p-4 border border-border">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Badge variant={c.active ? "default" : "secondary"} className="font-mono text-xs">
                  {c.code}
                </Badge>
                <span className="text-xs text-muted-foreground">
                  {c.discount_type === "percent" ? `${c.discount_value}%` : `R$ ${(c.discount_value / 100).toFixed(2)}`}
                  {c.min_order_cents > 0 && ` (mín. R$ ${(c.min_order_cents / 100).toFixed(2)})`}
                  {c.free_shipping && " · frete grátis"}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-[10px] text-muted-foreground">
                  {c.used_count}{c.max_uses ? `/${c.max_uses}` : ""} usos
                </span>
                <Switch checked={c.active} onCheckedChange={(v) => toggleActive(c.id, v)} />
                <button onClick={() => handleDelete(c.id)} className="text-destructive hover:text-destructive/80">
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
            {c.expires_at && (
              <p className="text-[10px] text-muted-foreground mt-1">
                Expira: {new Date(c.expires_at).toLocaleDateString("pt-BR")}
              </p>
            )}
          </Card>
        ))}
        {coupons.length === 0 && <p className="text-xs text-muted-foreground text-center py-8">Nenhum cupom cadastrado</p>}
      </div>
    </div>
  );
}

function TruckIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      className="text-primary"
    >
      <path
        d="M3 7h11v10H3V7Zm11 4h4l3 3v3h-7v-6Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path
        d="M7 20a1 1 0 1 0 0-2 1 1 0 0 0 0 2Zm11 0a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}
