import { useEffect } from "react";
import { cn } from "@/lib/utils";

export function JoinRequestSheet({
  open,
  onClose,
  onGoToHub,
}: {
  open: boolean;
  onClose: () => void;
  onGoToHub: () => void;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  return (
    <div
      className={cn(
        "fixed inset-0 z-50 transition-opacity duration-200",
        open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none",
      )}
      aria-hidden={!open}
    >
      <button
        type="button"
        aria-label="Close"
        onClick={onClose}
        className="absolute inset-0 bg-foreground/30 backdrop-blur-[1px]"
      />
      <div
        role="dialog"
        aria-modal="true"
        className={cn(
          "absolute left-1/2 -translate-x-1/2 bottom-0 w-full max-w-[440px]",
          "rounded-t-3xl bg-background border-t border-x border-border shadow-lift",
          "px-6 pt-3 pb-[max(1.5rem,env(safe-area-inset-bottom))]",
          "transition-transform duration-300 ease-out",
          open ? "translate-y-0" : "translate-y-full",
        )}
      >
        <div className="mx-auto h-1.5 w-10 rounded-full bg-border mb-4" aria-hidden />
        <div className="text-center">
          <p className="text-[22px]" aria-hidden>🎉</p>
          <h2 className="mt-1 text-[18px] font-semibold text-foreground">
            Request Sent
          </h2>
          <p className="mt-1.5 text-[13px] text-muted-foreground leading-snug">
            Your request has been sent to the host.
            <br />
            Track it in Activity Hub → Joined → Requested.
          </p>
        </div>
        <div className="mt-5 flex flex-col gap-2">
          <button
            type="button"
            onClick={onGoToHub}
            className="h-11 rounded-2xl bg-primary text-primary-foreground text-[14px] font-semibold shadow-green transition-transform active:scale-[0.98]"
          >
            Go to Activity Hub
          </button>
          <button
            type="button"
            onClick={onClose}
            className="h-11 rounded-2xl border border-border/80 bg-background text-foreground text-[13.5px] font-medium hover:border-foreground/20 transition-colors"
          >
            Continue Exploring
          </button>
        </div>
      </div>
    </div>
  );
}