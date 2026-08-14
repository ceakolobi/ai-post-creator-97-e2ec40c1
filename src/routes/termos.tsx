import { createFileRoute } from "@tanstack/react-router";
import { SiteHeader, SiteFooter } from "@/components/SiteHeader";

export const Route = createFileRoute("/termos")({
  head: () => ({
    meta: [
      { title: "Termos de Uso — Criattor" },
      { name: "description", content: "Condições de uso da plataforma Criattor de geração de posts com IA." },
      { property: "og:title", content: "Termos de Uso — Criattor" },
      { property: "og:description", content: "Condições de uso da plataforma Criattor." },
    ],
  }),
  component: Termos,
});

function Termos() {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="mx-auto max-w-3xl space-y-6 px-4 py-16">
        <h1 className="text-3xl">Termos de Uso</h1>
        <p className="text-sm text-muted-foreground">Última atualização: 2026</p>
        <section className="space-y-3 text-sm text-muted-foreground">
          <h2 className="text-lg font-semibold text-foreground">1. Sobre o serviço</h2>
          <p>
            O Criattor é uma ferramenta que gera sugestões de conteúdo (legendas, hashtags e imagens) para redes
            sociais com apoio de inteligência artificial. O conteúdo gerado é uma sugestão e deve ser revisado
            antes da publicação.
          </p>
          <h2 className="text-lg font-semibold text-foreground">2. Conta e uso</h2>
          <p>
            Você é responsável pelos dados informados no cadastro e pela guarda da sua senha. É proibido usar a
            plataforma para conteúdo ilegal, ofensivo ou que viole direitos de terceiros.
          </p>
          <h2 className="text-lg font-semibold text-foreground">3. Limites de uso</h2>
          <p>
            Cada plano possui um limite mensal de posts. O teste grátis oferece 10 posts durante 7 dias. Ao
            atingir o limite, novas gerações ficam bloqueadas até a renovação ou upgrade.
          </p>
          <h2 className="text-lg font-semibold text-foreground">4. Conteúdo gerado</h2>
          <p>
            Você pode usar comercialmente o conteúdo gerado na sua conta. O Criattor não garante exclusividade
            absoluta de resultados gerados por IA.
          </p>
          <h2 className="text-lg font-semibold text-foreground">5. Cancelamento</h2>
          <p>Você pode encerrar sua conta a qualquer momento entrando em contato pelo canal de suporte.</p>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
