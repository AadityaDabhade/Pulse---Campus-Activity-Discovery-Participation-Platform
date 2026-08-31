import { cn } from "@/lib/utils";
import { forwardRef, type ButtonHTMLAttributes } from "react";

type Variant = "primary" | "ghost" | "outline";

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  full?: boolean;
}

export const PulseButton = forwardRef<HTMLButtonElement, Props>(
  ({ className, variant = "primary", full = true, ...props }, ref) => {
    const base =
      "inline-flex items-center justify-center rounded-2xl h-14 px-6 text-[15px] font-medium " +
      "transition-all duration-200 active:scale-[0.98] disabled:opacity-40 disabled:pointer-events-none " +
      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40 focus-visible:ring-offset-2 focus-visible:ring-offset-background";
    const variants: Record<Variant, string> = {
      primary:
        "bg-primary text-primary-foreground shadow-green hover:brightness-[1.05]",
      ghost: "bg-transparent text-foreground hover:bg-secondary",
      outline:
        "bg-background text-foreground border border-border hover:border-foreground/20",
    };
    return (
      <button
        ref={ref}
        className={cn(base, variants[variant], full && "w-full", className)}
        {...props}
      />
    );
  },
);
PulseButton.displayName = "PulseButton";