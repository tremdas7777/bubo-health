import { useState, useEffect, useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { DollarSign, ShoppingCart, TrendingUp, Package, ArrowUpRight, ArrowDownRight, Loader2 } from 'lucide-react';

interface Order { id: string; amount_cents: number; status: string; created_at: string; buyer_name: string | null; buyer_email: string | null; }
const COLORS = ['hsl(var(--primary))', 'hsl(var(--muted-foreground))', 'hsl(142, 76%, 36%)', 'hsl(0, 84%, 60%)'];

export default function AdminDashboard() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<'7d' | '30d' | '90d'>('30d');

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      const daysMap = { '7d': 7, '30d': 30, '90d': 90 };
      const since = new Date(); since.setDate(since.getDate() - daysMap[period]);
      const { data } = await supabase.from('orders').select('*').gte('created_at', since.toISOString()).order('created_at', { ascending: true });
      setOrders((data as Order[]) || []); setLoading(false);
    };
    fetch();
  }, [period]);

  const metrics = useMemo(() => {
    const total = orders.length;
    const revenue = orders.reduce((s, o) => s + o.amount_cents, 0) / 100;
    const approved = orders.filter(o => o.status === 'approved' || o.status === 'paid');
    const pending = orders.filter(o => o.status === 'pending');
    const avgTicket = total > 0 ? revenue / total : 0;
    const conversionRate = total > 0 ? (approved.length / total) * 100 : 0;
    return { total, revenue, approved: approved.length, pending: pending.length, avgTicket, conversionRate };
  }, [orders]);

  const dailyData = useMemo(() => {
    const map: Record<string, { date: string; vendas: number; receita: number }> = {};
    orders.forEach(o => { const day = o.created_at.slice(0, 10); if (!map[day]) map[day] = { date: day, vendas: 0, receita: 0 }; map[day].vendas++; map[day].receita += o.amount_cents / 100; });
    return Object.values(map).sort((a, b) => a.date.localeCompare(b.date)).map(d => ({ ...d, date: new Date(d.date + 'T12:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }) }));
  }, [orders]);

  const statusData = useMemo(() => {
    const map: Record<string, number> = {};
    orders.forEach(o => { const s = o.status || 'pending'; map[s] = (map[s] || 0) + 1; });
    return Object.entries(map).map(([name, value]) => ({ name: name === 'pending' ? 'Pendente' : name === 'approved' || name === 'paid' ? 'Aprovado' : name === 'cancelled' ? 'Cancelado' : name, value }));
  }, [orders]);

  if (loading) return <div className="flex items-center justify-center py-20"><Loader2 size={32} className="animate-spin text-muted-foreground" /></div>;

  const statCards = [
    { icon: <ShoppingCart size={20} />, label: 'Total Pedidos', value: metrics.total, color: 'text-primary' },
    { icon: <DollarSign size={20} />, label: 'Receita Total', value: `R$ ${metrics.revenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, color: 'text-primary' },
    { icon: <TrendingUp size={20} />, label: 'Ticket Médio', value: `R$ ${metrics.avgTicket.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, color: 'text-primary' },
    { icon: <Package size={20} />, label: 'Taxa Aprovação', value: `${metrics.conversionRate.toFixed(1)}%`, color: 'text-primary' },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div><h2 className="text-xl font-black text-foreground">Dashboard</h2><p className="text-muted-foreground text-xs">Visão geral do desempenho da loja</p></div>
        <div className="flex gap-1 bg-muted p-1 rounded-md">
          {(['7d', '30d', '90d'] as const).map(p => (
            <button key={p} onClick={() => setPeriod(p)} className={`px-3 py-1.5 text-xs font-bold rounded transition-colors ${period === p ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}>
              {p === '7d' ? '7 dias' : p === '30d' ? '30 dias' : '90 dias'}
            </button>
          ))}
        </div>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {statCards.map((s, i) => (<Card key={i} className="p-4 border border-border"><div className="flex items-center gap-2 mb-2"><div className={s.color}>{s.icon}</div><span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">{s.label}</span></div><p className="text-xl font-black text-foreground">{s.value}</p></Card>))}
      </div>
      <div className="grid grid-cols-2 gap-3 mb-6">
        <Card className="p-4 border border-border"><div className="flex items-center gap-2"><div className="w-8 h-8 rounded-full bg-green-500/10 flex items-center justify-center"><ArrowUpRight size={16} className="text-green-500" /></div><div><p className="text-xs text-muted-foreground">Aprovados</p><p className="text-lg font-black text-foreground">{metrics.approved}</p></div></div></Card>
        <Card className="p-4 border border-border"><div className="flex items-center gap-2"><div className="w-8 h-8 rounded-full bg-amber-500/10 flex items-center justify-center"><ArrowDownRight size={16} className="text-amber-500" /></div><div><p className="text-xs text-muted-foreground">Pendentes</p><p className="text-lg font-black text-foreground">{metrics.pending}</p></div></div></Card>
      </div>
      <div className="grid md:grid-cols-3 gap-4 mb-6">
        <Card className="md:col-span-2 p-4 border border-border">
          <h3 className="text-sm font-bold text-foreground mb-3">Vendas por Dia</h3>
          {dailyData.length > 0 ? (<ResponsiveContainer width="100%" height={220}><BarChart data={dailyData}><CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" /><XAxis dataKey="date" tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} /><YAxis tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} /><Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 8, fontSize: 12 }} /><Bar dataKey="vendas" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} /></BarChart></ResponsiveContainer>) : (<p className="text-sm text-muted-foreground text-center py-10">Nenhum dado no período</p>)}
        </Card>
        <Card className="p-4 border border-border">
          <h3 className="text-sm font-bold text-foreground mb-3">Status dos Pedidos</h3>
          {statusData.length > 0 ? (<ResponsiveContainer width="100%" height={220}><PieChart><Pie data={statusData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={70} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>{statusData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}</Pie><Tooltip /></PieChart></ResponsiveContainer>) : (<p className="text-sm text-muted-foreground text-center py-10">Sem dados</p>)}
        </Card>
      </div>
      <Card className="p-4 border border-border mb-6">
        <h3 className="text-sm font-bold text-foreground mb-3">Receita por Dia (R$)</h3>
        {dailyData.length > 0 ? (<ResponsiveContainer width="100%" height={200}><LineChart data={dailyData}><CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" /><XAxis dataKey="date" tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} /><YAxis tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} /><Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 8, fontSize: 12 }} formatter={(value: number) => [`R$ ${value.toFixed(2)}`, 'Receita']} /><Line type="monotone" dataKey="receita" stroke="hsl(142, 76%, 36%)" strokeWidth={2} dot={{ r: 3 }} /></LineChart></ResponsiveContainer>) : (<p className="text-sm text-muted-foreground text-center py-10">Nenhum dado no período</p>)}
      </Card>
      <Card className="p-4 border border-border">
        <h3 className="text-sm font-bold text-foreground mb-3">Últimos Pedidos</h3>
        {orders.length > 0 ? (<div className="space-y-2 max-h-[300px] overflow-y-auto">{orders.slice(-10).reverse().map(o => (<div key={o.id} className="flex items-center justify-between py-2 border-b border-border last:border-0"><div><p className="text-xs font-bold text-foreground">{o.buyer_name || 'Sem nome'}</p><p className="text-[10px] text-muted-foreground">{new Date(o.created_at).toLocaleString('pt-BR')}</p></div><div className="text-right"><p className="text-xs font-bold text-foreground">R$ {(o.amount_cents / 100).toFixed(2)}</p><span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${o.status === 'approved' || o.status === 'paid' ? 'bg-green-500/10 text-green-600' : o.status === 'pending' ? 'bg-amber-500/10 text-amber-600' : 'bg-destructive/10 text-destructive'}`}>{o.status === 'pending' ? 'Pendente' : o.status === 'approved' || o.status === 'paid' ? 'Aprovado' : o.status}</span></div></div>))}</div>) : (<p className="text-sm text-muted-foreground text-center py-6">Nenhum pedido no período</p>)}
      </Card>
    </div>
  );
}
