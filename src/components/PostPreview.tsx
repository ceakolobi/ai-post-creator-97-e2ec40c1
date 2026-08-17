import { useState } from "react";
import { Copy, Check, Download, Heart, RefreshCw, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import type { Post } from "@/lib/data";
import { classesPosicao, comporComLogo, type MarcaConfig } from "@/lib/logo";
import { cn } from "@/lib/utils";

export function legendaCompleta(post: Pick<Post, "legenda" | "hashtags">) {
  return [post.legenda, post.hashtags].filter(Boolean).join("\n\n");
}

export function PostPreview({
  post,
  marca,
  onFavoritar,
  onExcluir,
  onGerarOutra,
}: {
  post: Post;
  marca?: MarcaConfig | null;
  onFavoritar?: () => void;
  onExcluir?: () => void;
  onGerarOutra?: () => void;
}) {
  const [copiado, setCopiado] = useState(false);

  async function copiar() {
    try {
      await navigator.clipboard.writeText(legendaCompleta(post));
      setCopiado(true);
      toast.success("Legenda copiada!");
      setTimeout(() => setCopiado(false), 2000);
    } catch {
      toast.error("Não conseguimos copiar. Selecione o texto manualmente.");
    }
  }

  async function baixar() {
    if (!post.imagem_url) return;
    try {
      let blob: Blob | null = null;
      if (marca) {
        blob = await comporComLogo(post.imagem_url, marca).catch(() => null);
      }
      if (!blob) {
        const r = await fetch(post.imagem_url);
        blob = await r.blob();
      }
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `criattor-${post.id.slice(0, 8)}.png`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success("Download iniciado");
    } catch {
      window.open(post.imagem_url, "_blank");
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,420px)_1fr]">
      <div className="overflow-hidden rounded-2xl border border-border bg-card">
        {post.imagem_url ? (
          <div className="relative">
            <img
              src={post.imagem_url}
              alt={post.titulo_curto ?? "Imagem gerada para o post"}
              width={1080}
              height={1080}
              className="aspect-square w-full object-cover"
            />
            {marca && (
              <img
                src={marca.url}
                alt="Logo da marca"
                style={{ width: `${marca.tamanho}%`, opacity: marca.opacidade / 100 }}
                className={cn("pointer-events-none absolute object-contain", classesPosicao(marca.posicao))}
              />
            )}
          </div>
        ) : (
          <div className="flex aspect-square w-full items-center justify-center bg-secondary text-sm text-muted-foreground">
            Sem imagem
          </div>
        )}
        <div className="space-y-2 p-4">
          <p className="text-sm whitespace-pre-line">{post.legenda}</p>
          {post.hashtags && <p className="text-sm text-accent">{post.hashtags}</p>}
        </div>
      </div>


      <div className="space-y-4">
        <div>
          <h2 className="text-xl font-semibold">{post.titulo_curto ?? "Post gerado"}</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {post.nicho} · {post.formato}
            {post.tom_de_voz ? ` · ${post.tom_de_voz}` : ""} ·{" "}
            {new Date(post.created_at).toLocaleDateString("pt-BR")}
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button variant="hero" onClick={copiar}>
            {copiado ? <Check /> : <Copy />}
            {copiado ? "Copiado!" : "Copiar legenda"}
          </Button>
          {post.imagem_url && (
            <Button variant="outline" onClick={baixar}>
              <Download />
              Baixar imagem
            </Button>
          )}
          {onGerarOutra && (
            <Button variant="outline" onClick={onGerarOutra}>
              <RefreshCw />
              Gerar outra versão
            </Button>
          )}
          {onFavoritar && (
            <Button variant={post.favorito ? "accent" : "outline"} onClick={onFavoritar}>
              <Heart className={cn(post.favorito && "fill-current")} />
              {post.favorito ? "Nos favoritos" : "Salvar nos favoritos"}
            </Button>
          )}
          {onExcluir && (
            <Button variant="ghost" className="text-destructive" onClick={onExcluir}>
              <Trash2 />
              Excluir
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
