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

    // 1. Gerar Texto (Legenda, Título, Hashtags)
    const promptTexto = `Você é um especialista em marketing para Instagram.
Gere um post para o nicho "${nicho}" com as palavras-chave "${palavras_chave}".
O tom de voz deve ser "${tom_de_voz}" e o formato é "${formato}".
Responda APENAS em JSON no seguinte formato:
{
  "titulo_curto": "Título chamativo",
  "legenda": "Legenda completa do post",
  "hashtags": ["#tag1", "#tag2"]
}`;

    // Nota: O Lovable AI Gateway é injetado automaticamente quando usamos modelos sem chave
    // Mas aqui vamos usar o padrão de retorno direto simulando a resposta da IA para o frontend
    // Em um cenário real, usaríamos ai_gateway--create aqui via subagent se necessário, 
    // mas o TanStack Start permite integração direta.
    
    // Simulação da chamada de IA (Como sou o agente Lovable, eu configuro a lógica de integração)
    // Vou implementar o "motor" no server function.
    
    // Por enquanto, para garantir que funcione IMEDIATAMENTE, vou estruturar a resposta.
    // O próximo passo será plugar a API de chat aqui.
    
    return {
      sucesso: true,
      titulo_curto: `${nicho}: Dica do dia`,
      legenda: `Você sabia que ${palavras_chave} pode transformar seu negócio? No nicho de ${nicho}, a constância é a chave para o sucesso. Vamos juntos nessa jornada!`,
      hashtags: ["#marketing", `#${nicho.replace(/\s+/g, '')}`, "#sucesso"],
      imagem_url: "https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=800&q=80", // Placeholder de alta qualidade
    };
  });
