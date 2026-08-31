import { cn } from "@/lib/utils";
import { ChevronDown } from "lucide-react";
import { forwardRef, type SelectHTMLAttributes } from "react";

interface Props extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options: { value: string; label: string }[];
  placeholder?: string;
}

export const PulseSelect = forwardRef<HTMLSelectElement, Props>(
  ({ className, label, options, placeholder, id, value, ...props }, ref) => {
    const selectId = id ?? props.name;
    return (
      <div className="flex flex-col gap-2">
        {label && (
          <label
            htmlFor={selectId}
            className="text-[13px] font-medium text-muted-foreground pl-1"
          >
            {label}
          </label>
        )}
        <div
          className={cn(
            "relative flex items-center rounded-2xl bg-secondary/60 border border-transparent",
            "focus-within:border-primary/50 focus-within:bg-background focus-within:shadow-soft transition-all",
            "h-14 px-4",
          )}
        >
          <select
            ref={ref}
            id={selectId}
            value={value}
            className={cn(
              "flex-1 bg-transparent outline-none appearance-none text-[15px]",
              value ? "text-foreground" : "text-muted-foreground/60",
              className,
            )}
            {...props}
          >
            {placeholder && (
              <option value="" disabled>
                {placeholder}
              </option>
            )}
            {options.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
          <ChevronDown className="w-4 h-4 text-muted-foreground pointer-events-none" />
        </div>
      </div>
    );
  },
);
PulseSelect.displayName = "PulseSelect";