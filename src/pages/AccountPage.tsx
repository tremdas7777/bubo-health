import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import Layout from "@/components/store/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { formatPrice } from "@/data/store";
import {
  User, Package, LogOut, Save, Loader2, MapPin, Phone, FileText, Clock, CheckCircle2, AlertCircle, Truck
} from "lucide-react";

interface Profile {
  full_name: string;
  email: string;
  phone: string;
  cpf: string;
  address_street: string;
  address_number: string;
  address_complement: string;
  address_neighborhood: string;
  address_city: string;
  address_state: string;
  address_zip: string;
}

interface Order {
  id: string;
  amount_cents: number;
  status: string;
  created_at: string;
  buyer_name: string | null;
  gateway: string | null;
  shipping_cost_cents: number | null;
  tracking_code: string | null;
}

const STATUS_MAP: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  pending: { label: "Aguardando pagamento", color: "text-yellow-600", icon: Clock },
  approved: { label: "Pago", color: "text-green-600", icon: CheckCircle2 },
  paid: { label: "Pago", color: "text-green-600", icon: CheckCircle2 },
  refused: { label: "Recusado", color: "text-destructive", icon: AlertCircle },
  cancelled: { label: "Cancelado", color: "text-muted-foreground", icon: AlertCircle },
};

export default function AccountPage() {
  const { user, loading: authLoading, signOut } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<"orders" | "profile">("orders");
  const [profile, setProfile] = useState<Profile>({
    full_name: "", email: "", phone: "", cpf: "",
    address_street: "", address_number: "", address_complement: "",
    address_neighborhood: "", address_city: "", address_state: "", address_zip: "",
  });
  const [orders, setOrders] = useState<Order[]>([]);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/entrar");
    }
  }, [authLoading, user, navigate]);

  useEffect(() => {
    if (!user) return;

    const fetchProfile = async () => {
      const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();
      if (data) {
        setProfile({
          full_name: data.full_name || "",
          email: data.email || "",
          phone: data.phone || "",
          cpf: data.cpf || "",
          address_street: data.address_street || "",
          address_number: data.address_number || "",
          address_complement: data.address_complement || "",
          address_neighborhood: data.address_neighborhood || "",
          address_city: data.address_city || "",
          address_state: data.address_state || "",
          address_zip: data.address_zip || "",
        });
      }
      setLoadingProfile(false);
    };

    const fetchOrders = async () => {
      const { data } = await supabase
        .from("orders")
        .select("id, amount_cents, status, created_at, buyer_name, gateway, shipping_cost_cents, tracking_code")
        .order("created_at", { ascending: false });
      setOrders((data as Order[]) || []);
      setLoadingOrders(false);
    };

    fetchProfile();
    fetchOrders();
  }, [user]);

  const handleSaveProfile = async () => {
    if (!user) return;
    setSaving(true);
    const { error } = await supabase
      .from("profiles")
      .update({ ...profile })
      .eq("user_id", user.id);
    setSaving(false);
    if (error) {
      toast({ title: "Erro ao salvar", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Perfil atualizado!" });
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  if (authLoading) {
    return (
      <Layout>
        <div className="flex min-h-[50vh] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="mx-auto max-w-3xl">
          {/* Header */}
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-heading font-bold">Minha Conta</h1>
              <p className="text-sm text-muted-foreground">{user?.email}</p>
            </div>
            <Button variant="outline" size="sm" onClick={handleSignOut}>
              <LogOut size={16} className="mr-2" /> Sair
            </Button>
          </div>

          {/* Tabs */}
          <div className="mb-6 flex gap-1 rounded-lg border border-border p-1">
            <button
              onClick={() => setActiveTab("orders")}
              className={`flex-1 rounded-md px-4 py-2.5 text-sm font-medium transition-colors ${
                activeTab === "orders" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Package size={16} className="mr-2 inline" /> Meus Pedidos
            </button>
            <button
              onClick={() => setActiveTab("profile")}
              className={`flex-1 rounded-md px-4 py-2.5 text-sm font-medium transition-colors ${
                activeTab === "profile" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <User size={16} className="mr-2 inline" /> Meus Dados
            </button>
          </div>

          {/* Orders Tab */}
          {activeTab === "orders" && (
            <div className="space-y-4">
              {loadingOrders ? (
                <div className="flex justify-center py-12">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                </div>
              ) : orders.length === 0 ? (
                <div className="rounded-xl border border-border bg-card p-12 text-center">
                  <Package size={48} className="mx-auto mb-4 text-muted-foreground/30" />
                  <p className="text-muted-foreground">Você ainda não tem pedidos.</p>
                  <Button className="mt-4" onClick={() => navigate("/produtos")}>Ver Produtos</Button>
                </div>
              ) : (
                orders.map((order) => {
                  const statusInfo = STATUS_MAP[order.status] || STATUS_MAP.pending;
                  const StatusIcon = statusInfo.icon;
                  return (
                    <div key={order.id} className="rounded-xl border border-border bg-card p-5">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="text-xs text-muted-foreground">
                            Pedido #{order.id.slice(0, 8).toUpperCase()}
                          </p>
                          <p className="text-lg font-bold">{formatPrice(order.amount_cents / 100)}</p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(order.created_at).toLocaleDateString("pt-BR")}
                          </p>
                        </div>
                        <div className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ${statusInfo.color} bg-current/10`}>
                          <StatusIcon size={14} />
                          {statusInfo.label}
                        </div>
                      </div>
                      {order.tracking_code && (
                        <div className="mt-3 flex items-center gap-2 rounded-lg border border-border bg-muted/30 px-3 py-2">
                          <Truck size={14} className="text-primary shrink-0" />
                          <div>
                            <p className="text-[10px] font-semibold text-muted-foreground">Rastreamento</p>
                            <a
                              href={`https://rastreamento.correios.com.br/app/index.php?objeto=${order.tracking_code}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs font-bold text-primary hover:underline"
                            >
                              {order.tracking_code}
                            </a>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          )}

          {/* Profile Tab */}
          {activeTab === "profile" && (
            <div className="space-y-6">
              {loadingProfile ? (
                <div className="flex justify-center py-12">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                </div>
              ) : (
                <>
                  {/* Personal Info */}
                  <div className="rounded-xl border border-border bg-card p-5 space-y-4">
                    <h3 className="flex items-center gap-2 font-semibold">
                      <User size={18} className="text-primary" /> Dados Pessoais
                    </h3>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <label className="mb-1 block text-xs text-muted-foreground">Nome completo</label>
                        <Input value={profile.full_name} onChange={(e) => setProfile({ ...profile, full_name: e.target.value })} />
                      </div>
                      <div>
                        <label className="mb-1 block text-xs text-muted-foreground">Email</label>
                        <Input value={profile.email} disabled className="bg-muted" />
                      </div>
                      <div>
                        <label className="mb-1 block text-xs text-muted-foreground">Telefone</label>
                        <Input value={profile.phone} onChange={(e) => setProfile({ ...profile, phone: e.target.value })} placeholder="(00) 00000-0000" />
                      </div>
                      <div>
                        <label className="mb-1 block text-xs text-muted-foreground">CPF</label>
                        <Input value={profile.cpf} onChange={(e) => setProfile({ ...profile, cpf: e.target.value })} placeholder="000.000.000-00" />
                      </div>
                    </div>
                  </div>

                  {/* Address */}
                  <div className="rounded-xl border border-border bg-card p-5 space-y-4">
                    <h3 className="flex items-center gap-2 font-semibold">
                      <MapPin size={18} className="text-primary" /> Endereço
                    </h3>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="sm:col-span-2">
                        <label className="mb-1 block text-xs text-muted-foreground">Rua</label>
                        <Input value={profile.address_street} onChange={(e) => setProfile({ ...profile, address_street: e.target.value })} />
                      </div>
                      <div>
                        <label className="mb-1 block text-xs text-muted-foreground">Número</label>
                        <Input value={profile.address_number} onChange={(e) => setProfile({ ...profile, address_number: e.target.value })} />
                      </div>
                      <div>
                        <label className="mb-1 block text-xs text-muted-foreground">Complemento</label>
                        <Input value={profile.address_complement} onChange={(e) => setProfile({ ...profile, address_complement: e.target.value })} />
                      </div>
                      <div>
                        <label className="mb-1 block text-xs text-muted-foreground">Bairro</label>
                        <Input value={profile.address_neighborhood} onChange={(e) => setProfile({ ...profile, address_neighborhood: e.target.value })} />
                      </div>
                      <div>
                        <label className="mb-1 block text-xs text-muted-foreground">Cidade</label>
                        <Input value={profile.address_city} onChange={(e) => setProfile({ ...profile, address_city: e.target.value })} />
                      </div>
                      <div>
                        <label className="mb-1 block text-xs text-muted-foreground">Estado</label>
                        <Input value={profile.address_state} onChange={(e) => setProfile({ ...profile, address_state: e.target.value })} maxLength={2} placeholder="SP" />
                      </div>
                      <div>
                        <label className="mb-1 block text-xs text-muted-foreground">CEP</label>
                        <Input value={profile.address_zip} onChange={(e) => setProfile({ ...profile, address_zip: e.target.value })} placeholder="00000-000" />
                      </div>
                    </div>
                  </div>

                  <Button onClick={handleSaveProfile} className="w-full py-6 font-semibold" disabled={saving}>
                    {saving ? <Loader2 size={18} className="mr-2 animate-spin" /> : <Save size={18} className="mr-2" />}
                    Salvar Alterações
                  </Button>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
