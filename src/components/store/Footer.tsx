import { ShoppingBag } from "lucide-react";
import { Link } from "react-router-dom";
import logoIcon from "@/assets/logo-icon.png";

export default function Footer() {
  return (
    <footer className="bg-foreground text-background/80">
      <div className="container mx-auto px-4 py-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <img src={logoIcon} alt="Bazu" width={32} height={32} className="w-8 h-8" />
              <span className="text-lg font-heading font-bold text-lime">Bazu</span>
            </div>
            <p className="text-sm opacity-60 leading-relaxed">
              De utensílios a eletrônicos, tudo que você precisa em um só lugar. É bazu!
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-heading font-semibold text-sm mb-3 text-background">Links Rápidos</h4>
            <div className="space-y-1.5 text-sm opacity-60">
              <Link to="/" className="block hover:opacity-100 transition-opacity">Página inicial</Link>
              <Link to="/produtos" className="block hover:opacity-100 transition-opacity">Todos os Produtos</Link>
              <Link to="/sobre" className="block hover:opacity-100 transition-opacity">Sobre nós</Link>
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
              <p>contato@bazu.com.br</p>
              <a
                href="https://wa.me/5511999999999"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block mt-2 bg-[#25D366] text-white px-4 py-2 rounded-lg font-medium text-xs hover:opacity-90 transition-opacity"
              >
                Conversar no WhatsApp
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-background/10 mt-8 pt-5 text-center text-[11px] opacity-40">
          © {new Date().getFullYear()} Bazu. Todos os direitos reservados.
        </div>
      </div>
    </footer>
  );
}
