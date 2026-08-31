import { createFileRoute, useNavigate, useRouter } from "@tanstack/react-router";
import { PhoneFrame } from "@/components/pulse/PhoneFrame";
import { SubHeader } from "./settings.notifications";
import { Logo } from "@/components/pulse/Logo";

export const Route = createFileRoute("/settings/about")({
  head: () => ({
    meta: [
      { title: "About Pulse" },
      { name: "description", content: "Version and app information for Pulse." },
      { property: "og:title", content: "About Pulse" },
      { property: "og:description", content: "Version and app information for Pulse." },
    ],
  }),
  component: AboutPage,
});

function AboutPage() {
  const navigate = useNavigate();
  const router = useRouter();
  const goBack = () => {
    if (typeof window !== "undefined" && window.history.length > 1) router.history.back();
    else navigate({ to: "/settings" });
  };
  return (
    <PhoneFrame>
      <div className="relative flex flex-col min-h-dvh sm:min-h-[calc(100dvh-3rem)]">
        <SubHeader title="About Pulse" onBack={goBack} />
        <main className="flex-1 overflow-y-auto px-5 pb-10 flex flex-col gap-4">
          <section className="flex flex-col items-center pt-4">
            <Logo />
            <p className="mt-3 text-[13px] text-muted-foreground text-center max-w-[260px]">
              A calm, student-first place to host tiny campus meet-ups.
            </p>
          </section>
          <div className="rounded-2xl border border-border/80 bg-card divide-y divide-border/70">
            <Row label="Version" value="1.0.0" />
            <Row label="Build" value="2026.07.24" />
            <Row label="Made for" value="IIT Kharagpur" />
          </div>
        </main>
      </div>
    </PhoneFrame>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center gap-3 px-4 py-3.5">
      <span className="text-[13px] text-muted-foreground flex-1">{label}</span>
      <span className="text-[13px] font-medium text-foreground">{value}</span>
    </div>
  );
}