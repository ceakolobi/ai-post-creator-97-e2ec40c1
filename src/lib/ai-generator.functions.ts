import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const gerarPostInputSchema = z.object({
  nicho: z.string(),
  palavras_chave: z.string(),
  tom_de_voz: z.string(),
  cores_marca: z.string().optional(),
  formato: z.string(),
  user_id: z.string().optional(),
  titulo_personalizado: z.string().max(60).optional(),
  destaques: z.array(z.string().max(40)).max(3).optional(),
  cta: z.string().max(60).optional(),
  evento: z
    .object({
      tipo: z.string().max(40).optional(),
      nome: z.string().max(60).optional(),
      data: z.string().max(30).optional(),
      hora: z.string().max(20).optional(),
      local: z.string().max(80).optional(),
    })
    .optional(),
});

export const gerarPostComIA = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) => gerarPostInputSchema.parse(data))
  .handler(async ({ data, context }) => {
    const {
      nicho,
      palavras_chave,
      tom_de_voz,
      formato,
      cores_marca,
      titulo_personalizado,
      destaques,
      cta,
      evento,
    } = data;

    const listaDestaques = (destaques ?? []).map((d) => d.trim()).filter(Boolean);
    const temEvento = !!(evento && (evento.nome || evento.data || evento.hora || evento.local));
    const linhaEvento = temEvento
      ? [
          evento?.tipo ? `Tipo: ${evento.tipo}` : "",
          evento?.nome ? `Nome: ${evento.nome}` : "",
          evento?.data ? `Data: ${evento.data}` : "",
          evento?.hora ? `Horário: ${evento.hora}` : "",
          evento?.local ? `Local: ${evento.local}` : "",
        ]
          .filter(Boolean)
          .join(" | ")
      : "";

    const systemPrompt = `Você é um especialista em marketing para Instagram focado em alto engajamento.
Gere um post profissional para o nicho "${nicho}" com as palavras-chave "${palavras_chave}".
O tom de voz deve ser "${tom_de_voz}" e o formato é "${formato}".${
      cores_marca ? `\nCores da marca: ${cores_marca}.` : ""
    }${
      titulo_personalizado
        ? `\nTÍTULO OBRIGATÓRIO NA IMAGEM (use exatamente este texto): "${titulo_personalizado}"`
        : ""
    }${
      listaDestaques.length
        ? `\nDESTAQUES (marcadores curtos que devem aparecer na imagem, no máximo ${listaDestaques.length} linhas, texto exato):\n- ${listaDestaques.join("\n- ")}`
        : ""
    }${cta ? `\nCHAMADA PARA AÇÃO (rodapé discreto da imagem, texto exato): "${cta}"` : ""}${
      linhaEvento
        ? `\nEVENTO — estes dados DEVEM aparecer na imagem de forma legível e organizada (bloco de data/hora destacado): ${linhaEvento}`
        : ""
    }

REGRAS DE CONTEÚDO:
1. TÍTULO NA IMAGEM: curto e impactante (HEADLINE).
2. TEXTO CURTO: nada de poluição visual. No máximo título + ${listaDestaques.length || 0} marcadores${temEvento ? " + bloco de data/hora/local" : ""}${cta ? " + 1 linha de CTA" : ""}.
3. ESTÉTICA: imagem linda, hierarquia clara, muito espaço em branco, tipografia elegante e coerente com o nicho.
4. Todo texto na imagem em português do Brasil, sem erros de ortografia.

Responda APENAS em JSON válido no seguinte formato:
{
  "titulo_curto": "Título chamativo (Headline)",
  "legenda": "Legenda engajadora em português${temEvento ? ", citando data, horário e local do evento" : ""}",
  "hashtags": ["#tag1", "#tag2"],
  "prompt_imagem": "Prompt detalhado em inglês para gerar uma imagem profissional. IMPORTANTE: o prompt deve listar exatamente os textos que precisam aparecer na imagem (título${listaDestaques.length ? ", marcadores" : ""}${temEvento ? ", data/hora/local" : ""}${cta ? ", CTA" : ""}) e pedir tipografia legível, elegante e sem poluição visual, harmonizada com o nicho ${nicho}."
}`;


    const { gerarTextoIA, gerarImagemIA } = await import("@/lib/ai-gateway.server");

    let conteudo: {
      titulo_curto?: string;
      legenda?: string;
      hashtags?: string[];
      prompt_imagem?: string;
    } = {};

    try {
      const bruto = await gerarTextoIA(systemPrompt);
      const limpo = bruto.replace(/^```(?:json)?/i, "").replace(/```$/, "").trim();
      conteudo = JSON.parse(limpo);
    } catch (error) {
      console.error("Erro ao gerar texto com IA:", error);
      throw new Error(
        error instanceof Error && error.message.includes("402")
          ? "Créditos de IA esgotados. Adicione créditos no workspace para continuar."
          : "Não conseguimos gerar o texto do post agora. Tente novamente.",
      );
    }

    let imagem_url = "";
    try {
      const b64 = await gerarImagemIA(
        conteudo.prompt_imagem ||
          `Professional Instagram post image for ${nicho}, ${palavras_chave}, high quality, realistic`,
      );

      if (b64) {
        const bytes = Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));
        const path = `${context.userId}/${crypto.randomUUID()}.png`;
        const { error: upErr } = await context.supabase.storage
          .from("posts-instagram")
          .upload(path, bytes, { contentType: "image/png", upsert: true });
        if (upErr) throw upErr;
        const { data: signed } = await context.supabase.storage
          .from("posts-instagram")
          .createSignedUrl(path, 60 * 60 * 24 * 365 * 5);
        imagem_url = signed?.signedUrl ?? "";
      }
    } catch (error) {
      // Texto já foi gerado: seguimos sem imagem em vez de falhar o post inteiro.
      console.error("Erro ao gerar/salvar imagem:", error);
    }

    const hashtags = Array.isArray(conteudo.hashtags) ? conteudo.hashtags : [];

    return {
      sucesso: true,
      nicho,
      titulo_curto: titulo_personalizado || conteudo.titulo_curto || `${nicho}: Dica do dia`,
      legenda: conteudo.legenda || "",
      hashtags,
      imagem_url,
    };
  });
