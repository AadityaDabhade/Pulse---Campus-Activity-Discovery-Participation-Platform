import { PulseButton } from "./PulseButton";
import { useNavigate } from "@tanstack/react-router";

export function EmptyState({
  onExplore,
  onCreate,
}: {
  onExplore?: () => void;
  onCreate?: () => void;
}) {
  const navigate = useNavigate();
  const handleCreate = onCreate ?? (() => navigate({ to: "/activity/new", search: { edit: undefined } }));
  return (
    <div className="flex flex-col items-center text-center px-6 py-16">
      <div
        aria-hidden
        className="h-20 w-20 rounded-full bg-accent/60 flex items-center justify-center text-3xl"
      >
        🍃
      </div>
      <h2 className="mt-6 text-[20px] font-semibold text-foreground">
        No activities yet.
      </h2>
      <p className="mt-2 text-[13.5px] text-muted-foreground max-w-[260px]">
        Looks like no one's hosting an activity right now. Why not start one?
      </p>
      <div className="mt-8 w-full max-w-[280px] flex flex-col gap-3">
        <PulseButton variant="primary" onClick={handleCreate}>
          Create One
        </PulseButton>
        <PulseButton variant="outline" onClick={onExplore}>
          Explore Other Activities
        </PulseButton>
      </div>
    </div>
  );
}