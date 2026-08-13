export type GerarPostInput = {
  nicho: string;
  palavras_chave: string;
  tom_de_voz: string;
  cores_marca: string;
  formato: string;
  user_id: string;
};

export type GerarPostResposta = {
  sucesso: boolean;
  titulo_curto?: string;
  legenda?: string;
  hashtags?: string[] | string;
  imagem_url?: string;
  nicho?: string;
  erro?: string;
};

export class ErroDeGeracao extends Error {}

const WEBHOOK_URL = import.meta.env["VITE_N8N_WEBHOOK_URL"] as string | undefined;

export function webhookConfigurado() {
  return Boolean(WEBHOOK_URL && WEBHOOK_URL.trim());
}

export async function gerarPost(input: GerarPostInput): Promise<GerarPostResposta> {
  if (!webhookConfigurado()) {
    throw new ErroDeGeracao(
      "O motor de geração ainda não foi configurado. Cadastre a URL do webhook em VITE_N8N_WEBHOOK_URL.",
    );
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 120_000);

  let resposta: Response;
  try {
    resposta = await fetch(WEBHOOK_URL!, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
      signal: controller.signal,
    });
  } catch (e) {
    clearTimeout(timeout);
    if (e instanceof DOMException && e.name === "AbortError") {
      throw new ErroDeGeracao("A geração demorou mais que o esperado. Tente novamente em alguns instantes.");
    }
    throw new ErroDeGeracao("Não conseguimos falar com o gerador agora. Verifique sua conexão e tente de novo.");
  }
  clearTimeout(timeout);

  if (!resposta.ok) {
    throw new ErroDeGeracao("O gerador está indisponível no momento. Tente novamente em alguns minutos.");
  }

  let dados: GerarPostResposta;
  try {
    const bruto = (await resposta.json()) as GerarPostResposta | GerarPostResposta[];
    dados = Array.isArray(bruto) ? bruto[0]! : bruto;
  } catch {
    throw new ErroDeGeracao("Recebemos uma resposta inesperada do gerador. Tente novamente.");
  }

  if (!dados || dados.sucesso === false) {
    throw new ErroDeGeracao(dados?.erro || "Não foi possível criar o post desta vez. Tente novamente.");
  }
  if (!dados.legenda) {
    throw new ErroDeGeracao("A resposta veio sem legenda. Tente gerar novamente.");
  }
  return dados;
}

export function normalizarHashtags(h: string[] | string | undefined | null): string {
  if (!h) return "";
  if (Array.isArray(h)) return h.join(" ");
  return h;
}
