import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { Loader2, MessageSquare, Save, Upload } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Planos } from "@/components/Planos";
import { useAuth } from "@/hooks/useAuth";
import { calcularUso, useFeedbacks, usePosts, useProfile, useSubscription } from "@/lib/data";
import { nomeDoPlano } from "@/lib/plans";

export const Route = createFileRoute("/_authenticated/minha-conta")({
  head: () => ({
    meta: [
      { title: "Minha conta — Criattor" },
      { name: "description", content: "Gerencie seus dados, plano, consumo mensal e envie sugestões." },
      { property: "og:title", content: "Minha conta — Criattor" },
      { property: "og:description", content: "Dados do perfil, plano e consumo." },
    ],
  }),
  component: MinhaConta,
});

function MinhaConta() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { data: perfil } = useProfile();
  const { data: sub } = useSubscription();
  const { data: posts } = usePosts();
  const { data: feedbacks } = useFeedbacks();
  const uso = calcularUso(posts, sub);

  const [nome, setNome] = useState("");
  const [telefone, setTelefone] = useState("");
  const [negocio, setNegocio] = useState("");
  const [salvando, setSalvando] = useState(false);
  const [enviandoAvatar, setEnviandoAvatar] = useState(false);
  const [avatar, setAvatar] = useState<string | null>(null);
  const [mensagem, setMensagem] = useState("");
  const [enviandoFeedback, setEnviandoFeedback] = useState(false);

  useEffect(() => {
    if (!perfil) return;
    setNome(perfil.nome ?? "");
    setTelefone(perfil.telefone ?? "");
    setNegocio(perfil.nome_negocio ?? "");
  }, [perfil]);

  useEffect(() => {
    let ativo = true;
    async function carregar() {
      if (!perfil?.avatar_url) {
        setAvatar(null);
        return;
      }
      const { data } = await supabase.storage
        .from("avatars")
        .createSignedUrl(perfil.avatar_url, 3600);
      if (ativo) setAvatar(data?.signedUrl ?? null);
    }
    carregar();
    return () => {
      ativo = false;
    };
  }, [perfil?.avatar_url]);

  async function salvar(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;
    setSalvando(true);
    const { error } = await supabase
      .from("profiles")
      .update({ nome, telefone, nome_negocio: negocio || null })
      .eq("id", user.id);
    setSalvando(false);
    if (error) {
      toast.error("Não conseguimos salvar suas informações.");
      return;
    }
    queryClient.invalidateQueries({ queryKey: ["profile"] });
    toast.success("Dados atualizados!");
  }

  async function enviarAvatar(e: React.ChangeEvent<HTMLInputElement>) {
    const arquivo = e.target.files?.[0];
    if (!arquivo || !user) return;
    setEnviandoAvatar(true);
    const caminho = `${user.id}/${Date.now()}-${arquivo.name.replace(/[^\w.-]/g, "")}`;
    const { error } = await supabase.storage.from("avatars").upload(caminho, arquivo, { upsert: true });
    if (!error) {
      await supabase.from("profiles").update({ avatar_url: caminho }).eq("id", user.id);
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      toast.success("Foto atualizada!");
    } else {
      toast.error("Não conseguimos enviar a imagem.");
    }
    setEnviandoAvatar(false);
  }

  async function enviarFeedback(e: React.FormEvent) {
    e.preventDefault();
    if (!user || !mensagem.trim()) return;
    setEnviandoFeedback(true);
    const { error } = await supabase.from("feedback").insert({ user_id: user.id, mensagem: mensagem.trim() });
    setEnviandoFeedback(false);
    if (error) {
      toast.error("Não conseguimos enviar sua mensagem.");
      return;
    }
    setMensagem("");
    queryClient.invalidateQueries({ queryKey: ["feedback"] });
    toast.success("Obrigado! Recebemos sua mensagem.");
  }

  const percentual = uso.ilimitado ? 100 : Math.min(100, (uso.usadosNoMes / Math.max(1, uso.limite)) * 100);

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-3xl">Minha conta</h1>
        <p className="mt-1 text-sm text-muted-foreground">Seus dados, plano e consumo.</p>
      </div>

      <section className="grid gap-6 lg:grid-cols-2">
        <form onSubmit={salvar} className="space-y-5 rounded-2xl border border-border bg-card p-6">
          <h2 className="text-lg font-semibold">Dados pessoais</h2>
          <div className="flex items-center gap-4">
            <div className="size-16 overflow-hidden rounded-full border border-border bg-secondary">
              {avatar ? (
                <img src={avatar} alt="Foto de perfil" className="size-full object-cover" />
              ) : (
                <div className="flex size-full items-center justify-center text-lg font-semibold">
                  {(nome || perfil?.email || "?").charAt(0).toUpperCase()}
                </div>
              )}
            </div>
            <Label className="cursor-pointer">
              <span className="inline-flex items-center gap-2 rounded-xl border border-input px-3 py-2 text-sm hover:bg-secondary">
                {enviandoAvatar ? <Loader2 className="size-4 animate-spin" /> : <Upload className="size-4" />}
                Trocar foto
              </span>
              <input type="file" accept="image/*" className="hidden" onChange={enviarAvatar} />
            </Label>
          </div>
          <div className="space-y-2">
            <Label htmlFor="nome">Nome</Label>
            <Input id="nome" value={nome} onChange={(e) => setNome(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">E-mail</Label>
            <Input id="email" value={perfil?.email ?? ""} disabled />
          </div>
          <div className="space-y-2">
            <Label htmlFor="telefone">Telefone / WhatsApp</Label>
            <Input id="telefone" value={telefone} onChange={(e) => setTelefone(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="negocio">Nome do negócio</Label>
            <Input id="negocio" value={negocio} onChange={(e) => setNegocio(e.target.value)} />
          </div>
          <Button type="submit" variant="hero" disabled={salvando}>
            {salvando ? <Loader2 className="animate-spin" /> : <Save />} Salvar alterações
          </Button>
        </form>

        <div className="space-y-6">
          <div className="rounded-2xl border border-border bg-card p-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Seu plano</h2>
              <Badge className="bg-gradient-brand text-primary-foreground">
                {sub?.status === "trial" ? "Teste grátis" : nomeDoPlano(sub?.plano_ativo)}
              </Badge>
            </div>
            {sub?.status === "trial" && (
              <p className="mt-2 text-sm text-muted-foreground">
                {uso.trialDias > 0
                  ? `${uso.trialDias} dia(s) restantes do seu teste de 7 dias.`
                  : "Seu teste grátis terminou."}
              </p>
            )}
            <div className="mt-5 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Posts usados neste mês</span>
                <span className="font-medium">
                  {uso.usadosNoMes} / {uso.ilimitado ? "∞" : uso.limite}
                </span>
              </div>
              <Progress value={percentual} />
            </div>
          </div>

          <form onSubmit={enviarFeedback} className="space-y-4 rounded-2xl border border-border bg-card p-6">
            <h2 className="flex items-center gap-2 text-lg font-semibold">
              <MessageSquare className="size-4 text-accent" /> Sugestões e suporte
            </h2>
            <Textarea
              value={mensagem}
              onChange={(e) => setMensagem(e.target.value)}
              placeholder="Conte o que podemos melhorar ou peça ajuda."
              rows={4}
            />
            <Button type="submit" variant="outline" disabled={enviandoFeedback || !mensagem.trim()}>
              {enviandoFeedback && <Loader2 className="animate-spin" />} Enviar mensagem
            </Button>
            {!!feedbacks?.length && (
              <ul className="space-y-2 pt-2 text-sm">
                {feedbacks.slice(0, 3).map((f) => (
                  <li key={f.id} className="rounded-xl bg-secondary p-3">
                    <p className="line-clamp-2">{f.mensagem}</p>
                    <span className="text-xs text-muted-foreground">
                      {new Date(f.created_at).toLocaleDateString("pt-BR")} · {f.status}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </form>
        </div>
      </section>

      <section>
        <h2 className="text-2xl">Planos disponíveis</h2>
        <p className="mt-1 mb-6 text-sm text-muted-foreground">
          Faça upgrade quando quiser. A troca de plano é confirmada pela nossa equipe.
        </p>
        <Planos ctaLabel="Quero este plano" />
      </section>
    </div>
  );
}
