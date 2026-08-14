import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { Sparkles, Images, CalendarDays, Timer, ImageOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/EmptyState";
import { usePosts, useSubscription, calcularUso, type Post } from "@/lib/data";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({
    meta: [
      { title: "Painel — Criattor" },
      { name: "description", content: "Acompanhe seus posts gerados, consumo do plano e histórico recente." },
      { property: "og:title", content: "Painel — Criattor" },
      { property: "og:description", content: "Seus posts gerados e consumo do plano." },
    ],
  }),
  component: Dashboard,
});

const CORES = ["oklch(0.5413 0.2466 293.01)", "oklch(0.6668 0.2591 322.15)", "oklch(0.7971 0.1339 211.53)", "oklch(0.6959 0.1491 162.48)", "oklch(0.7686 0.1647 70.08)"];

function serie30dias(posts: Post[]) {
  const dias: { dia: string; posts: number }[] = [];
  for (let i = 29; i >= 0; i--) {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() - i);
    const chave = d.toISOString().slice(0, 10);
    dias.push({
      dia: d.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" }),
      posts: posts.filter((p) => p.created_at.slice(0, 10) === chave).length,
    });
  }
  return dias;
}

function porNicho(posts: Post[]) {
  const mapa = new Map<string, number>();
  posts.forEach((p) => mapa.set(p.nicho, (mapa.get(p.nicho) ?? 0) + 1));
  return [...mapa.entries()]
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 5);
}

function Metrica({
  titulo,
  valor,
  icone: Icone,
  detalhe,
}: {
  titulo: string;
  valor: string;
  icone: typeof Images;
  detalhe?: string;
}) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{titulo}</p>
        <Icone className="size-4 text-accent" />
      </div>
      <p className="mt-3 text-3xl font-bold">{valor}</p>
      {detalhe && <p className="mt-1 text-xs text-muted-foreground">{detalhe}</p>}
    </div>
  );
}

function Dashboard() {
  const { data: posts, isLoading } = usePosts();
  const { data: sub } = useSubscription();
  const uso = calcularUso(posts, sub);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-64" />
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-32 rounded-2xl" />
          ))}
        </div>
        <Skeleton className="h-80 rounded-2xl" />
      </div>
    );
  }

  const lista = posts ?? [];
  const serie = serie30dias(lista);
  const nichos = porNicho(lista);

  return (
    <div className="space-y-8">
      {sub?.status === "trial" && (
        <div className="rounded-2xl border border-border bg-card p-4 text-sm glow">
          {uso.trialDias > 0 ? (
            <>
              Você tem <strong className="text-gradient">{uso.trialDias} dia(s)</strong> restantes no seu teste
              grátis.
            </>
          ) : (
            <>
              Seu teste grátis terminou. Escolha um plano em{" "}
              <Link to="/minha-conta" className="text-gradient font-semibold">
                Minha conta
              </Link>{" "}
              para continuar gerando posts.
            </>
          )}
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl">Seu painel</h1>
          <p className="mt-1 text-sm text-muted-foreground">Acompanhe sua produção de conteúdo.</p>
        </div>
        <Button asChild variant="hero" size="xl">
          <Link to="/criar">
            <Sparkles /> Criar novo post
          </Link>
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Metrica titulo="Posts gerados" valor={String(lista.length)} icone={Images} detalhe="Total na conta" />
        <Metrica titulo="Posts este mês" valor={String(uso.usadosNoMes)} icone={CalendarDays} />
        <Metrica
          titulo="Posts restantes"
          valor={uso.ilimitado ? "∞" : String(uso.restantes)}
          icone={Sparkles}
          detalhe={uso.ilimitado ? "Plano ilimitado" : `Limite de ${uso.limite}/mês`}
        />
        <Metrica
          titulo="Teste grátis"
          valor={sub?.status === "trial" ? `${uso.trialDias} dia(s)` : "—"}
          icone={Timer}
          detalhe={sub?.status === "trial" ? "restantes" : "Você não está em teste"}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        <div className="rounded-2xl border border-border bg-card p-5 lg:col-span-3">
          <h2 className="text-lg font-semibold">Posts por dia (últimos 30 dias)</h2>
          <div className="mt-4 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={serie}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                <XAxis dataKey="dia" stroke="var(--color-muted-foreground)" fontSize={11} interval={4} />
                <YAxis allowDecimals={false} stroke="var(--color-muted-foreground)" fontSize={11} />
                <Tooltip
                  contentStyle={{
                    background: "var(--color-card)",
                    border: "1px solid var(--color-border)",
                    borderRadius: 12,
                    color: "var(--color-foreground)",
                  }}
                />
                <Line type="monotone" dataKey="posts" stroke={CORES[1]} strokeWidth={3} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card p-5 lg:col-span-2">
          <h2 className="text-lg font-semibold">Posts por nicho</h2>
          <div className="mt-4 h-64">
            {nichos.length === 0 ? (
              <p className="text-sm text-muted-foreground">Nenhum post gerado ainda.</p>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={nichos} dataKey="value" nameKey="name" innerRadius={55} outerRadius={85}>
                    {nichos.map((_, i) => (
                      <Cell key={i} fill={CORES[i % CORES.length]} />
                    ))}
                  </Pie>
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                  <Tooltip
                    contentStyle={{
                      background: "var(--color-card)",
                      border: "1px solid var(--color-border)",
                      borderRadius: 12,
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      <div>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Posts recentes</h2>
          <Button asChild variant="ghost" size="sm">
            <Link to="/meus-posts">Ver todos</Link>
          </Button>
        </div>
        {lista.length === 0 ? (
          <EmptyState
            icone={<ImageOff className="size-8" />}
            titulo="Você ainda não criou nenhum post"
            descricao="Descreva seu nicho e receba legenda, hashtags e imagem em menos de um minuto."
            acao={
              <Button asChild variant="hero">
                <Link to="/criar">
                  <Sparkles /> Criar meu primeiro post
                </Link>
              </Button>
            }
          />
        ) : (
          <ul className="space-y-3">
            {lista.slice(0, 5).map((p) => (
              <li key={p.id}>
                <Link
                  to="/post/$postId"
                  params={{ postId: p.id }}
                  className="flex items-center gap-4 rounded-2xl border border-border bg-card p-3 transition-colors hover:bg-secondary"
                >
                  {p.imagem_url ? (
                    <img
                      src={p.imagem_url}
                      alt={p.titulo_curto ?? p.nicho}
                      loading="lazy"
                      width={64}
                      height={64}
                      className="size-16 rounded-xl object-cover"
                    />
                  ) : (
                    <div className="flex size-16 items-center justify-center rounded-xl bg-secondary">
                      <ImageOff className="size-5 text-muted-foreground" />
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium">{p.titulo_curto ?? p.nicho}</p>
                    <p className="text-xs text-muted-foreground">
                      {p.nicho} · {new Date(p.created_at).toLocaleDateString("pt-BR")}
                    </p>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
