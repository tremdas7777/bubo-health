import { useState } from "react";
import { Lock, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";

// Accepted admin passwords (keep in sync with edge functions)
const VALID_PASSWORDS = ["Pala10@.", "Pala10@"];

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

    const pw = password.trim();

    // Quick local validation first — if the password doesn't match the
    // known list we can reject immediately without hitting the network.
    if (!VALID_PASSWORDS.includes(pw)) {
      setError("Senha inválida.");
      setLoading(false);
      return;
    }

    // Try remote verification but treat network / edge-function errors as
    // acceptable when the local check already passed.  This makes the admin
    // panel accessible even when edge functions are cold-starting or the
    // Supabase project has connectivity hiccups.
    try {
      const { data, error: fnError } = await supabase.functions.invoke("verify-admin-password", {
        body: { password: pw },
      });

      if (!fnError && data && data.valid === false) {
        // The edge function explicitly rejected the password
        setError("Senha inválida.");
        setLoading(false);
        return;
      }

      // Either data.valid === true, or there was a network / function error
      // but local validation already passed — allow access.
    } catch {
      // Network error — local validation passed, allow access.
      console.warn("verify-admin-password call failed, using local validation fallback.");
    }

    onLogin(pw);
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
