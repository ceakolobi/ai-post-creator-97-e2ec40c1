import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Link2, Save } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { usePlanCheckouts } from "@/lib/checkout";
import { PLANOS } from "@/lib/plans";

type Linha = { checkout_url: string; produto_id: string };

export function AdminCheckouts() {
  const { data: checkouts } = usePlanCheckouts();
  const queryClient = useQueryClient();
  const [linhas, setLinhas] = useState<Record<string, Linha>>({});
  const [salvando, setSalvando] = useState<string | null>(null);

  useEffect(() => {
    const inicial: Record<string, Linha> = {};
    for (const p of PLANOS) {
      const atual = checkouts?.find((c) => c.plano_id === p.id);
      inicial[p.id] = {
        checkout_url: atual?.checkout_url ?? "",
        produto_id: atual?.produto_id ?? "",
      };
    }
    setLinhas(inicial);
  }, [checkouts]);

  async function salvar(planoId: string) {
    const linha = linhas[planoId];
    if (!linha?.checkout_url.trim()) {
      toast.error("Informe o link de checkout da Kiwify.");
      return;
    }
    setSalvando(planoId);
    const { error } = await supabase.from("plan_checkouts").upsert({
      plano_id: planoId,
      checkout_url: linha.checkout_url.trim(),
      produto_id: linha.produto_id.trim() || null,
      updated_at: new Date().toISOString(),
    });
    setSalvando(null);
    if (error) {
      toast.error("Não conseguimos salvar o link.");
      return;
    }
    queryClient.invalidateQueries({ queryKey: ["plan-checkouts"] });
    toast.success("Link salvo!");
  }

  return (
    <section className="mt-10 rounded-2xl border border-border bg-card p-6">
      <h2 className="flex items-center gap-2 text-lg font-semibold">
        <Link2 className="size-4 text-accent" /> Checkouts da Kiwify
      </h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Cole o link de checkout de cada plano e o ID do produto na Kiwify (usado pelo webhook para
        ativar o plano automaticamente).
      </p>
      <div className="mt-6 space-y-6">
        {PLANOS.filter((p) => p.id !== "trial").map((p) => (
          <div key={p.id} className="grid gap-3 md:grid-cols-[1fr_240px_auto] md:items-end">
            <div className="space-y-2">
              <Label htmlFor={`url-${p.id}`}>{p.nome} — link de checkout</Label>
              <Input
                id={`url-${p.id}`}
                placeholder="https://pay.kiwify.com.br/xxxxxxx"
                value={linhas[p.id]?.checkout_url ?? ""}
                onChange={(e) =>
                  setLinhas((s) => ({
                    ...s,
                    [p.id]: { ...(s[p.id] ?? { checkout_url: "", produto_id: "" }), checkout_url: e.target.value },
                  }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor={`prod-${p.id}`}>ID do produto</Label>
              <Input
                id={`prod-${p.id}`}
                placeholder="product_id da Kiwify"
                value={linhas[p.id]?.produto_id ?? ""}
                onChange={(e) =>
                  setLinhas((s) => ({
                    ...s,
                    [p.id]: { ...(s[p.id] ?? { checkout_url: "", produto_id: "" }), produto_id: e.target.value },
                  }))
                }
              />
            </div>
            <Button variant="outline" onClick={() => salvar(p.id)} disabled={salvando === p.id}>
              <Save className="size-4" /> Salvar
            </Button>
          </div>
        ))}
      </div>
    </section>
  );
}
