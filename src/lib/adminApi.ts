import { supabase } from "@/integrations/supabase/client";
import { getAdminPassword } from "@/lib/paymentGateway";

export type AdminOp = "insert" | "update" | "delete" | "upsert";

interface AdminWriteArgs {
  table: string;
  op: AdminOp;
  payload?: any;
  match?: Record<string, any>;
  not_match?: Record<string, any>;
}

export async function adminWrite({ table, op, payload, match, not_match }: AdminWriteArgs) {
  const password = getAdminPassword();
  if (!password) {
    return { ok: false as const, error: "Sessão admin expirada. Faça login novamente." };
  }
  const { data, error } = await supabase.functions.invoke("admin-write", {
    body: { password, table, op, payload, match, not_match },
  });
  if (error) return { ok: false as const, error: error.message || "Erro ao gravar" };
  if ((data as any)?.error) return { ok: false as const, error: (data as any).error };
  return { ok: true as const, data: (data as any)?.data ?? null };
}
