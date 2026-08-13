import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { limiteDoPlano } from "./plans";

export type Post = {
  id: string;
  user_id: string;
  nicho: string;
  palavras_chave: string | null;
  titulo_curto: string | null;
  legenda: string;
  hashtags: string | null;
  prompt_imagem: string | null;
  imagem_url: string | null;
  formato: string;
  tom_de_voz: string | null;
  favorito: boolean;
  created_at: string;
};

export type Profile = {
  id: string;
  nome: string | null;
  email: string | null;
  telefone: string | null;
  nome_negocio: string | null;
  avatar_url: string | null;
  created_at: string;
};

export type Subscription = {
  user_id: string;
  status: string;
  trial_started_at: string;
  trial_days: number;
  plano_ativo: string | null;
  updated_at: string;
};

export function inicioDoMes() {
  const d = new Date();
  return new Date(d.getFullYear(), d.getMonth(), 1).toISOString();
}

export function diasRestantesTrial(sub: Subscription | null | undefined) {
  if (!sub || sub.status !== "trial") return 0;
  const fim = new Date(sub.trial_started_at).getTime() + sub.trial_days * 86400000;
  return Math.max(0, Math.ceil((fim - Date.now()) / 86400000));
}

export function useProfile() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["profile", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase.from("profiles").select("*").eq("id", user!.id).maybeSingle();
      if (error) throw error;
      return data as Profile | null;
    },
  });
}

export function useIsAdmin() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["is-admin", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user!.id)
        .eq("role", "admin")
        .maybeSingle();
      if (error) throw error;
      return !!data;
    },
  });
}

export function useSubscription() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["subscription", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("subscriptions")
        .select("*")
        .eq("user_id", user!.id)
        .maybeSingle();
      if (error) throw error;
      return data as Subscription | null;
    },
  });
}

export function usePosts() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["posts", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("posts_gerados")
        .select("*")
        .eq("user_id", user!.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as Post[];
    },
  });
}

export type StatusDeUso = {
  usadosNoMes: number;
  limite: number;
  ilimitado: boolean;
  restantes: number;
  trialDias: number;
  trialExpirado: boolean;
  bloqueado: boolean;
  motivo: "trial_expirado" | "limite" | null;
};

export function calcularUso(posts: Post[] | undefined, sub: Subscription | null | undefined): StatusDeUso {
  const inicio = inicioDoMes();
  const usadosNoMes = (posts ?? []).filter((p) => p.created_at >= inicio).length;
  const status = sub?.status ?? "trial";
  const limite = limiteDoPlano(sub?.plano_ativo, status);
  const ilimitado = limite === -1;
  const trialDias = diasRestantesTrial(sub);
  const trialExpirado = status === "trial" && trialDias <= 0;
  const restantes = ilimitado ? Infinity : Math.max(0, limite - usadosNoMes);
  const bloqueado = trialExpirado || (!ilimitado && restantes <= 0);
  return {
    usadosNoMes,
    limite,
    ilimitado,
    restantes,
    trialDias,
    trialExpirado,
    bloqueado,
    motivo: trialExpirado ? "trial_expirado" : !ilimitado && restantes <= 0 ? "limite" : null,
  };
}

export function useFeedbacks() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["feedback", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("feedback")
        .select("*")
        .eq("user_id", user!.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as { id: string; mensagem: string; status: string; created_at: string }[];
    },
  });
}
