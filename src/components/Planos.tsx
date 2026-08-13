import { Check } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PLANOS } from "@/lib/plans";
import { cn } from "@/lib/utils";

export function Planos({ compact = false }: { compact?: boolean }) {
  return (
    <div className={cn("grid gap-6", compact ? "sm:grid-cols-2 xl:grid-cols-4" : "md:grid-cols-2 xl:grid-cols-4")}>
      {PLANOS.map((plano) => (
        <div
          key={plano.id}
          className={cn(
            "relative flex flex-col rounded-2xl border border-border bg-card p-6 transition-transform duration-200 hover:-translate-y-1",
            plano.destaque && "glow border-transparent",
          )}
        >
          {plano.destaque && (
            <Badge className="absolute -top-3 left-6 bg-gradient-brand text-primary-foreground">
              Mais escolhido
            </Badge>
          )}
          <h3 className="text-lg font-semibold">{plano.nome}</h3>
          <p className="mt-1 text-sm text-muted-foreground">{plano.publico}</p>
          <p className="mt-4 text-3xl font-bold text-gradient">{plano.preco}</p>
          <p className="mt-1 text-sm text-muted-foreground">
            {plano.limite === -1 ? "Posts ilimitados" : `${plano.limite} posts / mês`}
          </p>
          <ul className="mt-5 flex-1 space-y-2 text-sm">
            {plano.beneficios.map((b) => (
              <li key={b} className="flex items-start gap-2">
                <Check className="mt-0.5 size-4 text-accent" />
                <span className="text-muted-foreground">{b}</span>
              </li>
            ))}
          </ul>
          <Button
            className="mt-6"
            variant={plano.destaque ? "hero" : "outline"}
            onClick={() =>
              toast.success("Interesse registrado!", {
                description: `Avisaremos assim que o plano ${plano.nome} estiver disponível para contratação.`,
              })
            }
          >
            {plano.id === "trial" ? "Incluso no cadastro" : "Tenho interesse"}
          </Button>
        </div>
      ))}
    </div>
  );
}
