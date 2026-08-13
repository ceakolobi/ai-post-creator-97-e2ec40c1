import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/Logo";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useAuth } from "@/hooks/useAuth";

export function SiteHeader() {
  const { user, loading } = useAuth();

  return (
    <header className="sticky top-0 z-50 w-full glass">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <Logo />
        <div className="flex items-center gap-2">
          <ThemeToggle />
          {loading ? null : user ? (
            <Button asChild variant="hero" size="sm">
              <Link to="/dashboard">Meu painel</Link>
            </Button>
          ) : (
            <>
              <Button asChild variant="ghost" size="sm" className="hidden sm:inline-flex">
                <Link to="/login">Entrar</Link>
              </Button>
              <Button asChild variant="hero" size="sm">
                <Link to="/criar-conta">Começar grátis</Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-card/40">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-10 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-2">
          <Logo />
          <p>Posts profissionais para Instagram, criados por IA.</p>
        </div>
        <nav className="flex flex-wrap gap-4">
          <Link to="/termos" className="hover:text-foreground">
            Termos de Uso
          </Link>
          <Link to="/privacidade" className="hover:text-foreground">
            Política de Privacidade
          </Link>
          <Link to="/login" className="hover:text-foreground">
            Entrar
          </Link>
        </nav>
      </div>
    </footer>
  );
}
