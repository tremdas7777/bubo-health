import { useState } from "react";
import { Lock, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface Props {
  onLogin: () => void;
}

export default function AdminLogin({ onLogin }: Props) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [mode, setMode] = useState<"login" | "signup">("login");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (mode === "signup") {
      const { error: signUpError } = await supabase.auth.signUp({ email, password });
      if (signUpError) {
        setError(signUpError.message);
      } else {
        setError("Cadastro realizado! Verifique seu e-mail para confirmar.");
      }
      setLoading(false);
      return;
    }

    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
    if (signInError) {
      setError("E-mail ou senha inválidos.");
    } else {
      onLogin();
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-secondary px-4">
      <div className="w-full max-w-sm">
        <div className="bg-background rounded-2xl border border-border p-8 shadow-lg">
          <div className="flex justify-center mb-6">
            <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center">
              <Lock className="h-7 w-7 text-primary" />
            </div>
          </div>
          <h1 className="text-xl font-heading font-bold text-center mb-1">Painel Admin</h1>
          <p className="text-xs text-muted-foreground text-center mb-6">
            {mode === "login" ? "Faça login para acessar o painel" : "Crie sua conta de administrador"}
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-muted-foreground mb-1 block">E-mail</label>
              <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="admin@kazoom.com" required />
            </div>
            <div>
              <label className="text-xs font-semibold text-muted-foreground mb-1 block">Senha</label>
              <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required minLength={6} />
            </div>

            {error && (
              <p className={`text-xs text-center font-medium ${error.includes("Cadastro") ? "text-emerald-600" : "text-destructive"}`}>
                {error}
              </p>
            )}

            <Button type="submit" disabled={loading} className="w-full font-bold">
              {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              {mode === "login" ? "Entrar" : "Cadastrar"}
            </Button>
          </form>

          <button
            type="button"
            onClick={() => { setMode(mode === "login" ? "signup" : "login"); setError(""); }}
            className="mt-4 w-full text-center text-xs text-primary hover:underline"
          >
            {mode === "login" ? "Criar conta de administrador" : "Já tenho conta, fazer login"}
          </button>
        </div>
      </div>
    </div>
  );
}
