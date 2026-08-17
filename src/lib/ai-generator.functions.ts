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
    const { nicho, palavras_chave, tom_de_voz, formato } = data;

    const systemPrompt = `Você é um especialista em marketing para Instagram.
Gere um post profissional para o nicho "${nicho}" com as palavras-chave "${palavras_chave}".
O tom de voz deve ser "${tom_de_voz}" e o formato é "${formato}".
Responda APENAS em JSON no seguinte formato:
{
  "titulo_curto": "Título chamativo",
  "legenda": "Legenda completa do post",
  "hashtags": ["#tag1", "#tag2"],
  "prompt_imagem": "Prompt detalhado em inglês para gerar uma imagem fotorrealista e profissional para este post no DALL-E 3"
}`;

    try {
      // 1. Gerar Texto e Prompt de Imagem usando Lovable AI Gateway
      const { ai_gateway } = await import("@/lib/ai-gateway.server");
      const textoResponse = await ai_gateway.chat.completions.create({
        model: "gpt-4o",
        messages: [{ role: "system", content: systemPrompt }],
        response_format: { type: "json_object" },
      });

      const responseContent = textoResponse.choices[0].message.content || "{}";
      const conteudo = JSON.parse(responseContent);

      // 2. Gerar Imagem usando o prompt gerado
      const imagemResponse = await ai_gateway.images.generate({
        model: "dall-e-3",
        prompt: conteudo.prompt_imagem || `Professional Instagram post for ${nicho}, ${palavras_chave}, high quality, realistic`,
        n: 1,
        size: "1024x1024",
      });

      return {
        sucesso: true,
        nicho: data.nicho, // Garantindo que o nicho retorne para o frontend
        titulo_curto: conteudo.titulo_curto || `${nicho}: Dica do dia`,
        legenda: conteudo.legenda || "",
        hashtags: (conteudo.hashtags || []) as string[],
        imagem_url: imagemResponse.data[0].url || "",
      };
    } catch (error) {
      console.error("Erro na geração por IA:", error);
      throw new Error("Falha ao gerar conteúdo com a IA nativa.");
    }
  });
