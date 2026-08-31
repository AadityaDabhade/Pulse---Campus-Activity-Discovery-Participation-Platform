import { Link } from "@tanstack/react-router";
import { cn } from "@/lib/utils";

type Props = {
  slug: string;
  name: string;
  emoji: string;
  className?: string;
};

export function ActivityTypeCard({ slug, name, emoji, className }: Props) {
  return (
    <Link
      to="/activity/$type"
      params={{ type: slug }}
      className={cn(
        "group shrink-0 w-[128px] flex flex-col items-center gap-3",
        "transition-transform active:scale-[0.96]",
        className,
      )}
    >
      <div
        className={cn(
          "h-[128px] w-[128px] rounded-2xl bg-card border border-border/80",
          "flex items-center justify-center text-4xl shadow-soft",
          "transition-all duration-200",
          "group-hover:border-primary group-hover:shadow-green group-hover:-translate-y-0.5",
          "group-active:border-primary group-active:scale-[0.97]",
          "group-focus-visible:border-primary group-focus-visible:shadow-green",
        )}
        aria-hidden
      >
        {emoji}
      </div>
      <span className="text-[14px] font-medium text-foreground text-center leading-tight">
        {name}
      </span>
    </Link>
  );
}
