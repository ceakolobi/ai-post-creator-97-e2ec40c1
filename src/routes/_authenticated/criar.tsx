import { useEffect, useRef, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Loader2, Sparkles, Lock } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { PostPreview } from "@/components/PostPreview";
import { LogoMarca } from "@/components/LogoMarca";
import { PlanosUpgrade } from "@/components/PlanosUpgrade";

import { useMarca } from "@/lib/logo";
import { useAuth } from "@/hooks/useAuth";
import { calcularUso, usePosts, useSubscription, type Post } from "@/lib/data";
import { normalizarHashtags } from "@/lib/n8n";
import { gerarPostComIA } from "@/lib/ai-generator.functions.ts";

export const Route = createFileRoute("/_authenticated/criar")({
  head: () => ({
    meta: [
      { title: "Criar post — Hagoth" },
      { name: "description", content: "Gere legenda, hashtags e imagem para o seu próximo post de Instagram." },
      { property: "og:title", content: "Criar post — Hagoth" },
      { property: "og:description", content: "Gere legenda, hashtags e imagem em segundos." },
    ],
  }),
  component: CriarPost,
});

const MENSAGENS = [
  "Entendendo o seu nicho...",
  "Escrevendo sua legenda...",
  "Escolhendo as melhores hashtags...",
  "Criando a imagem...",
  "Quase lá...",
];

const TONS = ["Profissional", "Descontraído", "Inspirador", "Direto ao ponto", "Divertido"];

const TIPOS_EVENTO = [
  "Festa",
  "Palestra",
  "Conferência",
  "Workshop",
  "Curso",
  "Live",
  "Promoção",
  "Inauguração",
];

function CriarPost() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { data: posts } = usePosts();
  const { data: sub } = useSubscription();
  const usageGerarPost = useServerFn(gerarPostComIA);
  const uso = calcularUso(posts, sub);
  const marca = useMarca();

  const [nicho, setNicho] = useState("");
  const [palavras, setPalavras] = useState("");
  const [tom, setTom] = useState("");
  const [cor1, setCor1] = useState("#7C3AED");
  const [cor2, setCor2] = useState("#D946EF");
  const [usarCores, setUsarCores] = useState(false);
  const [formato] = useState("post único");

  const [usarTitulo, setUsarTitulo] = useState(false);
  const [tituloPersonalizado, setTituloPersonalizado] = useState("");
  const [usarDestaques, setUsarDestaques] = useState(false);
  const [destaques, setDestaques] = useState<string[]>(["", "", ""]);
  const [usarCta, setUsarCta] = useState(false);
  const [cta, setCta] = useState("");
  const [usarEvento, setUsarEvento] = useState(false);
  const [eventoTipo, setEventoTipo] = useState("");
  const [eventoNome, setEventoNome] = useState("");
  const [eventoData, setEventoData] = useState("");
  const [eventoHora, setEventoHora] = useState("");
  const [eventoLocal, setEventoLocal] = useState("");


  const [gerando, setGerando] = useState(false);
  const [mensagem, setMensagem] = useState(MENSAGENS[0]!);
  const [resultado, setResultado] = useState<Post | null>(null);
  const [bloqueioAberto, setBloqueioAberto] = useState(false);
  const resultadoRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!gerando) return;
    let i = 0;
    const t = setInterval(() => {
      i = (i + 1) % MENSAGENS.length;
      setMensagem(MENSAGENS[i]!);
    }, 6000);
    return () => clearInterval(t);
  }, [gerando]);

  async function enviar(e?: React.FormEvent) {
    e?.preventDefault();
    if (!nicho.trim() || !palavras.trim()) {
      toast.error("Preencha o nicho e as palavras-chave.");
      return;
    }
    if (uso.bloqueado) {
      setBloqueioAberto(true);
      return;
    }
    if (!user) return;

    setGerando(true);
    setMensagem(MENSAGENS[0]!);
    try {
      const resposta = await usageGerarPost({
        data: {
          nicho: nicho.trim(),
          palavras_chave: palavras.trim(),
          tom_de_voz: tom,
          cores_marca: usarCores ? `${cor1}, ${cor2}` : "",
          formato,
          user_id: user.id,
          ...(usarTitulo && tituloPersonalizado.trim()
            ? { titulo_personalizado: tituloPersonalizado.trim().slice(0, 60) }
            : {}),
          ...(usarDestaques && destaques.some((d) => d.trim())
            ? { destaques: destaques.map((d) => d.trim().slice(0, 40)).filter(Boolean) }
            : {}),
          ...(usarCta && cta.trim() ? { cta: cta.trim().slice(0, 60) } : {}),
          ...(usarEvento
            ? {
                evento: {
                  tipo: eventoTipo,
                  nome: eventoNome.trim().slice(0, 60),
                  data: eventoData,
                  hora: eventoHora,
                  local: eventoLocal.trim().slice(0, 80),
                },
              }
            : {}),
        }

      });

      const hashtags = normalizarHashtags(resposta.hashtags);
      const desde = new Date(Date.now() - 3 * 60 * 1000).toISOString();
      const { data: jaExiste } = await supabase
        .from("posts_gerados")
        .select("*")
        .eq("user_id", user.id)
        .gte("created_at", desde)
        .order("created_at", { ascending: false })
        .limit(1);

      let salvo = (jaExiste?.[0] as Post | undefined) ?? null;
      if (!salvo || salvo.legenda !== resposta.legenda) {
        const { data, error } = await supabase
          .from("posts_gerados")
          .insert({
            user_id: user.id,
            nicho: nicho.trim(),
            palavras_chave: palavras.trim(),
            titulo_curto: (resposta as any).titulo_curto ?? null,
            legenda: (resposta as any).legenda!,
            hashtags,
            imagem_url: (resposta as any).imagem_url ?? null,
            formato,
            tom_de_voz: tom || null,
          })
          .select("*")
          .single();
        if (error) throw new Error("O post foi gerado, mas não conseguimos salvá-lo no histórico.");
        salvo = data as Post;
      }

      setResultado(salvo);
      queryClient.invalidateQueries({ queryKey: ["posts"] });
      toast.success("Post criado com sucesso!");
      setTimeout(() => resultadoRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
    } catch (err: any) {
      const msg = err?.message || "Algo deu errado ao criar o post. Seus dados foram mantidos, tente novamente.";
      toast.error(msg);
    } finally {
      setGerando(false);
    }
  }

  async function favoritar() {
    if (!resultado) return;
    const novo = !resultado.favorito;
    const { error } = await supabase.from("posts_gerados").update({ favorito: novo }).eq("id", resultado.id);
    if (error) {
      toast.error("Não conseguimos atualizar os favoritos.");
      return;
    }
    setResultado({ ...resultado, favorito: novo });
    queryClient.invalidateQueries({ queryKey: ["posts"] });
    toast.success(novo ? "Salvo nos favoritos" : "Removido dos favoritos");
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl">Criar novo post</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Conte sobre o seu negócio e a IA monta o post completo.
        </p>
      </div>

      <LogoMarca />

      {uso.bloqueado && (
        <div className="space-y-4 rounded-2xl border border-destructive/40 bg-card p-4 text-sm">
          <p>
            {uso.motivo === "trial_expirado"
              ? "Seu teste grátis terminou. Assine um plano para continuar gerando posts — seu histórico continua disponível."
              : `Você atingiu o limite de ${uso.limite} posts deste mês. O limite renova no início do próximo mês.`}
          </p>
          <PlanosUpgrade />
        </div>
      )}


      <form onSubmit={enviar} className="grid gap-5 rounded-2xl border border-border bg-card p-6 md:grid-cols-2">
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="nicho">Nicho / segmento *</Label>
          <Input
            id="nicho"
            value={nicho}
            onChange={(e) => setNicho(e.target.value)}
            placeholder="Ex.: clínica de estética"
          />
        </div>
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="palavras">Palavras-chave *</Label>
          <Input
            id="palavras"
            value={palavras}
            onChange={(e) => setPalavras(e.target.value)}
            placeholder="Ex.: harmonização facial, autoestima"
          />
        </div>
        <div className="space-y-2">
          <Label>Tom de voz</Label>
          <Select value={tom} onValueChange={setTom}>
            <SelectTrigger>
              <SelectValue placeholder="Escolha um tom (opcional)" />
            </SelectTrigger>
            <SelectContent>
              {TONS.map((t) => (
                <SelectItem key={t} value={t}>
                  {t}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Formato</Label>
          <Select value="post único">
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="post único">Post único</SelectItem>
              <SelectItem value="carrossel" disabled>
                Carrossel (em breve)
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2 md:col-span-2">
          <div className="flex items-center gap-3">
            <Label htmlFor="cores">Cores da marca (opcional)</Label>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setUsarCores((v) => !v)}
              className="text-xs"
            >
              {usarCores ? "Não usar" : "Definir cores"}
            </Button>
          </div>
          {usarCores && (
            <div className="flex items-center gap-3">
              <input
                id="cores"
                type="color"
                value={cor1}
                onChange={(e) => setCor1(e.target.value)}
                className="size-10 cursor-pointer rounded-xl border border-border bg-transparent"
              />
              <input
                type="color"
                value={cor2}
                onChange={(e) => setCor2(e.target.value)}
                className="size-10 cursor-pointer rounded-xl border border-border bg-transparent"
              />
              <span className="text-sm text-muted-foreground">
                {cor1} · {cor2}
              </span>
            </div>
          )}
        </div>

        <div className="space-y-4 rounded-2xl border border-border/70 bg-secondary/30 p-4 md:col-span-2">
          <div>
            <p className="text-sm font-medium">Extras do post (opcionais)</p>
            <p className="text-xs text-muted-foreground">
              Marque só o que quiser na arte. Textos curtos mantêm o post limpo e bonito.
            </p>
          </div>

          <label className="flex items-start gap-3 text-sm">
            <Checkbox checked={usarTitulo} onCheckedChange={(v) => setUsarTitulo(v === true)} className="mt-0.5" />
            <span>
              <span className="font-medium">Título próprio na imagem</span>
              <span className="block text-xs text-muted-foreground">Se desmarcado, a IA cria o título.</span>
            </span>
          </label>
          {usarTitulo && (
            <div className="space-y-1 pl-7">
              <Input
                value={tituloPersonalizado}
                maxLength={60}
                onChange={(e) => setTituloPersonalizado(e.target.value)}
                placeholder="Ex.: Sua pele renovada em 1 sessão"
              />
              <p className="text-xs text-muted-foreground">{tituloPersonalizado.length}/60 caracteres</p>
            </div>
          )}

          <label className="flex items-start gap-3 text-sm">
            <Checkbox
              checked={usarDestaques}
              onCheckedChange={(v) => setUsarDestaques(v === true)}
              className="mt-0.5"
            />
            <span>
              <span className="font-medium">Marcadores de destaque</span>
              <span className="block text-xs text-muted-foreground">Até 3 frases bem curtas (máx. 40 caracteres).</span>
            </span>
          </label>
          {usarDestaques && (
            <div className="space-y-2 pl-7">
              {destaques.map((d, i) => (
                <Input
                  key={i}
                  value={d}
                  maxLength={40}
                  onChange={(e) =>
                    setDestaques((atual) => atual.map((item, idx) => (idx === i ? e.target.value : item)))
                  }
                  placeholder={`Destaque ${i + 1} (ex.: Agende pelo WhatsApp)`}
                />
              ))}
            </div>
          )}

          <label className="flex items-start gap-3 text-sm">
            <Checkbox checked={usarCta} onCheckedChange={(v) => setUsarCta(v === true)} className="mt-0.5" />
            <span>
              <span className="font-medium">Chamada para ação</span>
              <span className="block text-xs text-muted-foreground">Uma linha discreta no rodapé da arte.</span>
            </span>
          </label>
          {usarCta && (
            <div className="pl-7">
              <Input
                value={cta}
                maxLength={60}
                onChange={(e) => setCta(e.target.value)}
                placeholder="Ex.: Chame no direct • @seuperfil"
              />
            </div>
          )}

          <label className="flex items-start gap-3 text-sm">
            <Checkbox checked={usarEvento} onCheckedChange={(v) => setUsarEvento(v === true)} className="mt-0.5" />
            <span>
              <span className="font-medium">É um evento (festa, palestra, conferência...)</span>
              <span className="block text-xs text-muted-foreground">
                Data, horário e local aparecem em destaque na imagem e na legenda.
              </span>
            </span>
          </label>
          {usarEvento && (
            <div className="grid gap-3 pl-7 sm:grid-cols-2">
              <div className="space-y-1">
                <Label className="text-xs">Tipo</Label>
                <Select value={eventoTipo} onValueChange={setEventoTipo}>
                  <SelectTrigger>
                    <SelectValue placeholder="Escolha" />
                  </SelectTrigger>
                  <SelectContent>
                    {TIPOS_EVENTO.map((t) => (
                      <SelectItem key={t} value={t}>
                        {t}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Nome do evento</Label>
                <Input
                  value={eventoNome}
                  maxLength={60}
                  onChange={(e) => setEventoNome(e.target.value)}
                  placeholder="Ex.: Noite do Vinho"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Data</Label>
                <Input type="date" value={eventoData} onChange={(e) => setEventoData(e.target.value)} />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Horário</Label>
                <Input type="time" value={eventoHora} onChange={(e) => setEventoHora(e.target.value)} />
              </div>
              <div className="space-y-1 sm:col-span-2">
                <Label className="text-xs">Local</Label>
                <Input
                  value={eventoLocal}
                  maxLength={80}
                  onChange={(e) => setEventoLocal(e.target.value)}
                  placeholder="Ex.: Espaço Aurora — Rua das Flores, 120"
                />
              </div>
            </div>
          )}
        </div>



        <div className="md:col-span-2">
          <Button type="submit" variant="hero" size="xl" className="w-full sm:w-auto" disabled={gerando}>
            {gerando ? <Loader2 className="animate-spin" /> : <Sparkles />}
            {gerando ? mensagem : "Gerar post"}
          </Button>
          {gerando && (
            <p className="mt-3 text-sm text-muted-foreground">
              Isso costuma levar de 20 a 60 segundos. Pode deixar a página aberta.
            </p>
          )}
        </div>
      </form>

      {gerando && (
        <div className="grid gap-6 rounded-2xl border border-border bg-card p-6 lg:grid-cols-[minmax(0,420px)_1fr]">
          <div className="aspect-square w-full animate-pulse rounded-2xl bg-secondary" />
          <div className="space-y-3">
            <div className="h-6 w-2/3 animate-pulse rounded bg-secondary" />
            <div className="h-4 w-full animate-pulse rounded bg-secondary" />
            <div className="h-4 w-5/6 animate-pulse rounded bg-secondary" />
            <div className="h-4 w-3/4 animate-pulse rounded bg-secondary" />
          </div>
        </div>
      )}

      {resultado && !gerando && (
        <div ref={resultadoRef} className="space-y-4">
          <div className="flex items-center gap-3">
            <h2 className="text-2xl">Seu post está pronto</h2>
            <Badge className="bg-gradient-brand text-primary-foreground">novo</Badge>
          </div>
          <PostPreview post={resultado} marca={marca} onFavoritar={favoritar} onGerarOutra={() => enviar()} />
        </div>
      )}

      <Dialog open={bloqueioAberto} onOpenChange={setBloqueioAberto}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Lock className="size-4" /> Geração bloqueada
            </DialogTitle>
            <DialogDescription>
              {uso.motivo === "trial_expirado"
                ? "Seu teste grátis de 7 dias terminou. Assine um plano para continuar criando posts — seu histórico continua acessível."
                : `Você já usou os ${uso.limite} posts do seu plano neste mês. Faça upgrade ou aguarde a renovação.`}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setBloqueioAberto(false)}>
              Fechar
            </Button>
            <Button asChild variant="hero">
              <Link to="/minha-conta">Ver planos</Link>
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
