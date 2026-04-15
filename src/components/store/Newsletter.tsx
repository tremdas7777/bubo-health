import { memo, useState } from "react";
import { Mail, Send } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export default memo(function Newsletter() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes("@")) {
      toast.error("Informe um e-mail válido");
      return;
    }
    setLoading(true);
    try {
      // Track as a funnel event
      await supabase.from("funnel_events").insert({
        event: "newsletter_signup",
        session_id: email,
      });
      toast.success("Cadastrado com sucesso! 🎉");
      setEmail("");
    } catch {
      toast.error("Erro ao cadastrar. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="py-10 bg-primary/5 border-t border-border/50">
      <div className="container mx-auto px-4 max-w-[600px] text-center">
        <div className="flex items-center justify-center gap-2 mb-3">
          <Mail size={22} className="text-primary" />
          <h2 className="text-lg md:text-xl font-heading font-semibold">
            Receba ofertas exclusivas
          </h2>
        </div>
        <p className="text-sm text-muted-foreground mb-5">
          Cadastre seu e-mail e ganhe <strong className="text-primary">10% OFF</strong> na primeira compra!
        </p>
        <form onSubmit={handleSubmit} className="flex gap-2 max-w-[420px] mx-auto">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Seu melhor e-mail"
            className="flex-1 px-4 py-2.5 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
            required
          />
          <button
            type="submit"
            disabled={loading}
            className="bg-primary hover:bg-primary/90 text-primary-foreground px-5 py-2.5 rounded-lg font-medium text-sm flex items-center gap-2 transition-colors disabled:opacity-50"
          >
            <Send size={16} />
            {loading ? "..." : "Cadastrar"}
          </button>
        </form>
      </div>
    </section>
  );
});
