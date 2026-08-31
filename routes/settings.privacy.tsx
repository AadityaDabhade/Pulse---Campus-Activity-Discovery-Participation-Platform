import { createFileRoute, useNavigate, useRouter } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { PhoneFrame } from "@/components/pulse/PhoneFrame";
import { SubHeader } from "./settings.notifications";

export const Route = createFileRoute("/settings/privacy")({
  head: () => ({
    meta: [
      { title: "Privacy — Pulse" },
      { name: "description", content: "Manage your Pulse privacy preferences." },
      { property: "og:title", content: "Privacy — Pulse" },
      { property: "og:description", content: "Manage your Pulse privacy preferences." },
    ],
  }),
  component: PrivacyPage,
});

const OPTIONS = [
  {
    key: "phone_visible",
    label: "Share phone with joined participants",
    hint: "Hosts and confirmed members can see your phone.",
    def: true,
  },
  {
    key: "hall_visible",
    label: "Show my hall on activity cards",
    hint: "Helps others gauge nearby meet-ups.",
    def: true,
  },
  {
    key: "discoverable",
    label: "Appear in campus search",
    hint: "Other students can find your profile by name.",
    def: false,
  },
];

function PrivacyPage() {
  const navigate = useNavigate();
  const router = useRouter();
  const goBack = () => {
    if (typeof window !== "undefined" && window.history.length > 1) router.history.back();
    else navigate({ to: "/settings" });
  };
  const [state, setState] = useState<Record<string, boolean>>({});
  useEffect(() => {
    const raw = localStorage.getItem("pulse_privacy");
    const init: Record<string, boolean> = {};
    OPTIONS.forEach((o) => (init[o.key] = o.def));
    if (raw) {
      try {
        Object.assign(init, JSON.parse(raw));
      } catch {}
    }
    setState(init);
  }, []);
  const toggle = (k: string) => {
    const next = { ...state, [k]: !state[k] };
    setState(next);
    localStorage.setItem("pulse_privacy", JSON.stringify(next));
  };
  return (
    <PhoneFrame>
      <div className="relative flex flex-col min-h-dvh sm:min-h-[calc(100dvh-3rem)]">
        <SubHeader title="Privacy" onBack={goBack} />
        <main className="flex-1 overflow-y-auto px-5 pb-10 flex flex-col gap-2">
          {OPTIONS.map((o) => (
            <div
              key={o.key}
              className="rounded-2xl border border-border/80 bg-card px-4 py-3.5 flex items-center gap-3"
            >
              <div className="flex-1 min-w-0">
                <div className="text-[14px] font-medium text-foreground">{o.label}</div>
                <div className="text-[12px] text-muted-foreground mt-0.5">{o.hint}</div>
              </div>
              <button
                type="button"
                onClick={() => toggle(o.key)}
                aria-pressed={!!state[o.key]}
                className={
                  "relative h-6 w-11 rounded-full transition-colors " +
                  (state[o.key] ? "bg-primary" : "bg-secondary border border-border")
                }
              >
                <span
                  className={
                    "absolute top-0.5 h-5 w-5 rounded-full bg-background shadow-soft transition-transform " +
                    (state[o.key] ? "translate-x-5" : "translate-x-0.5")
                  }
                />
              </button>
            </div>
          ))}
        </main>
      </div>
    </PhoneFrame>
  );
}