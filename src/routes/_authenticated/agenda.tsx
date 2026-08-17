import { createFileRoute, Link } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { CalendarClock, Check, Copy, Trash2, Undo2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/EmptyState";
import { legendaCompleta } from "@/components/PostPreview";
import { useAgendamentos, formatarQuando, nomeRede, type Agendamento } from "@/lib/agenda";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/agenda")({
  head: () => ({
    meta: [
      { title: "Agenda de publicações — Hagoth" },
      {
        name: "description",
        content: "Organize quando publicar cada post no Instagram, Facebook, TikTok e LinkedIn.",
      },
      { property: "og:title", content: "Agenda de publicações — Hagoth" },
      { property: "og:description", content: "Lembretes de publicação com imagem e legenda prontas." },
    ],
  }),
  component: Agenda,
});

function Agenda() {
  const { data: itens, isLoading } = useAgendamentos();
  const queryClient = useQueryClient();

  async function alternarConcluido(item: Agendamento) {
    const { error } = await supabase
      .from("agendamentos")
      .update({ concluido: !item.concluido })
      .eq("id", item.id);
    if (error) {
      toast.error("Não conseguimos atualizar o lembrete.");
      return;
    }
    queryClient.invalidateQueries({ queryKey: ["agendamentos"] });
  }

  async function excluir(item: Agendamento) {
    const { error } = await supabase.from("agendamentos").delete().eq("id", item.id);
    if (error) {
      toast.error("Não conseguimos excluir o lembrete.");
      return;
    }
    queryClient.invalidateQueries({ queryKey: ["agendamentos"] });
    toast.success("Lembrete removido.");
  }

  async function copiar(item: Agendamento) {
    const post = item.posts_gerados;
    if (!post) return;
    try {
      await navigator.clipboard.writeText(legendaCompleta(post));
      toast.success("Legenda copiada!");
    } catch {
      toast.error("Não conseguimos copiar a legenda.");
    }
  }

  const pendentes = (itens ?? []).filter((i) => !i.concluido);
  const feitos = (itens ?? []).filter((i) => i.concluido);
  const agora = Date.now();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl">Agenda de publicações</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Seus lembretes de postagem. Na hora marcada, abra o post, baixe a imagem, copie a legenda e publique
          na rede escolhida.
        </p>
      </div>

      {isLoading && <p className="text-sm text-muted-foreground">Carregando...</p>}

      {!isLoading && pendentes.length === 0 && feitos.length === 0 && (
        <EmptyState
          titulo="Nenhum lembrete ainda"
          descricao="Crie um post e clique em 'Agendar lembrete' para organizar suas publicações."
          acao={
            <Button asChild variant="hero">
              <Link to="/criar">Criar post</Link>
            </Button>
          }
        />
      )}

      {pendentes.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-lg font-semibold">Próximos</h2>
          {pendentes.map((item) => (
            <Card
              key={item.id}
              item={item}
              atrasado={new Date(item.agendado_para).getTime() < agora}
              onCopiar={() => copiar(item)}
              onConcluir={() => alternarConcluido(item)}
              onExcluir={() => excluir(item)}
            />
          ))}
        </section>
      )}

      {feitos.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-lg font-semibold">Publicados</h2>
          {feitos.map((item) => (
            <Card
              key={item.id}
              item={item}
              onCopiar={() => copiar(item)}
              onConcluir={() => alternarConcluido(item)}
              onExcluir={() => excluir(item)}
            />
          ))}
        </section>
      )}
    </div>
  );
}

function Card({
  item,
  atrasado,
  onCopiar,
  onConcluir,
  onExcluir,
}: {
  item: Agendamento;
  atrasado?: boolean;
  onCopiar: () => void;
  onConcluir: () => void;
  onExcluir: () => void;
}) {
  const post = item.posts_gerados;
  return (
    <div
      className={cn(
        "flex flex-wrap items-center gap-4 rounded-2xl border border-border bg-card p-4",
        item.concluido && "opacity-60",
      )}
    >
      {post?.imagem_url ? (
        <img
          src={post.imagem_url}
          alt={post.titulo_curto ?? "Post agendado"}
          className="size-16 rounded-xl object-cover"
        />
      ) : (
        <div className="flex size-16 items-center justify-center rounded-xl bg-secondary">
          <CalendarClock className="size-5 text-muted-foreground" />
        </div>
      )}

      <div className="min-w-[200px] flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <p className="font-medium">{post?.titulo_curto ?? post?.nicho ?? "Post"}</p>
          <Badge variant="secondary">{nomeRede(item.rede)}</Badge>
          {atrasado && !item.concluido && <Badge className="bg-destructive text-destructive-foreground">atrasado</Badge>}
        </div>
        <p className="text-sm text-muted-foreground">{formatarQuando(item.agendado_para)}</p>
        {item.observacao && <p className="mt-1 text-sm text-muted-foreground">{item.observacao}</p>}
      </div>

      <div className="flex flex-wrap gap-2">
        {post && (
          <Button asChild variant="outline" size="sm">
            <Link to="/post/$postId" params={{ postId: post.id }}>
              Abrir post
            </Link>
          </Button>
        )}
        <Button variant="outline" size="sm" onClick={onCopiar}>
          <Copy />
          Copiar legenda
        </Button>
        <Button variant={item.concluido ? "ghost" : "hero"} size="sm" onClick={onConcluir}>
          {item.concluido ? <Undo2 /> : <Check />}
          {item.concluido ? "Reabrir" : "Marcar publicado"}
        </Button>
        <Button variant="ghost" size="sm" className="text-destructive" onClick={onExcluir}>
          <Trash2 />
        </Button>
      </div>
    </div>
  );
}
