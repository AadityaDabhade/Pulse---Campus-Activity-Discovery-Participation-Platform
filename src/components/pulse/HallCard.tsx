import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

interface Props {
  name: string;
  gradient: string;
  selected?: boolean;
  onClick?: () => void;
}

export function HallCard({ name, gradient, selected, onClick }: Props) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group shrink-0 w-40 text-left transition-all duration-300 active:scale-[0.97]"
    >
      <div
        className={cn(
          "relative h-48 w-40 rounded-3xl overflow-hidden transition-all duration-300",
          "ring-1 ring-border shadow-soft",
          selected && "ring-2 ring-primary shadow-green -translate-y-1",
        )}
      >
        <div className="absolute inset-0" style={{ background: gradient }} aria-hidden />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
        {selected && (
          <div className="absolute top-3 right-3 h-7 w-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center animate-pop">
            <Check className="h-4 w-4" strokeWidth={3} />
          </div>
        )}
      </div>
      <div className="mt-3 px-1">
        <p
          className={cn(
            "text-[14px] font-medium transition-colors",
            selected ? "text-primary" : "text-foreground",
          )}
        >
          {name}
        </p>
      </div>
    </button>
  );
}