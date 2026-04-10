import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Layout from "@/components/store/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Lock, ArrowRight, CheckCircle2 } from "lucide-react";

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [isRecovery, setIsRecovery] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // Check for recovery token in URL hash
    const hash = window.location.hash;
    if (hash.includes("type=recovery")) {
      setIsRecovery(true);
    }

    // Listen for PASSWORD_RECOVERY event
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") {
        setIsRecovery(true);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast({ title: "Erro", description: "As senhas não coincidem", variant: "destructive" });
      return;
    }
    if (password.length < 6) {
      toast({ title: "Erro", description: "A senha deve ter pelo menos 6 caracteres", variant: "destructive" });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      setSuccess(true);
      toast({ title: "Senha atualizada com sucesso!" });
      setTimeout(() => navigate("/conta"), 2000);
    } catch (err: any) {
      toast({ title: "Erro", description: err.message || "Erro ao atualizar senha", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  if (!isRecovery) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-12 text-center">
          <p className="text-muted-foreground">Link de recuperação inválido ou expirado.</p>
          <Button className="mt-4" onClick={() => navigate("/entrar")}>Voltar ao login</Button>
        </div>
      </Layout>
    );
  }

  if (success) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-12">
          <div className="mx-auto max-w-md text-center">
            <CheckCircle2 size={48} className="mx-auto mb-4 text-emerald-500" />
            <h1 className="text-2xl font-heading font-bold mb-2">Senha atualizada!</h1>
            <p className="text-muted-foreground">Redirecionando para sua conta...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-12">
        <div className="mx-auto max-w-md">
          <div className="rounded-2xl border border-border bg-card p-8 shadow-sm">
            <h1 className="mb-2 text-center text-2xl font-heading font-bold">Nova senha</h1>
            <p className="mb-6 text-center text-sm text-muted-foreground">
              Digite sua nova senha abaixo
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="relative">
                <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="password"
                  placeholder="Nova senha"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10"
                  required
                  minLength={6}
                />
              </div>
              <div className="relative">
                <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="password"
                  placeholder="Confirmar nova senha"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="pl-10"
                  required
                  minLength={6}
                />
              </div>
              <Button type="submit" className="w-full py-6 font-semibold" disabled={loading}>
                {loading ? <span className="animate-spin mr-2">⏳</span> : <ArrowRight size={18} className="mr-2" />}
                Atualizar senha
              </Button>
            </form>
          </div>
        </div>
      </div>
    </Layout>
  );
}
