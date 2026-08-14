import { useState, type ReactNode } from "react";
import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { LayoutDashboard, Sparkles, Images, User, Shield, LogOut, Menu, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/Logo";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useIsAdmin, useProfile, useSubscription, diasRestantesTrial } from "@/lib/data";
import { cn } from "@/lib/utils";

const links = [
  { to: "/dashboard", label: "Painel", icon: LayoutDashboard },
  { to: "/criar", label: "Criar post", icon: Sparkles },
  { to: "/meus-posts", label: "Meus posts", icon: Images },
  { to: "/minha-conta", label: "Minha conta", icon: User },
] as const;

export function AppShell({ children }: { children: ReactNode }) {
  const [aberto, setAberto] = useState(false);
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { data: isAdmin } = useIsAdmin();
  const { data: perfil } = useProfile();
  const { data: sub } = useSubscription();
  const dias = diasRestantesTrial(sub);

  async function sair() {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    navigate({ to: "/login", replace: true });
  }

  const nav = (
    <nav className="space-y-1">
      {links.map((l) => (
        <Link
          key={l.to}
          to={l.to}
          onClick={() => setAberto(false)}
          className={cn(
            "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors",
            pathname === l.to
              ? "bg-gradient-brand text-primary-foreground"
              : "text-muted-foreground hover:bg-secondary hover:text-foreground",
          )}
        >
          <l.icon className="size-4" />
          {l.label}
        </Link>
      ))}
      {isAdmin && (
        <Link
          to="/admin"
          onClick={() => setAberto(false)}
          className={cn(
            "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors",
            pathname === "/admin"
              ? "bg-gradient-brand text-primary-foreground"
              : "text-muted-foreground hover:bg-secondary hover:text-foreground",
          )}
        >
          <Shield className="size-4" />
          Administração
        </Link>
      )}
    </nav>
  );

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 glass lg:hidden">
        <div className="flex h-16 items-center justify-between px-4">
          <Logo to="/dashboard" />
          <div className="flex items-center gap-1">
            <ThemeToggle />
            <Button variant="ghost" size="icon" onClick={() => setAberto((a) => !a)} aria-label="Menu">
              {aberto ? <X /> : <Menu />}
            </Button>
          </div>
        </div>
        {aberto && <div className="border-t border-border bg-card p-4">{nav}</div>}
      </header>

      <div className="mx-auto flex max-w-7xl">
        <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col justify-between border-r border-border bg-card/50 p-4 lg:flex">
          <div className="space-y-6">
            <Logo to="/dashboard" />
            {nav}
          </div>
          <div className="space-y-3">
            {sub?.status === "trial" && (
              <div className="rounded-xl border border-border bg-card p-3 text-xs text-muted-foreground">
                Teste grátis: <strong className="text-gradient">{dias} dia(s)</strong> restantes
              </div>
            )}
            <div className="flex items-center justify-between gap-2 rounded-xl border border-border bg-card p-3">
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">{perfil?.nome || "Minha conta"}</p>
                <p className="truncate text-xs text-muted-foreground">{perfil?.email}</p>
              </div>
              <ThemeToggle />
            </div>
            <Button variant="outline" className="w-full" onClick={sair}>
              <LogOut /> Sair
            </Button>
          </div>
        </aside>

        <main className="min-w-0 flex-1 px-4 py-6 sm:px-6 lg:py-10">{children}</main>
      </div>
    </div>
  );
}
