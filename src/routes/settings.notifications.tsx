import { createFileRoute, useNavigate, useRouter } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowLeft } from "lucide-react";
import { PhoneFrame } from "@/components/pulse/PhoneFrame";

export const Route = createFileRoute("/settings/notifications")({
  head: () => ({
    meta: [
      { title: "Notifications — Pulse" },
      { name: "description", content: "Control your Pulse notifications." },
      { property: "og:title", content: "Notifications — Pulse" },
      { property: "og:description", content: "Control your Pulse notifications." },
    ],
  }),
  component: NotificationsSettings,
});

function NotificationsSettings() {
  const navigate = useNavigate();
  const router = useRouter();
  const goBack = () => {
    if (typeof window !== "undefined" && window.history.length > 1) router.history.back();
    else navigate({ to: "/settings" });
  };
  const [enabled, setEnabled] = useState(true);
  useEffect(() => {
    const v = localStorage.getItem("pulse_notifications");
    if (v !== null) setEnabled(v === "1");
  }, []);
  const toggle = () => {
    const next = !enabled;
    setEnabled(next);
    localStorage.setItem("pulse_notifications", next ? "1" : "0");
  };
  return (
    <PhoneFrame>
      <div className="relative flex flex-col min-h-dvh sm:min-h-[calc(100dvh-3rem)]">
        <SubHeader title="Notifications" onBack={goBack} />
        <main className="flex-1 overflow-y-auto px-5 pb-10 flex flex-col gap-4">
          <p className="text-[13px] text-muted-foreground">
            This controls all Pulse notifications — activities, requests, and reminders.
          </p>
          <div className="rounded-2xl border border-border/80 bg-card px-4 py-3.5 flex items-center gap-3">
            <span className="text-[14px] font-medium text-foreground flex-1">
              Enable Notifications
            </span>
            <button
              type="button"
              onClick={toggle}
              aria-pressed={enabled}
              className={
                "relative h-6 w-11 rounded-full transition-colors " +
                (enabled ? "bg-primary" : "bg-secondary border border-border")
              }
            >
              <span
                className={
                  "absolute top-0.5 h-5 w-5 rounded-full bg-background shadow-soft transition-transform " +
                  (enabled ? "translate-x-5" : "translate-x-0.5")
                }
              />
            </button>
          </div>
        </main>
      </div>
    </PhoneFrame>
  );
}

export function SubHeader({ title, onBack }: { title: string; onBack: () => void }) {
  return (
    <header className="flex items-center gap-3 px-5 pt-6 pb-3">
      <button
        type="button"
        onClick={onBack}
        aria-label="Back"
        className="h-10 w-10 rounded-full bg-secondary border border-border flex items-center justify-center text-muted-foreground active:scale-95"
      >
        <ArrowLeft className="h-5 w-5" strokeWidth={2.2} />
      </button>
      <h1 className="text-[18px] font-semibold text-foreground">{title}</h1>
    </header>
  );
}