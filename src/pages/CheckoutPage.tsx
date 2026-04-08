import { useState, useEffect, useCallback } from "react";
import { useNavigate, Link } from "react-router-dom";
import { ArrowLeft, ShieldCheck, Lock, Truck, Clock, Copy, Check, Loader2, Minus, Plus, Trash2, Tag, ChevronDown, ChevronUp } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { formatPrice, getInstallmentPrice } from "@/data/store";
import { trackEvent } from "@/lib/funnelTracking";
import { supabase } from "@/integrations/supabase/client";
import { fetchPaymentGatewayConfig } from "@/lib/paymentGateway";
import { fireWebhookEvent } from "@/lib/webhookManager";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type Step = "identification" | "shipping" | "payment";

interface ShippingOption {
  id: string;
  name: string;
  price_cents: number;
  days_min: number;
  days_max: number;
}

const DEFAULT_SHIPPING: ShippingOption[] = [
  { id: "pac", name: "PAC - Correios", price_cents: 0, days_min: 8, days_max: 15 },
  { id: "sedex", name: "SEDEX - Correios", price_cents: 1990, days_min: 3, days_max: 7 },
];

const PIX_DISCOUNT = 0.10; // 10% discount

function maskCPF(v: string) {
  return v.replace(/\D/g, "").slice(0, 11).replace(/(\d{3})(\d)/, "$1.$2").replace(/(\d{3})(\d)/, "$1.$2").replace(/(\d{3})(\d{1,2})$/, "$1-$2");
}

function maskPhone(v: string) {
  return v.replace(/\D/g, "").slice(0, 11).replace(/(\d{2})(\d)/, "($1) $2").replace(/(\d{5})(\d)/, "$1-$2");
}

function maskCEP(v: string) {
  return v.replace(/\D/g, "").slice(0, 8).replace(/(\d{5})(\d)/, "$1-$2");
}

const EMAIL_DOMAINS = [
  "@gmail.com",
  "@hotmail.com",
  "@outlook.com",
  "@yahoo.com",
  "@icloud.com",
  "@live.com",
  "@msn.com",
  "@uol.com.br",
  "@bol.com.br",
  "@terra.com.br",
];

export default function CheckoutPage() {
  const navigate = useNavigate();
  const { items, totalPrice, updateQuantity, removeItem, clearCart } = useCart();
  const [step, setStep] = useState<Step>("identification");
  const [showOrderSummary, setShowOrderSummary] = useState(false);

  // Form fields
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [cpf, setCpf] = useState("");

  // Shipping
  const [cep, setCep] = useState("");
  const [address, setAddress] = useState("");
  const [addressNumber, setAddressNumber] = useState("");
  const [complement, setComplement] = useState("");
  const [neighborhood, setNeighborhood] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [selectedShipping, setSelectedShipping] = useState("pac");
  const [shippingOptions, setShippingOptions] = useState<ShippingOption[]>(DEFAULT_SHIPPING);
  const [loadingCep, setLoadingCep] = useState(false);

  // Payment
  const [pixCode, setPixCode] = useState("");
  const [pixQrCode, setPixQrCode] = useState("");
  const [orderId, setOrderId] = useState("");
  const [copied, setCopied] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [paymentError, setPaymentError] = useState("");

  // Timer urgency
  const [timeLeft, setTimeLeft] = useState(15 * 60);

  // Email suggestions
  const [emailSuggestions, setEmailSuggestions] = useState<string[]>([]);
  const [showEmailSuggestions, setShowEmailSuggestions] = useState(false);

  const updateEmailSuggestions = useCallback((value: string) => {
    if (!value || value.includes("@") && value.indexOf("@") < value.length - 1) {
      // User already typed something after @, filter matching domains
      const atIndex = value.indexOf("@");
      if (atIndex > 0) {
        const typed = value.slice(atIndex);
        const prefix = value.slice(0, atIndex);
        const matches = EMAIL_DOMAINS.filter((d) => d.startsWith(typed) && d !== typed);
        setEmailSuggestions(matches.map((d) => prefix + d));
        setShowEmailSuggestions(matches.length > 0);
      } else {
        setEmailSuggestions([]);
        setShowEmailSuggestions(false);
      }
      return;
    }
    if (value.includes("@")) {
      // Just typed @, show all
      const prefix = value.slice(0, value.indexOf("@"));
      setEmailSuggestions(EMAIL_DOMAINS.map((d) => prefix + d));
      setShowEmailSuggestions(true);
      return;
    }
    setEmailSuggestions([]);
    setShowEmailSuggestions(false);
  }, []);

  useEffect(() => {
    void trackEvent("checkout");
  }, []);

  useEffect(() => {
    if (items.length === 0 && !pixCode) {
      navigate("/");
    }
  }, [items, pixCode, navigate]);

  // Countdown
  useEffect(() => {
    if (timeLeft <= 0) return;
    const t = setInterval(() => setTimeLeft((p) => Math.max(0, p - 1)), 1000);
    return () => clearInterval(t);
  }, [timeLeft]);

  // Load shipping config from DB
  useEffect(() => {
    supabase.from("shipping_config").select("*").limit(1).maybeSingle().then(({ data }) => {
      if (data?.shipping_options && Array.isArray(data.shipping_options) && (data.shipping_options as unknown as ShippingOption[]).length > 0) {
        setShippingOptions(data.shipping_options as unknown as ShippingOption[]);
      }
    });
  }, []);

  const selectedShippingOption = shippingOptions.find((s) => s.id === selectedShipping) || shippingOptions[0];
  const shippingCost = selectedShippingOption?.price_cents || 0;
  const subtotal = totalPrice;
  const pixDiscount = subtotal * PIX_DISCOUNT;
  const total = subtotal - pixDiscount + shippingCost / 100;

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  const handleCepLookup = async (cepValue: string) => {
    const clean = cepValue.replace(/\D/g, "");
    if (clean.length !== 8) return;
    setLoadingCep(true);
    try {
      const res = await fetch(`https://viacep.com.br/ws/${clean}/json/`);
      const data = await res.json();
      if (!data.erro) {
        setAddress(data.logradouro || "");
        setNeighborhood(data.bairro || "");
        setCity(data.localidade || "");
        setState(data.uf || "");
      }
    } catch { /* ignore */ }
    setLoadingCep(false);
  };

  const validateIdentification = () => {
    if (!name.trim() || !email.trim() || !phone.trim() || !cpf.trim()) return false;
    if (!email.includes("@")) return false;
    if (cpf.replace(/\D/g, "").length < 11) return false;
    return true;
  };

  const validateShipping = () => {
    if (!cep.trim() || !address.trim() || !addressNumber.trim() || !neighborhood.trim() || !city.trim() || !state.trim()) return false;
    return true;
  };

  const handleGeneratePix = async () => {
    setGenerating(true);
    setPaymentError("");

    try {
      const gatewayConfig = await fetchPaymentGatewayConfig();
      const gateway = gatewayConfig.activeGateway;

      const functionMap: Record<string, string> = {
        pagouai: "criar-pix",
        vennox: "criar-pix-vennox",
        centurionpay: "criar-pix-centurionpay",
        ironpay: "criar-pix-ironpay",
        simpayout: "criar-pix-simpayout",
      };

      const functionName = functionMap[gateway];
      if (!functionName) {
        setPaymentError("Gateway de pagamento não configurado.");
        setGenerating(false);
        return;
      }

      const bodyBase: Record<string, unknown> = {
        amount: total,
        buyerName: name,
        buyerEmail: email,
        buyerDocument: cpf.replace(/\D/g, ""),
        buyerPhone: phone.replace(/\D/g, ""),
        metadata: {
          address,
          addressNumber,
          complement,
          neighborhood,
          city,
          state,
          cep: cep.replace(/\D/g, ""),
          shippingMethod: selectedShipping,
          shippingCostCents: shippingCost,
          itemsDescription: items.map((i) => `${i.quantity}x ${i.product.name}`).join(", "),
        },
      };

      // Add gateway-specific keys
      const keyMap: Record<string, Record<string, string>> = {
        pagouai: { publicKey: gatewayConfig.pagouai.publicKey, secretKey: gatewayConfig.pagouai.secretKey },
        vennox: { secretKey: gatewayConfig.vennox.secretKey, companyId: gatewayConfig.vennox.companyId },
        centurionpay: { secretKey: gatewayConfig.centurionpay.secretKey, companyId: gatewayConfig.centurionpay.companyId },
        ironpay: { apiToken: gatewayConfig.ironpay.apiToken },
        simpayout: { clientId: gatewayConfig.simpayout.clientId, clientSecret: gatewayConfig.simpayout.clientSecret },
      };

      const { data, error } = await supabase.functions.invoke(functionName, {
        body: { ...bodyBase, ...keyMap[gateway] },
      });

      if (error) throw error;

      const result = data as { pix_code?: string; pix_qr_code?: string; order_id?: string } | null;

      if (result?.pix_code) {
        setPixCode(result.pix_code);
        setPixQrCode(result.pix_qr_code || "");
        setOrderId(result.order_id || "");

        // Fire webhook
        await fireWebhookEvent("venda_pendente", {
          source: "checkout",
          buyerName: name,
          buyerEmail: email,
          buyerPhone: phone,
          amount: total,
          orderId: result.order_id,
          gateway,
        });

        void trackEvent("purchase");
      } else {
        setPaymentError("Erro ao gerar PIX. Tente novamente.");
      }
    } catch (err) {
      console.error(err);
      setPaymentError("Erro ao processar pagamento. Verifique os dados e tente novamente.");
    }

    setGenerating(false);
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(pixCode);
      setCopied(true);
      // Update order qr_code_copied
      if (orderId) {
        await supabase.from("orders").update({ qr_code_copied: true }).eq("id", orderId);
      }
      setTimeout(() => setCopied(false), 3000);
    } catch { /* ignore */ }
  };

  const stepIndex = step === "identification" ? 0 : step === "shipping" ? 1 : 2;

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Top urgency bar */}
      <div className="bg-primary text-primary-foreground text-center py-2 px-4">
        <p className="text-xs font-bold flex items-center justify-center gap-2">
          <Clock size={14} />
          Oferta expira em {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")} — Finalize agora!
        </p>
      </div>

      {/* Header */}
      <header className="bg-background border-b border-border">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <button onClick={() => navigate(-1)} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft size={16} /> Voltar
          </button>
          <Link to="/" className="text-xl font-heading font-bold text-primary">Bazu</Link>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Lock size={12} /> Seguro
          </div>
        </div>
      </header>

      {/* Progress steps */}
      <div className="bg-background border-b border-border">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-center gap-2">
            {["Identificação", "Entrega", "Pagamento"].map((label, i) => (
              <div key={label} className="flex items-center gap-2">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                  i <= stepIndex ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                }`}>
                  {i < stepIndex ? "✓" : i + 1}
                </div>
                <span className={`text-xs font-medium hidden sm:inline ${
                  i <= stepIndex ? "text-foreground" : "text-muted-foreground"
                }`}>{label}</span>
                {i < 2 && <div className={`w-8 sm:w-16 h-0.5 ${i < stepIndex ? "bg-primary" : "bg-border"}`} />}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        <div className="grid lg:grid-cols-5 gap-6 max-w-5xl mx-auto">
          {/* Main content — left */}
          <div className="lg:col-span-3 space-y-4">
            {/* Viewers badge */}
            <div className="flex items-center gap-2 bg-amber-500/10 text-amber-700 rounded-lg px-3 py-2 text-xs font-medium">
              <AlertTriangle size={14} />
              <span>{viewers} pessoas estão vendo este checkout agora</span>
            </div>

            {/* Step: Identification */}
            {step === "identification" && (
              <div className="bg-background rounded-xl border border-border p-5 space-y-4">
                <h2 className="text-lg font-heading font-bold text-foreground">Seus dados</h2>
                <div className="space-y-3">
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground mb-1 block">Nome completo *</label>
                    <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Seu nome completo" />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground mb-1 block">E-mail *</label>
                    <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="seu@email.com" />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-semibold text-muted-foreground mb-1 block">Telefone *</label>
                      <Input value={phone} onChange={(e) => setPhone(maskPhone(e.target.value))} placeholder="(00) 00000-0000" />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-muted-foreground mb-1 block">CPF *</label>
                      <Input value={cpf} onChange={(e) => setCpf(maskCPF(e.target.value))} placeholder="000.000.000-00" />
                    </div>
                  </div>
                </div>
                <Button
                  onClick={() => setStep("shipping")}
                  disabled={!validateIdentification()}
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold py-6 text-sm"
                >
                  Continuar para Entrega
                </Button>
              </div>
            )}

            {/* Step: Shipping */}
            {step === "shipping" && (
              <div className="bg-background rounded-xl border border-border p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-heading font-bold text-foreground">Endereço de entrega</h2>
                  <button onClick={() => setStep("identification")} className="text-xs text-primary hover:underline">Editar dados</button>
                </div>
                <div className="space-y-3">
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground mb-1 block">CEP *</label>
                    <div className="flex gap-2">
                      <Input
                        value={cep}
                        onChange={(e) => {
                          const v = maskCEP(e.target.value);
                          setCep(v);
                          if (v.replace(/\D/g, "").length === 8) handleCepLookup(v);
                        }}
                        placeholder="00000-000"
                        className="flex-1"
                      />
                      {loadingCep && <Loader2 size={20} className="animate-spin text-primary mt-2" />}
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground mb-1 block">Endereço *</label>
                    <Input value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Rua, Avenida..." />
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="text-xs font-semibold text-muted-foreground mb-1 block">Número *</label>
                      <Input value={addressNumber} onChange={(e) => setAddressNumber(e.target.value)} placeholder="123" />
                    </div>
                    <div className="col-span-2">
                      <label className="text-xs font-semibold text-muted-foreground mb-1 block">Complemento</label>
                      <Input value={complement} onChange={(e) => setComplement(e.target.value)} placeholder="Apto, bloco..." />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground mb-1 block">Bairro *</label>
                    <Input value={neighborhood} onChange={(e) => setNeighborhood(e.target.value)} placeholder="Seu bairro" />
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="col-span-2">
                      <label className="text-xs font-semibold text-muted-foreground mb-1 block">Cidade *</label>
                      <Input value={city} onChange={(e) => setCity(e.target.value)} placeholder="Sua cidade" />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-muted-foreground mb-1 block">UF *</label>
                      <Input value={state} onChange={(e) => setState(e.target.value.toUpperCase().slice(0, 2))} placeholder="UF" />
                    </div>
                  </div>

                  {/* Shipping methods */}
                  <div className="pt-2">
                    <label className="text-xs font-semibold text-muted-foreground mb-2 block">Método de envio</label>
                    <div className="space-y-2">
                      {shippingOptions.map((opt) => (
                        <label
                          key={opt.id}
                          className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                            selectedShipping === opt.id ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
                          }`}
                        >
                          <input
                            type="radio"
                            name="shipping"
                            value={opt.id}
                            checked={selectedShipping === opt.id}
                            onChange={(e) => setSelectedShipping(e.target.value)}
                            className="accent-primary"
                          />
                          <Truck size={16} className="text-primary" />
                          <div className="flex-1">
                            <p className="text-sm font-medium">{opt.name}</p>
                            <p className="text-[11px] text-muted-foreground">{opt.days_min}-{opt.days_max} dias úteis</p>
                          </div>
                          <span className="text-sm font-bold text-primary">
                            {opt.price_cents === 0 ? "Grátis" : formatPrice(opt.price_cents / 100)}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
                <Button
                  onClick={() => setStep("payment")}
                  disabled={!validateShipping()}
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold py-6 text-sm"
                >
                  Continuar para Pagamento
                </Button>
              </div>
            )}

            {/* Step: Payment */}
            {step === "payment" && !pixCode && (
              <div className="bg-background rounded-xl border border-border p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-heading font-bold text-foreground">Pagamento via PIX</h2>
                  <button onClick={() => setStep("shipping")} className="text-xs text-primary hover:underline">Editar entrega</button>
                </div>

                {/* PIX benefit */}
                <div className="bg-emerald-500/10 rounded-lg p-4 space-y-2">
                  <div className="flex items-center gap-2">
                    <Tag size={16} className="text-emerald-600" />
                    <span className="text-sm font-bold text-emerald-700">10% de desconto no PIX!</span>
                  </div>
                  <p className="text-xs text-emerald-600">
                    Você economiza <strong>{formatPrice(pixDiscount)}</strong> pagando via PIX
                  </p>
                </div>

                {/* Summary before generating */}
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span>{formatPrice(subtotal)}</span></div>
                  <div className="flex justify-between text-emerald-600"><span>Desconto PIX (10%)</span><span>-{formatPrice(pixDiscount)}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Frete ({selectedShippingOption?.name})</span><span>{shippingCost === 0 ? "Grátis" : formatPrice(shippingCost / 100)}</span></div>
                  <div className="flex justify-between font-bold text-base pt-2 border-t border-border">
                    <span>Total</span>
                    <span className="text-primary">{formatPrice(total)}</span>
                  </div>
                </div>

                {paymentError && (
                  <div className="bg-destructive/10 text-destructive text-xs font-medium rounded-lg p-3 text-center">{paymentError}</div>
                )}

                <Button
                  onClick={handleGeneratePix}
                  disabled={generating}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-6 text-sm"
                >
                  {generating ? (
                    <><Loader2 size={16} className="animate-spin mr-2" /> Gerando PIX...</>
                  ) : (
                    "Gerar QR Code PIX"
                  )}
                </Button>
              </div>
            )}

            {/* PIX Generated */}
            {pixCode && (
              <div className="bg-background rounded-xl border border-border p-5 space-y-4">
                <div className="text-center space-y-2">
                  <div className="w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto">
                    <Check size={32} className="text-emerald-600" />
                  </div>
                  <h2 className="text-lg font-heading font-bold text-foreground">PIX gerado com sucesso!</h2>
                  <p className="text-sm text-muted-foreground">Escaneie o QR Code ou copie o código para pagar</p>
                </div>

                {pixQrCode && (
                  <div className="flex justify-center">
                    <img src={pixQrCode} alt="QR Code PIX" className="w-48 h-48 rounded-lg border border-border" />
                  </div>
                )}

                <div className="space-y-2">
                  <label className="text-xs font-semibold text-muted-foreground block">Código PIX Copia e Cola</label>
                  <div className="relative">
                    <Input value={pixCode} readOnly className="pr-20 font-mono text-xs" />
                    <Button
                      onClick={handleCopy}
                      size="sm"
                      className={`absolute right-1 top-1 h-7 text-xs ${copied ? "bg-emerald-600" : "bg-primary"}`}
                    >
                      {copied ? <><Check size={12} className="mr-1" /> Copiado</> : <><Copy size={12} className="mr-1" /> Copiar</>}
                    </Button>
                  </div>
                </div>

                <div className="bg-amber-500/10 rounded-lg p-3 text-center">
                  <p className="text-xs font-medium text-amber-700">
                    <Clock size={12} className="inline mr-1" />
                    Pague em até 30 minutos para garantir seu pedido
                  </p>
                </div>

                <div className="text-center pt-2">
                  <p className="text-lg font-bold text-primary">{formatPrice(total)}</p>
                  <p className="text-xs text-muted-foreground">Valor total com desconto PIX</p>
                </div>
              </div>
            )}

            {/* Trust badges */}
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-background rounded-lg border border-border p-3 text-center">
                <ShieldCheck size={20} className="text-primary mx-auto mb-1" />
                <p className="text-[10px] font-bold text-foreground">Compra Segura</p>
              </div>
              <div className="bg-background rounded-lg border border-border p-3 text-center">
                <Lock size={20} className="text-primary mx-auto mb-1" />
                <p className="text-[10px] font-bold text-foreground">Dados Protegidos</p>
              </div>
              <div className="bg-background rounded-lg border border-border p-3 text-center">
                <Truck size={20} className="text-primary mx-auto mb-1" />
                <p className="text-[10px] font-bold text-foreground">Entrega Garantida</p>
              </div>
            </div>
          </div>

          {/* Right sidebar — Order summary */}
          <div className="lg:col-span-2">
            {/* Mobile toggle */}
            <button
              onClick={() => setShowOrderSummary(!showOrderSummary)}
              className="lg:hidden w-full flex items-center justify-between bg-background rounded-lg border border-border p-3 mb-3"
            >
              <span className="text-sm font-bold">Resumo do pedido ({items.length} {items.length === 1 ? "item" : "itens"})</span>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-primary">{formatPrice(total)}</span>
                {showOrderSummary ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </div>
            </button>

            <div className={`${showOrderSummary ? "block" : "hidden"} lg:block`}>
              <div className="bg-background rounded-xl border border-border p-4 space-y-4 sticky top-4">
                <h3 className="text-sm font-heading font-bold text-foreground">Resumo do pedido</h3>

                {/* Items */}
                <div className="space-y-3 max-h-[300px] overflow-y-auto">
                  {items.map(({ product, quantity }) => (
                    <div key={product.id} className="flex gap-3">
                      <div className="relative">
                        <img src={product.image} alt={product.name} className="w-14 h-14 rounded-lg object-cover" />
                        <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                          {quantity}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium truncate">{product.name}</p>
                        <p className="text-xs text-primary font-bold">{formatPrice(product.price * quantity)}</p>
                        <div className="flex items-center gap-1 mt-1">
                          <button onClick={() => updateQuantity(product.id, quantity - 1)} className="w-5 h-5 border border-border rounded flex items-center justify-center hover:bg-muted">
                            <Minus size={10} />
                          </button>
                          <span className="text-[10px] w-4 text-center">{quantity}</span>
                          <button onClick={() => updateQuantity(product.id, quantity + 1)} className="w-5 h-5 border border-border rounded flex items-center justify-center hover:bg-muted">
                            <Plus size={10} />
                          </button>
                          <button onClick={() => removeItem(product.id)} className="ml-auto text-muted-foreground hover:text-destructive">
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Totals */}
                <div className="border-t border-border pt-3 space-y-1.5 text-xs">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span>{formatPrice(subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-emerald-600">
                    <span>Desconto PIX (10%)</span>
                    <span>-{formatPrice(pixDiscount)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Frete</span>
                    <span>{shippingCost === 0 ? "Grátis" : formatPrice(shippingCost / 100)}</span>
                  </div>
                  <div className="flex justify-between font-bold text-base pt-2 border-t border-border">
                    <span>Total</span>
                    <span className="text-primary">{formatPrice(total)}</span>
                  </div>
                  <p className="text-[10px] text-muted-foreground text-center">
                    ou {formatPrice(subtotal + shippingCost / 100)} em até 12x de {getInstallmentPrice(subtotal + shippingCost / 100)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
