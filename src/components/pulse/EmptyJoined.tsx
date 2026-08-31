import { PulseButton } from "./PulseButton";
import { ActivityCard } from "./ActivityCard";
import { TEA_ACTIVITIES } from "@/lib/discover-data";

export function EmptyJoined({ onExplore }: { onExplore?: () => void }) {
  const ambient = TEA_ACTIVITIES.slice(0, 2);
  return (
    <div className="relative flex flex-col items-center text-center px-6 py-16 overflow-hidden">
      {/* Ambient floating cards */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 flex flex-col justify-center gap-4 px-8"
      >
        <div className="opacity-[0.08] -rotate-3 translate-x-2">
          <ActivityCard activity={ambient[0]} />
        </div>
        <div className="opacity-[0.06] rotate-2 -translate-x-2">
          <ActivityCard activity={ambient[1] ?? ambient[0]} />
        </div>
      </div>

      <div className="relative flex flex-col items-center">
        <div
          aria-hidden
          className="h-24 w-24 rounded-full bg-accent/60 flex items-center justify-center text-4xl"
        >
          🌱
        </div>
        <h2 className="mt-6 text-[20px] font-semibold text-foreground max-w-[280px]">
          Your next campus memory is waiting.
        </h2>
        <p className="mt-2 text-[13.5px] text-muted-foreground max-w-[280px]">
          Discover activities happening around you and join the ones that spark your interest.
        </p>
        <div className="mt-8 w-full max-w-[280px]">
          <PulseButton variant="primary" onClick={onExplore}>
            Explore Activities
          </PulseButton>
        </div>
      </div>
    </div>
  );
}