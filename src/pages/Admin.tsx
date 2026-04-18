import { useEffect, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import AdminLogin from "@/pages/AdminLogin";
import AdminCupons from "@/components/AdminCupons";
import {
  ArrowDown,
  BarChart3,
  Bell,
  CheckCircle,
  Code,
  Copy,
  CreditCard,
  DollarSign,
  Eye,
  Loader2,
  Package,
  Plus,
  QrCode,
  RefreshCw,
  Save,
  Settings,
  Shield,
  ShoppingCart,
  Tag,
  Trash2,
  TrendingUp,
  Truck,
  Users,
  Zap,
} from "lucide-react";
import AdminProdutos from "@/components/AdminProdutos";
import AdminPedidos from "@/components/AdminPedidos";
import AdminAbandonedCarts from "@/components/AdminAbandonedCarts";

import AdminFrete from "@/components/AdminFrete";
import AdminDashboard from "@/components/AdminDashboard";
import AdminFinanceiro from "@/components/AdminFinanceiro";
import AdminLeads from "@/components/AdminLeads";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { getFunnelStats, clearFunnelEvents } from "@/lib/funnelTracking";
import {
  getPixelConfig,
  savePixelConfig,
  loadPixelConfigFromDb,
  type PixelConfig,
} from "@/lib/pixelManager";
import {
  getWebhookConfig,
  saveWebhookConfig,
  fireWebhookEvent,
  syncWebhooksToDb,
  loadWebhooksFromDb,
  type WebhookConfig,
  type WebhookEntry,
} from "@/lib/webhookManager";
import { getUtmifyConfig, saveUtmifyConfig, testUtmifyToken, type UtmifyConfig } from "@/lib/utmifyManager";
import { fetchFullGatewayConfig, savePaymentGatewayConfig, setAdminPassword, getAdminPassword, type PaymentGatewayConfig } from "@/lib/paymentGateway";
import { supabase } from "@/integrations/supabase/client";

type Tab =
  | "dashboard"
  | "analytics"
  | "produtos"
  | "financeiro"
  | "leads"
  | "pixels"
  | "webhooks"
  | "utmify"
  | "pagamentos"
  | "pedidos"
  | "abandonados"
  | "cloaker"
  | "frete"
  | "cupons"
  | "config";

interface FunnelStats {
  visitors: number;
  productViews: number;
  addToCart: number;
  checkout: number;
  purchase: number;
  activeNow: number;
}

interface AdminOrder {
  id: string;
  buyer_name: string | null;
  buyer_email: string | null;
  buyer_phone: string | null;
  amount_cents: number;
  status: string;
  qr_code_copied: boolean | null;
  gateway: string | null;
  created_at: string;
  updated_at: string;
  tracking_code: string | null;
}

const INITIAL_STATS: FunnelStats = {
  visitors: 0,
  productViews: 0,
  addToCart: 0,
  checkout: 0,
  purchase: 0,
  activeNow: 0,
};

const INITIAL_PIXEL_CONFIG: PixelConfig = {
  facebookPixels: [],
  tiktokPixels: [],
  googleAdsPixels: [],
  utmifyMetaPixels: [],
  utmifyGooglePixels: [],
  utmifyHtml: "",
  onlyPaid: false,
  ga4MeasurementId: "",
  ga4ApiSecret: "",
};

const INITIAL_GATEWAY_CONFIG: PaymentGatewayConfig = {
  activeGateway: "centurionpay",
  paymentMethods: {},
  pagouai: { publicKey: "", secretKey: "", enabled: false },
  vennox: { secretKey: "", companyId: "", enabled: false },
  centurionpay: { secretKey: "", companyId: "", enabled: false },
  ironpay: { apiToken: "", enabled: false },
  simpayout: { clientId: "", clientSecret: "", enabled: false },
  beehive: { publicKey: "", secretKey: "", enabled: false },
  pagamentosmp: { publicKey: "", secretKey: "", enabled: false },
};

const SUCCESS_HINTS = ["sucesso", "enviado", "ativado", "ok", "válido", "salva", "aprovado", "funcionando"];

const GATEWAY_LABELS: Record<PaymentGatewayConfig["activeGateway"], string> = {
  pagouai: "Pagou.ai",
  vennox: "Vennox",
  centurionpay: "Centurion Pay",
  ironpay: "Iron Pay",
  simpayout: "Sim Payout",
  beehive: "Beehive",
  pagamentosmp: "MP Pagamentos",
};

const GATEWAY_TEST_FUNCTIONS: Partial<Record<PaymentGatewayConfig["activeGateway"], string>> = {
  centurionpay: "criar-pix-centurionpay",
  beehive: "criar-pix-beehive",
  pagamentosmp: "criar-pix-pagamentosmp",
};

async function extractFunctionErrorMessage(error: unknown) {
  if (error && typeof error === "object" && "context" in error) {
    const response = (error as { context?: Response }).context;

    if (response instanceof Response) {
      try {
        const payload = await response.clone().json() as { error?: string; details?: { refusedReason?: { description?: string } } };
        return payload.error || payload.details?.refusedReason?.description || "Erro ao processar gateway";
      } catch {
        try {
          const text = await response.clone().text();
          if (text) return text;
        } catch {
          // ignore
        }
      }
    }
  }

  return error instanceof Error ? error.message : "Erro desconhecido";
}

const pct = (a: number, b: number) => (b === 0 ? 0 : Math.round((a / b) * 100));

function StatusMessage({ msg }: { msg: string }) {
  if (!msg) return null;

  const isSuccess = SUCCESS_HINTS.some((hint) => msg.toLowerCase().includes(hint));

  return (
    <div
      className={`mt-3 rounded-md p-2.5 text-center text-xs font-bold ${
        isSuccess ? "bg-emerald-500/10 text-emerald-500" : "bg-destructive/10 text-destructive"
      }`}
    >
      {msg}
    </div>
  );
}

function GatewayCard({
  title,
  isActive,
  fields,
  onSave,
  onTest,
  testing,
  gatewayKey,
  paymentMethods,
  onPaymentMethodChange,
}: {
  title: string;
  isActive: boolean;
  fields: { label: string; value: string; onChange: (value: string) => void; placeholder: string; secret?: boolean }[];
  onSave: () => void;
  onTest: () => void;
  testing: boolean;
  gatewayKey: string;
  paymentMethods: string;
  onPaymentMethodChange: (gw: string, method: string) => void;
}) {
  const PM_OPTIONS = [
    { value: "pix", label: "Somente PIX" },
    { value: "card", label: "Somente Cartão" },
    { value: "pix_card", label: "PIX + Cartão" },
  ];
  return (
    <Card className="mb-4 border border-border p-5">
      <div className="mb-3 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
          <CreditCard size={20} className="text-primary" />
        </div>
        <div className="flex-1">
          <h3 className="text-sm font-black text-foreground">{title}</h3>
          <p className="text-[11px] text-muted-foreground">Gateway de Pagamento</p>
        </div>
        {isActive && <Badge className="border-emerald-500/30 bg-emerald-500/10 text-[10px] text-emerald-500">Ativo</Badge>}
      </div>

      {/* Payment method selector */}
      <div className="mb-4">
        <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1 block">Métodos aceitos</label>
        <div className="flex gap-2">
          {PM_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => onPaymentMethodChange(gatewayKey, opt.value)}
              className={`flex-1 rounded-lg border-2 px-2 py-2 text-[11px] font-bold transition-all ${
                paymentMethods === opt.value
                  ? "border-emerald-500 bg-emerald-500/5 text-emerald-500"
                  : "border-border text-muted-foreground hover:border-muted-foreground/30"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        {fields.map((field) => (
          <div key={field.label}>
            <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{field.label}</label>
            <Input
              type={field.secret ? "password" : "text"}
              value={field.value}
              onChange={(event) => field.onChange(event.target.value)}
              placeholder={field.placeholder}
              className="mt-1 font-mono text-xs"
            />
          </div>
        ))}

        <Button onClick={onSave} className="w-full bg-emerald-500 text-xs font-bold text-white hover:bg-emerald-500/90">
          <Save size={14} className="mr-1.5" /> Salvar {title}
        </Button>
        <Button
          variant="outline"
          disabled={testing}
          onClick={onTest}
          className="w-full border-emerald-500/30 text-xs font-bold text-emerald-500 hover:bg-emerald-500/10"
        >
          {testing ? <Loader2 size={14} className="mr-1.5 animate-spin" /> : <Zap size={14} className="mr-1.5" />}
          Testar {title} (R$ 44,90)
        </Button>
      </div>
    </Card>
  );
}

export default function Admin() {
  const [authed, setAuthed] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>("dashboard");
  const [period, setPeriod] = useState(30);
  const [stats, setStats] = useState<FunnelStats>(INITIAL_STATS);

  const [pixelConfig, setPixelConfig] = useState<PixelConfig>(() => getPixelConfig() || INITIAL_PIXEL_CONFIG);
  const [pixelMessage, setPixelMessage] = useState("");

  const [webhookConfig, setWebhookConfig] = useState<WebhookConfig>(() => getWebhookConfig());
  const [webhookMessage, setWebhookMessage] = useState("");

  const [utmifyConfig, setUtmifyConfig] = useState<UtmifyConfig>(() => getUtmifyConfig());
  const [utmifyMessage, setUtmifyMessage] = useState("");
  const [utmifyMessage2, setUtmifyMessage2] = useState("");
  const [utmifyTesting, setUtmifyTesting] = useState(false);
  const [utmifyTesting2, setUtmifyTesting2] = useState(false);

  const [gatewayConfig, setGatewayConfig] = useState<PaymentGatewayConfig>(INITIAL_GATEWAY_CONFIG);
  const [gatewayMessage, setGatewayMessage] = useState("");
  const [gatewayTesting, setGatewayTesting] = useState(false);

  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [ordersMessage, setOrdersMessage] = useState("");

  const [cloakerEnabled, setCloakerEnabled] = useState(true);
  const [cloakerLoading, setCloakerLoading] = useState(false);
  const [cloakerMessage, setCloakerMessage] = useState("");

  const [whatsappNumber, setWhatsappNumber] = useState("");
  const [cardEnabled, setCardEnabled] = useState(true);
  const [configMessage, setConfigMessage] = useState("");

  const flashMessage = (setter: (value: string) => void, value: string, duration = 3000) => {
    setter(value);
    window.setTimeout(() => setter(""), duration);
  };

  const fetchOrders = async () => {
    setOrdersLoading(true);
    const { data } = await supabase.from("orders").select("*").order("created_at", { ascending: false }).limit(50);
    setOrders((data as AdminOrder[]) || []);
    setOrdersLoading(false);
  };

  useEffect(() => {
    if (!authed) return;
    const loadInitialState = async () => {
      const [dbPixelConfig, dbWebhookConfig, dbGatewayConfig] = await Promise.all([
        loadPixelConfigFromDb().catch(() => getPixelConfig()),
        loadWebhooksFromDb().catch(() => getWebhookConfig()),
        fetchFullGatewayConfig(getAdminPassword() || '').catch(() => INITIAL_GATEWAY_CONFIG),
      ]);

      setPixelConfig(dbPixelConfig || INITIAL_PIXEL_CONFIG);
      setWebhookConfig(dbWebhookConfig || getWebhookConfig());
      saveWebhookConfig(dbWebhookConfig || getWebhookConfig());
      setGatewayConfig(dbGatewayConfig || INITIAL_GATEWAY_CONFIG);
      setUtmifyConfig(getUtmifyConfig());

      const { data: cloakerData } = await supabase.from("cloaker_config").select("enabled").limit(1).maybeSingle();
      if (cloakerData) setCloakerEnabled(cloakerData.enabled);

      const { data: storeData } = await supabase.from("store_config").select("*").limit(1).maybeSingle();
      if (storeData) {
        setWhatsappNumber(storeData.whatsapp_number ?? "");
        setCardEnabled((storeData as any).card_enabled ?? true);
      }
    };

    void loadInitialState();
  }, [authed]);

  useEffect(() => {
    if (!authed || activeTab !== "analytics") return;

    let cancelled = false;

    const refresh = async () => {
      const nextStats = await getFunnelStats(period);
      if (!cancelled) {
        setStats(nextStats);
      }
    };

    void refresh();
    const interval = window.setInterval(refresh, 30000);

    return () => {
      cancelled = true;
      window.clearInterval(interval);
    };
  }, [authed, activeTab, period]);

  useEffect(() => {
    if (authed && activeTab === "pedidos") {
      void fetchOrders();
    }
  }, [authed, activeTab]);

  if (!authed) return <AdminLogin onLogin={(pwd) => { setAdminPassword(pwd); setAuthed(true); }} />;

  const handleClearStats = async () => {
    await clearFunnelEvents();
    const nextStats = await getFunnelStats(period);
    setStats(nextStats);
  };

  const handleSavePixels = async () => {
    await savePixelConfig(pixelConfig);
    flashMessage(setPixelMessage, "Pixels salvos e ativados com sucesso!");
  };

  const handleSaveWebhook = async () => {
    saveWebhookConfig(webhookConfig);
    await syncWebhooksToDb(webhookConfig);
    flashMessage(setWebhookMessage, "Webhooks salvos com sucesso!");
  };

  const handleTestWebhook = async (eventType: "venda_pendente" | "venda_aprovada") => {
    let hasWebhooks = webhookConfig.webhooks.length > 0;

    if (!hasWebhooks) {
      const dbConfig = await loadWebhooksFromDb();
      hasWebhooks = dbConfig.webhooks.length > 0;
      if (hasWebhooks) setWebhookConfig(dbConfig);
    }

    if (!hasWebhooks) {
      flashMessage(setWebhookMessage, "Adicione pelo menos um webhook primeiro!");
      return;
    }

    try {
      await fireWebhookEvent(eventType, { source: "loja-ecommerce", test: true });
      flashMessage(
        setWebhookMessage,
        `Teste de ${eventType === "venda_pendente" ? "venda pendente" : "venda aprovada"} enviado!`,
      );
    } catch {
      flashMessage(setWebhookMessage, "Erro ao enviar teste de webhook");
    }
  };

  const handleSaveUtmify = () => {
    saveUtmifyConfig(utmifyConfig);
    flashMessage(setUtmifyMessage, "Token Utmify salvo com sucesso!");
  };

  const handleTestUtmify = async (slot: 1 | 2) => {
    const token = slot === 1 ? utmifyConfig.apiToken : utmifyConfig.apiToken2;
    const setTesting = slot === 1 ? setUtmifyTesting : setUtmifyTesting2;
    const setMessage = slot === 1 ? setUtmifyMessage : setUtmifyMessage2;

    setTesting(true);
    setMessage("");
    const result = await testUtmifyToken(token);
    setMessage(result.message);
    setTesting(false);
    window.setTimeout(() => setMessage(""), 5000);
  };

  const handlePaymentMethodChange = async (gw: string, method: string) => {
    const updated: PaymentGatewayConfig = { ...gatewayConfig, paymentMethods: { ...gatewayConfig.paymentMethods, [gw]: method as any } };
    setGatewayConfig(updated);
    const result = await savePaymentGatewayConfig(updated);
    flashMessage(setGatewayMessage, result.ok ? `Métodos de ${gw} atualizados!` : result.error || "Erro ao salvar gateway", 5000);
  };

  const persistGateway = async (message: string) => {
    const result = await savePaymentGatewayConfig(gatewayConfig);
    flashMessage(setGatewayMessage, result.ok ? message : result.error || "Erro ao salvar gateway", 5000);
  };

  const testGateway = async (gateway: PaymentGatewayConfig["activeGateway"]) => {
    const functionName = GATEWAY_TEST_FUNCTIONS[gateway];

    if (!functionName) {
      flashMessage(setGatewayMessage, `Teste automático ainda não está disponível para ${GATEWAY_LABELS[gateway]}.`, 5000);
      return;
    }

    setGatewayTesting(true);
    setGatewayMessage(`⏳ Testando ${GATEWAY_LABELS[gateway]}...`);

    try {
      const bodyMap = {
        centurionpay: { secretKey: gatewayConfig.centurionpay.secretKey, companyId: gatewayConfig.centurionpay.companyId },
        beehive: {},
        pagamentosmp: {
          publicKey: gatewayConfig.pagamentosmp.publicKey,
          secretKey: gatewayConfig.pagamentosmp.secretKey,
        },
      } as const;

      const { data, error } = await supabase.functions.invoke(functionName, {
        body: {
          ...bodyMap[gateway as keyof typeof bodyMap],
          amount: 44.9,
          buyerName: "Teste Admin",
          buyerEmail: "teste-admin@teste.com",
          buyerDocument: "02692495322",
          buyerPhone: "11999999999",
          metadata: {
            address: "Rua Teste",
            addressNumber: "1",
            neighborhood: "Centro",
            city: "São Paulo",
            state: "SP",
            cep: "01001000",
            shippingMethod: "sedex",
            shippingCostCents: 4490,
            itemsDescription: "Teste Admin",
          },
        },
      });

      if (error) {
        throw new Error(await extractFunctionErrorMessage(error));
      }

      const payload = data as { pix_code?: string; order_id?: string; error?: string } | null;

      if (payload?.error) {
        throw new Error(payload.error);
      }

      if (payload?.pix_code) {
        flashMessage(
          setGatewayMessage,
          `✅ ${GATEWAY_LABELS[gateway]} OK! PIX gerado (pedido ${payload.order_id || "criado"})`,
          6000,
        );
      } else {
        flashMessage(setGatewayMessage, `⚠️ ${GATEWAY_LABELS[gateway]} respondeu sem código PIX.`, 6000);
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Erro desconhecido";
      flashMessage(setGatewayMessage, `❌ Erro no teste ${GATEWAY_LABELS[gateway]}: ${message}`, 6000);
    } finally {
      setGatewayTesting(false);
    }
  };

  const handleApproveOrder = async (order: AdminOrder) => {
    const { error } = await supabase
      .from("orders")
      .update({ status: "paid", updated_at: new Date().toISOString() })
      .eq("id", order.id);

    if (error) {
      flashMessage(setOrdersMessage, "Erro ao aprovar o pedido", 4000);
      return;
    }

    await fireWebhookEvent("venda_aprovada", {
      source: "loja-ecommerce",
      buyerName: order.buyer_name,
      buyerEmail: order.buyer_email,
      buyerPhone: order.buyer_phone,
      amount: order.amount_cents / 100,
      orderId: order.id,
      gateway: order.gateway,
    });

    // Send WhatsApp notification to buyer
    if (order.buyer_phone) {
      const phone = order.buyer_phone.replace(/\D/g, "");
      const fullPhone = phone.startsWith("55") ? phone : `55${phone}`;
      const msg = encodeURIComponent(
        `✅ Olá ${order.buyer_name || ""}! Seu pedido #${order.id.slice(0, 8).toUpperCase()} foi aprovado! Valor: R$ ${(order.amount_cents / 100).toFixed(2).replace(".", ",")}. Obrigado pela compra! 🎉`
      );
      window.open(`https://wa.me/${fullPhone}?text=${msg}`, "_blank");
    }

    flashMessage(setOrdersMessage, "Pedido aprovado com sucesso!", 4000);
    await fetchOrders();
  };

  const handleSendTrackingWhatsApp = (order: AdminOrder) => {
    if (!order.buyer_phone || !order.tracking_code) return;
    const phone = order.buyer_phone.replace(/\D/g, "");
    const fullPhone = phone.startsWith("55") ? phone : `55${phone}`;
    const msg = encodeURIComponent(
      `📦 Olá ${order.buyer_name || ""}! Seu pedido #${order.id.slice(0, 8).toUpperCase()} foi enviado! Código de rastreio: ${order.tracking_code}. Acompanhe em: https://rastreamento.correios.com.br/app/index.php?objeto=${order.tracking_code}`
    );
    window.open(`https://wa.me/${fullPhone}?text=${msg}`, "_blank");
  };

  const handleClearOrders = async () => {
    if (!window.confirm("Tem certeza que deseja limpar TODOS os pedidos?")) return;

    await supabase.from("orders").delete().neq("id", "00000000-0000-0000-0000-000000000000");
    await fetchOrders();
    flashMessage(setOrdersMessage, "Pedidos removidos com sucesso!", 4000);
  };

  const handleToggleCloaker = async (checked: boolean) => {
    setCloakerLoading(true);
    setCloakerMessage("");

    const { data: existing } = await supabase.from("cloaker_config").select("id").limit(1).maybeSingle();

    const response = existing?.id
      ? await supabase
          .from("cloaker_config")
          .update({ enabled: checked, updated_at: new Date().toISOString() })
          .eq("id", existing.id)
      : await supabase.from("cloaker_config").insert({ enabled: checked });

    if (response.error) {
      flashMessage(setCloakerMessage, "Erro ao salvar configuração", 4000);
    } else {
      setCloakerEnabled(checked);
      flashMessage(setCloakerMessage, checked ? "Cloaker ativado com sucesso!" : "Cloaker desativado com sucesso!", 4000);
    }

    setCloakerLoading(false);
  };

  const addWebhook = () => {
    setWebhookConfig((current) => ({
      ...current,
      webhooks: [...current.webhooks, { id: crypto.randomUUID(), url: "", events: ["venda_pendente", "venda_aprovada"] }],
    }));
  };

  const removeWebhook = (id: string) => {
    setWebhookConfig((current) => ({
      ...current,
      webhooks: current.webhooks.filter((webhook) => webhook.id !== id),
    }));
  };

  const updateWebhook = (id: string, updates: Partial<WebhookEntry>) => {
    setWebhookConfig((current) => ({
      ...current,
      webhooks: current.webhooks.map((webhook) => (webhook.id === id ? { ...webhook, ...updates } : webhook)),
    }));
  };

  const toggleWebhookEvent = (id: string, event: "venda_pendente" | "venda_aprovada") => {
    setWebhookConfig((current) => ({
      ...current,
      webhooks: current.webhooks.map((webhook) => {
        if (webhook.id !== id) return webhook;

        const events = webhook.events.includes(event)
          ? webhook.events.filter((item) => item !== event)
          : [...webhook.events, event];

        return { ...webhook, events: events.length > 0 ? events : [event] };
      }),
    }));
  };

  const globalConversion = pct(stats.purchase, stats.visitors);

  const funnelSteps = [
    {
      icon: <Eye size={20} className="text-primary" />,
      title: "Visitantes",
      description: "Chegaram à loja",
      count: stats.visitors,
      conversion: null as number | null,
      dropoff: `${pct(stats.productViews, stats.visitors)}% viram produtos`,
      progressValue: 100,
    },
    {
      icon: <TrendingUp size={20} className="text-emerald-500" />,
      title: "Visualizações",
      description: "Viram página de produto",
      count: stats.productViews,
      conversion: pct(stats.productViews, stats.visitors),
      dropoff: `${pct(stats.addToCart, stats.productViews)}% adicionaram ao carrinho`,
      progressValue: stats.visitors > 0 ? (stats.productViews / stats.visitors) * 100 : 0,
    },
    {
      icon: <ShoppingCart size={20} className="text-amber-500" />,
      title: "Carrinho",
      description: "Adicionaram produto ao carrinho",
      count: stats.addToCart,
      conversion: pct(stats.addToCart, stats.visitors),
      dropoff: `${pct(stats.checkout, stats.addToCart)}% foram ao checkout`,
      progressValue: stats.visitors > 0 ? (stats.addToCart / stats.visitors) * 100 : 0,
    },
    {
      icon: <CreditCard size={20} className="text-orange-500" />,
      title: "Checkout",
      description: "Iniciaram o pagamento",
      count: stats.checkout,
      conversion: pct(stats.checkout, stats.visitors),
      dropoff: `${pct(stats.purchase, stats.checkout)}% compraram`,
      progressValue: stats.visitors > 0 ? (stats.checkout / stats.visitors) * 100 : 0,
    },
    {
      icon: <DollarSign size={20} className="text-emerald-500" />,
      title: "Comprou (PIX)",
      description: "Geraram o PIX",
      count: stats.purchase,
      conversion: pct(stats.purchase, stats.visitors),
      dropoff: null as string | null,
      progressValue: stats.visitors > 0 ? (stats.purchase / stats.visitors) * 100 : 0,
    },
  ];

  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: "dashboard", label: "Dashboard", icon: <BarChart3 size={14} /> },
    { id: "analytics", label: "Funil", icon: <TrendingUp size={14} /> },
    { id: "produtos", label: "Produtos", icon: <Package size={14} /> },
    { id: "frete", label: "Frete", icon: <Truck size={14} /> },
    { id: "financeiro", label: "Financeiro", icon: <DollarSign size={14} /> },
    { id: "leads", label: "Leads", icon: <Users size={14} /> },
    { id: "cloaker", label: "Cloaker", icon: <Shield size={14} /> },
    { id: "pixels", label: "Pixels", icon: <Code size={14} /> },
    { id: "webhooks", label: "Webhooks", icon: <Bell size={14} /> },
    { id: "utmify", label: "Utmify", icon: <Zap size={14} /> },
    { id: "pagamentos", label: "Pagamentos", icon: <CreditCard size={14} /> },
    { id: "pedidos", label: "Pedidos", icon: <ShoppingCart size={14} /> },
    { id: "abandonados", label: "Abandonados", icon: <ShoppingCart size={14} /> },
    { id: "cupons", label: "Cupons", icon: <Tag size={14} /> },
    { id: "config", label: "Config", icon: <Settings size={14} /> },
  ];

  return (
    <div className="min-h-screen bg-secondary">
      <div className="bg-primary px-4 py-3">
        <div className="mx-auto flex max-w-3xl items-center justify-between">
          <div>
            <h1 className="text-sm font-black text-primary-foreground">Painel Admin</h1>
            <p className="text-[10px] text-primary-foreground/60">Gerenciamento da loja</p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="text-[10px] font-bold">Kazoom</Badge>
            <button onClick={async () => { await supabase.auth.signOut(); setAuthed(false); }} className="text-[10px] text-primary-foreground/60 hover:text-primary-foreground underline">Sair</button>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto border-b border-border bg-background">
        <div className="mx-auto flex max-w-3xl">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 whitespace-nowrap border-b-2 px-4 py-3 text-xs font-bold transition-colors ${
                activeTab === tab.id ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="mx-auto max-w-3xl p-4">
        {activeTab === "dashboard" && <AdminDashboard />}
        {activeTab === "produtos" && <AdminProdutos />}
        {activeTab === "frete" && <AdminFrete />}
        {activeTab === "financeiro" && <AdminFinanceiro />}
        {activeTab === "leads" && <AdminLeads />}
        {activeTab === "cupons" && <AdminCupons />}
        {activeTab === "abandonados" && <AdminAbandonedCarts />}
        

        {activeTab === "analytics" && (
          <div>
            <div className="mb-2 flex items-start justify-between">
              <div>
                <h2 className="text-xl font-black text-foreground">Funil de Conversão</h2>
                <p className="text-xs text-muted-foreground">Atualização automática a cada 30 segundos</p>
              </div>
              <span className="flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-3 py-1.5 text-xs font-bold text-emerald-500">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                {stats.activeNow} ativos agora
              </span>
            </div>

            <div className="mb-6 flex items-center gap-2">
              <span className="text-xs font-bold text-muted-foreground">Período:</span>
              {[5, 10, 15, 30, 60].map((minutes) => (
                <button
                  key={minutes}
                  onClick={() => setPeriod(minutes)}
                  className={`rounded-md px-3 py-1.5 text-xs font-bold transition-colors ${
                    period === minutes
                      ? "bg-primary text-primary-foreground"
                      : "border border-border bg-secondary text-muted-foreground hover:bg-muted"
                  }`}
                >
                  {minutes} min
                </button>
              ))}
            </div>

            <div className="space-y-0">
              {funnelSteps.map((step, index) => (
                <div key={step.title}>
                  <Card className="border border-border p-5 shadow-sm">
                    <div className="mb-3 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary">{step.icon}</div>
                        <div>
                          <h3 className="text-sm font-black text-foreground">{step.title}</h3>
                          <p className="text-[11px] text-muted-foreground">{step.description}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-black text-foreground">{step.count}</p>
                        {step.conversion !== null && (
                          <p className="text-xs font-bold text-muted-foreground">{step.conversion}% conversão</p>
                        )}
                      </div>
                    </div>
                    <Progress value={step.progressValue || 1} className="h-1.5" />
                  </Card>

                  {step.dropoff && index < funnelSteps.length - 1 && (
                    <div className="flex items-center gap-2 py-1.5 pl-6">
                      <ArrowDown size={12} className="text-destructive" />
                      <span className="text-[11px] font-bold text-destructive">↓ {step.dropoff}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>

            <Card className="mt-6 border border-border bg-background p-5 shadow-sm">
              <h3 className="mb-3 text-sm font-black uppercase text-foreground">Funil Visual</h3>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart
                  data={[
                    { etapa: "Visitantes", valor: stats.visitors },
                    { etapa: "Produto", valor: stats.productViews },
                    { etapa: "Carrinho", valor: stats.addToCart },
                    { etapa: "Checkout", valor: stats.checkout },
                    { etapa: "Comprou", valor: stats.purchase },
                  ]}
                  layout="vertical"
                  margin={{ left: 10, right: 30 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" horizontal={false} />
                  <XAxis type="number" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
                  <YAxis
                    dataKey="etapa"
                    type="category"
                    tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))", fontWeight: 700 }}
                    width={80}
                  />
                  <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid hsl(var(--border))" }} />
                  <Bar dataKey="valor" radius={[0, 6, 6, 0]}>
                    {[
                      "hsl(var(--primary))",
                      "hsl(142, 71%, 45%)",
                      "hsl(45, 93%, 47%)",
                      "hsl(30, 100%, 50%)",
                      "hsl(0, 84%, 60%)",
                    ].map((fill, index) => (
                      <Cell key={index} fill={fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </Card>

            <Card className="mt-4 border border-border bg-background p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-black text-foreground">Conversão Global</h3>
                  <p className="text-xs text-muted-foreground">Visitantes que compraram</p>
                </div>
                <div className="text-right">
                  <p className="text-4xl font-black text-foreground">{globalConversion}%</p>
                  <p className="text-xs font-bold text-muted-foreground">
                    {stats.purchase} de {stats.visitors} visitantes
                  </p>
                </div>
              </div>
            </Card>

            <div className="mt-4 text-right">
              <Button onClick={handleClearStats} variant="outline" size="sm" className="text-xs text-muted-foreground">
                <Trash2 size={12} className="mr-1" /> Limpar dados
              </Button>
            </div>
          </div>
        )}

        {activeTab === "pixels" && (
          <div>
            <h2 className="mb-1 text-xl font-black text-foreground">Pixels de Rastreamento</h2>
            <p className="mb-6 text-xs text-muted-foreground">Configure quantos pixels quiser por plataforma</p>

            <div className="mb-6">
              <div className="mb-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                    <Code size={16} className="text-primary" />
                  </div>
                  <h3 className="text-sm font-black text-foreground">Facebook / Meta Pixel</h3>
                  <Badge variant="secondary" className="text-[10px]">
                    {pixelConfig.facebookPixels.length}
                  </Badge>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  className="h-7 text-xs"
                  onClick={() =>
                    setPixelConfig((current) => ({
                      ...current,
                      facebookPixels: [...current.facebookPixels, { id: crypto.randomUUID(), pixelId: "", accessToken: "" }],
                    }))
                  }
                >
                  <Plus size={12} className="mr-1" /> Adicionar
                </Button>
              </div>

              {pixelConfig.facebookPixels.length === 0 && (
                <p className="rounded-md border border-dashed border-border py-4 text-center text-xs text-muted-foreground">
                  Nenhum pixel Facebook adicionado
                </p>
              )}

              <div className="space-y-2">
                {pixelConfig.facebookPixels.map((pixel, index) => (
                  <Card key={pixel.id} className="border border-border p-4">
                    <div className="mb-2 flex items-center justify-between">
                      <span className="text-[11px] font-black text-foreground">Pixel #{index + 1}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0 text-destructive hover:bg-destructive/10"
                        onClick={() =>
                          setPixelConfig((current) => ({
                            ...current,
                            facebookPixels: current.facebookPixels.filter((item) => item.id !== pixel.id),
                          }))
                        }
                      >
                        <Trash2 size={12} />
                      </Button>
                    </div>

                    <div className="space-y-2">
                      <div>
                        <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Pixel ID</label>
                        <Input
                          value={pixel.pixelId}
                          onChange={(event) =>
                            setPixelConfig((current) => ({
                              ...current,
                              facebookPixels: current.facebookPixels.map((item) =>
                                item.id === pixel.id ? { ...item, pixelId: event.target.value } : item,
                              ),
                            }))
                          }
                          placeholder="Ex: 123456789012345"
                          className="mt-1 font-mono text-xs"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Access Token (CAPI)</label>
                        <Input
                          type="password"
                          value={pixel.accessToken}
                          onChange={(event) =>
                            setPixelConfig((current) => ({
                              ...current,
                              facebookPixels: current.facebookPixels.map((item) =>
                                item.id === pixel.id ? { ...item, accessToken: event.target.value } : item,
                              ),
                            }))
                          }
                          placeholder="Token da Conversions API (opcional)"
                          className="mt-1 font-mono text-xs"
                        />
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>

            <div className="mb-6">
              <div className="mb-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-foreground/10">
                    <Zap size={16} className="text-foreground" />
                  </div>
                  <h3 className="text-sm font-black text-foreground">TikTok Pixel</h3>
                  <Badge variant="secondary" className="text-[10px]">
                    {pixelConfig.tiktokPixels.length}
                  </Badge>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  className="h-7 text-xs"
                  onClick={() =>
                    setPixelConfig((current) => ({
                      ...current,
                      tiktokPixels: [...current.tiktokPixels, { id: crypto.randomUUID(), pixelId: "", accessToken: "" }],
                    }))
                  }
                >
                  <Plus size={12} className="mr-1" /> Adicionar
                </Button>
              </div>

              {pixelConfig.tiktokPixels.length === 0 && (
                <p className="rounded-md border border-dashed border-border py-4 text-center text-xs text-muted-foreground">
                  Nenhum pixel TikTok adicionado
                </p>
              )}

              <div className="space-y-2">
                {pixelConfig.tiktokPixels.map((pixel, index) => (
                  <Card key={pixel.id} className="border border-border p-4">
                    <div className="mb-2 flex items-center justify-between">
                      <span className="text-[11px] font-black text-foreground">Pixel #{index + 1}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0 text-destructive hover:bg-destructive/10"
                        onClick={() =>
                          setPixelConfig((current) => ({
                            ...current,
                            tiktokPixels: current.tiktokPixels.filter((item) => item.id !== pixel.id),
                          }))
                        }
                      >
                        <Trash2 size={12} />
                      </Button>
                    </div>

                    <div className="space-y-2">
                      <div>
                        <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Pixel ID</label>
                        <Input
                          value={pixel.pixelId}
                          onChange={(event) =>
                            setPixelConfig((current) => ({
                              ...current,
                              tiktokPixels: current.tiktokPixels.map((item) =>
                                item.id === pixel.id ? { ...item, pixelId: event.target.value } : item,
                              ),
                            }))
                          }
                          placeholder="Ex: CXXXXXXXXXXXXXXX"
                          className="mt-1 font-mono text-xs"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Access Token</label>
                        <Input
                          type="password"
                          value={pixel.accessToken}
                          onChange={(event) =>
                            setPixelConfig((current) => ({
                              ...current,
                              tiktokPixels: current.tiktokPixels.map((item) =>
                                item.id === pixel.id ? { ...item, accessToken: event.target.value } : item,
                              ),
                            }))
                          }
                          placeholder="Token da Events API (opcional)"
                          className="mt-1 font-mono text-xs"
                        />
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>

            <div className="mb-6">
              <div className="mb-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                    <BarChart3 size={16} className="text-primary" />
                  </div>
                  <h3 className="text-sm font-black text-foreground">Google Ads</h3>
                  <Badge variant="secondary" className="text-[10px]">
                    {pixelConfig.googleAdsPixels.length}
                  </Badge>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  className="h-7 text-xs"
                  onClick={() =>
                    setPixelConfig((current) => ({
                      ...current,
                      googleAdsPixels: [...current.googleAdsPixels, { id: crypto.randomUUID(), adsId: "", adsLabel: "" }],
                    }))
                  }
                >
                  <Plus size={12} className="mr-1" /> Adicionar
                </Button>
              </div>

              {pixelConfig.googleAdsPixels.length === 0 && (
                <p className="rounded-md border border-dashed border-border py-4 text-center text-xs text-muted-foreground">
                  Nenhum pixel Google Ads adicionado
                </p>
              )}

              <div className="space-y-2">
                {pixelConfig.googleAdsPixels.map((pixel, index) => (
                  <Card key={pixel.id} className="border border-border p-4">
                    <div className="mb-2 flex items-center justify-between">
                      <span className="text-[11px] font-black text-foreground">Pixel #{index + 1}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0 text-destructive hover:bg-destructive/10"
                        onClick={() =>
                          setPixelConfig((current) => ({
                            ...current,
                            googleAdsPixels: current.googleAdsPixels.filter((item) => item.id !== pixel.id),
                          }))
                        }
                      >
                        <Trash2 size={12} />
                      </Button>
                    </div>

                    <div className="space-y-2">
                      <div>
                        <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">ID de Conversão</label>
                        <Input
                          value={pixel.adsId}
                          onChange={(event) =>
                            setPixelConfig((current) => ({
                              ...current,
                              googleAdsPixels: current.googleAdsPixels.map((item) =>
                                item.id === pixel.id ? { ...item, adsId: event.target.value } : item,
                              ),
                            }))
                          }
                          placeholder="Ex: AW-123456789"
                          className="mt-1 font-mono text-xs"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Rótulo de Conversão</label>
                        <Input
                          value={pixel.adsLabel}
                          onChange={(event) =>
                            setPixelConfig((current) => ({
                              ...current,
                              googleAdsPixels: current.googleAdsPixels.map((item) =>
                                item.id === pixel.id ? { ...item, adsLabel: event.target.value } : item,
                              ),
                            }))
                          }
                          placeholder="Ex: AbCdEfGhIjKlMnOp"
                          className="mt-1 font-mono text-xs"
                        />
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>

            <Card className="mb-6 border border-border p-5">
              <div className="mb-3 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <BarChart3 size={20} className="text-primary" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-foreground">Google Ads Server-Side (GA4)</h3>
                  <p className="text-[11px] text-muted-foreground">Necessário para marcar conversões mesmo com cloaker externo</p>
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">GA4 Measurement ID</label>
                  <Input
                    value={pixelConfig.ga4MeasurementId || ""}
                    onChange={(event) => setPixelConfig((current) => ({ ...current, ga4MeasurementId: event.target.value }))}
                    placeholder="Ex: G-XXXXXXXXXX"
                    className="mt-1 font-mono text-xs"
                  />
                  <p className="mt-0.5 text-[9px] text-muted-foreground">GA4 → Admin → Data Streams → Copie o Measurement ID</p>
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">GA4 API Secret</label>
                  <Input
                    type="password"
                    value={pixelConfig.ga4ApiSecret || ""}
                    onChange={(event) => setPixelConfig((current) => ({ ...current, ga4ApiSecret: event.target.value }))}
                    placeholder="Secret do Measurement Protocol"
                    className="mt-1 font-mono text-xs"
                  />
                  <p className="mt-0.5 text-[9px] text-muted-foreground">GA4 → Admin → Data Streams → Measurement Protocol API secrets → Criar</p>
                </div>
              </div>
            </Card>

            {/* Utmify Meta */}
            <Card className="mb-6 border border-border p-5">
              <div className="mb-3 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/10">
                    <Zap size={20} className="text-blue-500" />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-foreground">Pixel Utmify Meta (Facebook)</h3>
                    <p className="text-[11px] text-muted-foreground">Cole apenas o ID do pixel da Utmify (Meta)</p>
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  className="h-7 text-[11px]"
                  onClick={() =>
                    setPixelConfig((current) => ({
                      ...current,
                      utmifyMetaPixels: [...(current.utmifyMetaPixels || []), { id: crypto.randomUUID(), pixelId: "" }],
                    }))
                  }
                >
                  + Adicionar
                </Button>
              </div>

              {(!pixelConfig.utmifyMetaPixels || pixelConfig.utmifyMetaPixels.length === 0) && (
                <p className="rounded-md border border-dashed border-border py-4 text-center text-xs text-muted-foreground">
                  Nenhum pixel Utmify Meta adicionado
                </p>
              )}

              <div className="space-y-2">
                {(pixelConfig.utmifyMetaPixels || []).map((pixel, index) => (
                  <Card key={pixel.id} className="border border-border p-3">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-black text-muted-foreground">#{index + 1}</span>
                      <Input
                        value={pixel.pixelId}
                        onChange={(event) =>
                          setPixelConfig((current) => ({
                            ...current,
                            utmifyMetaPixels: current.utmifyMetaPixels.map((item) =>
                              item.id === pixel.id ? { ...item, pixelId: event.target.value.trim() } : item,
                            ),
                          }))
                        }
                        placeholder="Ex: 69e3bd8b2600b2c38b017f5f"
                        className="flex-1 font-mono text-xs"
                      />
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 w-7 p-0 text-destructive hover:bg-destructive/10"
                        onClick={() =>
                          setPixelConfig((current) => ({
                            ...current,
                            utmifyMetaPixels: current.utmifyMetaPixels.filter((item) => item.id !== pixel.id),
                          }))
                        }
                      >
                        <Trash2 size={12} />
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            </Card>

            {/* Utmify Google */}
            <Card className="mb-6 border border-border p-5">
              <div className="mb-3 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-500/10">
                    <Zap size={20} className="text-amber-500" />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-foreground">Pixel Utmify Google</h3>
                    <p className="text-[11px] text-muted-foreground">Cole apenas o ID do pixel da Utmify (Google)</p>
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  className="h-7 text-[11px]"
                  onClick={() =>
                    setPixelConfig((current) => ({
                      ...current,
                      utmifyGooglePixels: [...(current.utmifyGooglePixels || []), { id: crypto.randomUUID(), pixelId: "" }],
                    }))
                  }
                >
                  + Adicionar
                </Button>
              </div>

              {(!pixelConfig.utmifyGooglePixels || pixelConfig.utmifyGooglePixels.length === 0) && (
                <p className="rounded-md border border-dashed border-border py-4 text-center text-xs text-muted-foreground">
                  Nenhum pixel Utmify Google adicionado
                </p>
              )}

              <div className="space-y-2">
                {(pixelConfig.utmifyGooglePixels || []).map((pixel, index) => (
                  <Card key={pixel.id} className="border border-border p-3">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-black text-muted-foreground">#{index + 1}</span>
                      <Input
                        value={pixel.pixelId}
                        onChange={(event) =>
                          setPixelConfig((current) => ({
                            ...current,
                            utmifyGooglePixels: current.utmifyGooglePixels.map((item) =>
                              item.id === pixel.id ? { ...item, pixelId: event.target.value.trim() } : item,
                            ),
                          }))
                        }
                        placeholder="Ex: 69e14c5819a6fe27021491c3"
                        className="flex-1 font-mono text-xs"
                      />
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 w-7 p-0 text-destructive hover:bg-destructive/10"
                        onClick={() =>
                          setPixelConfig((current) => ({
                            ...current,
                            utmifyGooglePixels: current.utmifyGooglePixels.filter((item) => item.id !== pixel.id),
                          }))
                        }
                      >
                        <Trash2 size={12} />
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            </Card>

            <Card className="mb-6 border border-border p-5">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h3 className="text-sm font-black text-foreground">Modo de Conversão</h3>
                  <p className="text-[11px] text-muted-foreground">
                    {pixelConfig.onlyPaid
                      ? "Dispara pixel APENAS em vendas aprovadas (pagas)"
                      : "Dispara pixel em vendas pendentes + aprovadas"}
                  </p>
                </div>
                <Switch
                  checked={pixelConfig.onlyPaid || false}
                  onCheckedChange={(value) => setPixelConfig((current) => ({ ...current, onlyPaid: value }))}
                />
              </div>
            </Card>

            <Button onClick={handleSavePixels} className="w-full bg-emerald-500 text-xs font-bold text-white hover:bg-emerald-500/90">
              <Save size={14} className="mr-1.5" /> Salvar e Ativar Pixels
            </Button>
            <StatusMessage msg={pixelMessage} />
          </div>
        )}

        {activeTab === "webhooks" && (
          <div>
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="mb-1 text-xl font-black text-foreground">Webhooks de Notificação</h2>
                <p className="text-xs text-muted-foreground">Receba notificações de venda pendente e aprovada</p>
              </div>
              <Button onClick={addWebhook} size="sm" className="bg-primary text-xs font-bold text-primary-foreground">
                + Adicionar
              </Button>
            </div>

            {webhookConfig.webhooks.length === 0 && (
              <Card className="border border-border p-8 text-center">
                <Bell size={32} className="mx-auto mb-3 text-muted-foreground" />
                <p className="text-sm font-bold text-foreground">Nenhum webhook configurado</p>
                <p className="mt-1 text-xs text-muted-foreground">Clique em "+ Adicionar" para configurar</p>
              </Card>
            )}

            <div className="space-y-3">
              {webhookConfig.webhooks.map((webhook, index) => (
                <Card key={webhook.id} className="border border-border p-4">
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-xs font-black text-foreground">Webhook #{index + 1}</span>
                    <Button
                      onClick={() => removeWebhook(webhook.id)}
                      variant="ghost"
                      size="sm"
                      className="h-7 px-2 text-destructive hover:bg-destructive/10"
                    >
                      <Trash2 size={12} />
                    </Button>
                  </div>

                  <Input
                    type="url"
                    value={webhook.url}
                    onChange={(event) => updateWebhook(webhook.id, { url: event.target.value })}
                    placeholder="https://seu-webhook.com/notificacao"
                    className="mb-2 font-mono text-xs"
                  />

                  <div className="mt-2 flex items-center gap-3">
                    <span className="text-[10px] font-bold text-muted-foreground">Eventos:</span>
                    <button
                      onClick={() => toggleWebhookEvent(webhook.id, "venda_pendente")}
                      className={`rounded-md border px-2.5 py-1 text-[10px] font-bold transition-all ${
                        webhook.events.includes("venda_pendente")
                          ? "border-amber-500 bg-amber-500/10 text-amber-500"
                          : "border-border text-muted-foreground"
                      }`}
                    >
                      Venda Pendente
                    </button>
                    <button
                      onClick={() => toggleWebhookEvent(webhook.id, "venda_aprovada")}
                      className={`rounded-md border px-2.5 py-1 text-[10px] font-bold transition-all ${
                        webhook.events.includes("venda_aprovada")
                          ? "border-emerald-500 bg-emerald-500/10 text-emerald-500"
                          : "border-border text-muted-foreground"
                      }`}
                    >
                      Venda Aprovada
                    </button>
                  </div>
                </Card>
              ))}
            </div>

            {webhookConfig.webhooks.length > 0 && (
              <div className="mt-4 space-y-2">
                <Button onClick={handleSaveWebhook} className="w-full bg-emerald-500 text-xs font-bold text-white hover:bg-emerald-500/90">
                  <Save size={14} className="mr-1.5" /> Salvar Webhooks
                </Button>
                <div className="flex gap-2">
                  <Button onClick={() => handleTestWebhook("venda_pendente")} variant="outline" className="flex-1 text-xs font-bold">
                    Testar Pendente
                  </Button>
                  <Button onClick={() => handleTestWebhook("venda_aprovada")} variant="outline" className="flex-1 text-xs font-bold">
                    Testar Aprovada
                  </Button>
                </div>
              </div>
            )}

            <StatusMessage msg={webhookMessage} />
          </div>
        )}

        {activeTab === "utmify" && (
          <div>
            <h2 className="mb-1 text-xl font-black text-foreground">Integração Utmify</h2>
            <p className="mb-6 text-xs text-muted-foreground">Rastreie suas vendas com a Utmify</p>

            <Card className="border border-border p-5">
              <div className="mb-3 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/10">
                  <Zap size={20} className="text-emerald-500" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-foreground">Tokens da API</h3>
                  <p className="text-[11px] text-muted-foreground">Configure até 2 tokens Utmify para envio simultâneo</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Token 1</label>
                  <Input
                    type="password"
                    value={utmifyConfig.apiToken}
                    onChange={(event) => setUtmifyConfig((current) => ({ ...current, apiToken: event.target.value }))}
                    placeholder="Cole aqui o Token 1 da Utmify"
                    className="font-mono text-xs"
                  />
                  <Button
                    onClick={() => void handleTestUtmify(1)}
                    variant="outline"
                    size="sm"
                    className="text-xs font-bold"
                    disabled={utmifyTesting || !utmifyConfig.apiToken}
                  >
                    {utmifyTesting ? <Loader2 size={14} className="mr-1.5 animate-spin" /> : <Zap size={14} className="mr-1.5" />}
                    {utmifyTesting ? "Testando..." : "Testar Token 1"}
                  </Button>
                  <StatusMessage msg={utmifyMessage} />
                </div>

                <div className="space-y-2 border-t border-border pt-2">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Token 2 (opcional)</label>
                  <Input
                    type="password"
                    value={utmifyConfig.apiToken2}
                    onChange={(event) => setUtmifyConfig((current) => ({ ...current, apiToken2: event.target.value }))}
                    placeholder="Cole aqui o Token 2 da Utmify"
                    className="font-mono text-xs"
                  />
                  <Button
                    onClick={() => void handleTestUtmify(2)}
                    variant="outline"
                    size="sm"
                    className="text-xs font-bold"
                    disabled={utmifyTesting2 || !utmifyConfig.apiToken2}
                  >
                    {utmifyTesting2 ? <Loader2 size={14} className="mr-1.5 animate-spin" /> : <Zap size={14} className="mr-1.5" />}
                    {utmifyTesting2 ? "Testando..." : "Testar Token 2"}
                  </Button>
                  <StatusMessage msg={utmifyMessage2} />
                </div>

                <Button onClick={handleSaveUtmify} className="w-full bg-emerald-500 text-xs font-bold text-white hover:bg-emerald-500/90">
                  <Save size={14} className="mr-1.5" /> Salvar Tokens
                </Button>
              </div>
            </Card>
          </div>
        )}

        {activeTab === "pagamentos" && (
          <div>
            <h2 className="mb-1 text-xl font-black text-foreground">Gateways de Pagamento</h2>
            <p className="mb-6 text-xs text-muted-foreground">Configure os gateways para gerar cobranças PIX</p>

            <Card className="mb-4 border border-border p-4">
              <div className="mb-2 flex items-center gap-2">
                <QrCode size={16} className="text-emerald-500" />
                <span className="text-sm font-black text-foreground">Gateway Ativo</span>
              </div>

              <div className="flex flex-wrap gap-2">
                {(Object.keys(GATEWAY_LABELS) as PaymentGatewayConfig["activeGateway"][]).map((gateway) => (
                  <button
                    key={gateway}
                    onClick={async () => {
                      const updatedConfig = { ...gatewayConfig, activeGateway: gateway };
                      setGatewayConfig(updatedConfig);
                      const result = await savePaymentGatewayConfig(updatedConfig);
                      flashMessage(setGatewayMessage, result.ok ? `Gateway ativo: ${GATEWAY_LABELS[gateway]}` : result.error || "Erro ao salvar gateway", 5000);
                    }}
                    className={`min-w-[80px] flex-1 rounded-lg border-2 px-3 py-2.5 text-xs font-bold transition-all ${
                      gatewayConfig.activeGateway === gateway
                        ? "border-emerald-500 bg-emerald-500/5 text-emerald-500"
                        : "border-border text-muted-foreground hover:border-muted-foreground/30"
                    }`}
                  >
                    {GATEWAY_LABELS[gateway]}
                  </button>
                ))}
              </div>
              <StatusMessage msg={gatewayMessage} />
            </Card>

            <GatewayCard
              title="Pagou.ai"
              isActive={gatewayConfig.activeGateway === "pagouai"}
              fields={[
                {
                  label: "Chave Pública (Public Key)",
                  value: gatewayConfig.pagouai.publicKey,
                  onChange: (value) => setGatewayConfig((current) => ({ ...current, pagouai: { ...current.pagouai, publicKey: value } })),
                  placeholder: "pk_live_...",
                },
                {
                  label: "Chave Secreta (Secret Key)",
                  value: gatewayConfig.pagouai.secretKey,
                  onChange: (value) => setGatewayConfig((current) => ({ ...current, pagouai: { ...current.pagouai, secretKey: value } })),
                  placeholder: "sk_live_...",
                  secret: true,
                },
              ]}
              onSave={() => void persistGateway("Pagou.ai salva!")}
              onTest={() => void testGateway("pagouai")}
              testing={gatewayTesting}
              gatewayKey="pagouai"
              paymentMethods={gatewayConfig.paymentMethods.pagouai || "pix"}
              onPaymentMethodChange={handlePaymentMethodChange}
            />

            <GatewayCard
              title="Vennox"
              isActive={gatewayConfig.activeGateway === "vennox"}
              fields={[
                {
                  label: "Secret Key",
                  value: gatewayConfig.vennox.secretKey,
                  onChange: (value) => setGatewayConfig((current) => ({ ...current, vennox: { ...current.vennox, secretKey: value } })),
                  placeholder: "sua_secret_key",
                  secret: true,
                },
                {
                  label: "Company ID",
                  value: gatewayConfig.vennox.companyId,
                  onChange: (value) => setGatewayConfig((current) => ({ ...current, vennox: { ...current.vennox, companyId: value } })),
                  placeholder: "seu_company_id",
                },
              ]}
              onSave={() => void persistGateway("Vennox salva!")}
              onTest={() => void testGateway("vennox")}
              testing={gatewayTesting}
              gatewayKey="vennox"
              paymentMethods={gatewayConfig.paymentMethods.vennox || "pix"}
              onPaymentMethodChange={handlePaymentMethodChange}
            />

            <GatewayCard
              title="Centurion Pay"
              isActive={gatewayConfig.activeGateway === "centurionpay"}
              fields={[
                {
                  label: "Company ID",
                  value: gatewayConfig.centurionpay.companyId,
                  onChange: (value) =>
                    setGatewayConfig((current) => ({ ...current, centurionpay: { ...current.centurionpay, companyId: value } })),
                  placeholder: "seu_company_id",
                },
                {
                  label: "Secret Key",
                  value: gatewayConfig.centurionpay.secretKey,
                  onChange: (value) =>
                    setGatewayConfig((current) => ({ ...current, centurionpay: { ...current.centurionpay, secretKey: value } })),
                  placeholder: "sk_live_...",
                  secret: true,
                },
              ]}
              onSave={() => void persistGateway("Centurion Pay salva!")}
              onTest={() => void testGateway("centurionpay")}
              testing={gatewayTesting}
              gatewayKey="centurionpay"
              paymentMethods={gatewayConfig.paymentMethods.centurionpay || "pix"}
              onPaymentMethodChange={handlePaymentMethodChange}
            />

            <GatewayCard
              title="Iron Pay"
              isActive={gatewayConfig.activeGateway === "ironpay"}
              fields={[
                {
                  label: "Token da API",
                  value: gatewayConfig.ironpay.apiToken,
                  onChange: (value) => setGatewayConfig((current) => ({ ...current, ironpay: { ...current.ironpay, apiToken: value } })),
                  placeholder: "RUOkOpSr6bO7jIo6yAJk...",
                  secret: true,
                },
              ]}
              onSave={() => void persistGateway("Iron Pay salva!")}
              onTest={() => void testGateway("ironpay")}
              testing={gatewayTesting}
              gatewayKey="ironpay"
              paymentMethods={gatewayConfig.paymentMethods.ironpay || "pix"}
              onPaymentMethodChange={handlePaymentMethodChange}
            />

            <GatewayCard
              title="Sim Payout"
              isActive={gatewayConfig.activeGateway === "simpayout"}
              fields={[
                {
                  label: "Client ID",
                  value: gatewayConfig.simpayout.clientId,
                  onChange: (value) => setGatewayConfig((current) => ({ ...current, simpayout: { ...current.simpayout, clientId: value } })),
                  placeholder: "pk_live_...",
                },
                {
                  label: "Client Secret",
                  value: gatewayConfig.simpayout.clientSecret,
                  onChange: (value) =>
                    setGatewayConfig((current) => ({ ...current, simpayout: { ...current.simpayout, clientSecret: value } })),
                  placeholder: "sk_live_...",
                  secret: true,
                },
              ]}
              onSave={() => void persistGateway("Sim Payout salva!")}
              onTest={() => void testGateway("simpayout")}
              testing={gatewayTesting}
              gatewayKey="simpayout"
              paymentMethods={gatewayConfig.paymentMethods.simpayout || "pix"}
              onPaymentMethodChange={handlePaymentMethodChange}
            />

            <GatewayCard
              title="Beehive"
              isActive={gatewayConfig.activeGateway === "beehive"}
              fields={[
                {
                  label: "Chave Pública (Public Key)",
                  value: gatewayConfig.beehive.publicKey,
                  onChange: (value) => setGatewayConfig((current) => ({ ...current, beehive: { ...current.beehive, publicKey: value } })),
                  placeholder: "pk_live_...",
                },
                {
                  label: "Chave Secreta (Secret Key)",
                  value: gatewayConfig.beehive.secretKey,
                  onChange: (value) => setGatewayConfig((current) => ({ ...current, beehive: { ...current.beehive, secretKey: value } })),
                  placeholder: "sk_live_...",
                  secret: true,
                },
              ]}
              onSave={() => void persistGateway("Beehive salva!")}
              onTest={() => void testGateway("beehive")}
              testing={gatewayTesting}
              gatewayKey="beehive"
              paymentMethods={gatewayConfig.paymentMethods.beehive || "pix"}
              onPaymentMethodChange={handlePaymentMethodChange}
            />

            <GatewayCard
              title="MP Pagamentos"
              isActive={gatewayConfig.activeGateway === "pagamentosmp"}
              fields={[
                {
                  label: "Chave Pública (Public Key)",
                  value: gatewayConfig.pagamentosmp.publicKey,
                  onChange: (value) => setGatewayConfig((current) => ({ ...current, pagamentosmp: { ...current.pagamentosmp, publicKey: value } })),
                  placeholder: "pk_...",
                },
                {
                  label: "Chave Secreta (Secret Key)",
                  value: gatewayConfig.pagamentosmp.secretKey,
                  onChange: (value) => setGatewayConfig((current) => ({ ...current, pagamentosmp: { ...current.pagamentosmp, secretKey: value } })),
                  placeholder: "sk_...",
                  secret: true,
                },
              ]}
              onSave={() => void persistGateway("MP Pagamentos salva!")}
              onTest={() => void testGateway("pagamentosmp")}
              testing={gatewayTesting}
              gatewayKey="pagamentosmp"
              paymentMethods={gatewayConfig.paymentMethods.pagamentosmp || "pix"}
              onPaymentMethodChange={handlePaymentMethodChange}
            />
          </div>
        )}

        {activeTab === "pedidos" && <AdminPedidos />}

        {activeTab === "cloaker" && (
          <div className="space-y-4">
            <div>
              <h2 className="mb-1 text-xl font-black text-foreground">Cloaker</h2>
              <p className="text-xs text-muted-foreground">Proteção contra bots e revisores do Google Ads</p>
            </div>

            <Card className="space-y-4 border border-border p-5">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-bold text-foreground">Cloaker Ativado</p>
                  <p className="text-[10px] text-muted-foreground">
                    {cloakerEnabled
                      ? "Bots e revisores verão a página segura"
                      : "Todos os visitantes verão a página real"}
                  </p>
                </div>
                <Switch checked={cloakerEnabled} disabled={cloakerLoading} onCheckedChange={(value) => void handleToggleCloaker(value)} />
              </div>

              <div className="space-y-2 rounded-md border border-border bg-muted/30 p-3">
                <p className="flex items-center gap-1.5 text-xs font-bold text-foreground">
                  <Shield size={14} /> Como funciona
                </p>
                <ul className="list-disc space-y-1 pl-4 text-[10px] text-muted-foreground">
                  <li>Detecta bots do Google (AdsBot, Googlebot) pelo User-Agent</li>
                  <li>Verifica IPs conhecidos da Google</li>
                  <li>Bots são redirecionados para uma página segura</li>
                  <li>Usuários reais acessam normalmente a loja</li>
                </ul>
              </div>

              <div className="flex items-center gap-2">
                <Badge variant={cloakerEnabled ? "default" : "secondary"} className={cloakerEnabled ? "bg-emerald-500 text-white" : ""}>
                  {cloakerEnabled ? "🛡️ Protegido" : "⚠️ Desprotegido"}
                </Badge>
              </div>

              <StatusMessage msg={cloakerMessage} />
            </Card>
          </div>
        )}

        {activeTab === "config" && (
          <div className="space-y-4">
            <div>
              <h2 className="mb-1 text-xl font-black text-foreground">Configurações da Loja</h2>
              <p className="text-xs text-muted-foreground">Dados gerais exibidos no site</p>
            </div>

            <Card className="space-y-4 border border-border p-5">
              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  Número do WhatsApp
                </label>
                <p className="text-[10px] text-muted-foreground mb-1">
                  Com código do país (ex: 5533999829860). Deixe vazio para ocultar o botão.
                </p>
                <Input
                  value={whatsappNumber}
                  onChange={(e) => setWhatsappNumber(e.target.value)}
                  placeholder="5533999829860"
                  className="mt-1 font-mono text-xs"
                />
              </div>

              <div className="flex items-center justify-between gap-4 border-t border-border pt-4">
                <div>
                  <p className="text-sm font-bold text-foreground">Pagamento com Cartão</p>
                  <p className="text-[10px] text-muted-foreground">
                    {cardEnabled
                      ? "Cartão de crédito habilitado no checkout"
                      : "Apenas PIX disponível no checkout"}
                  </p>
                </div>
                <Switch checked={cardEnabled} onCheckedChange={setCardEnabled} />
              </div>

              <Button
                className="w-full bg-emerald-500 text-xs font-bold text-white hover:bg-emerald-500/90"
                onClick={async () => {
                  const { data: existing } = await supabase.from("store_config").select("id").limit(1).maybeSingle();
                  const payload = { whatsapp_number: whatsappNumber, card_enabled: cardEnabled, updated_at: new Date().toISOString() } as any;
                  const result = existing?.id
                    ? await supabase.from("store_config").update(payload).eq("id", existing.id)
                    : await supabase.from("store_config").insert(payload);
                  flashMessage(setConfigMessage, result.error ? "Erro ao salvar" : "Configuração salva com sucesso!");
                }}
              >
                <Save size={14} className="mr-1.5" /> Salvar Configurações
              </Button>

              <StatusMessage msg={configMessage} />
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
