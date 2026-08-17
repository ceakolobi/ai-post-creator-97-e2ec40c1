import { createFileRoute } from "@tanstack/react-router";
import { SiteHeader, SiteFooter } from "@/components/SiteHeader";

export const Route = createFileRoute("/privacidade")({
  head: () => ({
    meta: [
      { title: "Política de Privacidade — Hagoth" },
      {
        name: "description",
        content: "Como o Hagoth coleta, usa e protege os seus dados pessoais.",
      },
      { property: "og:title", content: "Política de Privacidade — Hagoth" },
      { property: "og:description", content: "Como o Hagoth coleta, usa e protege os seus dados." },
    ],
  }),
  component: Privacidade,
});

function Privacidade() {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="mx-auto max-w-3xl space-y-6 px-4 py-16">
        <h1 className="text-3xl">Política de Privacidade</h1>
        <p className="text-sm text-muted-foreground">Última atualização: 2026</p>
        <section className="space-y-3 text-sm text-muted-foreground">
          <h2 className="text-lg font-semibold text-foreground">Dados que coletamos</h2>
          <p>
            Nome, e-mail, telefone, nome do negócio (opcional) e foto de perfil (opcional), além dos posts que
            você gera na plataforma.
          </p>
          <h2 className="text-lg font-semibold text-foreground">Como usamos</h2>
          <p>
            Usamos seus dados para autenticar o acesso, gerar o conteúdo solicitado, manter seu histórico e
            controlar os limites do plano contratado.
          </p>
          <h2 className="text-lg font-semibold text-foreground">Compartilhamento</h2>
          <p>
            As informações do formulário de geração são enviadas ao serviço de inteligência artificial
            responsável por criar o conteúdo. Não vendemos seus dados a terceiros.
          </p>
          <h2 className="text-lg font-semibold text-foreground">Segurança</h2>
          <p>
            Os dados ficam protegidos por regras de acesso por usuário: apenas você (e a administração da
            plataforma, quando necessário para suporte) pode acessar os seus registros.
          </p>
          <h2 className="text-lg font-semibold text-foreground">Seus direitos</h2>
          <p>
            Você pode solicitar a correção ou exclusão dos seus dados a qualquer momento pelo canal de
            sugestões dentro da sua conta.
          </p>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
