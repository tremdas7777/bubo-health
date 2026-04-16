import { Link } from "react-router-dom";
import logoIcon from "@/assets/logo-icon.png";
import { useStoreConfig } from "@/hooks/useStoreConfig";

export default function Footer() {
  const { config } = useStoreConfig();
  const cleanNumber = config.whatsapp_number?.replace(/\D/g, "") || "";

  return (
    <footer className="bg-foreground text-background/80">
      <div className="container mx-auto px-4 py-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <img src={logoIcon} alt="Kazoom" width={32} height={32} className="w-8 h-8" />
              <span className="text-lg font-heading font-bold text-lime">Kazoom</span>
            </div>
            <p className="text-sm opacity-60 leading-relaxed">
              De utensílios a eletrônicos, tudo que você precisa em um só lugar. É Kazoom!
            </p>
            <div className="flex gap-3 mt-3">
              <a href="https://instagram.com/kazoom.brasil" target="_blank" rel="noopener noreferrer" className="opacity-60 hover:opacity-100 transition-opacity" aria-label="Instagram">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>
              </a>
              <a href="https://facebook.com/kazoom" target="_blank" rel="noopener noreferrer" className="opacity-60 hover:opacity-100 transition-opacity" aria-label="Facebook">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
              </a>
              <a href="https://tiktok.com/@kazoom" target="_blank" rel="noopener noreferrer" className="opacity-60 hover:opacity-100 transition-opacity" aria-label="TikTok">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5"/></svg>
              </a>
            </div>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-heading font-semibold text-sm mb-3 text-background">Links Rápidos</h4>
            <div className="space-y-1.5 text-sm opacity-60">
              <Link to="/" className="block hover:opacity-100 transition-opacity">Página inicial</Link>
              <Link to="/produtos" className="block hover:opacity-100 transition-opacity">Todos os Produtos</Link>
              <Link to="/sobre" className="block hover:opacity-100 transition-opacity">Sobre nós</Link>
              <Link to="/contato" className="block hover:opacity-100 transition-opacity">Contato</Link>
              <Link to="/rastrear" className="block hover:opacity-100 transition-opacity">Rastrear Pedido</Link>
            </div>
          </div>

          {/* Policies */}
          <div>
            <h4 className="font-heading font-semibold text-sm mb-3 text-background">Institucional</h4>
            <div className="space-y-1.5 text-sm opacity-60">
              <Link to="/politica-de-privacidade" className="block hover:opacity-100 transition-opacity">Política de Privacidade</Link>
              <Link to="/termos-de-uso" className="block hover:opacity-100 transition-opacity">Termos de Uso</Link>
              <Link to="/trocas-e-devolucoes" className="block hover:opacity-100 transition-opacity">Trocas e Devoluções</Link>
              <Link to="/faq" className="block hover:opacity-100 transition-opacity">Perguntas Frequentes</Link>
            </div>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-heading font-semibold text-sm mb-3 text-background">Atendimento</h4>
            <div className="space-y-1.5 text-sm opacity-60">
              <p>Segunda a Sexta: 08h às 18h</p>
              <p>suporte@kazoombrasil.com.br</p>
              <p className="text-xs">CNPJ: 60.105.125/0001-08</p>
              <p className="text-xs">Av. Larissa Cavalcante, 11 – Boa Vista</p>
              <p className="text-xs">Vitória da Conquista – BA, CEP 45027-400</p>
              {cleanNumber && (
                <a
                  href={`https://wa.me/${cleanNumber}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block mt-2 bg-[#25D366] text-white px-4 py-2 rounded-lg font-medium text-xs hover:opacity-90 transition-opacity"
                >
                  Conversar no WhatsApp
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Payment Flags */}
        <div className="border-t border-background/10 mt-8 pt-6 pb-2">
          <p className="text-center text-[10px] uppercase tracking-widest opacity-40 mb-3 font-semibold">Formas de pagamento</p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            {/* Visa */}
            <div className="bg-white rounded-md flex items-center justify-center h-9 w-14 shadow-sm">
              <svg viewBox="0 0 780 500" className="h-6 w-10" xmlns="http://www.w3.org/2000/svg">
                <path d="M293.2 348.7l33.4-195.8h53.4l-33.4 195.8h-53.4zm246.8-191c-10.6-4-27.2-8.3-47.9-8.3-52.8 0-90 26.6-90.2 64.7-.3 28.2 26.5 43.9 46.8 53.3 20.8 9.6 27.8 15.8 27.7 24.4-.1 13.2-16.6 19.2-32 19.2-21.4 0-32.8-3-50.3-10.2l-6.9-3.1-7.5 44c12.5 5.5 35.6 10.2 59.6 10.5 56.1 0 92.5-26.3 92.9-67 .2-22.3-14-39.3-44.8-53.3-18.6-9.1-30-15.1-29.9-24.3 0-8.1 9.7-16.8 30.5-16.8 17.4-.3 30 3.5 39.8 7.5l4.8 2.3 7.2-42.8zm137.1 3.8h-41.3c-12.8 0-22.4 3.5-28 16.3l-79.4 179.9h56.1l11.2-29.4h68.6l6.5 29.4h49.5l-43.2-196.2zm-65.9 126.6c4.4-11.3 21.5-54.7 21.5-54.7-.3.5 4.4-11.5 7.1-18.9l3.6 17.1s10.3 47.3 12.5 57.2h-44.7v-.7zM327.1 152.9L273.6 287l-5.7-27.8c-9.9-31.8-40.8-66.3-75.3-83.5l47.8 171h56.5l84.1-194.8h-54z" fill="#1A1F71"/>
                <path d="M206.4 152.9h-86.1l-.7 3.5c67 16.2 111.4 55.4 129.7 102.4l-18.7-89.7c-3.2-12.3-12.8-15.8-24.2-16.2z" fill="#F9A533"/>
              </svg>
            </div>
            {/* Mastercard */}
            <div className="bg-white rounded-md flex items-center justify-center h-9 w-14 shadow-sm">
              <svg viewBox="0 0 48 32" className="h-6 w-10" xmlns="http://www.w3.org/2000/svg">
                <circle cx="19" cy="16" r="9" fill="#EB001B"/>
                <circle cx="29" cy="16" r="9" fill="#F79E1B"/>
                <path d="M24 9.2a9 9 0 013.4 6.8A9 9 0 0124 22.8a9 9 0 01-3.4-6.8A9 9 0 0124 9.2z" fill="#FF5F00"/>
              </svg>
            </div>
            {/* Elo */}
            <div className="bg-white rounded-md flex items-center justify-center h-9 w-14 shadow-sm">
              <svg viewBox="0 0 48 32" className="h-6 w-10" xmlns="http://www.w3.org/2000/svg">
                <path d="M14.5 12.5a4.5 4.5 0 013.3-1.5 4.5 4.5 0 014.2 3l3-1a7.5 7.5 0 00-7.2-5 7.5 7.5 0 00-5.5 2.4l2.2 2.1z" fill="#FFF100"/>
                <path d="M12.3 14.6A7.5 7.5 0 0012 16.5a7.5 7.5 0 00.3 2l3-.8a4.5 4.5 0 010-2.3l-3-.8z" fill="#00A3DF"/>
                <path d="M14.5 20.5a4.5 4.5 0 01-1.7-2.5l-3 .8a7.5 7.5 0 005.5 4.6l.8-3a4.5 4.5 0 01-1.6-.9z" fill="#EE4023"/>
                <path d="M18 21a4.5 4.5 0 004-2.5l3 1a7.5 7.5 0 01-7 4.5 7.5 7.5 0 01-2.3-.4l.8-3A4.5 4.5 0 0018 21z" fill="#EE4023"/>
                <text x="25" y="20" fontFamily="Arial" fontWeight="bold" fontSize="9" fill="#231F20">elo</text>
              </svg>
            </div>
            {/* American Express */}
            <div className="bg-[#006FCF] rounded-md flex items-center justify-center h-9 w-14 shadow-sm">
              <span className="text-white font-black text-[9px] leading-[1.1] text-center tracking-tight">AMEX</span>
            </div>
            {/* Hipercard */}
            <div className="bg-[#822124] rounded-md flex items-center justify-center h-9 w-14 shadow-sm">
              <span className="text-white font-bold text-[8px] leading-tight text-center">HIPER<br/>CARD</span>
            </div>
            {/* PIX */}
            <div className="bg-white rounded-md flex items-center justify-center h-9 w-14 shadow-sm">
              <svg viewBox="0 0 512 512" className="h-6 w-6" xmlns="http://www.w3.org/2000/svg">
                <path d="M382.6 349.5c-16.5 0-32-6.4-43.7-18.1l-68.3-68.3c-5.5-5.3-14.8-5.4-20.4 0l-68.6 68.6c-11.7 11.7-27.2 18.1-43.7 18.1h-11.6l86.6 86.6c24.1 24.1 63.2 24.1 87.3 0l86.8-86.8h-4.4z" fill="#32BCAD"/>
                <path d="M137.9 162.5c16.5 0 32 6.4 43.7 18.1l68.6 68.6c5.8 5.8 14.6 5.8 20.4 0l68.3-68.3c11.7-11.7 27.2-18.1 43.7-18.1h4.4l-86.8-86.8c-24.1-24.1-63.2-24.1-87.3 0l-86.6 86.6h11.6z" fill="#32BCAD"/>
                <path d="M436.4 213.1l-41.2-41.2c-1.4.5-2.9.8-4.5.8h-8.1c-12.2 0-23.8 4.8-32.5 13.5l-68.3 68.3c-8 8-18.5 12-29 12s-21-4-29-12l-68.6-68.6c-8.6-8.6-20.2-13.3-32.2-13.3h-14.5c-1.2 0-2.3-.2-3.4-.5L64 213.2c-24.1 24.1-24.1 63.2 0 87.3l41.5 41.5c1.1-.3 2.2-.5 3.4-.5H123c12 0 23.6-4.7 32.2-13.3l68.6-68.6c7.7-7.7 18.5-12 29-12s21.3 4.3 29 12l68.3 68.3c8.7 8.7 20.3 13.5 32.5 13.5h8.1c1.6 0 3.1.3 4.5.8l41.2-41.2c24.2-24.2 24.2-63.3 0-87.4z" fill="#32BCAD"/>
              </svg>
            </div>
          </div>
        </div>

        <div className="border-t border-background/10 mt-4 pt-5 text-center text-[11px] opacity-40">
          © {new Date().getFullYear()} Kazoom. Todos os direitos reservados.
        </div>
      </div>
    </footer>
  );
}
