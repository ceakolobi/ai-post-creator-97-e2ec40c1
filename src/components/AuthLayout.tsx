import type { ReactNode } from "react";
import { Check } from "lucide-react";
import { Logo } from "@/components/Logo";
import { ThemeToggle } from "@/components/ThemeToggle";

const inclusos = [
  "Legenda pronta no tom da sua marca",
  "Hashtags relevantes para o seu nicho",
  "Imagem quadrada exclusiva criada por IA",
  "Histórico com busca, filtros e favoritos",
];

export function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-background lg:grid lg:grid-cols-2">
      <aside className="relative overflow-hidden border-b border-border bg-card/60 px-6 py-10 lg:border-b-0 lg:border-r lg:px-12 lg:py-16">
        <div
          className="pointer-events-none absolute -top-32 -left-20 size-96 rounded-full opacity-25 blur-3xl"
          style={{ backgroundImage: "var(--gradient-brand)" }}
          aria-hidden="true"
        />
        <div className="relative">
          <Logo />
          <h2 className="mt-8 text-2xl lg:text-3xl">
            Posts de Instagram prontos, <span className="text-gradient">sem travar na criação</span>
          </h2>
          <p className="mt-3 max-w-md text-sm text-muted-foreground">
            O Criattor transforma a descrição do seu negócio em conteúdo publicável: texto, hashtags e arte.
          </p>
          <ul className="mt-6 space-y-2">
            {inclusos.map((i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                <Check className="mt-0.5 size-4 text-accent" />
                {i}
              </li>
            ))}
          </ul>
          <div className="mt-8 inline-flex rounded-2xl border border-border bg-card px-4 py-3 text-sm glow">
            <strong className="text-gradient">7 dias grátis</strong>
            <span className="ml-2 text-muted-foreground">com 10 posts inclusos — sem cartão de crédito.</span>
          </div>
        </div>
      </aside>

      <main className="flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <div className="mb-4 flex justify-end">
            <ThemeToggle />
          </div>
          {children}
        </div>
      </main>
    </div>
  );
}
