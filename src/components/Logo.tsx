import { Sparkles } from "lucide-react";
import { Link } from "@tanstack/react-router";

export function Logo({ to = "/" }: { to?: string }) {
  return (
    <Link to={to} className="flex items-center gap-2 font-bold tracking-tight">
      <span className="flex size-8 items-center justify-center rounded-xl bg-gradient-brand glow">
        <Sparkles className="size-4 text-primary-foreground" />
      </span>
      <span className="text-lg">
        Hag<span className="text-gradient">oth</span>
      </span>
    </Link>
  );
}
