import { useState, useEffect, useRef, useMemo } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { DB_PRODUCTS_QUERY_KEY } from '@/hooks/useProducts';
import { getAdminPassword } from '@/lib/paymentGateway';
import { toast } from 'sonner';
import { Plus, Trash2, Edit, Upload, Download, Search, GripVertical, Image as ImageIcon, Loader2, RefreshCw, Eye, EyeOff, Star, StarOff, Copy, FolderOpen, Package, X, FileText, Save } from 'lucide-react';

interface DbProduct { id: string; name: string; slug: string; price_cents: number; original_price_cents: number | null; image_url: string | null; images: string[] | null; category: string | null; description: string | null; description_html: string | null; variants: any; featured: boolean | null; active: boolean | null; sort_order: number | null; created_at: string; updated_at: string; gtin: string | null; }
interface Collection { id: string; name: string; slug: string; description: string | null; image_url: string | null; sort_order: number | null; active: boolean | null; created_at: string; }
type SubTab = 'produtos' | 'colecoes' | 'importar';

const defaultProduct: Partial<DbProduct> = { name: '', slug: '', price_cents: 0, original_price_cents: null, image_url: '', images: [], category: 'Geral', description: '', description_html: '', variants: [], featured: false, active: true, sort_order: 0 };

function slugify(text: string): string { return text.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''); }

export default function AdminProdutos() {
  const queryClient = useQueryClient();
  const [products, setProducts] = useState<DbProduct[]>([]);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(true);
  const [subTab, setSubTab] = useState<SubTab>('produtos');
  const [search, setSearch] = useState('');
  const [filterCat, setFilterCat] = useState('todos');
  const [filterStatus, setFilterStatus] = useState<'todos' | 'active' | 'inactive'>('todos');
  const [editProduct, setEditProduct] = useState<Partial<DbProduct> | null>(null);
  const [editCollection, setEditCollection] = useState<Partial<Collection> | null>(null);
  const [saving, setSaving] = useState(false);
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [csvPreview, setCsvPreview] = useState<any[]>([]);
  const [importing, setImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragIdx, setDragIdx] = useState<number | null>(null);
  const [dragOverIdx, setDragOverIdx] = useState<number | null>(null);
  const [colDragIdx, setColDragIdx] = useState<number | null>(null);
  const [colDragOverIdx, setColDragOverIdx] = useState<number | null>(null);
  const [uploading, setUploading] = useState(false);
  const imgUploadRef = useRef<HTMLInputElement>(null);
  const colImgUploadRef = useRef<HTMLInputElement>(null);

  const uploadImage = async (file: File): Promise<string | null> => {
    const adminPassword = getAdminPassword();
    if (!adminPassword) { toast.error('Sessão expirada'); return null; }
    const formData = new FormData();
    formData.append('password', adminPassword);
    formData.append('file', file);
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const res = await fetch(`${supabaseUrl}/functions/v1/upload-product-image`, {
      method: 'POST',
      headers: { 'apikey': import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY },
      body: formData,
    });
    const data = await res.json();
    if (data.error) { toast.error('Erro no upload: ' + data.error); return null; }
    return data.url;
  };

  const handleProductImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setUploading(true);
    const urls: string[] = [];
    for (const file of Array.from(files)) {
      const url = await uploadImage(file);
      if (url) urls.push(url);
    }
    if (urls.length > 0) {
      setEditProduct(p => {
        const current = p?.images || [];
        const updated = [...current, ...urls];
        return { ...p, images: updated, image_url: updated[0] || '' };
      });
      toast.success(`${urls.length} imagem(ns) enviada(s)!`);
    }
    setUploading(false);
    if (imgUploadRef.current) imgUploadRef.current.value = '';
  };

  const handleCollectionImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const url = await uploadImage(file);
    if (url) {
      setEditCollection(c => ({ ...c, image_url: url }));
      toast.success('Imagem enviada!');
    }
    setUploading(false);
    if (colImgUploadRef.current) colImgUploadRef.current.value = '';
  };

  const fetchProducts = async () => { setLoading(true); const { data } = await supabase.from('products').select('*').order('sort_order', { ascending: true }).order('created_at', { ascending: false }); setProducts((data as DbProduct[]) || []); setLoading(false); };
  const fetchCollections = async () => { const { data } = await supabase.from('collections').select('*').order('sort_order', { ascending: true }); setCollections((data as Collection[]) || []); };
  useEffect(() => { fetchProducts(); fetchCollections(); }, []);

  const categories = useMemo(() => { const cats = new Set(products.map(p => p.category || 'Sem categoria')); return ['todos', ...Array.from(cats)]; }, [products]);
  const filtered = useMemo(() => products.filter(p => { if (search && !p.name.toLowerCase().includes(search.toLowerCase())) return false; if (filterCat !== 'todos' && p.category !== filterCat) return false; if (filterStatus === 'active' && !p.active) return false; if (filterStatus === 'inactive' && p.active) return false; return true; }), [products, search, filterCat, filterStatus]);

  const saveProduct = async () => {
    if (!editProduct?.name || !editProduct.slug) { toast.error('Nome e slug são obrigatórios'); return; }
    const adminPassword = getAdminPassword();
    if (!adminPassword) { toast.error('Sua sessão do admin expirou. Entre novamente.'); return; }

    setSaving(true);
    const payload = { name: editProduct.name, slug: editProduct.slug, price_cents: editProduct.price_cents || 0, original_price_cents: editProduct.original_price_cents || null, image_url: editProduct.image_url || null, images: editProduct.images || [], category: editProduct.category || 'Geral', description: editProduct.description || '', description_html: editProduct.description_html || '', variants: editProduct.variants || [], featured: editProduct.featured || false, active: editProduct.active !== false, sort_order: editProduct.sort_order || 0, gtin: editProduct.gtin || null };

    const { data, error } = await supabase.functions.invoke('save-admin-product', {
      body: {
        password: adminPassword,
        product: {
          id: editProduct.id,
          ...payload,
        },
      },
    });

    if (error || data?.error) {
      toast.error('Erro: ' + (error?.message || data?.error || 'Falha ao salvar produto'));
      setSaving(false);
      return;
    }

    await Promise.all([
      queryClient.invalidateQueries({ queryKey: DB_PRODUCTS_QUERY_KEY }),
      fetchProducts(),
    ]);

    toast.success(editProduct.id ? 'Produto atualizado!' : 'Produto criado!');
    setSaving(false);
    setEditProduct(null);
  };

  const adminAction = async (action: string, id?: string, data?: any) => {
    const pw = getAdminPassword();
    if (!pw) { toast.error('Sessão expirada'); return false; }
    const { data: res, error } = await supabase.functions.invoke('admin-action', {
      body: { password: pw, action, id, data },
    });
    if (error || res?.error) { toast.error(error?.message || res?.error || 'Erro'); return false; }
    return true;
  };

  const deleteProduct = async (id: string) => { if (!confirm('Excluir este produto?')) return; if (await adminAction('delete', id)) { toast.success('Produto excluído'); fetchProducts(); } };
  const duplicateProduct = async (product: DbProduct) => { if (await adminAction('duplicate', product.id)) { toast.success('Duplicado!'); fetchProducts(); } };
  const toggleActive = async (product: DbProduct) => { if (await adminAction('toggle-active', product.id, { active: !product.active })) fetchProducts(); };
  const toggleFeatured = async (product: DbProduct) => { if (await adminAction('toggle-featured', product.id, { featured: !product.featured })) fetchProducts(); };

  const handleDragDrop = async (fromIndex: number, toIndex: number) => {
    if (fromIndex === toIndex) return;
    const reordered = [...filtered]; const [moved] = reordered.splice(fromIndex, 1); reordered.splice(toIndex, 0, moved);
    if (await adminAction('reorder', undefined, { items: reordered.map((p, i) => ({ id: p.id, sort_order: i })) })) { fetchProducts(); toast.success('Ordem atualizada!'); }
  };

  const saveCollection = async () => {
    if (!editCollection?.name || !editCollection.slug) { toast.error('Nome e slug são obrigatórios'); return; }
    setSaving(true);
    const payload = { id: editCollection.id, name: editCollection.name, slug: editCollection.slug, description: editCollection.description || '', image_url: editCollection.image_url || null, sort_order: editCollection.sort_order || 0, active: editCollection.active !== false };
    if (await adminAction('save-collection', undefined, payload)) {
      toast.success(editCollection.id ? 'Coleção atualizada!' : 'Coleção criada!');
      setEditCollection(null); fetchCollections();
    }
    setSaving(false);
  };
  const deleteCollection = async (id: string) => { if (!confirm('Excluir?')) return; if (await adminAction('delete-collection', id)) { toast.success('Excluída'); fetchCollections(); } };
  const toggleCollectionActive = async (col: Collection) => { if (await adminAction('toggle-collection-active', col.id, { active: !col.active })) fetchCollections(); };
  const handleColDragDrop = async (fromIndex: number, toIndex: number) => {
    if (fromIndex === toIndex) return;
    const reordered = [...collections]; const [moved] = reordered.splice(fromIndex, 1); reordered.splice(toIndex, 0, moved);
    if (await adminAction('reorder-collections', undefined, { items: reordered.map((c, i) => ({ id: c.id, sort_order: i })) })) { fetchCollections(); toast.success('Ordem atualizada!'); }
  };

  const handleCsvSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return; setCsvFile(file);
    const reader = new FileReader();
    reader.onload = (ev) => { const text = ev.target?.result as string; const lines = text.split('\n').filter(l => l.trim()); if (lines.length < 2) return; const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, '').toLowerCase()); const rows = lines.slice(1).map(line => { const vals = line.match(/(".*?"|[^,]+)/g)?.map(v => v.trim().replace(/^"|"$/g, '')) || []; const row: Record<string, string> = {}; headers.forEach((h, i) => { row[h] = vals[i] || ''; }); return row; }); setCsvPreview(rows.slice(0, 50)); };
    reader.readAsText(file);
  };

  const importCsv = async () => {
    if (csvPreview.length === 0) return; setImporting(true); let success = 0; let errors = 0;
    const pw = getAdminPassword();
    if (!pw) { toast.error('Sessão expirada'); setImporting(false); return; }
    for (const row of csvPreview) {
      const name = row['nome'] || row['name'] || ''; if (!name) { errors++; continue; }
      const slug = row['slug'] || slugify(name);
      const price_cents = Math.round(parseFloat((row['preco'] || row['price'] || '0').replace(',', '.')) * 100) || 0;
      const origStr = row['preco_original'] || row['original_price'] || '';
      const original_price_cents = origStr ? Math.round(parseFloat(origStr.replace(',', '.')) * 100) : null;
      const category = row['categoria'] || row['category'] || 'Geral';
      const image_url = row['imagem'] || row['image'] || '';
      const imagesStr = row['imagens'] || row['images'] || '';
      const images = imagesStr ? imagesStr.split('|').map((u: string) => u.trim()).filter(Boolean) : (image_url ? [image_url] : []);
      const product = { name, slug, price_cents, original_price_cents, category, description: row['descricao'] || '', image_url: image_url || null, images, featured: ['sim', 'true'].includes((row['destaque'] || '').toLowerCase()), active: !['nao', 'false'].includes((row['ativo'] || 'true').toLowerCase()), sort_order: success };
      const { data, error } = await supabase.functions.invoke('save-admin-product', { body: { password: pw, product } });
      if (error || data?.error) errors++; else success++;
    }
    toast.success(`${success} importados, ${errors} erros`); setImporting(false); setCsvFile(null); setCsvPreview([]); fetchProducts();
  };

  const exportCsv = () => {
    const headers = ['nome', 'slug', 'preco', 'preco_original', 'categoria', 'descricao', 'imagem', 'imagens', 'destaque', 'ativo'];
    const rows = products.map(p => [p.name, p.slug, (p.price_cents / 100).toFixed(2), p.original_price_cents ? (p.original_price_cents / 100).toFixed(2) : '', p.category || '', p.description || '', p.image_url || '', (p.images || []).join('|'), p.featured ? 'sim' : 'nao', p.active ? 'sim' : 'nao']);
    const csv = [headers.join(','), ...rows.map(r => r.map(c => `"${(c || '').replace(/"/g, '""')}"`).join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' }); const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = `produtos_kazoom_${new Date().toISOString().slice(0, 10)}.csv`; a.click(); URL.revokeObjectURL(url); toast.success('CSV exportado!');
  };

  const subTabs: { id: SubTab; label: string; icon: React.ReactNode }[] = [{ id: 'produtos', label: 'Produtos', icon: <Package size={14} /> }, { id: 'colecoes', label: 'Coleções', icon: <FolderOpen size={14} /> }, { id: 'importar', label: 'Importar/Exportar', icon: <Upload size={14} /> }];

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div><h2 className="text-xl font-black text-foreground">Produtos & Coleções</h2><p className="text-muted-foreground text-xs">{products.length} produtos cadastrados</p></div>
        <Button onClick={fetchProducts} variant="outline" size="sm" className="text-xs" disabled={loading}>{loading ? <Loader2 size={14} className="mr-1 animate-spin" /> : <RefreshCw size={14} className="mr-1" />}Atualizar</Button>
      </div>
      <div className="flex gap-1 mb-4 bg-muted p-1 rounded-md">{subTabs.map(t => (<button key={t.id} onClick={() => setSubTab(t.id)} className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-bold rounded transition-colors ${subTab === t.id ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}>{t.icon} {t.label}</button>))}</div>

      {subTab === 'produtos' && (
        <div>
          <div className="flex flex-wrap gap-2 mb-4">
            <Button onClick={() => setEditProduct({ ...defaultProduct })} size="sm" className="text-xs"><Plus size={14} className="mr-1" /> Novo Produto</Button>
            <div className="flex-1 min-w-[200px]"><div className="relative"><Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" /><Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar..." className="pl-9 text-xs h-9" /></div></div>
            <Select value={filterCat} onValueChange={setFilterCat}><SelectTrigger className="w-[160px] h-9 text-xs"><SelectValue /></SelectTrigger><SelectContent>{categories.map(c => <SelectItem key={c} value={c} className="text-xs">{c === 'todos' ? 'Todas categorias' : c}</SelectItem>)}</SelectContent></Select>
            <Select value={filterStatus} onValueChange={(v: any) => setFilterStatus(v)}><SelectTrigger className="w-[120px] h-9 text-xs"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="todos" className="text-xs">Todos</SelectItem><SelectItem value="active" className="text-xs">Ativos</SelectItem><SelectItem value="inactive" className="text-xs">Inativos</SelectItem></SelectContent></Select>
          </div>
          {loading ? <div className="flex items-center justify-center py-20"><Loader2 size={32} className="animate-spin text-muted-foreground" /></div> : filtered.length === 0 ? (
            <Card className="p-8 text-center border border-border"><Package size={40} className="mx-auto text-muted-foreground mb-3" /><p className="text-sm text-muted-foreground">Nenhum produto encontrado</p><Button onClick={() => setEditProduct({ ...defaultProduct })} size="sm" className="mt-3 text-xs"><Plus size={14} className="mr-1" /> Criar primeiro produto</Button></Card>
          ) : (
            <div className="space-y-1">{filtered.map((product, idx) => (
              <Card key={product.id} draggable onDragStart={() => setDragIdx(idx)} onDragOver={(e) => { e.preventDefault(); setDragOverIdx(idx); }} onDragLeave={() => setDragOverIdx(null)} onDrop={(e) => { e.preventDefault(); if (dragIdx !== null) handleDragDrop(dragIdx, idx); setDragIdx(null); setDragOverIdx(null); }} onDragEnd={() => { setDragIdx(null); setDragOverIdx(null); }} className={`p-3 border transition-all cursor-grab ${!product.active ? 'opacity-50 border-border' : 'border-border hover:border-primary/30'} ${dragIdx === idx ? 'opacity-40 scale-95' : ''} ${dragOverIdx === idx && dragIdx !== idx ? 'border-primary border-2 bg-primary/5' : ''}`}>
                <div className="flex items-center gap-3">
                  <GripVertical size={18} className="text-muted-foreground shrink-0" />
                  <div className="w-14 h-14 rounded bg-muted overflow-hidden shrink-0">{product.image_url ? <img src={product.image_url} alt="" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center"><ImageIcon size={18} className="text-muted-foreground" /></div>}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5"><p className="text-sm font-bold text-foreground truncate">{product.name}</p>{product.featured && <Star size={12} className="text-primary fill-primary shrink-0" />}</div>
                    <div className="flex items-center gap-2 text-[10px] text-muted-foreground"><span>/{product.slug}</span><span>•</span><span>{product.category}</span></div>
                    <div className="flex items-center gap-2 mt-1">
                      {product.original_price_cents && <span className="text-[10px] text-muted-foreground line-through">R$ {(product.original_price_cents / 100).toFixed(2)}</span>}
                      <span className="text-xs font-bold text-foreground">R$ {(product.price_cents / 100).toFixed(2)}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <button onClick={() => toggleFeatured(product)} className="p-1.5 rounded hover:bg-muted">{product.featured ? <Star size={14} className="text-primary fill-primary" /> : <StarOff size={14} className="text-muted-foreground" />}</button>
                    <button onClick={() => toggleActive(product)} className="p-1.5 rounded hover:bg-muted">{product.active ? <Eye size={14} className="text-emerald-500" /> : <EyeOff size={14} className="text-muted-foreground" />}</button>
                    <button onClick={() => duplicateProduct(product)} className="p-1.5 rounded hover:bg-muted"><Copy size={14} className="text-muted-foreground" /></button>
                    <button onClick={() => setEditProduct({ ...product })} className="p-1.5 rounded hover:bg-muted"><Edit size={14} className="text-primary" /></button>
                    <button onClick={() => deleteProduct(product.id)} className="p-1.5 rounded hover:bg-muted"><Trash2 size={14} className="text-destructive" /></button>
                  </div>
                </div>
              </Card>
            ))}</div>
          )}
        </div>
      )}

      {subTab === 'colecoes' && (
        <div>
          <Button onClick={() => setEditCollection({ name: '', slug: '', description: '', active: true, sort_order: 0 })} size="sm" className="text-xs mb-4"><Plus size={14} className="mr-1" /> Nova Coleção</Button>
          {collections.length === 0 ? <Card className="p-8 text-center border border-border"><FolderOpen size={40} className="mx-auto text-muted-foreground mb-3" /><p className="text-sm text-muted-foreground">Nenhuma coleção criada</p></Card> : (
            <div className="space-y-1">{collections.map((col, idx) => (
              <Card key={col.id} draggable onDragStart={() => setColDragIdx(idx)} onDragOver={(e) => { e.preventDefault(); setColDragOverIdx(idx); }} onDragLeave={() => setColDragOverIdx(null)} onDrop={(e) => { e.preventDefault(); if (colDragIdx !== null) handleColDragDrop(colDragIdx, idx); setColDragIdx(null); setColDragOverIdx(null); }} onDragEnd={() => { setColDragIdx(null); setColDragOverIdx(null); }} className={`p-3 border transition-all cursor-grab ${!col.active ? 'opacity-50 border-border' : 'border-border hover:border-primary/30'} ${colDragIdx === idx ? 'opacity-40 scale-95' : ''} ${colDragOverIdx === idx && colDragIdx !== idx ? 'border-primary border-2 bg-primary/5' : ''}`}>
                <div className="flex items-center gap-3">
                  <GripVertical size={18} className="text-muted-foreground shrink-0" />
                  <div className="w-10 h-10 rounded bg-muted overflow-hidden shrink-0">{col.image_url ? <img src={col.image_url} alt="" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center"><FolderOpen size={16} className="text-muted-foreground" /></div>}</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-foreground truncate">{col.name}</p>
                    <p className="text-[10px] text-muted-foreground">/{col.slug}</p>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <button onClick={() => toggleCollectionActive(col)} className="p-1.5 rounded hover:bg-muted">{col.active ? <Eye size={14} className="text-emerald-500" /> : <EyeOff size={14} className="text-muted-foreground" />}</button>
                    <button onClick={() => setEditCollection({ ...col })} className="p-1.5 rounded hover:bg-muted"><Edit size={14} className="text-primary" /></button>
                    <button onClick={() => deleteCollection(col.id)} className="p-1.5 rounded hover:bg-muted"><Trash2 size={14} className="text-destructive" /></button>
                  </div>
                </div>
              </Card>
            ))}</div>
          )}
        </div>
      )}

      {subTab === 'importar' && (
        <div className="space-y-4">
          <Card className="p-4 border border-border"><h3 className="text-sm font-bold text-foreground mb-2 flex items-center gap-2"><Download size={16} /> Exportar Produtos</h3><Button onClick={exportCsv} variant="outline" size="sm" className="text-xs"><Download size={14} className="mr-1" /> Exportar CSV ({products.length} produtos)</Button></Card>
          <Card className="p-4 border border-border">
            <h3 className="text-sm font-bold text-foreground mb-2 flex items-center gap-2"><Upload size={16} /> Importar Produtos via CSV</h3>
            <p className="text-xs text-muted-foreground mb-2">Colunas: <code className="bg-muted px-1 py-0.5 rounded text-[10px]">nome, slug, preco, preco_original, categoria, descricao, imagem, imagens, destaque, ativo</code></p>
            <input ref={fileInputRef} type="file" accept=".csv" onChange={handleCsvSelect} className="hidden" />
            <Button onClick={() => fileInputRef.current?.click()} variant="outline" size="sm" className="text-xs mb-3"><Upload size={14} className="mr-1" /> Selecionar CSV</Button>
            {csvFile && <p className="text-xs text-foreground mb-2">📄 {csvFile.name} — {csvPreview.length} produtos</p>}
            {csvPreview.length > 0 && <Button onClick={importCsv} disabled={importing} className="text-xs">{importing ? <Loader2 size={14} className="mr-1 animate-spin" /> : <Upload size={14} className="mr-1" />}Importar {csvPreview.length} Produtos</Button>}
          </Card>
        </div>
      )}

      <Dialog open={!!editProduct} onOpenChange={(open) => { if (!open) setEditProduct(null); }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editProduct?.id ? 'Editar Produto' : 'Novo Produto'}</DialogTitle></DialogHeader>
          {editProduct && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div><label className="text-[10px] font-bold text-muted-foreground uppercase">Nome *</label><Input value={editProduct.name || ''} onChange={e => { const name = e.target.value; setEditProduct(p => ({ ...p, name, slug: p?.id ? p.slug : slugify(name) })); }} className="text-sm mt-1" /></div>
                <div><label className="text-[10px] font-bold text-muted-foreground uppercase">Slug *</label><Input value={editProduct.slug || ''} onChange={e => setEditProduct(p => ({ ...p, slug: e.target.value }))} className="text-sm mt-1 font-mono" /></div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div><label className="text-[10px] font-bold text-muted-foreground uppercase">Preço (R$) *</label><Input type="number" step="0.01" value={editProduct.price_cents ? (editProduct.price_cents / 100).toFixed(2) : ''} onChange={e => setEditProduct(p => ({ ...p, price_cents: Math.round(parseFloat(e.target.value || '0') * 100) }))} className="text-sm mt-1" /></div>
                <div><label className="text-[10px] font-bold text-muted-foreground uppercase">Preço Original (R$)</label><Input type="number" step="0.01" value={editProduct.original_price_cents ? (editProduct.original_price_cents / 100).toFixed(2) : ''} onChange={e => setEditProduct(p => ({ ...p, original_price_cents: e.target.value ? Math.round(parseFloat(e.target.value) * 100) : null }))} className="text-sm mt-1" /></div>
                <div><label className="text-[10px] font-bold text-muted-foreground uppercase">Categoria</label><Input value={editProduct.category || ''} onChange={e => setEditProduct(p => ({ ...p, category: e.target.value }))} className="text-sm mt-1" /></div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="text-[10px] font-bold text-muted-foreground uppercase">GTIN / EAN</label><Input value={editProduct.gtin || ''} onChange={e => setEditProduct(p => ({ ...p, gtin: e.target.value }))} placeholder="Ex: 7891234567890" className="text-sm mt-1 font-mono" /></div>
                <div><label className="text-[10px] font-bold text-muted-foreground uppercase">Ordem</label><Input type="number" value={editProduct.sort_order || 0} onChange={e => setEditProduct(p => ({ ...p, sort_order: parseInt(e.target.value) || 0 }))} className="text-sm mt-1" /></div>
              </div>
              <div><label className="text-[10px] font-bold text-muted-foreground uppercase">Descrição</label><Textarea value={editProduct.description || ''} onChange={e => setEditProduct(p => ({ ...p, description: e.target.value }))} className="text-sm mt-1" rows={3} /></div>
              <div><label className="text-[10px] font-bold text-muted-foreground uppercase">Descrição HTML</label><Textarea value={editProduct.description_html || ''} onChange={e => setEditProduct(p => ({ ...p, description_html: e.target.value }))} className="text-sm mt-1 font-mono" rows={4} /></div>
              <div>
                <label className="text-[10px] font-bold text-muted-foreground uppercase mb-1 block">Imagens ({(editProduct.images || []).length})</label>
                <div className="space-y-2">
                  {(editProduct.images || []).map((url, i) => (<div key={i} className="flex items-center gap-2"><div className="w-10 h-10 bg-muted rounded overflow-hidden shrink-0"><img src={url} alt="" className="w-full h-full object-cover" onError={e => (e.currentTarget.style.display = 'none')} /></div><Input value={url} onChange={e => { const imgs = [...(editProduct.images || [])]; imgs[i] = e.target.value; setEditProduct(p => ({ ...p, images: imgs, image_url: imgs[0] || '' })); }} className="text-xs font-mono flex-1" /><button onClick={() => { const imgs = (editProduct.images || []).filter((_, j) => j !== i); setEditProduct(p => ({ ...p, images: imgs, image_url: imgs[0] || '' })); }} className="p-1 text-destructive"><X size={14} /></button></div>))}
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="text-xs" onClick={() => setEditProduct(p => ({ ...p, images: [...(p?.images || []), ''] }))}><Plus size={14} className="mr-1" /> URL</Button>
                    <input ref={imgUploadRef} type="file" accept="image/*" multiple onChange={handleProductImageUpload} className="hidden" />
                    <Button variant="outline" size="sm" className="text-xs" onClick={() => imgUploadRef.current?.click()} disabled={uploading}>{uploading ? <Loader2 size={14} className="mr-1 animate-spin" /> : <Upload size={14} className="mr-1" />} Upload do PC</Button>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2"><Switch checked={editProduct.active !== false} onCheckedChange={v => setEditProduct(p => ({ ...p, active: v }))} /><span className="text-xs font-medium text-foreground">Ativo</span></div>
                <div className="flex items-center gap-2"><Switch checked={!!editProduct.featured} onCheckedChange={v => setEditProduct(p => ({ ...p, featured: v }))} /><span className="text-xs font-medium text-foreground">Destaque</span></div>
              </div>
              <div className="flex gap-2 pt-2">
                <Button onClick={saveProduct} disabled={saving} className="flex-1 text-xs">{saving ? <Loader2 size={14} className="mr-1 animate-spin" /> : <Save size={14} className="mr-1" />}{editProduct.id ? 'Salvar' : 'Criar Produto'}</Button>
                <Button variant="outline" onClick={() => setEditProduct(null)} className="text-xs">Cancelar</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={!!editCollection} onOpenChange={(open) => { if (!open) setEditCollection(null); }}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>{editCollection?.id ? 'Editar Coleção' : 'Nova Coleção'}</DialogTitle></DialogHeader>
          {editCollection && (
            <div className="space-y-4">
              <div><label className="text-[10px] font-bold text-muted-foreground uppercase">Nome *</label><Input value={editCollection.name || ''} onChange={e => { const name = e.target.value; setEditCollection(c => ({ ...c, name, slug: c?.id ? c.slug : slugify(name) })); }} className="text-sm mt-1" /></div>
              <div><label className="text-[10px] font-bold text-muted-foreground uppercase">Slug *</label><Input value={editCollection.slug || ''} onChange={e => setEditCollection(c => ({ ...c, slug: e.target.value }))} className="text-sm mt-1 font-mono" /></div>
              <div><label className="text-[10px] font-bold text-muted-foreground uppercase">Descrição</label><Textarea value={editCollection.description || ''} onChange={e => setEditCollection(c => ({ ...c, description: e.target.value }))} className="text-sm mt-1" rows={3} /></div>
              <div>
                <label className="text-[10px] font-bold text-muted-foreground uppercase">Imagem</label>
                <div className="flex gap-2 mt-1">
                  <Input value={editCollection.image_url || ''} onChange={e => setEditCollection(c => ({ ...c, image_url: e.target.value }))} placeholder="URL da imagem" className="text-sm font-mono flex-1" />
                  <input ref={colImgUploadRef} type="file" accept="image/*" onChange={handleCollectionImageUpload} className="hidden" />
                  <Button variant="outline" size="sm" className="text-xs shrink-0" onClick={() => colImgUploadRef.current?.click()} disabled={uploading}>{uploading ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}</Button>
                </div>
                {editCollection.image_url && <div className="w-16 h-16 mt-2 bg-muted rounded overflow-hidden"><img src={editCollection.image_url} alt="" className="w-full h-full object-cover" /></div>}
              </div>
              <div className="flex items-center gap-4"><div className="flex items-center gap-2"><Switch checked={editCollection.active !== false} onCheckedChange={v => setEditCollection(c => ({ ...c, active: v }))} /><span className="text-xs font-medium">Ativa</span></div></div>
              <div className="flex gap-2"><Button onClick={saveCollection} disabled={saving} className="flex-1 text-xs">{saving ? <Loader2 size={14} className="mr-1 animate-spin" /> : <Save size={14} className="mr-1" />}{editCollection.id ? 'Salvar' : 'Criar'}</Button><Button variant="outline" onClick={() => setEditCollection(null)} className="text-xs">Cancelar</Button></div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
