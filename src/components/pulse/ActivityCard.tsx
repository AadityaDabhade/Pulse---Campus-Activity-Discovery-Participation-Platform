import { Users, MapPin, Wallet } from "lucide-react";
import type { Activity } from "@/lib/discover-data";
import type { ReactNode } from "react";

function getRelativeCountdown(time: string, deadline: string): string {
  const now = new Date();
  const deadlineDate = new Date();

  if (time.toLowerCase().includes("tomorrow")) {
    deadlineDate.setDate(deadlineDate.getDate() + 1);
  }

  const match = deadline.match(/(\d+):(\d+)\s*(AM|PM)/i);
  if (!match) return deadline;

  let hours = parseInt(match[1], 10);
  const minutes = parseInt(match[2], 10);
  const period = match[3].toUpperCase();

  if (period === "PM" && hours !== 12) hours += 12;
  if (period === "AM" && hours === 12) hours = 0;

  deadlineDate.setHours(hours, minutes, 0, 0);

  const diffMs = deadlineDate.getTime() - now.getTime();
  if (diffMs <= 0) return "Expired";

  const minutesLeft = Math.floor(diffMs / (1000 * 60));
  const hoursLeft = Math.floor(diffMs / (1000 * 60 * 60));
  const daysLeft = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (daysLeft >= 1) return `${daysLeft} day${daysLeft === 1 ? "" : "s"} left`;
  if (hoursLeft >= 1) return `${hoursLeft} hour${hoursLeft === 1 ? "" : "s"} left`;
  return `${minutesLeft} min${minutesLeft === 1 ? "" : "s"} left`;
}

export function ActivityCard({
  activity,
  actions,
  onJoin,
  live,
}: {
  activity: Activity;
  actions?: ReactNode;
  onJoin?: () => void;
  live?: boolean;
}) {
  const remaining = activity.capacity - activity.joined;
  return (
    <article className="rounded-3xl bg-card border border-border/80 shadow-soft p-4 flex flex-col gap-3">
      <header className="flex items-start gap-3">
        <div
          aria-hidden
          className="h-[52px] w-[52px] shrink-0 rounded-2xl bg-accent/70 flex items-center justify-center text-2xl"
        >
          {activity.emoji}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="text-[16px] font-semibold text-foreground leading-tight">
              {activity.title}
            </h3>
            {live && <LiveNowPill />}
          </div>
          <p className="mt-1 text-[12.5px] text-muted-foreground">
            {activity.time} • Hosted by{" "}
            <span className="text-foreground font-medium">{activity.host}</span>
          </p>
        </div>
      </header>

      <div className="flex items-center justify-between rounded-2xl bg-secondary/60 px-3.5 py-2.5">
        <div className="flex items-center gap-2 text-[13px] text-foreground">
          <Users className="h-4 w-4 text-muted-foreground" strokeWidth={2.2} />
          <span className="font-medium">{activity.joined} Joined</span>
        </div>
        {remaining > 0 && (
          <span className="text-[12px] font-medium text-primary">
            Need {remaining} More
          </span>
        )}
      </div>

      {activity.eligibility && activity.eligibility.length > 0 && (
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-[11.5px] text-muted-foreground">Open for</span>
          {activity.eligibility.slice(0, 2).map((tag) => (
            <span
              key={tag}
              className="text-[11.5px] font-medium px-2.5 py-0.5 rounded-full bg-accent/70 text-accent-foreground"
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      <div className="flex items-start justify-between gap-3">
        <div className="flex flex-col gap-1.5 text-[12.5px] text-foreground">
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-muted-foreground" strokeWidth={2.2} />
            <span className="text-muted-foreground">Meet-up Point</span>
            <span className="font-medium">{activity.meetupPoint}</span>
          </div>
          {activity.cost && (
            <div className="flex items-center gap-2">
              <Wallet className="h-4 w-4 text-muted-foreground" strokeWidth={2.2} />
              <span className="text-muted-foreground">Contribution</span>
              <span className="font-medium">{activity.cost}</span>
            </div>
          )}
        </div>

        {!actions && (
          <button
          type="button"
          onClick={onJoin}
          className="shrink-0 flex flex-col items-center justify-center w-24 h-14 rounded-2xl bg-primary/10 border border-primary/30 text-primary transition-colors hover:bg-primary/15 active:scale-[0.98]"
          >
          <span className="text-[13px] font-semibold leading-tight">Join</span>
          <span className="text-[10px] font-medium leading-tight mt-0.5">
            {getRelativeCountdown(activity.time, activity.deadline ?? "")}
          </span>
          </button>
        )}
      </div>

      {actions && (
        <div className="flex items-center gap-2 pt-1">{actions}</div>
      )}
    </article>
  );
}

export function LiveNowPill() {
  return (
    <span className="inline-flex items-center gap-1 h-5 px-2 rounded-full bg-primary/10 border border-primary/30 text-primary text-[10px] font-semibold tracking-wide uppercase">
      <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" aria-hidden />
      Live Now
    </span>
  );
}
