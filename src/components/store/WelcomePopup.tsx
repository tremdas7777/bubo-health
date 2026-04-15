import { useState, useEffect } from "react";
import { X, Gift } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const COOKIE_KEY = "kazoom_welcome_seen";

export default function WelcomePopup() {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (localStorage.getItem(COOKIE_KEY)) return;
    const timer = setTimeout(() => setOpen(true), 4000);
    return () => clearTimeout(timer);
  }, []);

  const close = () => {
    setOpen(false);
    localStorage.setItem(COOKIE_KEY, "1");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    try {
      await supabase.from("funnel_events").insert({
        event: "newsletter_popup",
        session_id: email,
      });
      toast.success("Cupom KAZOOM10 liberado! Use no checkout 🎉");
      close();
    } catch {
      toast.error("Erro ao cadastrar. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-300 p-4">
      <div className="relative bg-card rounded-2xl shadow-2xl max-w-md w-full p-8 text-center border border-border animate-in zoom-in-95 duration-300">
        <button
          onClick={close}
          className="absolute top-3 right-3 text-muted-foreground hover:text-foreground transition-colors"
          aria-label="Fechar"
        >
          <X size={20} />
        </button>

        <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
          <Gift className="text-primary" size={28} />
        </div>

        <h2 className="text-2xl font-heading font-bold text-foreground mb-2">
          Ganhe 10% OFF
        </h2>
        <p className="text-muted-foreground text-sm mb-6">
          Na sua primeira compra! Cadastre seu e-mail e receba o cupom exclusivo.
        </p>

        <form onSubmit={handleSubmit} className="flex gap-2">
          <Input
            type="email"
            placeholder="Seu melhor e-mail"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="flex-1"
          />
          <Button type="submit" disabled={loading} className="shrink-0">
            {loading ? "..." : "Quero!"}
          </Button>
        </form>

        <button
          onClick={close}
          className="mt-4 text-xs text-muted-foreground hover:text-foreground underline"
        >
          Não, obrigado
        </button>
      </div>
    </div>
  );
}
