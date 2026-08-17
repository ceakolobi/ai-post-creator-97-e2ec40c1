import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import type { Post } from "@/lib/data";

export const REDES = [
  { id: "instagram", nome: "Instagram" },
  { id: "facebook", nome: "Facebook" },
  { id: "tiktok", nome: "TikTok" },
  { id: "linkedin", nome: "LinkedIn" },
] as const;

export type Agendamento = {
  id: string;
  user_id: string;
  post_id: string;
  rede: string;
  agendado_para: string;
  observacao: string | null;
  concluido: boolean;
  created_at: string;
  posts_gerados?: Post | null;
};

export function nomeRede(id: string) {
  return REDES.find((r) => r.id === id)?.nome ?? id;
}

export function useAgendamentos() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["agendamentos", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("agendamentos")
        .select("*, posts_gerados(*)")
        .eq("user_id", user!.id)
        .order("agendado_para", { ascending: true });
      if (error) throw error;
      return (data ?? []) as unknown as Agendamento[];
    },
  });
}

export function formatarQuando(iso: string) {
  return new Date(iso).toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/** Valor inicial para o input datetime-local: amanhã às 09:00. */
export function proximoHorarioPadrao() {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  d.setHours(9, 0, 0, 0);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}
