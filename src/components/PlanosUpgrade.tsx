import { ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { PLANOS } from "@/lib/plans";
import { montarCheckoutUrl, usePlanCheckouts } from "@/lib/checkout";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";

const PAGOS = ["essencial", "profissional"];

/** Bloco compacto com os dois planos pagos lado a lado, para telas de upgrade. */
export function PlanosUpgrade({ className }: { className?: string }) {
  const { data: checkouts } = usePlanCheckouts();
  const { user } = useAuth();
  const navigate = useNavigate();

  function assinar(planoId: string, nome: string) {
    const link = checkouts?.find((c) => c.plano_id === planoId)?.checkout_url;
    if (!link) {
      toast.info("Checkout em configuração", {
        description: `O link de pagamento do plano ${nome} ainda está sendo publicado.`,
      });
      return;
    }
    const url = montarCheckoutUrl(link, {
      email: user?.email ?? null,
      userId: user?.id ?? null,
      planoId,
    });
    window.open(url, "_blank", "noopener,noreferrer");
    if (user) navigate({ to: "/aguardando-pagamento", search: { plano: nome } });
  }

  return (
    <div className={cn("grid gap-4 sm:grid-cols-2", className)}>
      {PLANOS.filter((p) => PAGOS.includes(p.id)).map((plano) => (
        <div
          key={plano.id}
          className={cn(
            "flex flex-col rounded-2xl border border-border bg-card p-5",
            plano.destaque && "glow border-transparent",
          )}
        >
          <h3 className="text-base font-semibold">{plano.nome}</h3>
          <p className="mt-2 text-2xl font-bold text-gradient">{plano.preco}</p>
          <p className="mt-1 text-sm text-muted-foreground">{plano.limite} posts por mês</p>
          <Button
            className="mt-4"
            variant={plano.destaque ? "hero" : "outline"}
            onClick={() => assinar(plano.id, plano.nome)}
          >
            Assinar agora <ExternalLink className="size-4" />
          </Button>
        </div>
      ))}
    </div>
  );
}
