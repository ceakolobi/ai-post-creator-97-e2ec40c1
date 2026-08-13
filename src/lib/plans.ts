export type Plano = {
  id: string;
  nome: string;
  limite: number; // -1 = ilimitado
  preco: string;
  publico: string;
  destaque?: boolean;
  beneficios: string[];
};

export const PLANOS: Plano[] = [
  {
    id: "trial",
    nome: "Teste grátis",
    limite: 10,
    preco: "R$ 0",
    publico: "Todos os novos cadastros",
    beneficios: ["10 posts em 7 dias", "Legenda + hashtags", "Imagem exclusiva por IA", "Histórico completo"],
  },
  {
    id: "essencial",
    nome: "Essencial",
    limite: 30,
    preco: "R$ 49/mês",
    publico: "Autônomos e pequenos negócios",
    beneficios: ["30 posts por mês", "Todos os tons de voz", "Favoritos e histórico", "Suporte por e-mail"],
  },
  {
    id: "profissional",
    nome: "Profissional",
    limite: 100,
    preco: "R$ 129/mês",
    publico: "Negócios com presença ativa",
    destaque: true,
    beneficios: ["100 posts por mês", "Cores da marca", "Prioridade na geração", "Suporte prioritário"],
  },
  {
    id: "agencia",
    nome: "Agência",
    limite: -1,
    preco: "Sob consulta",
    publico: "Agências e gestores de várias contas",
    beneficios: ["Posts ilimitados", "Múltiplos nichos", "Relatórios de uso", "Atendimento dedicado"],
  },
];

export function limiteDoPlano(planoAtivo: string | null | undefined, status: string) {
  if (planoAtivo) {
    const p = PLANOS.find((x) => x.id === planoAtivo);
    if (p) return p.limite;
  }
  if (status === "trial") return 10;
  return 0;
}

export function nomeDoPlano(planoAtivo: string | null | undefined, status: string) {
  if (planoAtivo) return PLANOS.find((x) => x.id === planoAtivo)?.nome ?? planoAtivo;
  if (status === "trial") return "Teste grátis";
  return "Sem plano ativo";
}
