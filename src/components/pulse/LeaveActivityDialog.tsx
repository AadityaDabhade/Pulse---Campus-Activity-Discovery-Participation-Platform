import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

export function LeaveActivityDialog({
  open,
  onClose,
  onConfirm,
}: {
  open: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => void;
}) {
  const [reason, setReason] = useState("");
  useEffect(() => {
    if (!open) setReason("");
  }, [open]);
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
        <h2 className="text-[17px] font-semibold text-foreground">Leave this activity?</h2>
        <p className="mt-1 text-[12.5px] text-muted-foreground">
          Tell us why you're leaving. (optional)
        </p>
        <textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          rows={3}
          className="mt-3 w-full rounded-2xl border border-border/80 bg-secondary/40 px-3 py-2 text-[13px] outline-none focus:border-primary/50"
          placeholder="Optional reason"
        />
        <div className="mt-4 flex items-center gap-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 h-10 rounded-2xl border border-border/80 text-[13px] font-medium text-foreground"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => onConfirm(reason)}
            className="flex-1 h-10 rounded-2xl bg-primary text-primary-foreground text-[13px] font-semibold shadow-green active:scale-[0.98]"
          >
            Leave Activity
          </button>
        </div>
      </div>
    </div>
  );
}