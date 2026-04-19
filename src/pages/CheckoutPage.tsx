import { useState, useEffect, useCallback } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ArrowLeft, ShieldCheck, Lock, Truck, Clock, Loader2, Minus, Plus, Trash2, ChevronDown, ChevronUp, CreditCard } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import { useLocalization } from "@/contexts/LocalizationContext";
import { trackEvent } from "@/lib/funnelTracking";
import { supabase } from "@/integrations/supabase/client";
import { fetchPaymentGatewayConfig } from "@/lib/paymentGateway";
import { fireWebhookEvent } from "@/lib/webhookManager";
import { notifyUtmifyServerSide } from "@/lib/utmifyManager";
import { getCampaignParams } from "@/lib/campaignParams";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getTotalWithInterest, getInstallmentValue } from "@/lib/pricing";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { detectVisitorLocale, getTaxIdLabel, supportsInstallments } from "@/lib/checkoutLocale";
import PhoneCountryInput from "@/components/store/PhoneCountryInput";

type Step = "identification" | "shipping" | "payment";

interface ShippingOption {
  id: string;
  name: string;
  price_cents: number;
  days_min: number;
  days_max: number;
}

const DEFAULT_SHIPPING: ShippingOption[] = [
  { id: "standard", name: "Standard Worldwide", price_cents: 0, days_min: 8, days_max: 15 },
  { id: "express", name: "Express Worldwide", price_cents: 1990, days_min: 3, days_max: 7 },
];

const COUNTRIES: { code: string; name: string }[] = [
  { code: "us", name: "United States" }, { code: "gb", name: "United Kingdom" },
  { code: "ca", name: "Canada" }, { code: "au", name: "Australia" },
  { code: "de", name: "Germany" }, { code: "fr", name: "France" },
  { code: "es", name: "Spain" }, { code: "it", name: "Italy" },
  { code: "pt", name: "Portugal" }, { code: "nl", name: "Netherlands" },
  { code: "br", name: "Brazil" }, { code: "mx", name: "Mexico" },
  { code: "ar", name: "Argentina" }, { code: "jp", name: "Japan" },
  { code: "ie", name: "Ireland" }, { code: "be", name: "Belgium" },
  { code: "ch", name: "Switzerland" }, { code: "at", name: "Austria" },
  { code: "se", name: "Sweden" }, { code: "no", name: "Norway" },
  { code: "dk", name: "Denmark" }, { code: "fi", name: "Finland" },
  { code: "pl", name: "Poland" }, { code: "nz", name: "New Zealand" },
];

async function extractFunctionErrorMessage(error: unknown) {
  if (error && typeof error === "object" && "context" in error) {
    const response = (error as { context?: Response }).context;
    if (response instanceof Response) {
      try {
        const payload = await response.clone().json() as { error?: string; details?: { refusedReason?: { description?: string } } };
        return payload.error || payload.details?.refusedReason?.description || "Payment error";
      } catch {
        try { const text = await response.clone().text(); if (text) return text; } catch { /* ignore */ }
      }
    }
  }
  return error instanceof Error ? error.message : "Unknown payment error";
}

const EMAIL_DOMAINS = [
  "@gmail.com", "@hotmail.com", "@outlook.com", "@yahoo.com",
  "@icloud.com", "@live.com", "@msn.com", "@protonmail.com",
];

export default function CheckoutPage() {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const { items, totalPrice, updateQuantity, removeItem } = useCart();
  const { user } = useAuth();
  const { formatPrice: formatCents } = useLocalization();
  // Local helper: our checkout works in dollars, but formatCents expects cents.
  const formatPrice = (dollars: number) => formatCents(Math.round(dollars * 100));
  const [step, setStep] = useState<Step>("identification");
  const [showOrderSummary, setShowOrderSummary] = useState(false);

  // Auto-detected country from IP (default = "us" until detection completes)
  const [country, setCountry] = useState<string>("us");
  const taxIdLabel = getTaxIdLabel(country);

  // Form fields
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [taxId, setTaxId] = useState(""); // optional everywhere

  // Shipping
  const [postalCode, setPostalCode] = useState("");
  const [address, setAddress] = useState("");
  const [address2, setAddress2] = useState("");
  const [city, setCity] = useState("");
  const [stateRegion, setStateRegion] = useState("");
  const [selectedShipping, setSelectedShipping] = useState("standard");
  const [shippingOptions, setShippingOptions] = useState<ShippingOption[]>(DEFAULT_SHIPPING);
  const [loadingZip, setLoadingZip] = useState(false);

  // Payment
  const [cardEnabled, setCardEnabled] = useState(false);
  const [activeGateway, setActiveGateway] = useState<string>("stripe");
  const [generating, setGenerating] = useState(false);
  const [paymentError, setPaymentError] = useState("");

  // Card fields
  const [cardNumber, setCardNumber] = useState("");
  const [cardHolder, setCardHolder] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvv, setCardCvv] = useState("");
  const installments = 1; // installments removed — pay in full only

  // Live checkout tracking
  const [draftOrderId, setDraftOrderId] = useState<string>("");

  // Timer urgency
  const [timeLeft, setTimeLeft] = useState(15 * 60);

  // Email suggestions
  const [emailSuggestions, setEmailSuggestions] = useState<string[]>([]);
  const [showEmailSuggestions, setShowEmailSuggestions] = useState(false);

  const updateEmailSuggestions = useCallback((value: string) => {
    if (!value || (value.includes("@") && value.indexOf("@") < value.length - 1)) {
      const atIndex = value.indexOf("@");
      if (atIndex > 0) {
        const typed = value.slice(atIndex);
        const prefix = value.slice(0, atIndex);
        const matches = EMAIL_DOMAINS.filter((d) => d.startsWith(typed) && d !== typed);
        setEmailSuggestions(matches.map((d) => prefix + d));
        setShowEmailSuggestions(matches.length > 0);
      } else {
        setEmailSuggestions([]); setShowEmailSuggestions(false);
      }
      return;
    }
    if (value.includes("@")) {
      const prefix = value.slice(0, value.indexOf("@"));
      setEmailSuggestions(EMAIL_DOMAINS.map((d) => prefix + d));
      setShowEmailSuggestions(true);
      return;
    }
    setEmailSuggestions([]); setShowEmailSuggestions(false);
  }, []);

  // Detect visitor country once
  useEffect(() => {
    detectVisitorLocale().then((loc) => {
      setCountry(loc.countryCode);
      if (loc.city && !city) setCity(loc.city);
      if (loc.region && !stateRegion) setStateRegion(loc.region);
      if (loc.postal && !postalCode) setPostalCode(loc.postal);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    void trackEvent("checkout");
    fetchPaymentGatewayConfig().then((cfg) => {
      setActiveGateway(cfg.activeGateway);
      const methods = cfg.paymentMethods[cfg.activeGateway] || cfg.paymentMethods.default || "card";
      setCardEnabled(methods === "card" || methods === "pix_card");
    });
  }, []);

  useEffect(() => {
    if (items.length === 0) navigate("/");
  }, [items, navigate]);

  // Countdown
  useEffect(() => {
    if (timeLeft <= 0) return;
    const tt = setInterval(() => setTimeLeft((p) => Math.max(0, p - 1)), 1000);
    return () => clearInterval(tt);
  }, [timeLeft]);

  // Load shipping config from DB
  useEffect(() => {
    supabase.from("shipping_config").select("*").limit(1).maybeSingle().then(({ data }) => {
      if (data?.shipping_options && Array.isArray(data.shipping_options) && (data.shipping_options as unknown as ShippingOption[]).length > 0) {
        setShippingOptions(data.shipping_options as unknown as ShippingOption[]);
      }
    });
  }, []);

  // Pre-fill from profile
  useEffect(() => {
    if (!user) return;
    supabase.from("profiles").select("*").eq("user_id", user.id).maybeSingle().then(({ data }) => {
      if (!data) return;
      if (data.full_name && !name) setName(data.full_name);
      if (data.email && !email) setEmail(data.email);
      if (data.phone && !phone) setPhone(data.phone);
      if (data.cpf && !taxId) setTaxId(data.cpf);
      if (data.address_zip && !postalCode) {
        setPostalCode(data.address_zip);
        if (data.address_street) setAddress(data.address_street);
        if (data.address_complement) setAddress2(data.address_complement);
        if (data.address_city) setCity(data.address_city);
        if (data.address_state) setStateRegion(data.address_state);
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const selectedShippingOption = shippingOptions.find((s) => s.id === selectedShipping) || shippingOptions[0];
  const shippingCost = selectedShippingOption?.price_cents || 0;
  const subtotal = totalPrice;
  const total = subtotal + shippingCost / 100;
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const timerStr = `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;

  const saveOrderItems = async (oid: string) => {
    try {
      const rows = items.map((i) => ({
        order_id: oid, product_id: i.product.id, product_name: i.product.name,
        quantity: i.quantity, price_cents: Math.round(i.product.price * 100),
      }));
      await supabase.from("order_items").insert(rows);
    } catch (e) { console.error("Failed to save order items", e); }
  };

  // Global postal-code lookup (Zippopotam) — fills city/state when possible
  const handleZipLookup = async (zipValue: string, countryCode: string) => {
    const cleaned = zipValue.replace(/\s+/g, "").toUpperCase();
    if (!cleaned) return;
    setLoadingZip(true);
    try {
      const res = await fetch(`https://api.zippopotam.us/${countryCode}/${encodeURIComponent(cleaned)}`);
      if (res.ok) {
        const data = await res.json();
        const place = data.places?.[0];
        if (place) {
          if (place["place name"]) setCity(place["place name"]);
          const st = place["state"] || place["state abbreviation"];
          if (st) setStateRegion(st);
        }
      }
    } catch { /* ignore */ }
    setLoadingZip(false);
  };

  const validateIdentification = () => {
    if (!name.trim() || !email.trim() || !phone.trim()) return false;
    if (!email.includes("@")) return false;
    return true;
  };

  const validateShipping = () =>
    !!postalCode.trim() && !!address.trim() && !!city.trim() && !!stateRegion.trim();

  const upsertDraftOrder = useCallback(async (nextStep: "shipping" | "payment") => {
    try {
      const payload = {
        buyer_name: name, buyer_email: email,
        buyer_phone: phone.replace(/\D/g, ""),
        buyer_document: taxId.replace(/\D/g, "") || null,
        amount_cents: Math.round(totalPrice * 100),
        status: "draft", checkout_step: nextStep,
        checkout_step_updated_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      } as Record<string, unknown>;
      if (draftOrderId) {
        await supabase.from("orders").update(payload as never).eq("id", draftOrderId);
      } else {
        const { data } = await supabase.from("orders").insert(payload as never).select("id").maybeSingle();
        if (data?.id) setDraftOrderId(data.id);
      }
    } catch (e) { console.warn("draft order upsert failed", e); }
  }, [draftOrderId, name, email, phone, taxId, totalPrice]);

  const goToShipping = () => { void upsertDraftOrder("shipping"); setStep("shipping"); };
  const goToPayment = () => { void upsertDraftOrder("payment"); setStep("payment"); };

  const handleCardPayment = async () => {
    setGenerating(true); setPaymentError("");
    try {
      const gatewayConfig = await fetchPaymentGatewayConfig();
      const gateway = "beehive";

      if (!cardNumber || !cardHolder || !cardExpiry || !cardCvv) {
        setPaymentError(t("checkout.processing"));
        setGenerating(false);
        return;
      }
      if (typeof BeehivePay === "undefined") {
        setPaymentError("Payment library not loaded. Please reload.");
        setGenerating(false);
        return;
      }

      BeehivePay.setPublicKey(gatewayConfig.beehive.publicKey);
      BeehivePay.setTestMode(!gatewayConfig.beehive.publicKey.startsWith("pk_live_"));

      const [expMonth, expYear] = cardExpiry.split("/").map((s) => parseInt(s.trim(), 10));
      const fullYear = expYear < 100 ? 2000 + expYear : expYear;
      const cardHash = await BeehivePay.encrypt({
        number: cardNumber.replace(/\D/g, ""), holderName: cardHolder,
        expMonth, expYear: fullYear, cvv: cardCvv,
      });

      const bodyBase: Record<string, unknown> = {
        amount: total,
        buyerName: name, buyerEmail: email,
        buyerDocument: taxId.replace(/\D/g, "") || "00000000000",
        buyerPhone: phone.replace(/\D/g, ""),
        cardHash, installments,
        metadata: {
          country, address, address2, city, state: stateRegion,
          cep: postalCode.replace(/\s+/g, ""), shippingMethod: selectedShipping, shippingCostCents: shippingCost,
        },
      };

      const { data, error } = await supabase.functions.invoke("criar-cartao-beehive", { body: bodyBase });
      if (error) throw new Error(await extractFunctionErrorMessage(error));
      const result = data as { order_id?: string; status?: string; error?: string } | null;
      if (result?.error) { setPaymentError(result.error); setGenerating(false); return; }

      if (result?.order_id) {
        void notifyUtmifyServerSide({
          orderId: result.order_id, status: "waiting_payment", paymentMethod: "credit_card",
          customerName: name, customerEmail: email, customerPhone: phone || null,
          customerDocument: taxId?.replace(/\D/g, "") || null,
          productName: items[0]?.product?.name || "Kazoom Order",
          priceInCents: Math.round(total * 100), trackingParameters: getCampaignParams(),
        });
      }

      if (result?.status === "paid") {
        if (result.order_id) await saveOrderItems(result.order_id);
        if (draftOrderId) { await supabase.from("orders").delete().eq("id", draftOrderId); setDraftOrderId(""); }
        supabase.functions.invoke("send-order-email", {
          body: {
            orderId: result.order_id, buyerEmail: email, buyerName: name,
            status: "paid", amountCents: Math.round(total * 100), type: "status",
            items: items.map(i => ({ name: i.product.name, quantity: i.quantity, priceCents: Math.round(i.product.price * 100) })),
          },
        }).catch(e => console.error("Email error:", e));
        await fireWebhookEvent("venda_aprovada", {
          source: "checkout", buyerName: name, buyerEmail: email, buyerPhone: phone,
          amount: total, orderId: result.order_id, gateway,
        });
        void notifyUtmifyServerSide({
          orderId: result.order_id || "", status: "paid", paymentMethod: "credit_card",
          customerName: name, customerEmail: email, customerPhone: phone || null,
          customerDocument: taxId?.replace(/\D/g, "") || null,
          productName: items[0]?.product?.name || "Kazoom Order",
          priceInCents: Math.round(total * 100), trackingParameters: getCampaignParams(),
        });
        void trackEvent("purchase");
        navigate(`/obrigado?pedido=${result.order_id}&metodo=card`);
      } else {
        setPaymentError("Payment not approved. Please check your card details.");
        if (result?.order_id) {
          void notifyUtmifyServerSide({
            orderId: result.order_id, status: "refused", paymentMethod: "credit_card",
            customerName: name, customerEmail: email, customerPhone: phone || null,
            customerDocument: taxId?.replace(/\D/g, "") || null,
            productName: items[0]?.product?.name || "Kazoom Order",
            priceInCents: Math.round(total * 100), trackingParameters: getCampaignParams(),
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
    setGenerating(true); setPaymentError("");
    try {
      const successUrl = `${window.location.origin}/obrigado`;
      const cancelUrl = `${window.location.origin}/checkout`;
      const cartItems = items.map((i) => ({
        name: i.product.name, quantity: i.quantity,
        amount_cents: Math.round(i.product.price * 100),
        product_id: i.product.id || null,
        image: i.product.image || (i.product.images?.[0] ?? null),
      }));
      const { data, error } = await supabase.functions.invoke("stripe-checkout", {
        body: {
          items: cartItems, buyerName: name, buyerEmail: email,
          buyerPhone: phone.replace(/\D/g, ""), currency: "usd",
          shippingCostCents: shippingCost, successUrl, cancelUrl,
          metadata: {
            country, address: `${address} ${address2}`.trim(), city, state: stateRegion,
            postal: postalCode, shippingMethod: selectedShipping,
          },
        },
      });
      if (error) throw new Error(await extractFunctionErrorMessage(error));
      const result = data as { url?: string; order_id?: string; error?: string } | null;
      if (result?.error) { setPaymentError(result.error); setGenerating(false); return; }
      if (!result?.url) { setPaymentError("Could not start Stripe checkout."); setGenerating(false); return; }
      if (draftOrderId) { await supabase.from("orders").delete().eq("id", draftOrderId); setDraftOrderId(""); }
      void trackEvent("purchase");
      window.location.href = result.url;
    } catch (err) {
      console.error(err);
      setPaymentError(await extractFunctionErrorMessage(err));
      setGenerating(false);
    }
  };

  const stepIndex = step === "identification" ? 0 : step === "shipping" ? 1 : 2;
  const stepLabels = [t("checkout.step1"), t("checkout.step2"), t("checkout.step3")];

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Top urgency bar */}
      <div className="bg-primary text-primary-foreground text-center py-2 px-4">
        <p className="text-xs font-bold flex items-center justify-center gap-2">
          <Clock size={14} />
          {t("checkout.urgencyTimer", { time: timerStr })}
        </p>
      </div>

      {/* Header */}
      <header className="bg-background border-b border-border">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <button onClick={() => navigate(-1)} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft size={16} /> {t("checkout.back")}
          </button>
          <Link to="/" className="text-xl font-heading font-bold text-primary">Kazoom</Link>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Lock size={12} /> {t("checkout.secure")}
          </div>
        </div>
      </header>

      {/* Progress steps */}
      <div className="bg-background border-b border-border">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-center gap-2">
            {stepLabels.map((label, i) => (
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
                <h2 className="text-lg font-heading font-bold text-foreground">{t("checkout.step1")}</h2>
                <div className="space-y-3">
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground mb-1 block">{t("checkout.fullName")} *</label>
                    <Input value={name} onChange={(e) => setName(e.target.value)} placeholder={t("checkout.fullNamePh")} />
                  </div>
                  <div className="relative">
                    <label className="text-xs font-semibold text-muted-foreground mb-1 block">{t("checkout.email")} *</label>
                    <Input
                      type="email" value={email}
                      onChange={(e) => { setEmail(e.target.value); updateEmailSuggestions(e.target.value); }}
                      onFocus={() => updateEmailSuggestions(email)}
                      onBlur={() => setTimeout(() => setShowEmailSuggestions(false), 200)}
                      placeholder={t("checkout.emailPh")}
                    />
                    {showEmailSuggestions && emailSuggestions.length > 0 && (
                      <div className="absolute z-10 w-full mt-1 bg-background border border-border rounded-lg shadow-lg overflow-hidden">
                        {emailSuggestions.slice(0, 5).map((suggestion) => (
                          <button
                            key={suggestion} type="button"
                            className="w-full text-left px-3 py-2 text-sm hover:bg-muted transition-colors border-b border-border last:border-0"
                            onMouseDown={(e) => { e.preventDefault(); setEmail(suggestion); setShowEmailSuggestions(false); }}
                          >
                            {suggestion}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-semibold text-muted-foreground mb-1 block">{t("checkout.phone")} *</label>
                      <PhoneCountryInput value={phone} onChange={setPhone} defaultCountry={country} placeholder={t("checkout.phone")} />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-muted-foreground mb-1 block">{taxIdLabel}</label>
                      <Input value={taxId} onChange={(e) => setTaxId(e.target.value)} placeholder={t("checkout.taxIdHint")} />
                    </div>
                  </div>
                </div>
                <Button
                  onClick={goToShipping}
                  disabled={!validateIdentification()}
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold py-6 text-sm"
                >
                  {t("checkout.continueShipping")}
                </Button>
              </div>
            )}

            {/* Step: Shipping */}
            {step === "shipping" && (
              <div className="bg-background rounded-xl border border-border p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-heading font-bold text-foreground">{t("checkout.step2")}</h2>
                  <button onClick={() => setStep("identification")} className="text-xs text-primary hover:underline">{t("checkout.editData")}</button>
                </div>
                <div className="space-y-3">
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground mb-1 block">{t("checkout.country")} *</label>
                    <Select value={country} onValueChange={(v) => { setCountry(v); }}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent className="max-h-72">
                        {COUNTRIES.map((c) => (
                          <SelectItem key={c.code} value={c.code}>{c.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-semibold text-muted-foreground mb-1 block">{t("checkout.postalCode")} *</label>
                      <div className="flex gap-2">
                        <Input
                          value={postalCode}
                          onChange={(e) => {
                            const v = e.target.value;
                            setPostalCode(v);
                            if (v.length >= 4) handleZipLookup(v, country);
                          }}
                          placeholder={t("checkout.postalCodePh")}
                          className="flex-1"
                        />
                        {loadingZip && <Loader2 size={20} className="animate-spin text-primary mt-2" />}
                      </div>
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-muted-foreground mb-1 block">{t("checkout.city")} *</label>
                      <Input value={city} onChange={(e) => setCity(e.target.value)} placeholder={t("checkout.city")} />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground mb-1 block">{t("checkout.address1")} *</label>
                    <Input value={address} onChange={(e) => setAddress(e.target.value)} placeholder={t("checkout.address1Ph")} />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground mb-1 block">{t("checkout.address2")}</label>
                    <Input value={address2} onChange={(e) => setAddress2(e.target.value)} placeholder={t("checkout.address2")} />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground mb-1 block">{t("checkout.state")} *</label>
                    <Input value={stateRegion} onChange={(e) => setStateRegion(e.target.value)} placeholder={t("checkout.state")} />
                  </div>

                  {/* Shipping methods */}
                  <div className="pt-2">
                    <label className="text-xs font-semibold text-muted-foreground mb-2 block">{t("checkout.shippingMethod")}</label>
                    <div className="space-y-2">
                      {shippingOptions.map((opt) => (
                        <label
                          key={opt.id}
                          className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                            selectedShipping === opt.id ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
                          }`}
                        >
                          <input
                            type="radio" name="shipping" value={opt.id}
                            checked={selectedShipping === opt.id}
                            onChange={(e) => setSelectedShipping(e.target.value)}
                            className="accent-primary"
                          />
                          <Truck size={16} className="text-primary" />
                          <div className="flex-1">
                            <p className="text-sm font-medium">{opt.name}</p>
                            <p className="text-[11px] text-muted-foreground">{t("checkout.deliveryDays", { min: opt.days_min, max: opt.days_max })}</p>
                          </div>
                          <span className="text-sm font-bold text-primary">
                            {opt.price_cents === 0 ? t("checkout.freeLabel") : formatPrice(opt.price_cents / 100)}
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
                  {t("checkout.continuePayment")}
                </Button>
              </div>
            )}

            {/* Step: Payment */}
            {step === "payment" && (
              <div className="bg-background rounded-xl border border-border p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-heading font-bold text-foreground">{t("checkout.step3")}</h2>
                  <button onClick={() => setStep("shipping")} className="text-xs text-primary hover:underline">{t("checkout.editShipping")}</button>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between"><span className="text-muted-foreground">{t("checkout.subtotalLabel")}</span><span>{formatPrice(subtotal)}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">{t("checkout.shippingLabel")} ({selectedShippingOption?.name})</span><span>{shippingCost === 0 ? t("checkout.freeLabel") : formatPrice(shippingCost / 100)}</span></div>
                  <div className="flex justify-between font-bold text-base pt-2 border-t border-border">
                    <span>{t("checkout.totalLabel")}</span>
                    <span className="text-primary">{formatPrice(total)}</span>
                  </div>
                </div>

                {paymentError && (
                  <div className="bg-destructive/10 text-destructive text-xs font-medium rounded-lg p-3 text-center">{paymentError}</div>
                )}

                {activeGateway === "stripe" && (
                  <div className="space-y-3">
                    <div className="rounded-lg border border-primary/30 bg-primary/5 p-3 flex items-center gap-2">
                      <Lock size={14} className="text-primary" />
                      <span className="text-xs font-medium text-foreground">{t("checkout.secureNotice")}</span>
                    </div>
                    <Button
                      onClick={handleStripeCheckout}
                      disabled={generating}
                      className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold py-6 text-sm"
                    >
                      {generating ? (
                        <><Loader2 size={16} className="animate-spin mr-2" /> {t("checkout.redirecting")}</>
                      ) : (
                        <><CreditCard size={16} className="mr-2" /> {t("checkout.payWithStripe", { amount: formatPrice(total) })}</>
                      )}
                    </Button>
                  </div>
                )}

                {activeGateway !== "stripe" && cardEnabled && (
                  <div className="space-y-3">
                    <div>
                      <label className="text-xs font-semibold text-muted-foreground mb-1 block">{t("checkout.cardNumber")} *</label>
                      <Input
                        value={cardNumber}
                        onChange={(e) => setCardNumber(e.target.value.replace(/\D/g, "").slice(0, 16).replace(/(\d{4})/g, "$1 ").trim())}
                        placeholder="0000 0000 0000 0000"
                        inputMode="numeric"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-muted-foreground mb-1 block">{t("checkout.cardHolder")} *</label>
                      <Input value={cardHolder} onChange={(e) => setCardHolder(e.target.value.toUpperCase())} placeholder={t("checkout.cardHolderPh")} />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs font-semibold text-muted-foreground mb-1 block">{t("checkout.expiry")} *</label>
                        <Input
                          value={cardExpiry}
                          onChange={(e) => {
                            let v = e.target.value.replace(/\D/g, "").slice(0, 4);
                            if (v.length >= 3) v = v.slice(0, 2) + "/" + v.slice(2);
                            setCardExpiry(v);
                          }}
                          placeholder="MM/YY"
                          inputMode="numeric"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-muted-foreground mb-1 block">{t("checkout.cvv")} *</label>
                        <Input value={cardCvv} onChange={(e) => setCardCvv(e.target.value.replace(/\D/g, "").slice(0, 4))} placeholder="123" inputMode="numeric" />
                      </div>
                    </div>
                    {/* Installments removed — pay in full only */}
                    <Button
                      onClick={handleCardPayment}
                      disabled={generating}
                      className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold py-6 text-sm"
                    >
                      {generating ? (
                        <><Loader2 size={16} className="animate-spin mr-2" /> {t("checkout.processing")}</>
                      ) : (
                        t("checkout.payNow", { amount: formatPrice(total) })
                      )}
                    </Button>
                  </div>
                )}
              </div>
            )}

            {/* Trust badges */}
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-background rounded-lg border border-border p-3 text-center">
                <ShieldCheck size={20} className="text-primary mx-auto mb-1" />
                <p className="text-[10px] font-bold text-foreground">{t("checkout.trustSecure")}</p>
              </div>
              <div className="bg-background rounded-lg border border-border p-3 text-center">
                <Lock size={20} className="text-primary mx-auto mb-1" />
                <p className="text-[10px] font-bold text-foreground">{t("checkout.trustProtected")}</p>
              </div>
              <div className="bg-background rounded-lg border border-border p-3 text-center">
                <Truck size={20} className="text-primary mx-auto mb-1" />
                <p className="text-[10px] font-bold text-foreground">{t("checkout.trustDelivery")}</p>
              </div>
            </div>
          </div>

          {/* Right sidebar — Order summary */}
          <div className="lg:col-span-2">
            <button
              onClick={() => setShowOrderSummary(!showOrderSummary)}
              className="lg:hidden w-full flex items-center justify-between bg-background rounded-lg border border-border p-3 mb-3"
            >
              <span className="text-sm font-bold">
                {t("checkout.orderSummary")} ({items.length} {items.length === 1 ? t("checkout.itemsOne") : t("checkout.items")})
              </span>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-primary">{formatPrice(total)}</span>
                {showOrderSummary ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </div>
            </button>

            <div className={`${showOrderSummary ? "block" : "hidden"} lg:block`}>
              <div className="bg-background rounded-xl border border-border p-4 space-y-4 sticky top-4">
                <h3 className="text-sm font-heading font-bold text-foreground">{t("checkout.orderSummary")}</h3>

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
                              <li key={i}>{i + 1}: {s.color} · {s.size}</li>
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

                <div className="border-t border-border pt-3 space-y-1.5 text-xs">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">{t("checkout.subtotalLabel")}</span>
                    <span>{formatPrice(subtotal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">{t("checkout.shippingLabel")}</span>
                    <span>{shippingCost === 0 ? t("checkout.freeLabel") : formatPrice(shippingCost / 100)}</span>
                  </div>
                  <div className="flex justify-between font-bold text-base pt-2 border-t border-border">
                    <span>{t("checkout.totalLabel")}</span>
                    <span className="text-primary">{formatPrice(total)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
