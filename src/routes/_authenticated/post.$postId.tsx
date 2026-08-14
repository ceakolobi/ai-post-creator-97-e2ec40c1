import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { PostPreview } from "@/components/PostPreview";
import { usePosts } from "@/lib/data";

export const Route = createFileRoute("/_authenticated/post/$postId")({
  head: () => ({
    meta: [
      { title: "Detalhe do post — Criattor" },
      { name: "description", content: "Veja a legenda, hashtags e imagem geradas para este post." },
      { property: "og:title", content: "Detalhe do post — Criattor" },
      { property: "og:description", content: "Legenda, hashtags e imagem do seu post." },
    ],
  }),
  component: DetalhePost,
});

function DetalhePost() {
  const { postId } = Route.useParams();
  const { data: posts, isLoading } = usePosts();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const post = posts?.find((p) => p.id === postId);

  async function favoritar() {
    if (!post) return;
    const { error } = await supabase
      .from("posts_gerados")
      .update({ favorito: !post.favorito })
      .eq("id", post.id);
    if (error) return toast.error("Não conseguimos atualizar os favoritos.");
    queryClient.invalidateQueries({ queryKey: ["posts"] });
  }

  async function excluir() {
    if (!post || !confirm("Excluir este post do histórico?")) return;
    const { error } = await supabase.from("posts_gerados").delete().eq("id", post.id);
    if (error) return toast.error("Não conseguimos excluir este post.");
    queryClient.invalidateQueries({ queryKey: ["posts"] });
    toast.success("Post excluído");
    navigate({ to: "/meus-posts" });
  }

  return (
    <div className="space-y-6">
      <Button asChild variant="ghost" size="sm">
        <Link to="/meus-posts">
          <ArrowLeft /> Voltar para meus posts
        </Link>
      </Button>

      {isLoading ? (
        <Skeleton className="h-96 rounded-2xl" />
      ) : !post ? (
        <div className="rounded-2xl border border-border bg-card p-8 text-center">
          <h1 className="text-xl font-semibold">Post não encontrado</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Ele pode ter sido excluído ou pertence a outra conta.
          </p>
        </div>
      ) : (
        <PostPreview post={post} onFavoritar={favoritar} onExcluir={excluir} />
      )}
    </div>
  );
}
