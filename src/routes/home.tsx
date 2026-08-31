import { createFileRoute, redirect } from "@tanstack/react-router";
import { PhoneFrame } from "@/components/pulse/PhoneFrame";
import { TopBar } from "@/components/pulse/TopBar";
import { BottomNav } from "@/components/pulse/BottomNav";
import { CampusUpdateCard } from "@/components/pulse/CampusUpdateCard";
import { ActivityTypeCard } from "@/components/pulse/ActivityTypeCard";
import { CATEGORIES } from "@/lib/discover-data";

export const Route = createFileRoute("/home")({
  beforeLoad: async ({ context }) => {
    if (typeof window === 'undefined') return;

    let session = context.session;
    if (!session) {
      const { data } = await context.supabase.auth.getSession();
      session = data.session;
    }
    if (!session) {
      throw redirect({ to: "/" });
    }
  },
  head: () => ({
    meta: [
      { title: "Discover — Pulse" },
      {
        name: "description",
        content:
          "Browse student-hosted activities and campus updates on Pulse.",
      },
    ],
  }),
  component: Discover,
});


function Discover() {
  return (
    <PhoneFrame>
      <div className="relative flex flex-col min-h-dvh sm:min-h-[calc(100dvh-3rem)]">
        <TopBar />

        <main className="flex-1 overflow-y-auto pb-32">
          <div className="px-6 pt-1 pb-1">
            <h1 className="text-[26px] font-semibold tracking-tight text-foreground leading-tight">
              Discover
            </h1>
            <p className="mt-1 text-[13.5px] text-muted-foreground">
              What's happening around campus.
            </p>
          </div>

          <Section title="Campus Updates">
            <CampusUpdateCard
              eyebrow="Announcement"
              title="Spring Fest lineup drops this Friday."
              meta="Institute · 2h ago"
              emoji="🎪"
            />
          </Section>

          {CATEGORIES.map((cat) => (
            <Section key={cat.title} title={cat.title}>
              {cat.types.map((t) => (
                <ActivityTypeCard
                  key={t.slug}
                  slug={t.slug}
                  name={t.name}
                  emoji={t.emoji}
                />
              ))}
            </Section>
          ))}
        </main>

        <BottomNav />
      </div>
    </PhoneFrame>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mt-6">
      <h2 className="px-6 text-[17px] font-semibold text-foreground tracking-tight">
        {title}
      </h2>
      <div className="mt-4 flex gap-3 overflow-x-auto scrollbar-none px-6 pt-3 pb-3">
        {children}
      </div>
    </section>
  );
}