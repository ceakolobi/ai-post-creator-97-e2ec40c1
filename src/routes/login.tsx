import { useEffect, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { AuthLayout } from "@/components/AuthLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/useAuth";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Entrar — Criattor" },
      { name: "description", content: "Acesse sua conta Criattor e continue criando posts para Instagram." },
      { property: "og:title", content: "Entrar — Criattor" },
      { property: "og:description", content: "Acesse sua conta Criattor." },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [carregando, setCarregando] = useState(false);

  useEffect(() => {
    if (user) navigate({ to: "/dashboard", replace: true });
  }, [user, navigate]);

  async function entrar(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim() || !senha) {
      toast.error("Preencha e-mail e senha.");
      return;
    }
    setCarregando(true);
    const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password: senha });
    setCarregando(false);
    if (error) {
      toast.error(
        error.message.includes("Invalid login")
          ? "E-mail ou senha incorretos."
          : error.message.includes("Email not confirmed")
            ? "Confirme seu e-mail antes de entrar. Verifique sua caixa de entrada."
            : "Não conseguimos entrar agora. Tente novamente.",
      );
      return;
    }
    toast.success("Bem-vindo de volta!");
    navigate({ to: "/dashboard" });
  }

  return (
    <AuthLayout>
      <div className="rounded-2xl border border-border bg-card p-6 sm:p-8">
        <h1 className="text-2xl">Entrar</h1>
        <p className="mt-1 text-sm text-muted-foreground">Use o e-mail cadastrado para acessar seu painel.</p>
        <form onSubmit={entrar} className="mt-6 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">E-mail</Label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="voce@email.com"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="senha">Senha</Label>
            <Input
              id="senha"
              type="password"
              autoComplete="current-password"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              placeholder="••••••••"
            />
          </div>
          <Button type="submit" variant="hero" className="w-full" size="lg" disabled={carregando}>
            {carregando && <Loader2 className="animate-spin" />}
            Entrar
          </Button>
        </form>
        <div className="mt-4 flex flex-col gap-2 text-sm text-muted-foreground">
          <Link to="/recuperar-senha" className="hover:text-foreground">
            Esqueci minha senha
          </Link>
          <span>
            Ainda não tem conta?{" "}
            <Link to="/criar-conta" className="text-gradient font-semibold">
              Criar conta grátis
            </Link>
          </span>
        </div>
      </div>
    </AuthLayout>
  );
}
