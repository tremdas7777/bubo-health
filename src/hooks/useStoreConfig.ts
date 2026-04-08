import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface StoreConfig {
  whatsapp_number: string;
}

const DEFAULT_CONFIG: StoreConfig = { whatsapp_number: "" };

export function useStoreConfig() {
  const [config, setConfig] = useState<StoreConfig>(DEFAULT_CONFIG);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from("store_config")
      .select("whatsapp_number")
      .limit(1)
      .maybeSingle()
      .then(({ data }) => {
        if (data) setConfig({ whatsapp_number: data.whatsapp_number ?? "" });
        setLoading(false);
      });
  }, []);

  return { config, loading };
}
