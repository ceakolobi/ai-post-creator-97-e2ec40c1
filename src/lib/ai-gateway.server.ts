import { OpenAI } from "openai";

// O Lovable AI Gateway injeta as credenciais automaticamente no ambiente do Worker
export const ai_gateway = new OpenAI({
  apiKey: process.env.LOVABLE_API_KEY,
  baseURL: "https://api.lovable.dev/v1", // URL do Gateway AI do Lovable
});
