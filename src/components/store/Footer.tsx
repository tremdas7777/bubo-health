import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import logoIcon from "@/assets/logo-icon.png";
import { useStoreConfig } from "@/hooks/useStoreConfig";
import LanguageCurrencySwitcher from "./LanguageCurrencySwitcher";

export default function Footer() {
  const { t } = useTranslation();
  const { config } = useStoreConfig();
  const cleanNumber = config.whatsapp_number?.replace(/\D/g, "") || "";

  return (
    <footer className="bg-foreground text-background/80">
      <div className="container mx-auto px-4 py-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <img src={logoIcon} alt="Bubo Health" width={32} height={32} className="w-8 h-8" />
              <span className="text-lg font-heading font-bold text-lime">Bubo Health</span>
            </div>
            <p className="text-sm opacity-60 leading-relaxed">
              {t("footer.tagline")}
            </p>
            <div className="flex gap-3 mt-3">
              <a href="https://instagram.com/bubohealth" target="_blank" rel="noopener noreferrer" className="opacity-60 hover:opacity-100 transition-opacity" aria-label="Instagram">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>
              </a>
              <a href="https://facebook.com/bubohealth" target="_blank" rel="noopener noreferrer" className="opacity-60 hover:opacity-100 transition-opacity" aria-label="Facebook">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
              </a>
              <a href="https://tiktok.com/@bubohealth" target="_blank" rel="noopener noreferrer" className="opacity-60 hover:opacity-100 transition-opacity" aria-label="TikTok">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5"/></svg>
              </a>
            </div>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-heading font-semibold text-sm mb-3 text-background">{t("footer.quickLinks")}</h4>
            <div className="space-y-1.5 text-sm opacity-60">
              <Link to="/" className="block hover:opacity-100 transition-opacity">{t("nav.home")}</Link>
              <Link to="/produtos" className="block hover:opacity-100 transition-opacity">{t("footer.allProducts")}</Link>
              <Link to="/sobre" className="block hover:opacity-100 transition-opacity">{t("footer.about")}</Link>
              <Link to="/contato" className="block hover:opacity-100 transition-opacity">{t("footer.contact")}</Link>
              <Link to="/rastrear" className="block hover:opacity-100 transition-opacity">{t("footer.trackOrder")}</Link>
            </div>
          </div>

          {/* Policies */}
          <div>
            <h4 className="font-heading font-semibold text-sm mb-3 text-background">{t("footer.legal")}</h4>
            <div className="space-y-1.5 text-sm opacity-60">
              <Link to="/politica-de-privacidade" className="block hover:opacity-100 transition-opacity">{t("footer.privacy")}</Link>
              <Link to="/termos-de-uso" className="block hover:opacity-100 transition-opacity">{t("footer.terms")}</Link>
              <Link to="/trocas-e-devolucoes" className="block hover:opacity-100 transition-opacity">{t("footer.returns")}</Link>
              <Link to="/faq" className="block hover:opacity-100 transition-opacity">{t("footer.faq")}</Link>
            </div>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-heading font-semibold text-sm mb-3 text-background">{t("footer.support")}</h4>
            <div className="space-y-1.5 text-sm opacity-60">
              <p>{t("footer.businessHours")}</p>
              <p>{t("footerExtras.businessEmail")}</p>
              <p className="text-xs">{t("footerExtras.businessAddress")}</p>
              {cleanNumber && (
                <a
                  href={`https://wa.me/${cleanNumber}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block mt-2 bg-[#25D366] text-white px-4 py-2 rounded-lg font-medium text-xs hover:opacity-90 transition-opacity"
                >
                  {t("footer.chatWhatsApp")}
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Payment Flags */}
        <div className="border-t border-background/10 mt-8 pt-6 pb-2">
          <p className="text-center text-[10px] uppercase tracking-widest opacity-40 mb-3 font-semibold">{t("footer.paymentMethods")}</p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            {/* Visa */}
            <div className="bg-white rounded-md flex items-center justify-center h-9 w-14 shadow-sm">
              <span className="text-[#1A1F71] font-black text-[10px] italic tracking-tight">VISA</span>
            </div>
            {/* Mastercard */}
            <div className="bg-white rounded-md flex items-center justify-center h-9 w-14 shadow-sm">
              <svg viewBox="0 0 48 32" className="h-6 w-10" xmlns="http://www.w3.org/2000/svg">
                <circle cx="19" cy="16" r="9" fill="#EB001B"/>
                <circle cx="29" cy="16" r="9" fill="#F79E1B"/>
                <path d="M24 9.2a9 9 0 013.4 6.8A9 9 0 0124 22.8a9 9 0 01-3.4-6.8A9 9 0 0124 9.2z" fill="#FF5F00"/>
              </svg>
            </div>
            {/* American Express */}
            <div className="bg-[#006FCF] rounded-md flex items-center justify-center h-9 w-14 shadow-sm">
              <span className="text-white font-black text-[9px] leading-[1.1] text-center tracking-tight">AMEX</span>
            </div>
            {/* Apple Pay */}
            <div className="bg-black rounded-md flex items-center justify-center h-9 w-14 shadow-sm">
              <span className="text-white font-semibold text-[9px]"> Pay</span>
            </div>
            {/* Google Pay */}
            <div className="bg-white rounded-md flex items-center justify-center h-9 w-14 shadow-sm">
              <span className="text-[#5F6368] font-semibold text-[9px]">G Pay</span>
            </div>
          </div>
        </div>

        <div className="border-t border-background/10 mt-4 pt-5 flex flex-col md:flex-row items-center justify-between gap-4 text-[11px] opacity-40">
          <div>© {new Date().getFullYear()} Bubo Health. {t("footer.rights")}</div>
          <div className="text-background scale-90 md:scale-100">
            <LanguageCurrencySwitcher />
          </div>
        </div>
      </div>
    </footer>
  );
}
