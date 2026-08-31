import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useState } from "react";
import { ChevronLeft, Check, ChevronDown, ChevronUp } from "lucide-react";
import { PhoneFrame } from "@/components/pulse/PhoneFrame";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/activity/$id/notifications")({
  head: () => ({
    meta: [
      { title: "Notifications & Reminders — Pulse" },
      {
        name: "description",
        content:
          "Stay on top of updates and reminders for this campus activity.",
      },
    ],
  }),
  component: NotificationsPage,
});

type Tab = "notifications" | "reminders";
type Item = { id: string; message: string; timestamp: string };

const INITIAL_NOTIFICATIONS: Item[] = [
  { id: "n1", message: "Host changed the activity timing.", timestamp: "10 mins ago" },
  { id: "n2", message: "Host updated the meeting location.", timestamp: "1 hour ago" },
];

const INITIAL_REMINDERS: Item[] = [
  { id: "r1", message: "Activity starts in 1 hour.", timestamp: "" },
  { id: "r2", message: "Activity starts in 15 minutes.", timestamp: "" },
];

function NotificationsPage() {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("notifications");
  const [notifications, setNotifications] = useState(INITIAL_NOTIFICATIONS);
  const [reminders, setReminders] = useState(INITIAL_REMINDERS);
  const [readN, setReadN] = useState<Item[]>([]);
  const [readR, setReadR] = useState<Item[]>([]);
  const [showReadN, setShowReadN] = useState(false);
  const [showReadR, setShowReadR] = useState(false);

  const active = tab === "notifications" ? notifications : reminders;
  const read = tab === "notifications" ? readN : readR;
  const showRead = tab === "notifications" ? showReadN : showReadR;
  const toggleShowRead = () =>
    tab === "notifications" ? setShowReadN((s) => !s) : setShowReadR((s) => !s);

  const markRead = (id: string) => {
    if (tab === "notifications") {
      const item = notifications.find((n) => n.id === id);
      if (!item) return;
      setNotifications((n) => n.filter((x) => x.id !== id));
      setReadN((r) => [item, ...r]);
    } else {
      const item = reminders.find((n) => n.id === id);
      if (!item) return;
      setReminders((n) => n.filter((x) => x.id !== id));
      setReadR((r) => [item, ...r]);
    }
  };

  return (
    <PhoneFrame>
      <div className="relative flex flex-col min-h-dvh sm:min-h-[calc(100dvh-3rem)]">
        <header className="flex items-center gap-3 px-5 pt-6 pb-4">
          <button
            type="button"
            onClick={() => router.history.back()}
            aria-label="Back"
            className="h-10 w-10 rounded-full bg-secondary border border-border shadow-soft flex items-center justify-center text-muted-foreground transition-transform active:scale-95"
          >
            <ChevronLeft className="h-5 w-5" strokeWidth={2.2} />
          </button>
          <div className="min-w-0">
            <p className="text-[11px] tracking-[0.18em] uppercase font-semibold text-primary">
              Activity
            </p>
            <h1 className="text-[20px] font-semibold text-foreground leading-tight truncate">
              Notifications &amp; Reminders
            </h1>
          </div>
        </header>

        {/* Segmented chips */}
        <div className="px-5 pb-4 flex items-center gap-2">
          <Chip active={tab === "notifications"} onClick={() => setTab("notifications")}>
            Notifications
          </Chip>
          <Chip active={tab === "reminders"} onClick={() => setTab("reminders")}>
            Reminders
          </Chip>
        </div>

        <main className="flex-1 overflow-y-auto pb-10 px-5 flex flex-col gap-3">
          {active.length === 0 && read.length === 0 && (
            <p className="text-center text-[13.5px] text-muted-foreground pt-10">
              Nothing here yet.
            </p>
          )}

          {active.map((item) => (
            <ItemCard key={item.id} item={item} onMarkRead={() => markRead(item.id)} />
          ))}

          {read.length > 0 && (
            <div className="mt-2">
              <button
                type="button"
                onClick={toggleShowRead}
                className="w-full flex items-center justify-between px-2 py-2 text-[12.5px] font-medium text-muted-foreground"
              >
                <span>{read.length} read</span>
                {showRead ? (
                  <ChevronUp className="h-4 w-4" strokeWidth={2.2} />
                ) : (
                  <ChevronDown className="h-4 w-4" strokeWidth={2.2} />
                )}
              </button>
              {showRead && (
                <div className="flex flex-col gap-3 mt-1 opacity-70">
                  {read.map((item) => (
                    <ItemCard key={item.id} item={item} readOnly />
                  ))}
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    </PhoneFrame>
  );
}

function ItemCard({
  item,
  onMarkRead,
  readOnly,
}: {
  item: Item;
  onMarkRead?: () => void;
  readOnly?: boolean;
}) {
  return (
    <article className="rounded-2xl bg-card border border-border/80 shadow-soft px-4 py-3 flex items-start justify-between gap-3">
      <div className="min-w-0 flex-1">
        <p className="text-[13.5px] text-foreground leading-snug">{item.message}</p>
        {item.timestamp && (
          <p className="mt-1 text-[11.5px] text-muted-foreground">{item.timestamp}</p>
        )}
      </div>
      {!readOnly && (
        <button
          type="button"
          onClick={onMarkRead}
          className="shrink-0 h-8 px-2.5 rounded-full border border-border/80 text-muted-foreground text-[11.5px] font-medium inline-flex items-center gap-1 hover:text-foreground hover:border-foreground/20 transition-colors"
        >
          <Check className="h-3.5 w-3.5" strokeWidth={2.2} />
          Mark as read
        </button>
      )}
    </article>
  );
}

function Chip({
  active,
  onClick,
  children,
}: {
  active?: boolean;
  onClick?: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "h-8 px-3.5 rounded-full text-[12.5px] font-medium border transition-colors",
        active
          ? "bg-primary/10 border-primary/30 text-primary"
          : "bg-background border-border/80 text-muted-foreground hover:text-foreground",
      )}
    >
      {children}
    </button>
  );
}