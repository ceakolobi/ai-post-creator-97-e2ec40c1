import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const postsExemplos = [
  {
    nicho: "Salão de Beleza",
    imagem: "https://images.unsplash.com/photo-1560066984-138dadb4c035?q=80&w=1000&auto=format&fit=crop",
    legenda: "Transformação incrível de hoje! ✨ O segredo de um cabelo saudável está no cuidado diário e no toque profissional.",
  },
  {
    nicho: "Advocacia",
    imagem: "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?q=80&w=1000&auto=format&fit=crop",
    legenda: "Conhecer seus direitos é o primeiro passo para a justiça. ⚖️ No post de hoje, explicamos como funciona o novo processo civil.",
  },
  {
    nicho: "Restaurante",
    imagem: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=1000&auto=format&fit=crop",
    legenda: "Sabor que abraça! 🍝 Já conhece nosso novo prato da estação? Ingredientes frescos e tempero caseiro.",
  },
  {
    nicho: "Academia",
    imagem: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=1000&auto=format&fit=crop",
    legenda: "Seu único limite é você mesma. 💪 Treino pesado hoje para colher os resultados amanhã. Vamos juntos?",
  },
  {
    nicho: "Imobiliária",
    imagem: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?q=80&w=1000&auto=format&fit=crop",
    legenda: "O lar dos seus sonhos está mais perto do que você imagina. 🏠 Agende uma visita e encante-se com cada detalhe.",
  },
  {
    nicho: "Pet Shop",
    imagem: "https://images.unsplash.com/photo-1516734212186-a967f81ad0d7?q=80&w=1000&auto=format&fit=crop",
    legenda: "Dia de banho e tosa por aqui! 🐶 Porque seu melhor amigo merece todo o carinho e cuidado do mundo.",
  }
];

export function PostCarousel() {
  const [index, setIndex] = useState(0);

  const prox = () => setIndex((i) => (i + 1) % postsExemplos.length);
  const ant = () => setIndex((i) => (i - 1 + postsExemplos.length) % postsExemplos.length);

  useEffect(() => {
    const timer = setInterval(prox, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="relative mx-auto max-w-6xl px-4 py-16">
      <div className="text-center">
        <h2 className="text-3xl font-bold">Posts criados com o Hagoth</h2>
        <p className="mt-2 text-muted-foreground">
          Gerados por clientes reais — sem designer, sem agência.
        </p>
      </div>

      <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {[0, 1, 2, 3].map((offset) => {
          const post = postsExemplos[(index + offset) % postsExemplos.length];
          return (
            <div
              key={post.nicho}
              className="group overflow-hidden rounded-2xl border border-border bg-card transition-all duration-300 hover:shadow-xl"
            >
              <div className="relative aspect-square overflow-hidden">
                <img
                  src={post.imagem}
                  alt={post.nicho}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                <span className="absolute top-3 left-3 rounded-full bg-background/80 px-3 py-1 text-[10px] font-bold tracking-wider backdrop-blur-sm">
                  {post.nicho.toUpperCase()}
                </span>
              </div>
              <div className="p-4">
                <p className="line-clamp-3 text-sm italic text-muted-foreground">
                  "{post.legenda}"
                </p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-8 flex justify-center gap-2">
        <Button variant="outline" size="icon" onClick={ant} className="rounded-full">
          <ChevronLeft className="size-4" />
        </Button>
        <Button variant="outline" size="icon" onClick={prox} className="rounded-full">
          <ChevronRight className="size-4" />
        </Button>
      </div>
    </div>
  );
}
