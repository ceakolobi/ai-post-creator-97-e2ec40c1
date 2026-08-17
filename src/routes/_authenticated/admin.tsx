import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Users, Images, TrendingUp, MessageSquare, Search } from "lucide-react";
import { toast } from "sonner";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EmptyState } from "@/components/EmptyState";
import { useIsAdmin, type Post, type Profile, type Subscription } from "@/lib/data";
import { PLANOS, nomeDoPlano } from "@/lib/plans";

export const Route = createFileRoute("/_authenticated/admin")({
  head: () => ({
    meta: [
      { title: "Administração — Criattor" },
      { name: "description", content: "Métricas do produto, clientes, planos e feedbacks recebidos." },
      { property: "og:title", content: "Administração — Criattor" },
      { property: "og:description", content: "Painel administrativo do Criattor." },
    ],
  }),
  component: Admin,
});

type Feedback = { id: string; user_id: string; mensagem: string; status: string; created_at: string };

function useAdminData(habilitado: boolean) {
  return useQuery({
    queryKey: ["admin-data"],
    enabled: habilitado,
    queryFn: async () => {
      const [perfis, posts, subs, feeds] = await Promise.all([
        supabase.from("profiles").select("*").order("created_at", { ascending: false }),
        supabase.from("posts_gerados").select("*").order("created_at", { ascending: false }),
        supabase.from("subscriptions").select("*"),
        supabase.from("feedback").select("*").order("created_at", { ascending: false }),
      ]);
      const erro = perfis.error ?? posts.error ?? subs.error ?? feeds.error;
      if (erro) throw erro;
      return {
        perfis: (perfis.data ?? []) as Profile[],
        posts: (posts.data ?? []) as Post[],
        subs: (subs.data ?? []) as Subscription[],
        feedbacks: (feeds.data ?? []) as Feedback[],
      };
    },
  });
}

function Metrica({ titulo, valor, icone: Icone }: { titulo: string; valor: string; icone: typeof Users }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{titulo}</p>
        <Icone className="size-4 text-accent" />
      </div>
      <p className="mt-3 text-3xl font-bold">{valor}</p>
    </div>
  );
}

function Admin() {
  const { data: isAdmin, isLoading: verificando } = useIsAdmin();
  const { data, isLoading } = useAdminData(!!isAdmin);
  const queryClient = useQueryClient();
  const [busca, setBusca] = useState("");

  const serie = useMemo(() => {
    const dias: { dia: string; posts: number }[] = [];
    for (let i = 13; i >= 0; i--) {
      const d = new Date();
      d.setHours(0, 0, 0, 0);
      d.setDate(d.getDate() - i);
      const chave = d.toISOString().slice(0, 10);
      dias.push({
        dia: d.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" }),
        posts: (data?.posts ?? []).filter((p) => p.created_at.slice(0, 10) === chave).length,
      });
    }
    return dias;
  }, [data]);

  const clientes = useMemo(() => {
    const termo = busca.trim().toLowerCase();
    return (data?.perfis ?? [])
      .map((p) => ({
        perfil: p,
        sub: data?.subs.find((s) => s.user_id === p.id) ?? null,
        posts: (data?.posts ?? []).filter((x) => x.user_id === p.id).length,
      }))
      .filter(
        ({ perfil }) =>
          !termo ||
          [perfil.nome, perfil.email, perfil.nome_negocio]
            .filter(Boolean)
            .some((v) => v!.toLowerCase().includes(termo)),
      );
  }, [data, busca]);

  async function atualizarPlano(userId: string, plano: string) {
    const { error } = await supabase
      .from("subscriptions")
      .update({
        plano_ativo: plano === "trial" ? null : plano,
        status: plano === "trial" ? "trial" : "ativo",
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", userId);
    if (error) {
      toast.error("Não conseguimos atualizar o plano.");
      return;
    }
    queryClient.invalidateQueries({ queryKey: ["admin-data"] });
    toast.success("Plano atualizado!");
  }

  async function atualizarFeedback(id: string, status: string) {
    const { error } = await supabase.from("feedback").update({ status }).eq("id", id);
    if (error) {
      toast.error("Não conseguimos atualizar o feedback.");
      return;
    }
    queryClient.invalidateQueries({ queryKey: ["admin-data"] });
  }

  if (verificando) return <Skeleton className="h-64 rounded-2xl" />;

  if (!isAdmin) {
    return (
      <EmptyState
        titulo="Acesso restrito"
        descricao="Esta área é exclusiva para administradores do Criattor."
      />
    );
  }

  const inicioMes = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString();
  const postsNoMes = (data?.posts ?? []).filter((p) => p.created_at >= inicioMes).length;
  const pagantes = (data?.subs ?? []).filter((s) => s.status !== "trial").length;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl">Administração</h1>
        <p className="mt-1 text-sm text-muted-foreground">Visão geral do produto e dos clientes.</p>
      </div>

      {isLoading ? (
        <Skeleton className="h-64 rounded-2xl" />
      ) : (
        <Tabs defaultValue="metricas">
          <TabsList>
            <TabsTrigger value="metricas">Métricas</TabsTrigger>
            <TabsTrigger value="clientes">Clientes</TabsTrigger>
            <TabsTrigger value="feedbacks">Feedbacks</TabsTrigger>
          </TabsList>

          <TabsContent value="metricas" className="space-y-6 pt-6">
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <Metrica titulo="Usuários" valor={String(data?.perfis.length ?? 0)} icone={Users} />
              <Metrica titulo="Posts gerados" valor={String(data?.posts.length ?? 0)} icone={Images} />
              <Metrica titulo="Posts neste mês" valor={String(postsNoMes)} icone={TrendingUp} />
              <Metrica titulo="Assinantes ativos" valor={String(pagantes)} icone={Users} />
            </div>
            <div className="rounded-2xl border border-border bg-card p-5">
              <h2 className="text-lg font-semibold">Posts por dia (14 dias)</h2>
              <div className="mt-4 h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={serie}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                    <XAxis dataKey="dia" stroke="var(--color-muted-foreground)" fontSize={11} />
                    <YAxis allowDecimals={false} stroke="var(--color-muted-foreground)" fontSize={11} />
                    <Tooltip
                      contentStyle={{
                        background: "var(--color-card)",
                        border: "1px solid var(--color-border)",
                        borderRadius: 12,
                      }}
                    />
                    <Bar dataKey="posts" fill="oklch(0.6668 0.2591 322.15)" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="clientes" className="space-y-4 pt-6">
            <div className="relative max-w-md">
              <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                placeholder="Buscar por nome, e-mail ou negócio"
                className="pl-9"
              />
            </div>
            <div className="overflow-x-auto rounded-2xl border border-border bg-card">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-border text-muted-foreground">
                  <tr>
                    <th className="p-3 font-medium">Cliente</th>
                    <th className="p-3 font-medium">Negócio</th>
                    <th className="p-3 font-medium">Posts</th>
                    <th className="p-3 font-medium">Plano</th>
                    <th className="p-3 font-medium">Alterar plano</th>
                  </tr>
                </thead>
                <tbody>
                  {clientes.map(({ perfil, sub, posts }) => (
                    <tr key={perfil.id} className="border-b border-border/60 last:border-0">
                      <td className="p-3">
                        <p className="font-medium">{perfil.nome || "—"}</p>
                        <p className="text-xs text-muted-foreground">{perfil.email}</p>
                      </td>
                      <td className="p-3 text-muted-foreground">{perfil.nome_negocio || "—"}</td>
                      <td className="p-3">{posts}</td>
                      <td className="p-3">
                        <Badge variant="secondary">
                          {sub?.status === "trial" ? "Teste grátis" : nomeDoPlano(sub?.plano_ativo, sub?.status ?? "trial")}
                        </Badge>
                      </td>
                      <td className="p-3">
                        <select
                          value={sub?.status === "trial" ? "trial" : (sub?.plano_ativo ?? "trial")}
                          onChange={(e) => atualizarPlano(perfil.id, e.target.value)}
                          className="h-9 rounded-xl border border-input bg-background px-2 text-sm"
                        >
                          <option value="trial">Teste grátis</option>
                          {PLANOS.filter((p) => p.id !== "trial").map((p) => (
                            <option key={p.id} value={p.id}>
                              {p.nome}
                            </option>
                          ))}
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {clientes.length === 0 && (
                <p className="p-6 text-center text-sm text-muted-foreground">Nenhum cliente encontrado.</p>
              )}
            </div>
          </TabsContent>

          <TabsContent value="feedbacks" className="space-y-3 pt-6">
            {(data?.feedbacks ?? []).length === 0 ? (
              <EmptyState
                icone={<MessageSquare className="size-8" />}
                titulo="Nenhum feedback ainda"
                descricao="As mensagens enviadas pelos clientes aparecerão aqui."
              />
            ) : (
              (data?.feedbacks ?? []).map((f) => {
                const autor = data?.perfis.find((p) => p.id === f.user_id);
                return (
                  <div key={f.id} className="rounded-2xl border border-border bg-card p-4">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="text-sm font-medium">{autor?.nome || autor?.email || "Cliente"}</p>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary">{f.status}</Badge>
                        <span className="text-xs text-muted-foreground">
                          {new Date(f.created_at).toLocaleDateString("pt-BR")}
                        </span>
                      </div>
                    </div>
                    <p className="mt-2 text-sm text-muted-foreground">{f.mensagem}</p>
                    <div className="mt-3 flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => atualizarFeedback(f.id, "em análise")}>
                        Em análise
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => atualizarFeedback(f.id, "resolvido")}>
                        Resolvido
                      </Button>
                    </div>
                  </div>
                );
              })
            )}
          </TabsContent>
        </Tabs>
      )}

      <AdminCheckouts />
    </div>
  );
}
