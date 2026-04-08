import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useEffect } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { CartProvider } from "@/contexts/CartContext";
import { captureCampaignParams } from "@/lib/campaignParams";
import { trackEvent } from "@/lib/funnelTracking";
import { injectPixels, loadPixelConfigFromDb } from "@/lib/pixelManager";
import Index from "./pages/Index";
import ProductsPage from "./pages/ProductsPage";
import CollectionPage from "./pages/CollectionPage";
import ProductDetailPage from "./pages/ProductDetailPage";
import CheckoutPage from "./pages/CheckoutPage";
import AboutPage from "./pages/AboutPage";
import Admin from "./pages/Admin";
import NotFound from "./pages/NotFound";
import PrivacyPolicyPage from "./pages/PrivacyPolicyPage";
import TermsPage from "./pages/TermsPage";
import ReturnPolicyPage from "./pages/ReturnPolicyPage";

const queryClient = new QueryClient();

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
      <TooltipProvider>
        <CartProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/produtos" element={<ProductsPage />} />
              <Route path="/colecao/:slug" element={<CollectionPage />} />
              <Route path="/produto/:slug" element={<ProductDetailPage />} />
              <Route path="/sobre" element={<AboutPage />} />
              <Route path="/politica-de-privacidade" element={<PrivacyPolicyPage />} />
              <Route path="/termos-de-uso" element={<TermsPage />} />
              <Route path="/trocas-e-devolucoes" element={<ReturnPolicyPage />} />
              <Route path="/checkout" element={<CheckoutPage />} />
              <Route path="/admin" element={<Admin />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </CartProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
