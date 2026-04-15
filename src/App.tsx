import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { lazy, Suspense, useEffect } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { CartProvider } from "@/contexts/CartContext";
import { WishlistProvider } from "@/contexts/WishlistContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { captureCampaignParams } from "@/lib/campaignParams";
import { trackEvent } from "@/lib/funnelTracking";
import { injectPixels, loadPixelConfigFromDb } from "@/lib/pixelManager";

const Index = lazy(() => import("./pages/Index"));
const ProductsPage = lazy(() => import("./pages/ProductsPage"));
const CollectionPage = lazy(() => import("./pages/CollectionPage"));
const ProductDetailPage = lazy(() => import("./pages/ProductDetailPage"));
const CheckoutPage = lazy(() => import("./pages/CheckoutPage"));
const AboutPage = lazy(() => import("./pages/AboutPage"));
const Admin = lazy(() => import("./pages/Admin"));
const NotFound = lazy(() => import("./pages/NotFound"));
const PrivacyPolicyPage = lazy(() => import("./pages/PrivacyPolicyPage"));
const TermsPage = lazy(() => import("./pages/TermsPage"));
const ReturnPolicyPage = lazy(() => import("./pages/ReturnPolicyPage"));
const ContactPage = lazy(() => import("./pages/ContactPage"));
const WishlistPage = lazy(() => import("./pages/WishlistPage"));
const ThankYouPage = lazy(() => import("./pages/ThankYouPage"));
const AuthPage = lazy(() => import("./pages/AuthPage"));
const AccountPage = lazy(() => import("./pages/AccountPage"));
const ResetPasswordPage = lazy(() => import("./pages/ResetPasswordPage"));
const FAQPage = lazy(() => import("./pages/FAQPage"));

const queryClient = new QueryClient();

function PageLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  );
}

const App = () => {
  useEffect(() => {
    captureCampaignParams();
    void trackEvent("visitor");
    loadPixelConfigFromDb().then((config) => {
      injectPixels(config);
    });
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <TooltipProvider>
          <AuthProvider>
            <CartProvider>
              <WishlistProvider>
              <Toaster />
              <Sonner />
              <BrowserRouter>
                <Suspense fallback={<PageLoader />}>
                  <Routes>
                    <Route path="/" element={<Index />} />
                    <Route path="/produtos" element={<ProductsPage />} />
                    <Route path="/colecao/:slug" element={<CollectionPage />} />
                    <Route path="/produto/:slug" element={<ProductDetailPage />} />
                    <Route path="/sobre" element={<AboutPage />} />
                    <Route path="/politica-de-privacidade" element={<PrivacyPolicyPage />} />
                    <Route path="/termos-de-uso" element={<TermsPage />} />
                    <Route path="/trocas-e-devolucoes" element={<ReturnPolicyPage />} />
                    <Route path="/contato" element={<ContactPage />} />
                    <Route path="/checkout" element={<CheckoutPage />} />
                    <Route path="/favoritos" element={<WishlistPage />} />
                    <Route path="/obrigado" element={<ThankYouPage />} />
                    <Route path="/entrar" element={<AuthPage />} />
                    <Route path="/conta" element={<AccountPage />} />
                    <Route path="/redefinir-senha" element={<ResetPasswordPage />} />
                    <Route path="/admin" element={<Admin />} />
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </Suspense>
              </BrowserRouter>
              </WishlistProvider>
            </CartProvider>
          </AuthProvider>
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default App;
