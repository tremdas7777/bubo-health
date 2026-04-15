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
          </div>

          {/* Links */}
          <div>
            <h4 className="font-heading font-semibold text-sm mb-3 text-background">Links Rápidos</h4>
            <div className="space-y-1.5 text-sm opacity-60">
              <Link to="/" className="block hover:opacity-100 transition-opacity">Página inicial</Link>
              <Link to="/produtos" className="block hover:opacity-100 transition-opacity">Todos os Produtos</Link>
              <Link to="/sobre" className="block hover:opacity-100 transition-opacity">Sobre nós</Link>
              <Link to="/contato" className="block hover:opacity-100 transition-opacity">Contato</Link>
            </div>
          </div>

          {/* Policies */}
          <div>
            <h4 className="font-heading font-semibold text-sm mb-3 text-background">Institucional</h4>
            <div className="space-y-1.5 text-sm opacity-60">
              <Link to="/politica-de-privacidade" className="block hover:opacity-100 transition-opacity">Política de Privacidade</Link>
              <Link to="/termos-de-uso" className="block hover:opacity-100 transition-opacity">Termos de Uso</Link>
              <Link to="/trocas-e-devolucoes" className="block hover:opacity-100 transition-opacity">Trocas e Devoluções</Link>
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
          <div className="flex flex-wrap items-center justify-center gap-2">
            {/* Visa */}
            <div className="bg-white rounded-md px-2.5 py-1.5 flex items-center justify-center h-8 w-12">
              <svg viewBox="0 0 48 32" className="h-5 w-auto" xmlns="http://www.w3.org/2000/svg">
                <path d="M19.5 10.2l-3.2 11.6h-2.6l-1.6-9.3c-.1-.4-.2-.5-.5-.7A11 11 0 008 10.5l.1-.3h4.2c.5 0 1 .4 1.1.9l1 5.5 2.6-6.4h2.5zm10 7.8c0-3-4.2-3.2-4.2-4.6 0-.4.4-.8 1.3-.9a5.7 5.7 0 013 .5l.5-2.4a8.2 8.2 0 00-2.8-.5c-3 0-5 1.6-5 3.8 0 1.7 1.5 2.6 2.6 3.1 1.1.6 1.5 1 1.5 1.5 0 .8-1 1.2-1.8 1.2a6.3 6.3 0 01-3.1-.7l-.5 2.5a8.8 8.8 0 003.3.6c3.2 0 5.2-1.6 5.2-3.9zm7.9 3.8H40l-2.2-11.6h-2.1a1.1 1.1 0 00-1.1.7L30.4 21.8h2.5l.5-1.4h3.1l.3 1.4zm-2.7-3.3l1.3-3.5.7 3.5h-2zm-10-8.3l-2 11.6h-2.4l2-11.6h2.4z" fill="#1A1F71"/>
              </svg>
            </div>
            {/* Mastercard */}
            <div className="bg-white rounded-md px-2.5 py-1.5 flex items-center justify-center h-8 w-12">
              <svg viewBox="0 0 48 32" className="h-5 w-auto" xmlns="http://www.w3.org/2000/svg">
                <circle cx="19" cy="16" r="9" fill="#EB001B"/>
                <circle cx="29" cy="16" r="9" fill="#F79E1B"/>
                <path d="M24 9.2a9 9 0 013.4 6.8A9 9 0 0124 22.8a9 9 0 01-3.4-6.8A9 9 0 0124 9.2z" fill="#FF5F00"/>
              </svg>
            </div>
            {/* Elo */}
            <div className="bg-white rounded-md px-2.5 py-1.5 flex items-center justify-center h-8 w-12">
              <svg viewBox="0 0 48 32" className="h-5 w-auto" xmlns="http://www.w3.org/2000/svg">
                <path d="M14.5 12.5a4.5 4.5 0 013.3-1.5 4.5 4.5 0 014.2 3l3-1a7.5 7.5 0 00-7.2-5 7.5 7.5 0 00-5.5 2.4l2.2 2.1z" fill="#FFF100"/>
                <path d="M12.3 14.6A7.5 7.5 0 0012 16.5a7.5 7.5 0 00.3 2l3-.8a4.5 4.5 0 010-2.3l-3-.8z" fill="#00A3DF"/>
                <path d="M14.5 20.5a4.5 4.5 0 01-1.7-2.5l-3 .8a7.5 7.5 0 005.5 4.6l.8-3a4.5 4.5 0 01-1.6-.9z" fill="#EE4023"/>
                <path d="M18 21a4.5 4.5 0 004-2.5l3 1a7.5 7.5 0 01-7 4.5 7.5 7.5 0 01-2.3-.4l.8-3A4.5 4.5 0 0018 21z" fill="#EE4023"/>
                <text x="25" y="20" fontFamily="Arial" fontWeight="bold" fontSize="9" fill="#231F20">elo</text>
              </svg>
            </div>
            {/* American Express */}
            <div className="bg-[#006FCF] rounded-md px-2.5 py-1.5 flex items-center justify-center h-8 w-12">
              <span className="text-white font-black text-[8px] leading-[1.1] text-center">AMEX</span>
            </div>
            {/* Hipercard */}
            <div className="bg-[#822124] rounded-md px-2.5 py-1.5 flex items-center justify-center h-8 w-12">
              <span className="text-white font-bold text-[7px] leading-tight text-center">HIPER<br/>CARD</span>
            </div>
            {/* PIX */}
            <div className="bg-white rounded-md px-2.5 py-1.5 flex items-center justify-center h-8 w-12">
              <svg viewBox="0 0 48 32" className="h-5 w-auto" xmlns="http://www.w3.org/2000/svg">
                <path d="M29.3 10.7l-4.6 4.6a1 1 0 01-1.4 0l-4.6-4.6a3.5 3.5 0 00-2.5-1h-.7l5.8 5.8a2.5 2.5 0 003.4 0l5.8-5.8h-.7a3.5 3.5 0 00-2.5 1z" fill="#32BCAD"/>
                <path d="M29.3 21.3l-4.6-4.6a1 1 0 00-1.4 0l-4.6 4.6a3.5 3.5 0 01-2.5 1h-.7l5.8-5.8a2.5 2.5 0 013.4 0l5.8 5.8h-.7a3.5 3.5 0 01-2.5-1z" fill="#32BCAD"/>
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
