import { Link } from "react-router-dom";
import { Search, User, ShoppingBag, Menu, X } from "lucide-react";
import { useState } from "react";
import { navLinks } from "@/data/store";
import { useCart } from "@/contexts/CartContext";

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { totalItems, setIsOpen } = useCart();

  return (
    <header className="bg-background border-b border-border sticky top-0 z-40">
      <div className="container mx-auto px-4">
        {/* Top row */}
        <div className="flex items-center justify-between py-4">
          {/* Left: search + mobile menu */}
          <div className="flex items-center gap-3">
            <button
              className="lg:hidden text-foreground"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
            <button className="text-foreground hover:text-primary transition-colors">
              <Search size={22} />
            </button>
          </div>

          {/* Center: Logo */}
          <Link to="/" className="flex items-center gap-2">
            <div className="w-10 h-10 bg-lime rounded-lg flex items-center justify-center">
              <ShoppingBag size={22} className="text-primary" />
            </div>
            <span className="text-2xl font-heading font-bold text-primary">
              Amélia
            </span>
          </Link>

          {/* Right: account + cart */}
          <div className="flex items-center gap-4">
            <Link to="/conta" className="text-foreground hover:text-primary transition-colors">
              <User size={22} />
            </Link>
            <button
              onClick={() => setIsOpen(true)}
              className="text-foreground hover:text-primary transition-colors relative"
            >
              <ShoppingBag size={22} />
              {totalItems > 0 && (
                <span className="absolute -top-2 -right-2 bg-primary text-primary-foreground text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center">
                  {totalItems}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Desktop nav */}
        <nav className="hidden lg:flex items-center justify-center gap-6 pb-3">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              to={link.href}
              className="text-sm text-foreground hover:text-primary transition-colors font-medium"
            >
              {link.name}
            </Link>
          ))}
        </nav>
      </div>

      {/* Mobile nav */}
      {mobileMenuOpen && (
        <nav className="lg:hidden border-t border-border bg-background">
          <div className="container mx-auto px-4 py-4 flex flex-col gap-3">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                className="text-sm text-foreground hover:text-primary transition-colors font-medium py-1"
                onClick={() => setMobileMenuOpen(false)}
              >
                {link.name}
              </Link>
            ))}
          </div>
        </nav>
      )}
    </header>
  );
}
