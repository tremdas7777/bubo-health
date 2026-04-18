import { useState, useEffect, useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { supabase } from '@/integrations/supabase/client';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { DollarSign, ShoppingCart, TrendingUp, Package, ArrowUpRight, ArrowDownRight, Loader2, Calendar as CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import type { DateRange } from 'react-day-picker';

interface Order { id: string; amount_cents: number; status: string; created_at: string; buyer_name: string | null; buyer_email: string | null; }
const COLORS = ['hsl(var(--primary))', 'hsl(var(--muted-foreground))', 'hsl(142, 76%, 36%)', 'hsl(0, 84%, 60%)'];

type PresetPeriod = 'today' | 'yesterday' | '7d' | '30d' | '90d' | 'custom';

function getRangeForPreset(preset: PresetPeriod, custom?: DateRange): { from: Date; to: Date } {
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
  const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
  switch (preset) {
    case 'today':
      return { from: startOfToday, to: endOfToday };
    case 'yesterday': {
      const y = new Date(startOfToday); y.setDate(y.getDate() - 1);
      const yEnd = new Date(y); yEnd.setHours(23, 59, 59, 999);
      return { from: y, to: yEnd };
    }
    case '7d': { const f = new Date(startOfToday); f.setDate(f.getDate() - 6); return { from: f, to: endOfToday }; }
    case '30d': { const f = new Date(startOfToday); f.setDate(f.getDate() - 29); return { from: f, to: endOfToday }; }
    case '90d': { const f = new Date(startOfToday); f.setDate(f.getDate() - 89); return { from: f, to: endOfToday }; }
    case 'custom': {
      const from = custom?.from ?? startOfToday;
      const to = custom?.to ?? custom?.from ?? endOfToday;
      const toEnd = new Date(to); toEnd.setHours(23, 59, 59, 999);
      const fromStart = new Date(from); fromStart.setHours(0, 0, 0, 0);
      return { from: fromStart, to: toEnd };
    }
  }
}

export default function AdminDashboard() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [preset, setPreset] = useState<PresetPeriod>('today');
  const [customRange, setCustomRange] = useState<DateRange | undefined>();
  const [popoverOpen, setPopoverOpen] = useState(false);

  const range = useMemo(() => getRangeForPreset(preset, customRange), [preset, customRange]);

  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);
      const { data } = await supabase
        .from('orders')
        .select('*')
        .gte('created_at', range.from.toISOString())
        .lte('created_at', range.to.toISOString())
        .order('created_at', { ascending: true });
      setOrders((data as Order[]) || []);
      setLoading(false);
    };
    fetchOrders();
  }, [range.from, range.to]);

  const metrics = useMemo(() => {
    const total = orders.length;
    const approvedList = orders.filter(o => o.status === 'approved' || o.status === 'paid');
    const pending = orders.filter(o => o.status === 'pending');
    const cancelled = orders.filter(o => o.status === 'cancelled' || o.status === 'refused');
    const revenue = approvedList.reduce((s, o) => s + o.amount_cents, 0) / 100;
    const revenueTotal = orders.reduce((s, o) => s + o.amount_cents, 0) / 100;
    const avgTicket = approvedList.length > 0 ? revenue / approvedList.length : 0;
    const conversionRate = total > 0 ? (approvedList.length / total) * 100 : 0;
    return { total, revenue, revenueTotal, approved: approvedList.length, pending: pending.length, cancelled: cancelled.length, avgTicket, conversionRate };
  }, [orders]);

  const isSingleDay = useMemo(() => {
    const diff = range.to.getTime() - range.from.getTime();
    return diff <= 24 * 60 * 60 * 1000;
  }, [range]);

  const timeSeriesData = useMemo(() => {
    if (isSingleDay) {
      // Group by hour
      const map: Record<number, { label: string; vendas: number; receita: number }> = {};
      for (let h = 0; h < 24; h++) map[h] = { label: `${String(h).padStart(2, '0')}h`, vendas: 0, receita: 0 };
      orders.forEach(o => {
        const h = new Date(o.created_at).getHours();
        map[h].vendas++;
        if (o.status === 'approved' || o.status === 'paid') map[h].receita += o.amount_cents / 100;
      });
      return Object.values(map).map(d => ({ date: d.label, vendas: d.vendas, receita: d.receita }));
    }
    const map: Record<string, { date: string; vendas: number; receita: number }> = {};
    orders.forEach(o => {
      const day = o.created_at.slice(0, 10);
      if (!map[day]) map[day] = { date: day, vendas: 0, receita: 0 };
      map[day].vendas++;
      if (o.status === 'approved' || o.status === 'paid') map[day].receita += o.amount_cents / 100;
    });
    return Object.values(map).sort((a, b) => a.date.localeCompare(b.date)).map(d => ({ ...d, date: new Date(d.date + 'T12:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }) }));
  }, [orders, isSingleDay]);

  const statusData = useMemo(() => {
    const map: Record<string, number> = {};
    orders.forEach(o => { const s = o.status || 'pending'; map[s] = (map[s] || 0) + 1; });
    return Object.entries(map).map(([name, value]) => ({ name: name === 'pending' ? 'Pendente' : name === 'approved' || name === 'paid' ? 'Aprovado' : name === 'cancelled' ? 'Cancelado' : name === 'refused' ? 'Recusado' : name, value }));
  }, [orders]);

  const rangeLabel = useMemo(() => {
    if (preset === 'today') return 'Hoje';
    if (preset === 'yesterday') return 'Ontem';
    if (preset === '7d') return 'Últimos 7 dias';
    if (preset === '30d') return 'Últimos 30 dias';
    if (preset === '90d') return 'Últimos 90 dias';
    if (customRange?.from) {
      const fromStr = format(customRange.from, 'dd/MM/yyyy', { locale: ptBR });
      const toStr = customRange.to ? format(customRange.to, 'dd/MM/yyyy', { locale: ptBR }) : fromStr;
      return fromStr === toStr ? fromStr : `${fromStr} - ${toStr}`;
    }
    return 'Personalizado';
  }, [preset, customRange]);

  const presets: { key: PresetPeriod; label: string }[] = [
    { key: 'today', label: 'Hoje' },
    { key: 'yesterday', label: 'Ontem' },
    { key: '7d', label: '7d' },
    { key: '30d', label: '30d' },
    { key: '90d', label: '90d' },
  ];

  const statCards = [
    { icon: <ShoppingCart size={20} />, label: 'Total Pedidos', value: metrics.total },
    { icon: <DollarSign size={20} />, label: 'Receita Aprovada', value: `R$ ${metrics.revenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` },
    { icon: <TrendingUp size={20} />, label: 'Ticket Médio', value: `R$ ${metrics.avgTicket.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` },
    { icon: <Package size={20} />, label: 'Taxa Aprovação', value: `${metrics.conversionRate.toFixed(1)}%` },
  ];

  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-4">
        <div>
          <h2 className="text-xl font-black text-foreground">Dashboard</h2>
          <p className="text-muted-foreground text-xs">Período: <span className="font-bold text-foreground">{rangeLabel}</span></p>
        </div>
        <div className="flex flex-wrap items-center gap-1 bg-muted p-1 rounded-md">
          {presets.map(p => (
            <button
              key={p.key}
              onClick={() => { setPreset(p.key); setCustomRange(undefined); }}
              className={cn(
                'px-3 py-1.5 text-xs font-bold rounded transition-colors',
                preset === p.key ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
              )}
            >
              {p.label}
            </button>
          ))}
          <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className={cn(
                  'h-auto px-3 py-1.5 text-xs font-bold rounded gap-1.5',
                  preset === 'custom' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
                )}
              >
                <CalendarIcon size={14} />
                Data
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
              <Calendar
                mode="range"
                selected={customRange}
                onSelect={(r) => {
                  setCustomRange(r);
                  if (r?.from) setPreset('custom');
                  if (r?.from && r?.to) setPopoverOpen(false);
                }}
                numberOfMonths={2}
                locale={ptBR}
                className="p-3 pointer-events-auto"
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20"><Loader2 size={32} className="animate-spin text-muted-foreground" /></div>
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
            {statCards.map((s, i) => (
              <Card key={i} className="p-4 border border-border">
                <div className="flex items-center gap-2 mb-2">
                  <div className="text-primary">{s.icon}</div>
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">{s.label}</span>
                </div>
                <p className="text-xl font-black text-foreground">{s.value}</p>
              </Card>
            ))}
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-6">
            <Card className="p-4 border border-border">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-green-500/10 flex items-center justify-center"><ArrowUpRight size={16} className="text-green-500" /></div>
                <div><p className="text-xs text-muted-foreground">Aprovados</p><p className="text-lg font-black text-foreground">{metrics.approved}</p></div>
              </div>
            </Card>
            <Card className="p-4 border border-border">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-amber-500/10 flex items-center justify-center"><ArrowDownRight size={16} className="text-amber-500" /></div>
                <div><p className="text-xs text-muted-foreground">Pendentes</p><p className="text-lg font-black text-foreground">{metrics.pending}</p></div>
              </div>
            </Card>
            <Card className="p-4 border border-border col-span-2 md:col-span-1">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-destructive/10 flex items-center justify-center"><ArrowDownRight size={16} className="text-destructive" /></div>
                <div><p className="text-xs text-muted-foreground">Cancelados/Recusados</p><p className="text-lg font-black text-foreground">{metrics.cancelled}</p></div>
              </div>
            </Card>
          </div>

          <div className="grid md:grid-cols-3 gap-4 mb-6">
            <Card className="md:col-span-2 p-4 border border-border">
              <h3 className="text-sm font-bold text-foreground mb-3">{isSingleDay ? 'Vendas por Hora' : 'Vendas por Dia'}</h3>
              {timeSeriesData.some(d => d.vendas > 0) ? (
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={timeSeriesData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="date" tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} />
                    <YAxis tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} allowDecimals={false} />
                    <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 8, fontSize: 12 }} />
                    <Bar dataKey="vendas" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : <p className="text-sm text-muted-foreground text-center py-10">Nenhum pedido no período</p>}
            </Card>
            <Card className="p-4 border border-border">
              <h3 className="text-sm font-bold text-foreground mb-3">Status dos Pedidos</h3>
              {statusData.length > 0 ? (
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie data={statusData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={70} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                      {statusData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              ) : <p className="text-sm text-muted-foreground text-center py-10">Sem dados</p>}
            </Card>
          </div>

          <Card className="p-4 border border-border mb-6">
            <h3 className="text-sm font-bold text-foreground mb-3">Receita Aprovada {isSingleDay ? 'por Hora' : 'por Dia'} (R$)</h3>
            {timeSeriesData.some(d => d.receita > 0) ? (
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={timeSeriesData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="date" tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} />
                  <YAxis tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} />
                  <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 8, fontSize: 12 }} formatter={(value: number) => [`R$ ${value.toFixed(2)}`, 'Receita']} />
                  <Line type="monotone" dataKey="receita" stroke="hsl(142, 76%, 36%)" strokeWidth={2} dot={{ r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            ) : <p className="text-sm text-muted-foreground text-center py-10">Nenhuma receita aprovada no período</p>}
          </Card>

          <Card className="p-4 border border-border">
            <h3 className="text-sm font-bold text-foreground mb-3">Últimos Pedidos</h3>
            {orders.length > 0 ? (
              <div className="space-y-2 max-h-[300px] overflow-y-auto">
                {orders.slice(-10).reverse().map(o => (
                  <div key={o.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                    <div>
                      <p className="text-xs font-bold text-foreground">{o.buyer_name || 'Sem nome'}</p>
                      <p className="text-[10px] text-muted-foreground">{new Date(o.created_at).toLocaleString('pt-BR')}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-bold text-foreground">R$ {(o.amount_cents / 100).toFixed(2)}</p>
                      <span className={cn(
                        'text-[10px] font-bold px-2 py-0.5 rounded-full',
                        o.status === 'approved' || o.status === 'paid' ? 'bg-green-500/10 text-green-600' :
                        o.status === 'pending' ? 'bg-amber-500/10 text-amber-600' :
                        'bg-destructive/10 text-destructive'
                      )}>
                        {o.status === 'pending' ? 'Pendente' : o.status === 'approved' || o.status === 'paid' ? 'Aprovado' : o.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : <p className="text-sm text-muted-foreground text-center py-6">Nenhum pedido no período</p>}
          </Card>
        </>
      )}
    </div>
  );
}
