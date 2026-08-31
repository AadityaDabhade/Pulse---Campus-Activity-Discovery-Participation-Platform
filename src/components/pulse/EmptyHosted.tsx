import { PulseButton } from "./PulseButton";
import { useNavigate } from "@tanstack/react-router";

export function EmptyHosted({ onCreate }: { onCreate?: () => void }) {
  const navigate = useNavigate();
  const handle = onCreate ?? (() => navigate({ to: "/activity/new", search: { edit: undefined } }));
  return (
    <div className="flex flex-col items-center text-center px-6 py-16">
      <div
        aria-hidden
        className="h-24 w-24 rounded-full bg-accent/60 flex items-center justify-center text-4xl"
      >
        ✨
      </div>
      <h2 className="mt-6 text-[20px] font-semibold text-foreground max-w-[280px]">
        Create moments that bring people together.
      </h2>
      <p className="mt-2 text-[13.5px] text-muted-foreground max-w-[280px]">
        Host an activity and bring people together around shared interests.
      </p>
      <div className="mt-8 w-full max-w-[280px]">
        <PulseButton variant="primary" onClick={handle}>
          Create Activity
        </PulseButton>
      </div>
    </div>
  );
}