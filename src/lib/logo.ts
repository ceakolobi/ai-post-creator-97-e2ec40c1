import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useProfile } from "@/lib/data";

export type PosicaoLogo =
  | "superior-esquerda"
  | "superior-direita"
  | "centro"
  | "inferior-esquerda"
  | "inferior-direita";

export const POSICOES_LOGO: { id: PosicaoLogo; nome: string }[] = [
  { id: "superior-esquerda", nome: "Canto superior esquerdo" },
  { id: "superior-direita", nome: "Canto superior direito" },
  { id: "centro", nome: "Centro" },
  { id: "inferior-esquerda", nome: "Canto inferior esquerdo" },
  { id: "inferior-direita", nome: "Canto inferior direito" },
];

export type MarcaConfig = {
  url: string;
  posicao: PosicaoLogo;
  tamanho: number; // % da largura da imagem
  opacidade: number; // 0-100
};

/** Classes de posicionamento para o overlay na pré-visualização. */
export function classesPosicao(posicao: PosicaoLogo) {
  switch (posicao) {
    case "superior-esquerda":
      return "top-[4%] left-[4%]";
    case "superior-direita":
      return "top-[4%] right-[4%]";
    case "centro":
      return "top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2";
    case "inferior-esquerda":
      return "bottom-[4%] left-[4%]";
    default:
      return "bottom-[4%] right-[4%]";
  }
}

/** Retorna a logo salva no perfil com URL assinada, pronta para uso. */
export function useMarca(): MarcaConfig | null {
  const { data: perfil } = useProfile();
  const [url, setUrl] = useState<string | null>(null);
  const caminho = (perfil as unknown as { logo_url?: string | null } | null)?.logo_url ?? null;

  useEffect(() => {
    let ativo = true;
    if (!caminho) {
      setUrl(null);
      return;
    }
    supabase.storage
      .from("avatars")
      .createSignedUrl(caminho, 3600)
      .then(({ data }) => {
        if (ativo) setUrl(data?.signedUrl ?? null);
      });
    return () => {
      ativo = false;
    };
  }, [caminho]);

  if (!url) return null;
  const p = perfil as unknown as {
    logo_posicao?: PosicaoLogo | null;
    logo_tamanho?: number | null;
    logo_opacidade?: number | null;
  };
  return {
    url,
    posicao: p?.logo_posicao ?? "inferior-direita",
    tamanho: p?.logo_tamanho ?? 18,
    opacidade: p?.logo_opacidade ?? 90,
  };
}

function carregarImagem(src: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

/** Gera um blob PNG da imagem do post com a logo aplicada. */
export async function comporComLogo(imagemUrl: string, marca: MarcaConfig): Promise<Blob | null> {
  const [base, logo] = await Promise.all([carregarImagem(imagemUrl), carregarImagem(marca.url)]);
  const canvas = document.createElement("canvas");
  canvas.width = base.naturalWidth || 1024;
  canvas.height = base.naturalHeight || 1024;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;
  ctx.drawImage(base, 0, 0, canvas.width, canvas.height);

  const largura = (canvas.width * marca.tamanho) / 100;
  const escala = largura / (logo.naturalWidth || 1);
  const altura = (logo.naturalHeight || 1) * escala;
  const margem = canvas.width * 0.04;

  let x = canvas.width - largura - margem;
  let y = canvas.height - altura - margem;
  if (marca.posicao === "superior-esquerda") {
    x = margem;
    y = margem;
  } else if (marca.posicao === "superior-direita") {
    y = margem;
  } else if (marca.posicao === "inferior-esquerda") {
    x = margem;
  } else if (marca.posicao === "centro") {
    x = (canvas.width - largura) / 2;
    y = (canvas.height - altura) / 2;
  }

  ctx.globalAlpha = marca.opacidade / 100;
  ctx.drawImage(logo, x, y, largura, altura);
  ctx.globalAlpha = 1;

  return new Promise((resolve) => canvas.toBlob((b) => resolve(b), "image/png"));
}
