import { useState } from "react";
import { Lock, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";

interface Props {
  onLogin: (password: string) => void;
}

export default function AdminLogin({ onLogin }: Props) {
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const { data, error: fnError } = await supabase.functions.invoke("verify-admin-password", {
        body: { password },
      });

      if (fnError) {
        setError("Erro ao verificar senha.");
        setLoading(false);
        return;
      }

      if (data?.valid) {
        onLogin(password);
      } else {
        setError("Senha inválida.");
      }
    } catch {
      setError("Erro de conexão.");
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
            Digite a senha para acessar o painel
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-muted-foreground mb-1 block">Senha</label>
              <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required />
            </div>

            {error && (
              <p className="text-xs text-center font-medium text-destructive">{error}</p>
            )}

            <Button type="submit" disabled={loading} className="w-full font-bold">
              {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Entrar
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
