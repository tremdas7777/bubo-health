import { ShoppingBag } from "lucide-react";
import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="bg-foreground text-background">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-lime rounded-lg flex items-center justify-center">
                <ShoppingBag size={16} className="text-primary" />
              </div>
              <span className="text-xl font-heading font-bold text-lime">Amélia</span>
            </div>
            <p className="text-sm opacity-70">
              De utensílios a eletrônicos, tudo que você precisa em um só lugar.
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-heading font-semibold mb-4">Links Rápidos</h4>
            <div className="space-y-2 text-sm opacity-70">
              <Link to="/" className="block hover:opacity-100 transition-opacity">Página inicial</Link>
              <Link to="/produtos" className="block hover:opacity-100 transition-opacity">Todos os Produtos</Link>
              <Link to="/sobre" className="block hover:opacity-100 transition-opacity">Sobre nós</Link>
            </div>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-heading font-semibold mb-4">Atendimento</h4>
            <div className="space-y-2 text-sm opacity-70">
              <p>Segunda a Sexta: 08h às 18h</p>
              <p>contato@amelia.com.br</p>
              <a
                href="https://wa.me/5511999999999"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block mt-2 bg-lime text-foreground px-4 py-2 rounded-lg font-medium text-sm hover:opacity-90 transition-opacity"
              >
                WhatsApp
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-background/20 mt-8 pt-6 text-center text-xs opacity-50">
          © {new Date().getFullYear()} Amélia. Todos os direitos reservados.
        </div>
      </div>
    </footer>
  );
}
