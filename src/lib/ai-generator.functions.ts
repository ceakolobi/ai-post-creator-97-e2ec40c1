import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const gerarPostInputSchema = z.object({
  nicho: z.string(),
  palavras_chave: z.string(),
  tom_de_voz: z.string(),
  cores_marca: z.string().optional(),
  formato: z.string(),
  user_id: z.string(),
});

export const gerarPostComIA = createServerFn({ method: "POST" })
  .inputValidator((data) => gerarPostInputSchema.parse(data))
  .handler(async ({ data }) => {
    const { nicho, palavras_chave, tom_de_voz, formato, cores_marca, user_id } = data;

    const systemPrompt = `Você é um especialista em marketing para Instagram focado em alto engajamento.
Gere um post profissional para o nicho "${nicho}" com as palavras-chave "${palavras_chave}".
O tom de voz deve ser "${tom_de_voz}" e o formato é "${formato}".${
      cores_marca ? `\nCores da marca: ${cores_marca}.` : ""
    }

REGRAS DE CONTEÚDO:
1. TÍTULO NA IMAGEM: Crie um título curto e impactante (HEADLINE) para ser usado na imagem.
2. TEXTO CURTO: Evite exageros. Use o básico que converte e gera engajamento.
3. ESTÉTICA: A imagem deve ser linda e combinar perfeitamente com o nicho escolhido.

Responda APENAS em JSON válido no seguinte formato:
{
  "titulo_curto": "Título chamativo (Headline)",
  "legenda": "Legenda engajadora em português",
  "hashtags": ["#tag1", "#tag2"],
  "prompt_imagem": "Prompt detalhado em inglês para gerar uma imagem profissional. IMPORTANTE: O prompt deve incluir instruções para a IA escrever o texto do 'titulo_curto' de forma legível e elegante na imagem, garantindo harmonia com o nicho ${nicho}."
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
        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        const bytes = Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));
        const path = `${user_id}/${crypto.randomUUID()}.png`;
        const { error: upErr } = await supabaseAdmin.storage
          .from("posts-instagram")
          .upload(path, bytes, { contentType: "image/png", upsert: true });
        if (upErr) throw upErr;
        const { data: signed } = await supabaseAdmin.storage
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
      titulo_curto: conteudo.titulo_curto || `${nicho}: Dica do dia`,
      legenda: conteudo.legenda || "",
      hashtags,
      imagem_url,
    };
  });
