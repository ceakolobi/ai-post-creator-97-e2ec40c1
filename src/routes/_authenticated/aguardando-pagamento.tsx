import { createFileRoute, Link, useSearch } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { CheckCircle2, Clock, RefreshCw } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { useSubscription } from "@/lib/data";
import { nomeDoPlano } from "@/lib/plans";

export const Route = createFileRoute("/_authenticated/aguardando-pagamento")({
  validateSearch: (search: Record<string, unknown>) => ({
    plano: typeof search['plano'] === "string" ? (search['plano'] as string) : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Confirmando pagamento — Hagoth" },
      { name: "description", content: "Estamos confirmando seu pagamento para liberar o plano." },
      { property: "og:title", content: "Confirmando pagamento — Hagoth" },
      { property: "og:description", content: "Assim que a Kiwify confirmar, seu plano é liberado." },
    ],
  }),
  component: Aguardando,
});

function Aguardando() {
  const { plano } = useSearch({ from: "/_authenticated/aguardando-pagamento" });
  const { user } = useAuth();
  const { data: sub, refetch } = useSubscription();

  const { data: pagamentos } = useQuery({
    queryKey: ["pagamentos", user?.id],
    enabled: !!user,
    refetchInterval: 10000,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("pagamentos")
        .select("id, status, plano_id, created_at")
        .order("created_at", { ascending: false })
        .limit(5);
      if (error) throw error;
      return data ?? [];
    },
  });

  const ativo = sub?.status === "ativo" && !!sub.plano_ativo;

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="rounded-2xl border border-border bg-card p-8 text-center">
        {ativo ? (
          <>
            <CheckCircle2 className="mx-auto size-12 text-accent" />
            <h1 className="mt-4 text-2xl">Plano ativado!</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Seu plano <strong>{nomeDoPlano(sub?.plano_ativo, sub?.status ?? "")}</strong> já está
              liberado. Bom trabalho!
            </p>
            <Button asChild variant="hero" className="mt-6">
              <Link to="/criar">Criar meu primeiro post do plano</Link>
            </Button>
          </>
        ) : (
          <>
            <Clock className="mx-auto size-12 animate-pulse text-accent" />
            <h1 className="mt-4 text-2xl">Estamos confirmando seu pagamento</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              {plano ? `Plano ${plano}. ` : ""}Assim que a Kiwify confirmar, seu acesso é liberado
              automaticamente — normalmente em poucos segundos. Esta página atualiza sozinha.
            </p>
            <Button variant="outline" className="mt-6" onClick={() => refetch()}>
              <RefreshCw className="size-4" /> Verificar agora
            </Button>
          </>
        )}
      </div>

      {!!pagamentos?.length && (
        <div className="rounded-2xl border border-border bg-card p-6">
          <h2 className="text-sm font-semibold">Últimos pagamentos registrados</h2>
          <ul className="mt-3 space-y-2 text-sm">
            {pagamentos.map((p) => (
              <li key={p.id} className="flex items-center justify-between rounded-xl bg-secondary p-3">
                <span className="text-muted-foreground">
                  {new Date(p.created_at).toLocaleString("pt-BR")} · {p.plano_id ?? "plano não identificado"}
                </span>
                <Badge variant="secondary">{p.status}</Badge>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
