import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

const PAID_PARAMS = [
  "fbclid",
  "gclid",
  "wbraid",
  "gbraid",
  "ttclid",
  "ref_id",
  "utm_source",
  "utm_campaign",
  "utm_medium",
  "src",
  "cck",
  "tck",
  "gck",
];

const STORAGE_KEY = "cloaker_bypass";
const BYPASS_PARAM = "real";

function hasPaidTraffic(): boolean {
  if (typeof window === "undefined") return false;
  try {
    if (sessionStorage.getItem(STORAGE_KEY) === "1") return true;
    const search = new URLSearchParams(window.location.search);
    if (search.get(BYPASS_PARAM)) {
      sessionStorage.setItem(STORAGE_KEY, "1");
      return true;
    }
    for (const k of PAID_PARAMS) {
      if (search.get(k)) {
        sessionStorage.setItem(STORAGE_KEY, "1");
        return true;
      }
    }
    // Check stored campaign params from earlier in the session
    const stored = sessionStorage.getItem("campaign_params");
    if (stored) {
      const parsed = JSON.parse(stored);
      if (parsed && Object.keys(parsed).length > 0) {
        sessionStorage.setItem(STORAGE_KEY, "1");
        return true;
      }
    }
    // Check referrer from major paid networks
    const ref = document.referrer || "";
    if (/facebook\.com|instagram\.com|tiktok\.com|fb\.me|l\.facebook|googleadservices/i.test(ref)) {
      sessionStorage.setItem(STORAGE_KEY, "1");
      return true;
    }
  } catch {
    // ignore
  }
  return false;
}

export type CloakerState = "loading" | "real" | "safe";

export function useCloaker(): CloakerState {
  const [state, setState] = useState<CloakerState>("loading");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const paid = hasPaidTraffic();
        if (paid) {
          if (!cancelled) setState("real");
          return;
        }
        const { data } = await supabase
          .from("cloaker_config")
          .select("enabled")
          .limit(1)
          .maybeSingle();
        if (cancelled) return;
        if (data?.enabled) setState("safe");
        else setState("real");
      } catch {
        if (!cancelled) setState("real");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return state;
}
