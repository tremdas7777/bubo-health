import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import PageHead from "@/components/seo/PageHead";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted">
      <PageHead
        title="Página não encontrada | Bazu"
        description="A página que você procura não foi encontrada. Volte para a página inicial da Bazu."
      />
      <div className="text-center">
        <h1 className="mb-4 text-6xl font-heading font-bold text-foreground">404</h1>
        <p className="mb-4 text-xl text-muted-foreground">Página não encontrada</p>
        <Link to="/" className="text-primary underline hover:text-primary/90">
          Voltar para a página inicial
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
