function anthropicKey() {
  const key = process.env["ANTHROPIC_API_KEY"];
  if (!key) throw new Error("ANTHROPIC_API_KEY ausente no servidor.");
  return key;
}

function openaiKey() {
  const key = process.env["OPENAI_API_KEY"];
  if (!key) throw new Error("OPENAI_API_KEY ausente no servidor.");
  return key;
}

export async function gerarTextoIA(systemPrompt: string): Promise<string> {
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "x-api-key": anthropicKey(),
      "anthropic-version": "2023-06-01",
      "content-type": "application/json",
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-6",
      max_tokens: 2000,
      messages: [{ role: "user", content: systemPrompt }],
    }),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`Anthropic texto ${res.status}: ${body.slice(0, 500)}`);
  }

  const json = (await res.json()) as {
    content?: Array<{ type?: string; text?: string }>;
  };
  const textBlock = json.content?.find((b) => b.type === "text");
  return textBlock?.text ?? "{}";
}

/** Retorna a imagem em base64 (sem prefixo data:). */
export async function gerarImagemIA(prompt: string): Promise<string | null> {
  const res = await fetch("https://api.openai.com/v1/images/generations", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${openaiKey()}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "dall-e-3",
      prompt,
      quality: "standard",
      size: "1024x1024",
      response_format: "b64_json",
      n: 1,
    }),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`OpenAI imagem ${res.status}: ${body.slice(0, 500)}`);
  }

  const json = (await res.json()) as {
    data?: Array<{ b64_json?: string }>;
  };
  return json.data?.[0]?.b64_json ?? null;
}
