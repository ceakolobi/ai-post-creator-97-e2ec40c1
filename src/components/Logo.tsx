import { Link } from "@tanstack/react-router";
import marcaHagoth from "@/assets/hagoth-mark.png.asset.json";

export function Logo({ to = "/" }: { to?: string }) {
  return (
    <Link to={to} className="flex items-center gap-2 font-bold tracking-tight">
      <img
        src={marcaHagoth.url}
        alt="Hagoth"
        width={32}
        height={32}
        className="size-8 rounded-xl glow"
      />
      <span className="text-lg">
        Hag<span className="text-gradient">oth</span>
      </span>
    </Link>
  );
}
