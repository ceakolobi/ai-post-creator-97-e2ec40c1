import { useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { Heart, ImageOff, Search, Sparkles, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/EmptyState";
import { usePosts, type Post } from "@/lib/data";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/meus-posts")({
  head: () => ({
    meta: [
      { title: "Meus posts — Criattor" },
      { name: "description", content: "Histórico completo dos posts gerados, com busca, favoritos e download." },
      { property: "og:title", content: "Meus posts — Criattor" },
      { property: "og:description", content: "Seu histórico de posts gerados pela IA." },
    ],
  }),
  component: MeusPosts,
});

function MeusPosts() {
  const { data: posts, isLoading } = usePosts();
  const queryClient = useQueryClient();
  const [busca, setBusca] = useState("");
  const [soFavoritos, setSoFavoritos] = useState(false);
  const [nicho, setNicho] = useState("");

  const nichos = useMemo(
    () => [...new Set((posts ?? []).map((p) => p.nicho))].sort(),
    [posts],
  );

  const filtrados = useMemo(() => {
    const termo = busca.trim().toLowerCase();
    return (posts ?? []).filter((p) => {
      if (soFavoritos && !p.favorito) return false;
      if (nicho && p.nicho !== nicho) return false;
      if (!termo) return true;
      return [p.titulo_curto, p.legenda, p.hashtags, p.nicho, p.palavras_chave]
        .filter(Boolean)
        .some((v) => v!.toLowerCase().includes(termo));
    });
  }, [posts, busca, soFavoritos, nicho]);

  async function favoritar(post: Post) {
    const { error } = await supabase
      .from("posts_gerados")
      .update({ favorito: !post.favorito })
      .eq("id", post.id);
    if (error) {
      toast.error("Não conseguimos atualizar os favoritos.");
      return;
    }
    queryClient.invalidateQueries({ queryKey: ["posts"] });
  }

  async function excluir(post: Post) {
    if (!confirm("Excluir este post do histórico?")) return;
    const { error } = await supabase.from("posts_gerados").delete().eq("id", post.id);
    if (error) {
      toast.error("Não conseguimos excluir este post.");
      return;
    }
    queryClient.invalidateQueries({ queryKey: ["posts"] });
    toast.success("Post excluído");
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl">Meus posts</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {posts?.length ?? 0} post(s) no seu histórico.
          </p>
        </div>
        <Button asChild variant="hero">
          <Link to="/criar">
            <Sparkles /> Criar novo post
          </Link>
        </Button>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative min-w-56 flex-1">
          <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Buscar por nicho, legenda ou hashtag"
            className="pl-9"
          />
        </div>
        <Button variant={soFavoritos ? "accent" : "outline"} onClick={() => setSoFavoritos((v) => !v)}>
          <Heart className={cn(soFavoritos && "fill-current")} /> Favoritos
        </Button>
        {nichos.length > 1 && (
          <select
            value={nicho}
            onChange={(e) => setNicho(e.target.value)}
            className="h-10 rounded-xl border border-input bg-background px-3 text-sm"
          >
            <option value="">Todos os nichos</option>
            {nichos.map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
        )}
      </div>

      {isLoading ? (
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className="h-72 rounded-2xl" />
          ))}
        </div>
      ) : filtrados.length === 0 ? (
        <EmptyState
          icone={<ImageOff className="size-8" />}
          titulo={posts?.length ? "Nenhum post encontrado" : "Seu histórico está vazio"}
          descricao={
            posts?.length
              ? "Tente ajustar a busca ou os filtros aplicados."
              : "Gere seu primeiro post e ele aparecerá aqui automaticamente."
          }
          acao={
            !posts?.length && (
              <Button asChild variant="hero">
                <Link to="/criar">
                  <Sparkles /> Criar meu primeiro post
                </Link>
              </Button>
            )
          }
        />
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {filtrados.map((p) => (
            <article
              key={p.id}
              className="group overflow-hidden rounded-2xl border border-border bg-card transition-transform hover:-translate-y-1"
            >
              <Link to="/post/$postId" params={{ postId: p.id }}>
                {p.imagem_url ? (
                  <img
                    src={p.imagem_url}
                    alt={p.titulo_curto ?? p.nicho}
                    loading="lazy"
                    width={600}
                    height={600}
                    className="aspect-square w-full object-cover"
                  />
                ) : (
                  <div className="flex aspect-square w-full items-center justify-center bg-secondary">
                    <ImageOff className="size-6 text-muted-foreground" />
                  </div>
                )}
              </Link>
              <div className="space-y-2 p-4">
                <Link to="/post/$postId" params={{ postId: p.id }} className="block">
                  <h2 className="truncate font-semibold">{p.titulo_curto ?? p.nicho}</h2>
                  <p className="line-clamp-2 text-sm text-muted-foreground">{p.legenda}</p>
                </Link>
                <div className="flex items-center justify-between pt-1">
                  <span className="text-xs text-muted-foreground">
                    {new Date(p.created_at).toLocaleDateString("pt-BR")}
                  </span>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label="Favoritar"
                      onClick={() => favoritar(p)}
                    >
                      <Heart className={cn("size-4", p.favorito && "fill-current text-accent")} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label="Excluir"
                      className="text-destructive"
                      onClick={() => excluir(p)}
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
