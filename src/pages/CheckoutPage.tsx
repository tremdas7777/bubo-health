import { useState, useEffect, useCallback } from "react";
import { useNavigate, Link } from "react-router-dom";
import { ArrowLeft, ShieldCheck, Lock, Truck, Clock, Copy, Check, Loader2, Minus, Plus, Trash2, Tag, ChevronDown, ChevronUp, CreditCard } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import { formatPrice, getInstallmentPrice } from "@/data/store";
import { trackEvent } from "@/lib/funnelTracking";
import { supabase } from "@/integrations/supabase/client";
import { fetchPaymentGatewayConfig } from "@/lib/paymentGateway";
import { fireWebhookEvent } from "@/lib/webhookManager";
import { notifyUtmifyServerSide } from "@/lib/utmifyManager";
import { getCampaignParams } from "@/lib/campaignParams";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PIX_DISCOUNT_RATE, PIX_DISCOUNT_PERCENT, getTotalWithInterest, getInstallmentValue } from "@/lib/pricing";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";

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

type PaymentMethod = "pix" | "card";

const GATEWAY_LABELS: Record<string, string> = {
  pagouai: "Pagou.ai",
  vennox: "Vennox",
  centurionpay: "Centurion Pay",
  ironpay: "Iron Pay",
  simpayout: "Sim Payout",
  beehive: "Beehive",
  pagamentosmp: "MP Pagamentos",
};

async function extractFunctionErrorMessage(error: unknown) {
  if (error && typeof error === "object" && "context" in error) {
    const response = (error as { context?: Response }).context;

    if (response instanceof Response) {
      try {
        const payload = await response.clone().json() as { error?: string; details?: { refusedReason?: { description?: string } } };
        return payload.error || payload.details?.refusedReason?.description || "Erro ao processar pagamento";
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

  return error instanceof Error ? error.message : "Erro desconhecido ao processar pagamento";
}

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
  const { user } = useAuth();
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
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("pix");
  const [cardEnabled, setCardEnabled] = useState(false);
  const [activeGateway, setActiveGateway] = useState<string>("stripe");
  const [pixCode, setPixCode] = useState("");
  const [pixQrCode, setPixQrCode] = useState("");
  const [orderId, setOrderId] = useState("");
  const [copied, setCopied] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [paymentError, setPaymentError] = useState("");

  // Card fields
  const [cardNumber, setCardNumber] = useState("");
  const [cardHolder, setCardHolder] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvv, setCardCvv] = useState("");
  const [installments, setInstallments] = useState(1);

  // Live checkout tracking (draft order for abandoned cart visibility)
  const [draftOrderId, setDraftOrderId] = useState<string>("");




  // Timer urgency
  const [timeLeft, setTimeLeft] = useState(15 * 60);
  const [pollingPayment, setPollingPayment] = useState(false);

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
    fetchPaymentGatewayConfig().then((cfg) => {
      setActiveGateway(cfg.activeGateway);
      const methods = cfg.paymentMethods[cfg.activeGateway] || cfg.paymentMethods.default || "card";
      setCardEnabled(methods === "card" || methods === "pix_card");
      if (cfg.activeGateway === "stripe" || methods === "card") setPaymentMethod("card");
    });
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

  // Pre-fill from profile when logged in
  useEffect(() => {
    if (!user) return;
    supabase.from("profiles").select("*").eq("user_id", user.id).maybeSingle().then(({ data }) => {
      if (!data) return;
      if (data.full_name && !name) setName(data.full_name);
      if (data.email && !email) setEmail(data.email);
      if (data.phone && !phone) setPhone(data.phone);
      if (data.cpf && !cpf) setCpf(data.cpf);
      if (data.address_zip && !cep) {
        setCep(maskCEP(data.address_zip));
        if (data.address_street) setAddress(data.address_street);
        if (data.address_number) setAddressNumber(data.address_number);
        if (data.address_complement) setComplement(data.address_complement);
        if (data.address_neighborhood) setNeighborhood(data.address_neighborhood);
        if (data.address_city) setCity(data.address_city);
        if (data.address_state) setState(data.address_state);
      }
    });
  }, [user]);

  // Poll for payment status when PIX is generated
  useEffect(() => {
    if (!orderId || pollingPayment) return;
    setPollingPayment(true);
    const interval = setInterval(async () => {
      try {
        const { data } = await supabase
          .from("orders")
          .select("status, amount_cents, buyer_name, buyer_email, buyer_phone, buyer_document")
          .eq("id", orderId)
          .maybeSingle();
        if (data?.status === "paid" || data?.status === "approved") {
          clearInterval(interval);
          // Utmify: notifica venda aprovada (PIX confirmado)
          void notifyUtmifyServerSide({
            orderId,
            status: "paid",
            paymentMethod: "pix",
            customerName: data.buyer_name || "Cliente",
            customerEmail: data.buyer_email || "",
            customerPhone: data.buyer_phone || null,
            customerDocument: data.buyer_document || null,
            productName: "Pedido Kazoom",
            priceInCents: data.amount_cents || 0,
            trackingParameters: getCampaignParams(),
          });
          navigate(`/obrigado?pedido=${orderId}&metodo=pix`);
        }
      } catch { /* ignore */ }
    }, 5000);
    return () => clearInterval(interval);
  }, [orderId, navigate, pollingPayment]);

  const selectedShippingOption = shippingOptions.find((s) => s.id === selectedShipping) || shippingOptions[0];
  const shippingCost = selectedShippingOption?.price_cents || 0;
  const subtotal = totalPrice;
  const isPix = paymentMethod === "pix";
  const pixDiscount = isPix ? subtotal * PIX_DISCOUNT_RATE : 0;
  const total = subtotal - pixDiscount + shippingCost / 100;
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const activeGatewayMethods = cardEnabled ? (isPix ? "pix" : "card") : "pix";

  const saveOrderItems = async (oid: string) => {
    try {
      const rows = items.map((i) => ({
        order_id: oid,
        product_id: i.product.id,
        product_name: i.product.name,
        quantity: i.quantity,
        price_cents: Math.round(i.product.price * 100),
      }));
      await supabase.from("order_items").insert(rows);
    } catch (e) {
      console.error("Failed to save order items", e);
    }
  };

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

  // Upsert a draft order so admin can see live progress through checkout
  const upsertDraftOrder = useCallback(async (nextStep: "shipping" | "payment") => {
    try {
      const payload = {
        buyer_name: name,
        buyer_email: email,
        buyer_phone: phone.replace(/\D/g, ""),
        buyer_document: cpf.replace(/\D/g, ""),
        amount_cents: Math.round(totalPrice * 100),
        status: "draft",
        checkout_step: nextStep,
        checkout_step_updated_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      } as Record<string, unknown>;

      if (draftOrderId) {
        await supabase.from("orders").update(payload as never).eq("id", draftOrderId);
      } else {
        const { data } = await supabase
          .from("orders")
          .insert(payload as never)
          .select("id")
          .maybeSingle();
        if (data?.id) setDraftOrderId(data.id);
      }
    } catch (e) {
      console.warn("draft order upsert failed", e);
    }
  }, [draftOrderId, name, email, phone, cpf, totalPrice]);

  const goToShipping = () => {
    void upsertDraftOrder("shipping");
    setStep("shipping");
  };
  const goToPayment = () => {
    void upsertDraftOrder("payment");
    setStep("payment");
  };


  const handleGeneratePix = async () => {
    setGenerating(true);
    setPaymentError("");

    try {
      const gateway = "beehive";

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

      const { data, error } = await supabase.functions.invoke("criar-pix-beehive", {
        body: bodyBase,
      });

      if (error) {
        throw new Error(await extractFunctionErrorMessage(error));
      }

      const result = data as { pix_code?: string; pix_qr_code?: string; order_id?: string; error?: string } | null;

      if (result?.error) {
        setPaymentError(result.error);
        setGenerating(false);
        return;
      }

      if (result?.pix_code) {
        setPixCode(result.pix_code);
        setPixQrCode(result.pix_qr_code || "");
        setOrderId(result.order_id || "");

        // Delete draft order now that the real order exists
        if (draftOrderId) {
          await supabase.from("orders").delete().eq("id", draftOrderId);
          setDraftOrderId("");
        }

        // Save order items
        if (result.order_id) {
          await saveOrderItems(result.order_id);
        }

        // Send order confirmation email (pending)
        supabase.functions.invoke("send-order-email", {
          body: {
            orderId: result.order_id,
            buyerEmail: email,
            buyerName: name,
            status: "pending",
            amountCents: Math.round(total * 100),
            type: "status",
            items: items.map(i => ({ name: i.product.name, quantity: i.quantity, priceCents: Math.round(i.product.price * 100) })),
          },
        }).catch(e => console.error("Email error:", e));

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

        // Utmify: notifica venda pendente (PIX gerado)
        void notifyUtmifyServerSide({
          orderId: result.order_id || "",
          status: "waiting_payment",
          paymentMethod: "pix",
          customerName: name,
          customerEmail: email,
          customerPhone: phone || null,
          customerDocument: cpf?.replace(/\D/g, "") || null,
          productName: items[0]?.product?.name || "Pedido Kazoom",
          priceInCents: Math.round(total * 100),
          trackingParameters: getCampaignParams(),
        });

        void trackEvent("purchase");
      } else {
        setPaymentError("Erro ao gerar PIX. Tente novamente.");
      }
    } catch (err) {
      console.error(err);
      setPaymentError(await extractFunctionErrorMessage(err));
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

  const handleCardPayment = async () => {
    setGenerating(true);
    setPaymentError("");

    try {
      const gatewayConfig = await fetchPaymentGatewayConfig();
      const gateway = "beehive";

      // Validate card fields
      if (!cardNumber || !cardHolder || !cardExpiry || !cardCvv) {
        setPaymentError("Preencha todos os dados do cartão.");
        setGenerating(false);
        return;
      }

      // Tokenize card using Beehive JS library
      if (typeof BeehivePay === "undefined") {
        setPaymentError("Biblioteca de pagamento não carregada. Recarregue a página.");
        setGenerating(false);
        return;
      }

      BeehivePay.setPublicKey(gatewayConfig.beehive.publicKey);
      BeehivePay.setTestMode(!gatewayConfig.beehive.publicKey.startsWith("pk_live_"));

      const [expMonth, expYear] = cardExpiry.split("/").map((s) => parseInt(s.trim(), 10));
      const fullYear = expYear < 100 ? 2000 + expYear : expYear;

      const cardHash = await BeehivePay.encrypt({
        number: cardNumber.replace(/\D/g, ""),
        holderName: cardHolder,
        expMonth,
        expYear: fullYear,
        cvv: cardCvv,
      });

      const bodyBase: Record<string, unknown> = {
        amount: getTotalWithInterest(total, installments),
        buyerName: name,
        buyerEmail: email,
        buyerDocument: cpf.replace(/\D/g, ""),
        buyerPhone: phone.replace(/\D/g, ""),
        cardHash,
        installments,
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
        },
      };

      const { data, error } = await supabase.functions.invoke("criar-cartao-beehive", {
        body: bodyBase,
      });

      if (error) {
        throw new Error(await extractFunctionErrorMessage(error));
      }

      const result = data as { order_id?: string; status?: string; error?: string } | null;

      if (result?.error) {
        setPaymentError(result.error);
        setGenerating(false);
        return;
      }

      // Utmify: notifica venda pendente (cartão) — dispara para TODA tentativa de pagamento
      if (result?.order_id) {
        void notifyUtmifyServerSide({
          orderId: result.order_id,
          status: "waiting_payment",
          paymentMethod: "credit_card",
          customerName: name,
          customerEmail: email,
          customerPhone: phone || null,
          customerDocument: cpf?.replace(/\D/g, "") || null,
          productName: items[0]?.product?.name || "Pedido Kazoom",
          priceInCents: Math.round(total * 100),
          trackingParameters: getCampaignParams(),
        });
      }

      if (result?.status === "paid") {
        // Save order items
        if (result.order_id) {
          await saveOrderItems(result.order_id);
        }
        // Delete draft now that real card order is paid
        if (draftOrderId) {
          await supabase.from("orders").delete().eq("id", draftOrderId);
          setDraftOrderId("");
        }
        // Send paid confirmation email
        supabase.functions.invoke("send-order-email", {
          body: {
            orderId: result.order_id,
            buyerEmail: email,
            buyerName: name,
            status: "paid",
            amountCents: Math.round(total * 100),
            type: "status",
            items: items.map(i => ({ name: i.product.name, quantity: i.quantity, priceCents: Math.round(i.product.price * 100) })),
          },
        }).catch(e => console.error("Email error:", e));

        await fireWebhookEvent("venda_aprovada", {
          source: "checkout",
          buyerName: name,
          buyerEmail: email,
          buyerPhone: phone,
          amount: total,
          orderId: result.order_id,
          gateway,
        });

        // Utmify: notifica venda aprovada (cartão)
        void notifyUtmifyServerSide({
          orderId: result.order_id || "",
          status: "paid",
          paymentMethod: "credit_card",
          customerName: name,
          customerEmail: email,
          customerPhone: phone || null,
          customerDocument: cpf?.replace(/\D/g, "") || null,
          productName: items[0]?.product?.name || "Pedido Kazoom",
          priceInCents: Math.round(total * 100),
          trackingParameters: getCampaignParams(),
        });

        void trackEvent("purchase");
        navigate(`/obrigado?pedido=${result.order_id}&metodo=card`);
      } else {
        setOrderId(result?.order_id || "");
        setPaymentError("Pagamento não aprovado. Verifique os dados do cartão.");

        // Utmify: notifica venda recusada (cartão)
        if (result?.order_id) {
          void notifyUtmifyServerSide({
            orderId: result.order_id,
            status: "refused",
            paymentMethod: "credit_card",
            customerName: name,
            customerEmail: email,
            customerPhone: phone || null,
            customerDocument: cpf?.replace(/\D/g, "") || null,
            productName: items[0]?.product?.name || "Pedido Kazoom",
            priceInCents: Math.round(total * 100),
            trackingParameters: getCampaignParams(),
          });
        }
      }
    } catch (err) {
      console.error(err);
      setPaymentError(await extractFunctionErrorMessage(err));
    }

    setGenerating(false);
  };

  const handleStripeCheckout = async () => {
    setGenerating(true);
    setPaymentError("");
    try {
      const successUrl = `${window.location.origin}/obrigado`;
      const cancelUrl = `${window.location.origin}/checkout`;

      const cartItems = items.map((i) => ({
        name: i.product.name,
        quantity: i.quantity,
        amount_cents: Math.round(i.product.price * 100),
        product_id: i.product.id || null,
        image: i.product.image_url || (i.product.images?.[0] ?? null),
      }));

      const { data, error } = await supabase.functions.invoke("stripe-checkout", {
        body: {
          items: cartItems,
          buyerName: name,
          buyerEmail: email,
          buyerPhone: phone.replace(/\D/g, ""),
          currency: "usd",
          shippingCostCents: shippingCost,
          successUrl,
          cancelUrl,
          metadata: {
            address: `${address}, ${addressNumber} ${complement}`.trim(),
            neighborhood,
            city,
            state,
            cep: cep.replace(/\D/g, ""),
            shippingMethod: selectedShipping,
          },
        },
      });

      if (error) {
        throw new Error(await extractFunctionErrorMessage(error));
      }
      const result = data as { url?: string; order_id?: string; error?: string } | null;
      if (result?.error) {
        setPaymentError(result.error);
        setGenerating(false);
        return;
      }
      if (!result?.url) {
        setPaymentError("Não foi possível iniciar o checkout do Stripe.");
        setGenerating(false);
        return;
      }
      // Delete draft order since real order is created server-side
      if (draftOrderId) {
        await supabase.from("orders").delete().eq("id", draftOrderId);
        setDraftOrderId("");
      }
      void trackEvent("purchase");
      window.location.href = result.url;
    } catch (err) {
      console.error(err);
      setPaymentError(await extractFunctionErrorMessage(err));
      setGenerating(false);
    }
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
          <Link to="/" className="text-xl font-heading font-bold text-primary">Kazoom</Link>
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

            {/* Step: Identification */}
            {step === "identification" && (
              <div className="bg-background rounded-xl border border-border p-5 space-y-4">
                <h2 className="text-lg font-heading font-bold text-foreground">Seus dados</h2>
                <div className="space-y-3">
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground mb-1 block">Nome completo *</label>
                    <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Seu nome completo" />
                  </div>
                  <div className="relative">
                    <label className="text-xs font-semibold text-muted-foreground mb-1 block">E-mail *</label>
                    <Input
                      type="email"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        updateEmailSuggestions(e.target.value);
                      }}
                      onFocus={() => updateEmailSuggestions(email)}
                      onBlur={() => setTimeout(() => setShowEmailSuggestions(false), 200)}
                      placeholder="seu@email.com"
                    />
                    {showEmailSuggestions && emailSuggestions.length > 0 && (
                      <div className="absolute z-10 w-full mt-1 bg-background border border-border rounded-lg shadow-lg overflow-hidden">
                        {emailSuggestions.slice(0, 5).map((suggestion) => (
                          <button
                            key={suggestion}
                            type="button"
                            className="w-full text-left px-3 py-2 text-sm hover:bg-muted transition-colors border-b border-border last:border-0"
                            onMouseDown={(e) => {
                              e.preventDefault();
                              setEmail(suggestion);
                              setShowEmailSuggestions(false);
                            }}
                          >
                            {suggestion}
                          </button>
                        ))}
                      </div>
                    )}
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
                  onClick={goToShipping}
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
                  onClick={goToPayment}
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
                  <h2 className="text-lg font-heading font-bold text-foreground">Pagamento</h2>
                  <button onClick={() => setStep("shipping")} className="text-xs text-primary hover:underline">Editar entrega</button>
                </div>

                {/* Payment method selector — hidden when Stripe is the active gateway (card only) */}
                {activeGateway !== "stripe" && cardEnabled && (
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-muted-foreground block">Forma de pagamento</label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => setPaymentMethod("pix")}
                        className={`flex items-center justify-center gap-2 rounded-lg border-2 p-3 text-sm font-bold transition-all ${
                          paymentMethod === "pix"
                            ? "border-emerald-500 bg-emerald-500/5 text-emerald-600"
                            : "border-border text-muted-foreground hover:border-muted-foreground/40"
                        }`}
                      >
                        <Tag size={16} /> PIX
                      </button>
                      <button
                        onClick={() => setPaymentMethod("card")}
                        className={`flex items-center justify-center gap-2 rounded-lg border-2 p-3 text-sm font-bold transition-all ${
                          paymentMethod === "card"
                            ? "border-primary bg-primary/5 text-primary"
                            : "border-border text-muted-foreground hover:border-muted-foreground/40"
                        }`}
                      >
                        <CreditCard size={16} /> Cartão
                      </button>
                    </div>
                  </div>
                )}

                {/* PIX benefit highlight */}
                {isPix && (
                  <div className="bg-emerald-500/10 rounded-lg p-3 flex items-center gap-2">
                    <Tag size={14} className="text-emerald-600" />
                    <span className="text-xs font-medium text-emerald-700">
                      Você economiza <strong>{formatPrice(subtotal * PIX_DISCOUNT_RATE)}</strong> pagando via PIX!
                    </span>
                  </div>
                )}





                {/* Summary */}
                {/* Summary */}
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span>{formatPrice(subtotal)}</span></div>
                  {isPix && (
                    <div className="flex justify-between text-emerald-600"><span>Desconto PIX ({PIX_DISCOUNT_PERCENT}%)</span><span>-{formatPrice(pixDiscount)}</span></div>
                  )}
                  <div className="flex justify-between"><span className="text-muted-foreground">Frete ({selectedShippingOption?.name})</span><span>{shippingCost === 0 ? "Grátis" : formatPrice(shippingCost / 100)}</span></div>
                  <div className="flex justify-between font-bold text-base pt-2 border-t border-border">
                    <span>Total</span>
                    <span className="text-primary">{formatPrice(total)}</span>
                  </div>
                </div>

                {paymentError && (
                  <div className="bg-destructive/10 text-destructive text-xs font-medium rounded-lg p-3 text-center">{paymentError}</div>
                )}

                {isPix && (
                  <Button
                    onClick={handleGeneratePix}
                    disabled={generating}
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-6 text-sm"
                  >
                    {generating ? (
                      <><Loader2 size={16} className="animate-spin mr-2" /> Processando...</>
                    ) : (
                      "Comprar Agora"
                    )}
                  </Button>
                )}

                {paymentMethod === "card" && (
                  <div className="space-y-3">
                    <div>
                      <label className="text-xs font-semibold text-muted-foreground mb-1 block">Número do cartão *</label>
                      <Input
                        value={cardNumber}
                        onChange={(e) => setCardNumber(e.target.value.replace(/\D/g, "").slice(0, 16).replace(/(\d{4})/g, "$1 ").trim())}
                        placeholder="0000 0000 0000 0000"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-muted-foreground mb-1 block">Nome no cartão *</label>
                      <Input value={cardHolder} onChange={(e) => setCardHolder(e.target.value.toUpperCase())} placeholder="NOME COMO NO CARTÃO" />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs font-semibold text-muted-foreground mb-1 block">Validade *</label>
                        <Input
                          value={cardExpiry}
                          onChange={(e) => {
                            let v = e.target.value.replace(/\D/g, "").slice(0, 4);
                            if (v.length >= 3) v = v.slice(0, 2) + "/" + v.slice(2);
                            setCardExpiry(v);
                          }}
                          placeholder="MM/AA"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-muted-foreground mb-1 block">CVV *</label>
                        <Input value={cardCvv} onChange={(e) => setCardCvv(e.target.value.replace(/\D/g, "").slice(0, 4))} placeholder="123" />
                      </div>
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-muted-foreground mb-1 block">Parcelas *</label>
                      <Select value={String(installments)} onValueChange={(v) => setInstallments(Number(v))}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {Array.from({ length: 6 }, (_, i) => i + 1).map((n) => {
                            const installmentVal = getInstallmentValue(total, n);
                            const totalWithInterest = getTotalWithInterest(total, n);
                            const hasInterest = n > 1;
                            return (
                              <SelectItem key={n} value={String(n)}>
                                {n}x de {formatPrice(installmentVal)} {hasInterest ? `(total ${formatPrice(totalWithInterest)})` : "(à vista)"}
                              </SelectItem>
                            );
                          })}
                        </SelectContent>
                      </Select>
                    </div>
                    <Button
                      onClick={handleCardPayment}
                      disabled={generating}
                      className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold py-6 text-sm"
                    >
                      {generating ? (
                        <><Loader2 size={16} className="animate-spin mr-2" /> Processando...</>
                      ) : (
                        "Comprar Agora"
                      )}
                    </Button>
                  </div>
                )}
              </div>
            )}

            {/* PIX Generated - Modal Popup */}
            <Dialog open={!!pixCode} onOpenChange={(open) => { if (!open) { /* keep open until user closes manually via X */ } }}>
              <DialogContent className="max-w-md max-h-[95vh] overflow-y-auto">
                <DialogHeader>
                  <div className="w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-2">
                    <Check size={32} className="text-emerald-600" />
                  </div>
                  <DialogTitle className="text-center text-lg font-heading font-bold">
                    PIX gerado com sucesso!
                  </DialogTitle>
                  <DialogDescription className="text-center">
                    Escaneie o QR Code ou copie o código para pagar
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                  {/* QR Code */}
                  <div className="flex justify-center">
                    <div className="bg-white p-3 rounded-lg border border-border">
                      <QRCodeSVG value={pixCode} size={200} />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-muted-foreground block">
                      Código PIX Copia e Cola
                    </label>
                    <div className="relative">
                      <Input value={pixCode} readOnly className="pr-20 font-mono text-xs" />
                      <Button
                        onClick={handleCopy}
                        size="sm"
                        className={`absolute right-1 top-1 h-7 text-xs ${copied ? "bg-emerald-600 hover:bg-emerald-600" : "bg-primary hover:bg-primary/90"}`}
                      >
                        {copied ? <><Check size={12} className="mr-1" /> Copiado</> : <><Copy size={12} className="mr-1" /> Copiar</>}
                      </Button>
                    </div>
                  </div>

                  <Button
                    onClick={handleCopy}
                    className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold py-6"
                  >
                    {copied ? <><Check size={18} className="mr-2" /> Código Copiado!</> : <><Copy size={18} className="mr-2" /> Copiar Código PIX</>}
                  </Button>

                  <div className="bg-amber-500/10 rounded-lg p-3 text-center">
                    <p className="text-xs font-medium text-amber-700">
                      <Clock size={12} className="inline mr-1" />
                      Pague em até 30 minutos para garantir seu pedido
                    </p>
                  </div>

                  <div className="text-center pt-1 border-t border-border">
                    <p className="text-lg font-bold text-primary">{formatPrice(total)}</p>
                    <p className="text-xs text-muted-foreground">Valor total com desconto PIX</p>
                  </div>
                </div>
              </DialogContent>
            </Dialog>

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
                  {items.map(({ product, quantity, selections, lineId }) => (
                    <div key={lineId} className="flex gap-3">
                      <div className="relative">
                        <img src={product.image} alt={product.name} className="w-14 h-14 rounded-lg object-cover" />
                        <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                          {quantity}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium line-clamp-2">{product.name}</p>
                        {selections && selections.length > 0 && (
                          <ul className="mt-0.5 space-y-0.5 text-[10px] text-muted-foreground">
                            {selections.map((s, i) => (
                              <li key={i}>Camisa {i + 1}: {s.color} · {s.size}</li>
                            ))}
                          </ul>
                        )}
                        <p className="text-xs text-primary font-bold">{formatPrice(product.price * quantity)}</p>
                        <div className="flex items-center gap-1 mt-1">
                          <button onClick={() => updateQuantity(lineId, quantity - 1)} className="w-5 h-5 border border-border rounded flex items-center justify-center hover:bg-muted">
                            <Minus size={10} />
                          </button>
                          <span className="text-[10px] w-4 text-center">{quantity}</span>
                          <button onClick={() => updateQuantity(lineId, quantity + 1)} className="w-5 h-5 border border-border rounded flex items-center justify-center hover:bg-muted">
                            <Plus size={10} />
                          </button>
                          <button onClick={() => removeItem(lineId)} className="ml-auto text-muted-foreground hover:text-destructive">
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
                  {isPix && (
                    <div className="flex justify-between text-emerald-600">
                      <span>Desconto PIX ({PIX_DISCOUNT_PERCENT}%)</span>
                      <span>-{formatPrice(pixDiscount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Frete</span>
                    <span>{shippingCost === 0 ? "Grátis" : formatPrice(shippingCost / 100)}</span>
                  </div>
                  <div className="flex justify-between font-bold text-base pt-2 border-t border-border">
                    <span>Total</span>
                    <span className="text-primary">{formatPrice(total)}</span>
                  </div>
                  <p className="text-[10px] text-muted-foreground text-center">
                    {isPix
                      ? `${PIX_DISCOUNT_PERCENT}% de desconto no PIX`
                      : `ou em até 6x de ${formatPrice(getInstallmentValue(total, 6))}`
                    }
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
