import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface StoreConfig {
  whatsapp_number: string;
  card_enabled: boolean;
}

const DEFAULT_CONFIG: StoreConfig = { whatsapp_number: "", card_enabled: true };

export function useStoreConfig() {
  const [config, setConfig] = useState<StoreConfig>(DEFAULT_CONFIG);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from("store_config")
      .select("*")
      .limit(1)
      .maybeSingle()
      .then(({ data }) => {
        if (data) setConfig({
          whatsapp_number: data.whatsapp_number ?? "",
          card_enabled: (data as any).card_enabled ?? true,
        });
        setLoading(false);
      });
  }, []);

  return { config, loading };
}
