import { createFileRoute, useNavigate, useRouter } from "@tanstack/react-router";
import { PhoneFrame } from "@/components/pulse/PhoneFrame";
import { SubHeader } from "./settings.notifications";

export const Route = createFileRoute("/settings/founder")({
  head: () => ({
    meta: [
      { title: "Founder's Note — Pulse" },
      { name: "description", content: "A note from the founder of Pulse." },
      { property: "og:title", content: "Founder's Note — Pulse" },
      { property: "og:description", content: "A note from the founder of Pulse." },
    ],
  }),
  component: FounderNote,
});

function FounderNote() {
  const navigate = useNavigate();
  const router = useRouter();
  const goBack = () => {
    if (typeof window !== "undefined" && window.history.length > 1) router.history.back();
    else navigate({ to: "/settings" });
  };
  return (
    <PhoneFrame>
      <div className="relative flex flex-col min-h-dvh sm:min-h-[calc(100dvh-3rem)]">
        <SubHeader title="Founder's Note" onBack={goBack} />
        <main className="flex-1 overflow-y-auto px-5 pb-10">
          <div className="rounded-3xl bg-primary/5 border border-primary/15 p-5">
            <div className="text-4xl">🌿</div>
            <h2 className="mt-3 text-[20px] font-semibold text-foreground leading-tight">
              A quiet nudge to show up.
            </h2>
            <p className="mt-3 text-[13.5px] text-foreground/85 leading-relaxed">
              Campus goes by fast. Some of the best evenings — a spontaneous chai run, a study huddle,
              a random walk to the lake — never happen because we couldn't find the two other people
              who also felt like it.
            </p>
            <p className="mt-3 text-[13.5px] text-foreground/85 leading-relaxed">
              Pulse is a small attempt to fix that. A calm, student-first place to host tiny meet-ups,
              find your people, and turn ordinary days into memories you'll actually remember.
            </p>
            <p className="mt-3 text-[13.5px] text-foreground/85 leading-relaxed">
              We're building it slowly, with a lot of care. Thanks for being one of the first here.
            </p>
            <p className="mt-5 text-[13px] font-medium text-primary">— The Pulse team</p>
          </div>
        </main>
      </div>
    </PhoneFrame>
  );
}