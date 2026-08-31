import { useEffect } from "react";
import { cn } from "@/lib/utils";

export function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  destructive = false,
}: {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  destructive?: boolean;
}) {
  useEffect(() => {
    if (!open) return;
    const k = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", k);
    return () => window.removeEventListener("keydown", k);
  }, [open, onClose]);

  return (
    <div
      className={cn(
        "fixed inset-0 z-50 transition-opacity duration-200 flex items-center justify-center p-6",
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
          "relative w-full max-w-[380px] rounded-3xl bg-background border border-border shadow-lift p-5",
          "transition-transform duration-200",
          open ? "scale-100" : "scale-95",
        )}
      >
        <h2 className="text-[17px] font-semibold text-foreground">{title}</h2>
        {description && (
          <p className="mt-1 text-[12.5px] text-muted-foreground">{description}</p>
        )}
        <div className="mt-4 flex items-center gap-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 h-10 rounded-2xl border border-border/80 text-[13px] font-medium text-foreground"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className={cn(
              "flex-1 h-10 rounded-2xl text-[13px] font-semibold active:scale-[0.98]",
              destructive
                ? "bg-destructive text-destructive-foreground"
                : "bg-primary text-primary-foreground shadow-green",
            )}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}