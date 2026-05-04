import { Link } from "react-router-dom";
import { Search, User, ShoppingBag, Menu, X, Heart, Moon, Sun } from "lucide-react";
import { useState } from "react";
import { useDbCollections } from "@/hooks/useProducts";
import { useCart } from "@/contexts/CartContext";
import { useWishlist } from "@/contexts/WishlistContext";
import { useTheme } from "@/contexts/ThemeContext";
import { useAuth } from "@/contexts/AuthContext";
import logoIcon from "@/assets/logo-icon.png";
import SearchOverlay from "./SearchOverlay";
import LanguageCurrencySwitcher from "./LanguageCurrencySwitcher";
import { useTranslation } from "react-i18next";

export default function Header() {
  const { t } = useTranslation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const { totalItems, setIsOpen } = useCart();
  const { totalItems: wishlistCount } = useWishlist();
  const { theme, toggleTheme } = useTheme();
  const { user } = useAuth();
  const { data: collections = [] } = useDbCollections();

  const COLLECTION_I18N: Record<string, string> = {
    "home-kitchen": t("collections.homeKitchen"),
    "electronics": t("collections.electronics"),
    "sports": t("collections.sports"),
    "tools": t("collections.tools"),
    "fitness": t("collections.fitness"),
    "fishing": t("collections.fishing"),
    "health-beauty": t("collections.healthBeauty"),
  };
  const navLinks = [
    { name: t("nav.home"), href: "/" },
    ...collections.map((c) => ({ name: COLLECTION_I18N[c.slug] || c.name, href: `/colecao/${c.slug}` })),
    { name: t("nav.about"), href: "/sobre" },
  ];

  return (
    <header className="bg-background sticky top-0 z-40">
      {/* Main header row */}
      <div className="container mx-auto px-4 lg:px-8">
        <div className="flex items-center justify-between h-[70px]">
          {/* Left: search */}
          <div className="flex items-center gap-3 w-[100px]">
            <button
              className="lg:hidden text-foreground"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label={t("common.menu")}
            >
              {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
            <button onClick={() => setSearchOpen(true)} className="text-foreground hover:text-primary transition-colors" aria-label={t("common.search")}>
              <Search size={22} />
            </button>
          </div>

          {/* Center: Logo */}
          <Link to="/" className="flex items-center">
            <span className="text-2xl md:text-3xl font-heading font-bold text-primary tracking-tight">
              Bubo Health
            </span>
          </Link>

          {/* Right: account + cart */}
          <div className="flex items-center gap-3 w-[140px] justify-end">
            <LanguageCurrencySwitcher />
            <button
              onClick={toggleTheme}
              className="text-foreground hover:text-primary transition-colors"
              aria-label={t("nav.toggleTheme")}
            >
              {theme === "dark" ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            <Link to="/favoritos" className="text-foreground hover:text-primary transition-colors relative hidden sm:block" aria-label={t("nav.favorites")}>
              <Heart size={22} />
              {wishlistCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center">
                  {wishlistCount}
                </span>
              )}
            </Link>
            <Link to={user ? "/conta" : "/entrar"} className="text-foreground hover:text-primary transition-colors hidden sm:block relative" aria-label={t("nav.account")}>
              <User size={22} />
              {user && (
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-background" />
              )}
            </Link>
            <button
              onClick={() => setIsOpen(true)}
              className="text-foreground hover:text-primary transition-colors relative"
              aria-label={t("nav.cart")}
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
      </div>

      {/* Navigation bar */}
      <div className="border-t border-border">
        <nav className="hidden lg:flex items-center justify-center gap-1 container mx-auto px-4">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              to={link.href}
              className="text-[13px] text-foreground hover:text-primary transition-colors font-normal px-3 py-3 flex items-center gap-1"
            >
              {link.name}
            </Link>
          ))}
        </nav>
      </div>

      {/* Mobile nav */}
      {mobileMenuOpen && (
        <nav className="lg:hidden border-t border-border bg-background shadow-lg">
          <div className="container mx-auto px-4 py-3 flex flex-col">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                className="text-sm text-foreground hover:text-primary transition-colors font-normal py-2.5 border-b border-border/50 last:border-0 flex items-center justify-between"
                onClick={() => setMobileMenuOpen(false)}
              >
                {link.name}
              </Link>
            ))}
            <Link
              to={user ? "/conta" : "/entrar"}
              className="text-sm text-foreground hover:text-primary transition-colors font-normal py-2.5 flex items-center gap-2"
              onClick={() => setMobileMenuOpen(false)}
            >
              <User size={16} /> {user ? t("nav.myAccount") : t("nav.signIn")}
            </Link>
          </div>
        </nav>
      )}

      <SearchOverlay isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
    </header>
  );
}
