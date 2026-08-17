import { useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Loader2, MailCheck } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { AuthLayout } from "@/components/AuthLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/criar-conta")({
  head: () => ({
    meta: [
      { title: "Criar conta grátis — Hagoth" },
      {
        name: "description",
        content: "Crie sua conta no Hagoth e gere 10 posts para Instagram grátis por 7 dias.",
      },
      { property: "og:title", content: "Criar conta grátis — Hagoth" },
      { property: "og:description", content: "10 posts grátis por 7 dias, sem cartão de crédito." },
    ],
  }),
  component: CriarConta,
});

function CriarConta() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    nome: "",
    email: "",
    telefone: "",
    nome_negocio: "",
    senha: "",
  });
  const [carregando, setCarregando] = useState(false);
  const [enviado, setEnviado] = useState(false);

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  async function cadastrar(e: React.FormEvent) {
    e.preventDefault();
    if (!form.nome.trim() || !form.email.trim() || !form.telefone.trim() || !form.senha) {
      toast.error("Preencha nome, e-mail, telefone e senha.");
      return;
    }
    if (form.senha.length < 6) {
      toast.error("A senha precisa ter pelo menos 6 caracteres.");
      return;
    }
    setCarregando(true);
    const { data, error } = await supabase.auth.signUp({
      email: form.email.trim(),
      password: form.senha,
      options: {
        emailRedirectTo: `${window.location.origin}/dashboard`,
        data: {
          nome: form.nome.trim(),
          telefone: form.telefone.trim(),
          nome_negocio: form.nome_negocio.trim(),
        },
      },
    });
    setCarregando(false);
    if (error) {
      toast.error(
        error.message.includes("already registered")
          ? "Este e-mail já tem uma conta. Tente entrar."
          : "Não conseguimos criar sua conta agora. Tente novamente.",
      );
      return;
    }
    if (data.session) {
      toast.success("Conta criada! Bom proveito do seu teste grátis.");
      navigate({ to: "/dashboard" });
      return;
    }
    setEnviado(true);
  }

  if (enviado) {
    return (
      <AuthLayout>
        <div className="rounded-2xl border border-border bg-card p-8 text-center">
          <MailCheck className="mx-auto size-10 text-accent" />
          <h1 className="mt-4 text-2xl">Confirme seu e-mail</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Enviamos um link de confirmação para <strong>{form.email}</strong>. Clique nele para ativar sua
            conta e começar o teste grátis.
          </p>
          <Button asChild variant="outline" className="mt-6">
            <Link to="/login">Voltar para o login</Link>
          </Button>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout>
      <div className="rounded-2xl border border-border bg-card p-6 sm:p-8">
        <h1 className="text-2xl">Criar conta grátis</h1>
        <p className="mt-1 text-sm text-muted-foreground">7 dias de teste com 10 posts inclusos.</p>
        <form onSubmit={cadastrar} className="mt-6 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="nome">Nome completo</Label>
            <Input id="nome" value={form.nome} onChange={set("nome")} placeholder="Maria Silva" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">E-mail</Label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              value={form.email}
              onChange={set("email")}
              placeholder="voce@email.com"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="telefone">Telefone / WhatsApp</Label>
            <Input id="telefone" value={form.telefone} onChange={set("telefone")} placeholder="(11) 99999-9999" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="negocio">Nome do negócio / marca (opcional)</Label>
            <Input
              id="negocio"
              value={form.nome_negocio}
              onChange={set("nome_negocio")}
              placeholder="Clínica Bela Face"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="senha">Senha</Label>
            <Input
              id="senha"
              type="password"
              autoComplete="new-password"
              value={form.senha}
              onChange={set("senha")}
              placeholder="Mínimo de 6 caracteres"
            />
          </div>
          <Button type="submit" variant="hero" size="lg" className="w-full" disabled={carregando}>
            {carregando && <Loader2 className="animate-spin" />}
            Começar grátis
          </Button>
        </form>
        <p className="mt-4 text-sm text-muted-foreground">
          Já tem conta?{" "}
          <Link to="/login" className="text-gradient font-semibold">
            Entrar
          </Link>
        </p>
      </div>
    </AuthLayout>
  );
}
