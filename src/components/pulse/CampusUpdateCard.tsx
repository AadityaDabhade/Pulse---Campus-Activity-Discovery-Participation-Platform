import { cn } from "@/lib/utils";

type Props = {
  eyebrow: string;
  title: string;
  meta: string;
  emoji: string;
  className?: string;
};

export function CampusUpdateCard({ eyebrow, title, meta, emoji, className }: Props) {
  return (
    <button
      type="button"
      className={cn(
        "shrink-0 w-[320px] h-[116px] rounded-2xl bg-card border border-border/80 shadow-soft",
        "p-4 flex items-stretch gap-3 text-left transition-transform active:scale-[0.98]",
        className,
      )}
    >
      <div className="flex-1 min-w-0 flex flex-col justify-between">
        <div>
          <span className="text-[10.5px] font-semibold tracking-[0.18em] uppercase text-primary">
            {eyebrow}
          </span>
          <h3 className="mt-1 text-[14.5px] leading-snug font-semibold text-foreground line-clamp-2">
            {title}
          </h3>
        </div>
        <p className="text-[11.5px] text-muted-foreground">{meta}</p>
      </div>
      <div
        aria-hidden
        className="w-[30%] shrink-0 rounded-xl bg-accent/70 flex items-center justify-center text-3xl"
      >
        {emoji}
      </div>
    </button>
  );
}