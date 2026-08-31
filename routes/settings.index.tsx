import { createFileRoute, Link, useNavigate, useRouter, redirect } from "@tanstack/react-router";
import {
  ArrowLeft,
  Bell,
  Shield,
  Heart,
  Info,
  LifeBuoy,
  FileText,
  LogOut,
  ChevronRight,
} from "lucide-react";
import { PhoneFrame } from "@/components/pulse/PhoneFrame";
import { supabase } from "@/lib/supabase";

export const Route = createFileRoute("/settings/")({
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
      { title: "Settings — Pulse" },
      { name: "description", content: "Manage your Pulse preferences." },
      { property: "og:title", content: "Settings — Pulse" },
      { property: "og:description", content: "Manage your Pulse preferences." },
    ],
  }),
  component: Settings,
});

function Settings() {
  const navigate = useNavigate();
  const router = useRouter();
  const goBack = () => {
    if (typeof window !== "undefined" && window.history.length > 1) router.history.back();
    else navigate({ to: "/profile" });
  };

  const logout = async () => {
    await supabase.auth.signOut();
    // Invalidate router so all route contexts (session) reset
    await router.invalidate();
    navigate({ to: "/" });
  };

  return (
    <PhoneFrame>
      <div className="relative flex flex-col min-h-dvh sm:min-h-[calc(100dvh-3rem)]">
        <header className="flex items-center gap-3 px-5 pt-6 pb-3">
          <button
            type="button"
            onClick={goBack}
            aria-label="Back"
            className="h-10 w-10 rounded-full bg-secondary border border-border flex items-center justify-center text-muted-foreground active:scale-95"
          >
            <ArrowLeft className="h-5 w-5" strokeWidth={2.2} />
          </button>
          <h1 className="text-[18px] font-semibold text-foreground">Settings</h1>
        </header>

        <main className="flex-1 overflow-y-auto px-5 pb-10 flex flex-col gap-3">
          <Group>
            <Row to="/settings/notifications" icon={Bell} label="Notifications" />
            <Row to="/settings/privacy" icon={Shield} label="Privacy" />
          </Group>
          <Group>
            <Row to="/settings/founder" icon={Heart} label="Founder's Note" />
            <Row to="/settings/about" icon={Info} label="About Pulse" />
            <Row to="/settings/help" icon={LifeBuoy} label="Help & Support" />
            <Row to="/settings/terms" icon={FileText} label="Terms & Conditions" />
          </Group>

          <div className="pt-6">
            <button
              type="button"
              onClick={logout}
              className="w-full flex items-center gap-3 rounded-2xl border border-border/80 bg-card px-4 py-3.5 text-destructive active:scale-[0.99]"
            >
              <LogOut className="h-4 w-4" strokeWidth={2.2} />
              <span className="text-[14px] font-medium flex-1 text-left">Log out</span>
            </button>
          </div>
        </main>
      </div>
    </PhoneFrame>
  );
}

function Group({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-border/80 bg-card divide-y divide-border/70 overflow-hidden">
      {children}
    </div>
  );
}

function Row({
  to,
  icon: Icon,
  label,
}: {
  to: string;
  icon: typeof Bell;
  label: string;
}) {
  return (
    <Link to={to} className="flex items-center gap-3 px-4 py-3.5 active:bg-secondary/50">
      <Icon className="h-4 w-4 text-primary" strokeWidth={2.2} />
      <span className="text-[14px] font-medium text-foreground flex-1">{label}</span>
      <ChevronRight className="h-4 w-4 text-muted-foreground" strokeWidth={2.2} />
    </Link>
  );
}