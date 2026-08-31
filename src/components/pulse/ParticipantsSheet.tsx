import { useEffect } from "react";
import { cn } from "@/lib/utils";

export type ParticipantUI = {
  id: string; // The activity_request.id
  userId: string;
  name: string;
  status: 'REQUESTED' | 'APPROVED' | 'REJECTED' | 'CANCELLED' | 'LEFT' | 'REMOVED';
};

export function ParticipantsSheet({
  open,
  onClose,
  participants,
  onUpdateStatus,
}: {
  open: boolean;
  onClose: () => void;
  participants: ParticipantUI[];
  onUpdateStatus?: (id: string, newStatus: string) => void;
}) {
  useEffect(() => {
    if (!open) return;
    const k = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", k);
    return () => window.removeEventListener("keydown", k);
  }, [open, onClose]);

  const requested = participants.filter((p) => p.status === "REQUESTED");
  const approved = participants.filter((p) => p.status === "APPROVED");

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
          "px-5 pt-3 pb-[max(1.5rem,env(safe-area-inset-bottom))]",
          "transition-transform duration-300 ease-out",
          open ? "translate-y-0" : "translate-y-full",
        )}
      >
        <div className="mx-auto h-1.5 w-10 rounded-full bg-border mb-4" aria-hidden />
        <h2 className="text-[16px] font-semibold text-foreground">Participants</h2>
        <p className="text-[12px] text-muted-foreground mb-3">{approved.length} Approved, {requested.length} Pending</p>
        
        <ul className="flex flex-col gap-2 max-h-[55vh] overflow-y-auto">
          {requested.length > 0 && (
            <div className="text-[12px] font-medium text-muted-foreground mt-2 mb-1">Pending Requests</div>
          )}
          {requested.map((p) => (
            <li
              key={p.id}
              className="flex items-center gap-3 rounded-2xl bg-yellow-50/50 border border-yellow-100 px-3 py-2.5"
            >
              <div className="h-9 w-9 rounded-full bg-yellow-100 flex items-center justify-center text-[13px] font-semibold text-yellow-800">
                {p.name.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-medium text-foreground truncate">{p.name}</p>
              </div>
              {onUpdateStatus && (
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => onUpdateStatus(p.id, 'APPROVED')}
                    className="h-8 px-3 rounded-full bg-primary text-primary-foreground text-[11.5px] font-medium"
                  >
                    Accept
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (confirm(`Decline ${p.name}?`)) onUpdateStatus(p.id, 'REJECTED');
                    }}
                    className="h-8 px-3 rounded-full border border-border/80 text-[11.5px] font-medium text-muted-foreground"
                  >
                    Decline
                  </button>
                </div>
              )}
            </li>
          ))}

          {approved.length > 0 && (
            <div className="text-[12px] font-medium text-muted-foreground mt-2 mb-1">Approved Participants</div>
          )}
          {approved.map((p) => (
            <li
              key={p.id}
              className="flex items-center gap-3 rounded-2xl bg-card border border-border/70 px-3 py-2.5"
            >
              <div className="h-9 w-9 rounded-full bg-accent/70 flex items-center justify-center text-[13px] font-semibold text-accent-foreground">
                {p.name.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-medium text-foreground truncate">{p.name}</p>
              </div>
              {onUpdateStatus && (
                <button
                  type="button"
                  onClick={() => {
                    if (confirm(`Remove ${p.name}?`)) onUpdateStatus(p.id, 'REMOVED');
                  }}
                  className="h-8 px-3 rounded-full border border-border/80 text-[11.5px] font-medium text-muted-foreground hover:text-foreground hover:border-foreground/20"
                >
                  Remove
                </button>
              )}
            </li>
          ))}

          {approved.length === 0 && requested.length === 0 && (
            <li className="text-center text-[12.5px] text-muted-foreground py-8">
              No participants yet.
            </li>
          )}
        </ul>
      </div>
    </div>
  );
}