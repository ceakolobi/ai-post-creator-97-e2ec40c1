import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type PlanCheckout = {
  plano_id: string;
  checkout_url: string;
  produto_id: string | null;
  updated_at: string;
};

export function usePlanCheckouts() {
  return useQuery({
    queryKey: ["plan-checkouts"],
    queryFn: async () => {
      const { data, error } = await supabase.from("plan_checkouts").select("*");
      if (error) throw error;
      return (data ?? []) as PlanCheckout[];
    },
  });
}

/** Acrescenta o e-mail (e o id do usuário) ao link da Kiwify para casar o pagamento com a conta. */
export function montarCheckoutUrl(
  url: string,
  opcoes: { email?: string | null; userId?: string | null; planoId?: string },
) {
  try {
    const u = new URL(url);
    if (opcoes.email) u.searchParams.set("email", opcoes.email);
    if (opcoes.userId) u.searchParams.set("external_reference", opcoes.userId);
    if (opcoes.planoId) u.searchParams.set("utm_content", opcoes.planoId);
    return u.toString();
  } catch {
    return url;
  }
}
