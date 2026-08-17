import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Loader2, MailCheck } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { AuthLayout } from "@/components/AuthLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/recuperar-senha")({
  head: () => ({
    meta: [
      { title: "Recuperar senha — Hagoth" },
      { name: "description", content: "Receba um link por e-mail para redefinir a senha da sua conta Hagoth." },
      { property: "og:title", content: "Recuperar senha — Hagoth" },
      { property: "og:description", content: "Redefina a senha da sua conta Hagoth." },
    ],
  }),
  component: RecuperarSenha,
});

function RecuperarSenha() {
  const [email, setEmail] = useState("");
  const [carregando, setCarregando] = useState(false);
  const [enviado, setEnviado] = useState(false);

  async function enviar(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) {
      toast.error("Informe seu e-mail.");
      return;
    }
    setCarregando(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: `${window.location.origin}/redefinir-senha`,
    });
    setCarregando(false);
    if (error) {
      toast.error("Não conseguimos enviar o e-mail agora. Tente novamente.");
      return;
    }
    setEnviado(true);
  }

  return (
    <AuthLayout>
      <div className="rounded-2xl border border-border bg-card p-6 sm:p-8">
        {enviado ? (
          <div className="text-center">
            <MailCheck className="mx-auto size-10 text-accent" />
            <h1 className="mt-4 text-2xl">Verifique seu e-mail</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Se existir uma conta com <strong>{email}</strong>, enviamos um link para criar uma nova senha.
            </p>
            <Button asChild variant="outline" className="mt-6">
              <Link to="/login">Voltar para o login</Link>
            </Button>
          </div>
        ) : (
          <>
            <h1 className="text-2xl">Esqueci minha senha</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Enviaremos um link para você criar uma nova senha.
            </p>
            <form onSubmit={enviar} className="mt-6 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">E-mail</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="voce@email.com"
                />
              </div>
              <Button type="submit" variant="hero" size="lg" className="w-full" disabled={carregando}>
                {carregando && <Loader2 className="animate-spin" />}
                Enviar link
              </Button>
            </form>
            <p className="mt-4 text-sm text-muted-foreground">
              Lembrou a senha?{" "}
              <Link to="/login" className="text-gradient font-semibold">
                Entrar
              </Link>
            </p>
          </>
        )}
      </div>
    </AuthLayout>
  );
}
