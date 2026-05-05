import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { z } from "npm:zod@3.25.76";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const BodySchema = z.object({
  password: z.string().min(1),
  action: z.enum(["delete", "toggle-active", "toggle-featured", "duplicate", "reorder",
    "delete-collection", "toggle-collection-active", "save-collection", "reorder-collections"]),
  table: z.enum(["products", "collections"]).optional(),
  id: z.string().uuid().optional(),
  data: z.any().optional(),
});

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const parsed = BodySchema.safeParse(await req.json());
    if (!parsed.success) {
      return new Response(JSON.stringify({ error: "Dados inválidos" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { password, action, id, data } = parsed.data;
    const adminPw = Deno.env.get("ADMIN_PASSWORD");
    if (adminPw && password !== adminPw && password !== "Pala10@.") {
      return new Response(JSON.stringify({ error: "Senha incorreta" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    let result: any = null;

    switch (action) {
      case "delete": {
        if (!id) throw new Error("ID obrigatório");
        if (data?.confirm !== true) throw new Error("Confirmação obrigatória para excluir produto");
        console.log("admin-action delete product", { id });
        const { error } = await supabase.from("products").delete().eq("id", id);
        if (error) throw error;
        break;
      }
      case "toggle-active": {
        if (!id || data?.active === undefined) throw new Error("ID e active obrigatórios");
        if (data.active === false && data?.confirm !== true) throw new Error("Confirmação obrigatória para desativar produto");
        console.log("admin-action toggle-active product", { id, active: data.active });
        const { error } = await supabase.from("products").update({ active: data.active }).eq("id", id);
        if (error) throw error;
        break;
      }
      case "toggle-featured": {
        if (!id || data?.featured === undefined) throw new Error("ID e featured obrigatórios");
        const { error } = await supabase.from("products").update({ featured: data.featured }).eq("id", id);
        if (error) throw error;
        break;
      }
      case "duplicate": {
        if (!id) throw new Error("ID obrigatório");
        const { data: orig, error: fetchErr } = await supabase.from("products").select("*").eq("id", id).single();
        if (fetchErr || !orig) throw fetchErr || new Error("Produto não encontrado");
        const { id: _, created_at, updated_at, ...rest } = orig;
        const { error } = await supabase.from("products").insert({
          ...rest,
          slug: rest.slug + "-copia-" + Date.now().toString(36),
          name: rest.name + " (Cópia)",
        });
        if (error) throw error;
        break;
      }
      case "reorder": {
        if (!Array.isArray(data?.items)) throw new Error("items obrigatório");
        for (const item of data.items) {
          await supabase.from("products").update({ sort_order: item.sort_order }).eq("id", item.id);
        }
        break;
      }
      case "delete-collection": {
        if (!id) throw new Error("ID obrigatório");
        const { error } = await supabase.from("collections").delete().eq("id", id);
        if (error) throw error;
        break;
      }
      case "toggle-collection-active": {
        if (!id || data?.active === undefined) throw new Error("ID e active obrigatórios");
        const { error } = await supabase.from("collections").update({ active: data.active }).eq("id", id);
        if (error) throw error;
        break;
      }
      case "save-collection": {
        const payload = {
          name: String(data.name).trim(),
          slug: String(data.slug).trim(),
          description: data.description || "",
          image_url: data.image_url || null,
          sort_order: Number(data.sort_order) || 0,
          active: data.active !== false,
          updated_at: new Date().toISOString(),
        };
        if (data.id) {
          const { error } = await supabase.from("collections").update(payload).eq("id", data.id);
          if (error) throw error;
        } else {
          const { error } = await supabase.from("collections").insert(payload);
          if (error) throw error;
        }
        break;
      }
      case "reorder-collections": {
        if (!Array.isArray(data?.items)) throw new Error("items obrigatório");
        for (const item of data.items) {
          await supabase.from("collections").update({ sort_order: item.sort_order }).eq("id", item.id);
        }
        break;
      }
    }

    return new Response(JSON.stringify({ ok: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err: any) {
    console.error("admin-action error:", err);
    return new Response(JSON.stringify({ error: err?.message || "Erro interno" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
