import { cn } from "@/lib/utils";
import { forwardRef, type InputHTMLAttributes, type ReactNode } from "react";

interface Props extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  hint?: string;
  leading?: ReactNode;
  trailing?: ReactNode;
}

export const PulseInput = forwardRef<HTMLInputElement, Props>(
  ({ className, label, hint, leading, trailing, id, ...props }, ref) => {
    const inputId = id ?? props.name;
    return (
      <div className="flex flex-col gap-2">
        {label && (
          <label
            htmlFor={inputId}
            className="text-[13px] font-medium text-muted-foreground pl-1"
          >
            {label}
          </label>
        )}
        <div
          className={cn(
            "flex items-center gap-2 rounded-2xl bg-secondary/60 border border-transparent",
            "focus-within:border-primary/50 focus-within:bg-background focus-within:shadow-soft transition-all",
            "h-14 px-4",
          )}
        >
          {leading && (
            <span className="text-muted-foreground text-sm">{leading}</span>
          )}
          <input
            ref={ref}
            id={inputId}
            className={cn(
              "flex-1 bg-transparent outline-none text-[15px] text-foreground placeholder:text-muted-foreground/60",
              className,
            )}
            {...props}
          />
          {trailing && (
            <span className="text-muted-foreground text-[13px] whitespace-nowrap select-none">
              {trailing}
            </span>
          )}
        </div>
        {hint && <p className="text-xs text-muted-foreground pl-1">{hint}</p>}
      </div>
    );
  },
);
PulseInput.displayName = "PulseInput";