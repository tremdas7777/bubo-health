import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Save, Truck, Plus, Trash2, Loader2 } from 'lucide-react';

interface ShippingOption { id: string; name: string; price_cents: number; estimated_days: string; }
interface ShippingConfig { id: string; free_shipping_enabled: boolean; free_shipping_min_cents: number; flat_rate_enabled: boolean; flat_rate_cents: number; shipping_options: ShippingOption[]; }

export default function AdminFrete() {
  const [config, setConfig] = useState<ShippingConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => { loadConfig(); }, []);

  async function loadConfig() {
    setLoading(true);
    const { data } = await supabase.from('shipping_config').select('*').limit(1).single();
    if (data) setConfig({ ...data, shipping_options: Array.isArray(data.shipping_options) ? (data.shipping_options as unknown as ShippingOption[]) : [] });
    setLoading(false);
  }

  async function handleSave() {
    if (!config) return; setSaving(true);
    const { error } = await supabase.from('shipping_config').update({ free_shipping_enabled: config.free_shipping_enabled, free_shipping_min_cents: config.free_shipping_min_cents, flat_rate_enabled: config.flat_rate_enabled, flat_rate_cents: config.flat_rate_cents, shipping_options: config.shipping_options as any }).eq('id', config.id);
    setMessage(error ? '❌ Erro ao salvar configuração' : '✅ Configuração de frete salva com sucesso!');
    setSaving(false); setTimeout(() => setMessage(''), 4000);
  }

  function addOption() { if (!config) return; setConfig({ ...config, shipping_options: [...config.shipping_options, { id: crypto.randomUUID(), name: '', price_cents: 0, estimated_days: '' }] }); }
  function removeOption(id: string) { if (!config) return; setConfig({ ...config, shipping_options: config.shipping_options.filter(o => o.id !== id) }); }
  function updateOption(id: string, updates: Partial<ShippingOption>) { if (!config) return; setConfig({ ...config, shipping_options: config.shipping_options.map(o => o.id === id ? { ...o, ...updates } : o) }); }

  if (loading) return <div className="flex items-center justify-center py-12"><Loader2 className="animate-spin text-primary" size={24} /></div>;
  if (!config) return <p className="text-muted-foreground text-sm">Erro ao carregar configuração de frete.</p>;

  return (
    <div className="space-y-6">
      <div><h2 className="text-xl font-black text-foreground flex items-center gap-2"><Truck size={22} className="text-primary" />Configuração de Frete</h2><p className="text-muted-foreground text-xs mt-1">Configure as opções de frete do checkout</p></div>
      <Card className="p-5 border border-border">
        <div className="flex items-center justify-between mb-4"><div><h3 className="text-sm font-bold text-foreground">Frete Grátis</h3><p className="text-xs text-muted-foreground">Ofereça frete grátis para seus clientes</p></div><Switch checked={config.free_shipping_enabled} onCheckedChange={v => setConfig({ ...config, free_shipping_enabled: v })} /></div>
        {config.free_shipping_enabled && <div><Label className="text-xs font-medium text-muted-foreground">Valor mínimo para frete grátis (R$)</Label><Input type="number" step="0.01" min="0" value={(config.free_shipping_min_cents / 100).toFixed(2)} onChange={e => setConfig({ ...config, free_shipping_min_cents: Math.round(parseFloat(e.target.value || '0') * 100) })} className="mt-1.5 max-w-xs" placeholder="0.00 = sempre grátis" /><p className="text-[10px] text-muted-foreground mt-1">Deixe 0 para frete grátis em todos os pedidos</p></div>}
      </Card>
      <Card className="p-5 border border-border">
        <div className="flex items-center justify-between mb-4"><div><h3 className="text-sm font-bold text-foreground">Taxa Fixa de Frete</h3><p className="text-xs text-muted-foreground">Cobrar um valor fixo de frete quando não for grátis</p></div><Switch checked={config.flat_rate_enabled} onCheckedChange={v => setConfig({ ...config, flat_rate_enabled: v })} /></div>
        {config.flat_rate_enabled && <div><Label className="text-xs font-medium text-muted-foreground">Valor do frete fixo (R$)</Label><Input type="number" step="0.01" min="0" value={(config.flat_rate_cents / 100).toFixed(2)} onChange={e => setConfig({ ...config, flat_rate_cents: Math.round(parseFloat(e.target.value || '0') * 100) })} className="mt-1.5 max-w-xs" /></div>}
      </Card>
      <Card className="p-5 border border-border">
        <div className="flex items-center justify-between mb-4"><div><h3 className="text-sm font-bold text-foreground">Opções de Frete Customizadas</h3><p className="text-xs text-muted-foreground">Adicione opções como SEDEX, PAC, etc.</p></div><Button onClick={addOption} size="sm" variant="outline" className="text-xs font-bold"><Plus size={14} className="mr-1" /> Adicionar</Button></div>
        {config.shipping_options.length === 0 && <p className="text-xs text-muted-foreground text-center py-4">Nenhuma opção customizada adicionada</p>}
        <div className="space-y-3">{config.shipping_options.map(option => (
          <div key={option.id} className="flex items-start gap-3 bg-muted/30 rounded-lg p-3">
            <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-2">
              <div><Label className="text-[10px] font-medium text-muted-foreground">Nome</Label><Input value={option.name} onChange={e => updateOption(option.id, { name: e.target.value })} placeholder="Ex: SEDEX" className="mt-1 text-sm" /></div>
              <div><Label className="text-[10px] font-medium text-muted-foreground">Preço (R$)</Label><Input type="number" step="0.01" min="0" value={(option.price_cents / 100).toFixed(2)} onChange={e => updateOption(option.id, { price_cents: Math.round(parseFloat(e.target.value || '0') * 100) })} className="mt-1 text-sm" /></div>
              <div><Label className="text-[10px] font-medium text-muted-foreground">Prazo</Label><Input value={option.estimated_days} onChange={e => updateOption(option.id, { estimated_days: e.target.value })} placeholder="Ex: 3-5 dias úteis" className="mt-1 text-sm" /></div>
            </div>
            <button onClick={() => removeOption(option.id)} className="mt-5 text-destructive hover:text-destructive/80"><Trash2 size={16} /></button>
          </div>
        ))}</div>
      </Card>
      {message && <div className={`p-2.5 rounded-md text-center text-xs font-bold ${message.includes('sucesso') ? 'bg-emerald-500/10 text-emerald-500' : 'bg-destructive/10 text-destructive'}`}>{message}</div>}
      <Button onClick={handleSave} disabled={saving} className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold">{saving ? <Loader2 size={16} className="mr-2 animate-spin" /> : <Save size={16} className="mr-2" />}Salvar Configuração de Frete</Button>
    </div>
  );
}
