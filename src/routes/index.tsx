import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Sparkles,
  Image as ImageIcon,
  History,
  Wand2,
  PencilLine,
  Copy,
  ArrowRight,
  Quote,
  Check,
  X,
  CalendarClock,
  Stamp,
  MessageSquareHeart,
  ShieldCheck,
  Download,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { SiteHeader, SiteFooter } from "@/components/SiteHeader";
import { Planos } from "@/components/Planos";
import heroImg from "@/assets/hero-hagoth.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Hagoth — Posts profissionais para Instagram em segundos" },
      {
        name: "description",
        content:
          "Descreva seu nicho e receba legenda, hashtags e uma imagem exclusiva criada por IA. Teste grátis por 7 dias.",
      },
      { property: "og:title", content: "Hagoth — Posts para Instagram com IA" },
      {
        property: "og:description",
        content: "Legenda, hashtags e imagem exclusiva em segundos. Feito para quem não é designer.",
      },
    ],
  }),
  component: Landing,
});

const beneficios = [
  {
    icone: PencilLine,
    titulo: "Legenda + hashtags prontas",
    texto: "Texto no tom da sua marca e hashtags relevantes para o seu nicho, sem bloqueio criativo.",
  },
  {
    icone: ImageIcon,
    titulo: "Imagem exclusiva por IA",
    texto: "Uma arte quadrada única para cada post — nada de banco de imagens repetido.",
  },
  {
    icone: History,
    titulo: "Histórico organizado",
    texto: "Todos os posts salvos, com busca, filtros e favoritos para reaproveitar quando quiser.",
  },
  {
    icone: Wand2,
    titulo: "Feito para quem não é designer",
    texto: "Sem editor complicado: descreva o negócio e copie o resultado direto para o Instagram.",
  },
];

const passos = [
  { n: "01", titulo: "Descreva seu nicho", texto: "Conte o segmento e as palavras-chave do post." },
  { n: "02", titulo: "A IA cria", texto: "Em segundos você recebe legenda, hashtags e imagem." },
  { n: "03", titulo: "Copie e publique", texto: "Um clique para copiar o texto e baixar a arte." },
];

function Landing() {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />

      <main>
        <section className="relative overflow-hidden">
          <div
            className="pointer-events-none absolute -top-40 left-1/2 size-[38rem] -translate-x-1/2 rounded-full opacity-30 blur-3xl"
            style={{ backgroundImage: "var(--gradient-brand)" }}
            aria-hidden="true"
          />
          <div className="relative mx-auto grid max-w-6xl items-center gap-10 px-4 py-16 lg:grid-cols-2 lg:py-24">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-xs text-muted-foreground">
                <Sparkles className="size-3 text-accent" />7 dias grátis, sem cartão
              </span>
              <h1 className="mt-5 text-4xl leading-tight sm:text-5xl lg:text-6xl">
                Posts profissionais para Instagram em <span className="text-gradient">segundos</span>
              </h1>
              <p className="mt-5 max-w-xl text-lg text-muted-foreground">
                Descreva seu nicho e o Hagoth entrega legenda, hashtags e uma imagem exclusiva criada por
                inteligência artificial. Pronto para copiar e publicar.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Button asChild variant="hero" size="xl">
                  <Link to="/criar-conta">
                    Começar grátis <ArrowRight />
                  </Link>
                </Button>
                <Button asChild variant="outline" size="xl">
                  <Link to="/login">Já tenho conta</Link>
                </Button>
              </div>
            </div>
            <div className="animate-floaty">
              <img
                src={heroImg}
                alt="Interface do Hagoth gerando posts de Instagram com inteligência artificial"
                width={1408}
                height={1008}
                className="w-full rounded-3xl border border-border"
              />
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 py-16">
          <h2 className="text-3xl">Tudo o que você precisa para postar todo dia</h2>
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {beneficios.map((b) => (
              <div
                key={b.titulo}
                className="rounded-2xl border border-border bg-card p-6 transition-transform duration-200 hover:-translate-y-1"
              >
                <span className="flex size-10 items-center justify-center rounded-xl bg-gradient-brand">
                  <b.icone className="size-5 text-primary-foreground" />
                </span>
                <h3 className="mt-4 text-base font-semibold">{b.titulo}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{b.texto}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="border-y border-border bg-card/40">
          <div className="mx-auto max-w-6xl px-4 py-16">
            <h2 className="text-3xl">Como funciona</h2>
            <div className="mt-8 grid gap-5 md:grid-cols-3">
              {passos.map((p) => (
                <div key={p.n} className="rounded-2xl border border-border bg-card p-6">
                  <span className="text-3xl font-bold text-gradient">{p.n}</span>
                  <h3 className="mt-3 text-lg font-semibold">{p.titulo}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{p.texto}</p>
                </div>
              ))}
            </div>
            <div className="mt-8">
              <Button asChild variant="hero" size="lg">
                <Link to="/criar-conta">
                  <Copy /> Criar meu primeiro post
                </Link>
              </Button>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 py-16">
          <h2 className="text-3xl">Quem já usa</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Estamos coletando os primeiros depoimentos — o seu pode ser o próximo.
          </p>
          <div className="mt-8 grid gap-5 md:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="rounded-2xl border border-dashed border-border bg-card/50 p-6">
                <Quote className="size-5 text-accent" />
                <p className="mt-3 text-sm text-muted-foreground">
                  Espaço reservado para o depoimento de um cliente Hagoth.
                </p>
                <p className="mt-4 text-xs text-muted-foreground">Em breve</p>
              </div>
            ))}
          </div>
        </section>

        <section className="border-y border-border bg-card/40">
          <div className="mx-auto max-w-6xl px-4 py-16">
            <h2 className="text-3xl">Feito para o seu nicho</h2>
            <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
              O Hagoth entende o contexto do seu negócio e adapta linguagem, chamadas e hashtags para cada
              segmento.
            </p>
            <div className="mt-8 flex flex-wrap gap-2">
              {nichos.map((n) => (
                <span
                  key={n}
                  className="rounded-full border border-border bg-card px-4 py-2 text-sm text-muted-foreground"
                >
                  {n}
                </span>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 py-16">
          <h2 className="text-3xl">Muito além de um gerador de legendas</h2>
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {recursos.map((r) => (
              <div key={r.titulo} className="rounded-2xl border border-border bg-card p-6">
                <span className="flex size-10 items-center justify-center rounded-xl bg-gradient-brand">
                  <r.icone className="size-5 text-primary-foreground" />
                </span>
                <h3 className="mt-4 text-base font-semibold">{r.titulo}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{r.texto}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="border-y border-border bg-card/40">
          <div className="mx-auto max-w-6xl px-4 py-16">
            <h2 className="text-3xl">Quanto tempo você economiza</h2>
            <div className="mt-8 grid gap-5 md:grid-cols-2">
              <div className="rounded-2xl border border-border bg-card p-6">
                <h3 className="text-base font-semibold text-muted-foreground">Do jeito antigo</h3>
                <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
                  {semHagoth.map((t) => (
                    <li key={t} className="flex gap-2">
                      <X className="mt-0.5 size-4 shrink-0 text-destructive" />
                      {t}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="rounded-2xl border border-border bg-card p-6 glow">
                <h3 className="text-base font-semibold text-gradient">Com o Hagoth</h3>
                <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
                  {comHagoth.map((t) => (
                    <li key={t} className="flex gap-2">
                      <Check className="mt-0.5 size-4 shrink-0 text-accent" />
                      {t}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>


        <section id="planos" className="border-t border-border bg-card/40">
          <div className="mx-auto max-w-6xl px-4 py-16">
            <h2 className="text-3xl">Planos para cada momento</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Comece com 7 dias grátis e 10 posts. Depois escolha o plano do tamanho do seu negócio.
            </p>
            <div className="mt-10">
              <Planos />
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
