import { useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { AuthLayout } from "@/components/AuthLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/redefinir-senha")({
  head: () => ({
    meta: [
      { title: "Definir nova senha — Hagoth" },
      { name: "description", content: "Escolha uma nova senha para a sua conta Hagoth." },
      { property: "og:title", content: "Definir nova senha — Hagoth" },
      { property: "og:description", content: "Escolha uma nova senha para a sua conta." },
    ],
  }),
  component: RedefinirSenha,
});

function RedefinirSenha() {
  const navigate = useNavigate();
  const [senha, setSenha] = useState("");
  const [confirma, setConfirma] = useState("");
  const [carregando, setCarregando] = useState(false);

  async function salvar(e: React.FormEvent) {
    e.preventDefault();
    if (senha.length < 6) {
      toast.error("A senha precisa ter pelo menos 6 caracteres.");
      return;
    }
    if (senha !== confirma) {
      toast.error("As senhas não são iguais.");
      return;
    }
    setCarregando(true);
    const { error } = await supabase.auth.updateUser({ password: senha });
    setCarregando(false);
    if (error) {
      toast.error("Não foi possível alterar a senha. Solicite um novo link.");
      return;
    }
    toast.success("Senha atualizada!");
    navigate({ to: "/dashboard" });
  }

  return (
    <AuthLayout>
      <div className="rounded-2xl border border-border bg-card p-6 sm:p-8">
        <h1 className="text-2xl">Nova senha</h1>
        <p className="mt-1 text-sm text-muted-foreground">Escolha uma senha para acessar sua conta.</p>
        <form onSubmit={salvar} className="mt-6 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="senha">Nova senha</Label>
            <Input id="senha" type="password" value={senha} onChange={(e) => setSenha(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirma">Confirmar senha</Label>
            <Input id="confirma" type="password" value={confirma} onChange={(e) => setConfirma(e.target.value)} />
          </div>
          <Button type="submit" variant="hero" size="lg" className="w-full" disabled={carregando}>
            {carregando && <Loader2 className="animate-spin" />}
            Salvar nova senha
          </Button>
        </form>
      </div>
    </AuthLayout>
  );
}
