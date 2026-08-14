import type { ReactNode } from "react";

export function EmptyState({
  titulo,
  descricao,
  acao,
  icone,
}: {
  titulo: string;
  descricao: string;
  acao?: ReactNode;
  icone?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-card/50 px-6 py-16 text-center">
      {icone && <div className="mb-4 text-muted-foreground">{icone}</div>}
      <h3 className="text-lg font-semibold">{titulo}</h3>
      <p className="mt-2 max-w-md text-sm text-muted-foreground">{descricao}</p>
      {acao && <div className="mt-6">{acao}</div>}
    </div>
  );
}
