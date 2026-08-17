import { useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { ImagePlus, Loader2, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/lib/data";
import { POSICOES_LOGO, classesPosicao, useMarca, type PosicaoLogo } from "@/lib/logo";

export function LogoMarca() {
  const { user } = useAuth();
  const { data: perfil } = useProfile();
  const queryClient = useQueryClient();
  const marca = useMarca();
  const inputRef = useRef<HTMLInputElement>(null);
  const [enviando, setEnviando] = useState(false);

  const perfilLogo = perfil as unknown as {
    logo_posicao?: PosicaoLogo | null;
    logo_tamanho?: number | null;
    logo_opacidade?: number | null;
  } | null;

  const posicao: PosicaoLogo = perfilLogo?.logo_posicao ?? "inferior-direita";
  const tamanho = perfilLogo?.logo_tamanho ?? 18;
  const opacidade = perfilLogo?.logo_opacidade ?? 90;

  async function atualizar(campos: Record<string, unknown>) {
    if (!user) return;
    const { error } = await supabase.from("profiles").update(campos as never).eq("id", user.id);
    if (error) {
      toast.error("Não conseguimos salvar as preferências da logo.");
      return;
    }
    queryClient.invalidateQueries({ queryKey: ["profile"] });
  }

  async function enviarLogo(e: React.ChangeEvent<HTMLInputElement>) {
    const arquivo = e.target.files?.[0];
    if (!arquivo || !user) return;
    setEnviando(true);
    const caminho = `${user.id}/logo-${Date.now()}-${arquivo.name.replace(/[^\w.-]/g, "")}`;
    const { error } = await supabase.storage.from("avatars").upload(caminho, arquivo, { upsert: true });
    if (error) {
      toast.error("Não conseguimos enviar a logo.");
    } else {
      await atualizar({ logo_url: caminho });
      toast.success("Logo salva! Ela será aplicada nos seus posts.");
    }
    setEnviando(false);
    if (inputRef.current) inputRef.current.value = "";
  }

  return (
    <section className="space-y-5 rounded-2xl border border-border bg-card p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold">Logo da marca</h2>
          <p className="text-sm text-muted-foreground">
            Envie sua logo em PNG com fundo transparente e escolha onde ela aparece na imagem.
          </p>
        </div>
        <div className="flex gap-2">
          <input
            ref={inputRef}
            type="file"
            accept="image/png,image/jpeg,image/webp,image/svg+xml"
            className="hidden"
            onChange={enviarLogo}
          />
          <Button type="button" variant="outline" disabled={enviando} onClick={() => inputRef.current?.click()}>
            {enviando ? <Loader2 className="animate-spin" /> : <ImagePlus />}
            {marca ? "Trocar logo" : "Adicionar logo"}
          </Button>
          {marca && (
            <Button
              type="button"
              variant="ghost"
              className="text-destructive"
              onClick={() => atualizar({ logo_url: null })}
            >
              <Trash2 />
              Remover
            </Button>
          )}
        </div>
      </div>

      {marca && (
        <div className="grid gap-6 md:grid-cols-[200px_1fr]">
          <div className="relative aspect-square w-full overflow-hidden rounded-xl border border-border bg-secondary">
            <div className="absolute inset-0 bg-gradient-brand opacity-30" />
            <img
              src={marca.url}
              alt="Prévia da logo"
              style={{ width: `${tamanho}%`, opacity: opacidade / 100 }}
              className={`absolute object-contain ${classesPosicao(posicao)}`}
            />
          </div>

          <div className="space-y-5">
            <div className="space-y-2">
              <Label>Posição na imagem</Label>
              <Select value={posicao} onValueChange={(v) => atualizar({ logo_posicao: v })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {POSICOES_LOGO.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Tamanho — {tamanho}% da largura</Label>
              <Slider
                value={[tamanho]}
                min={5}
                max={50}
                step={1}
                onValueCommit={(v) => atualizar({ logo_tamanho: v[0] })}
              />
            </div>

            <div className="space-y-2">
              <Label>Opacidade — {opacidade}%</Label>
              <Slider
                value={[opacidade]}
                min={20}
                max={100}
                step={5}
                onValueCommit={(v) => atualizar({ logo_opacidade: v[0] })}
              />
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
