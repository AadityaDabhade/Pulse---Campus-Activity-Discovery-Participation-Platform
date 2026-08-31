import { cn } from "@/lib/utils";

export function Logo({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "font-semibold tracking-[0.22em] text-primary text-[16px]",
        className,
      )}
    >
      PULSE
    </span>
  );
}