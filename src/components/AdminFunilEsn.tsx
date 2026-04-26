import { useEffect, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { ArrowDown, CreditCard, DollarSign, Eye, ExternalLink, ShoppingCart, TrendingUp } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { getFunnelStatsForProduct, type FunnelStats } from "@/lib/funnelTracking";

const ESN_SLUG = "esn-elite-leistung-combo-1";
const ESN_NAME = "ESN Elite Leistung Combo";
const ESN_EXTERNAL_CHECKOUT = "https://checkout.flowspays.com/checkout/cmodkt6sb00i31rp0obulz7pa?offer=ZW5X4XQ";

const INITIAL_STATS: FunnelStats = {
  visitors: 0,
  productViews: 0,
  addToCart: 0,
  checkout: 0,
  purchase: 0,
  activeNow: 0,
};

const pct = (numerator: number, denominator: number) =>
  denominator > 0 ? Math.round((numerator / denominator) * 100) : 0;

export default function AdminFunilEsn() {
  const [period, setPeriod] = useState(60);
  const [stats, setStats] = useState<FunnelStats>(INITIAL_STATS);

  useEffect(() => {
    let cancelled = false;
    const refresh = async () => {
      const next = await getFunnelStatsForProduct(ESN_SLUG, period);
      if (!cancelled) setStats(next);
    };
    void refresh();
    const interval = window.setInterval(refresh, 30000);
    return () => {
      cancelled = true;
      window.clearInterval(interval);
    };
  }, [period]);

  const productConversion = pct(stats.checkout, stats.productViews);

  const funnelSteps = [
    {
      icon: <Eye size={20} className="text-primary" />,
      title: "Visitantes da loja",
      description: "Tráfego total no período",
      count: stats.visitors,
      conversion: null as number | null,
      dropoff: `${pct(stats.productViews, stats.visitors)}% chegaram à página do ESN`,
      progressValue: 100,
    },
    {
      icon: <TrendingUp size={20} className="text-emerald-500" />,
      title: "Viram o ESN Combo",
      description: `Página /produto/${ESN_SLUG}`,
      count: stats.productViews,
      conversion: pct(stats.productViews, stats.visitors),
      dropoff: `${pct(stats.addToCart, stats.productViews)}% adicionaram ao carrinho`,
      progressValue: stats.visitors > 0 ? (stats.productViews / stats.visitors) * 100 : 0,
    },
    {
      icon: <ShoppingCart size={20} className="text-amber-500" />,
      title: "Adicionaram ao carrinho",
      description: "Clicaram em Adicionar",
      count: stats.addToCart,
      conversion: pct(stats.addToCart, stats.productViews),
      dropoff: `${pct(stats.checkout, stats.addToCart)}% foram ao checkout`,
      progressValue: stats.productViews > 0 ? (stats.addToCart / stats.productViews) * 100 : 0,
    },
    {
      icon: <CreditCard size={20} className="text-orange-500" />,
      title: "Iniciaram checkout externo",
      description: "Clicaram em Comprar Agora (Flowspays)",
      count: stats.checkout,
      conversion: pct(stats.checkout, stats.productViews),
      dropoff: null as string | null,
      progressValue: stats.productViews > 0 ? (stats.checkout / stats.productViews) * 100 : 0,
    },
  ];

  return (
    <div>
      <div className="mb-2 flex items-start justify-between">
        <div>
          <h2 className="text-xl font-black text-foreground">Funil ESN Combo</h2>
          <p className="text-xs text-muted-foreground">Rastreamento exclusivo do produto · atualiza a cada 30s</p>
        </div>
        <span className="flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-3 py-1.5 text-xs font-bold text-emerald-500">
          <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          {stats.activeNow} ativos agora
        </span>
      </div>

      <Card className="mb-4 border border-amber-500/30 bg-amber-500/5 p-3">
        <div className="flex items-start gap-2 text-xs">
          <ExternalLink size={14} className="mt-0.5 text-amber-600" />
          <div className="flex-1">
            <p className="font-bold text-amber-700 dark:text-amber-400">Checkout externo (Flowspays)</p>
            <p className="text-muted-foreground">
              Este produto envia o cliente para um checkout fora da loja. O evento de "Compra" não pode ser
              capturado automaticamente — somente até o clique em <strong>Comprar Agora</strong>.
            </p>
            <a
              href={ESN_EXTERNAL_CHECKOUT}
              target="_blank"
              rel="noreferrer"
              className="mt-1 inline-flex items-center gap-1 text-amber-700 underline dark:text-amber-400"
            >
              Abrir checkout externo <ExternalLink size={11} />
            </a>
          </div>
        </div>
      </Card>

      <div className="mb-2 flex items-center justify-between">
        <Badge variant="secondary" className="text-[10px]">Produto: {ESN_NAME}</Badge>
      </div>

      <div className="mb-6 flex items-center gap-2">
        <span className="text-xs font-bold text-muted-foreground">Período:</span>
        {[15, 30, 60, 180, 1440].map((minutes) => (
          <button
            key={minutes}
            onClick={() => setPeriod(minutes)}
            className={`rounded-md px-3 py-1.5 text-xs font-bold transition-colors ${
              period === minutes
                ? "bg-primary text-primary-foreground"
                : "border border-border bg-secondary text-muted-foreground hover:bg-muted"
            }`}
          >
            {minutes >= 1440 ? "24h" : minutes >= 60 ? `${minutes / 60}h` : `${minutes}min`}
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
        <h3 className="mb-3 text-sm font-black uppercase text-foreground">Funil Visual ESN</h3>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart
            data={[
              { etapa: "Viram ESN", valor: stats.productViews },
              { etapa: "Carrinho", valor: stats.addToCart },
              { etapa: "Checkout", valor: stats.checkout },
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
              {["hsl(142, 71%, 45%)", "hsl(45, 93%, 47%)", "hsl(30, 100%, 50%)"].map((fill, index) => (
                <Cell key={index} fill={fill} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </Card>

      <Card className="mt-4 border border-border bg-background p-5 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-black text-foreground">Conversão Página → Checkout</h3>
            <p className="text-xs text-muted-foreground">% de visualizações que clicaram em Comprar Agora</p>
          </div>
          <div className="text-right">
            <p className="text-4xl font-black text-foreground">{productConversion}%</p>
            <p className="text-xs font-bold text-muted-foreground">
              {stats.checkout} de {stats.productViews} visualizações
            </p>
          </div>
        </div>
      </Card>

      <Card className="mt-4 border border-dashed border-border bg-background p-4">
        <div className="flex items-start gap-2 text-[11px] text-muted-foreground">
          <DollarSign size={14} className="mt-0.5 text-emerald-500" />
          <p>
            Para ver as vendas <strong>finalizadas</strong> deste combo, acesse o painel do gateway externo
            <span className="font-mono"> Flowspays</span>. As métricas acima refletem apenas a jornada dentro da loja Kazoom.
          </p>
        </div>
      </Card>
    </div>
  );
}
