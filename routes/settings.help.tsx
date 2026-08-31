import { createFileRoute, useNavigate, useRouter } from "@tanstack/react-router";
import { Mail, Bug, MessageCircle } from "lucide-react";
import { PhoneFrame } from "@/components/pulse/PhoneFrame";
import { SubHeader } from "./settings.notifications";

export const Route = createFileRoute("/settings/help")({
  head: () => ({
    meta: [
      { title: "Help & Support — Pulse" },
      { name: "description", content: "Get help or contact the Pulse team." },
      { property: "og:title", content: "Help & Support — Pulse" },
      { property: "og:description", content: "Get help or contact the Pulse team." },
    ],
  }),
  component: HelpPage,
});

function HelpPage() {
  const navigate = useNavigate();
  const router = useRouter();
  const goBack = () => {
    if (typeof window !== "undefined" && window.history.length > 1) router.history.back();
    else navigate({ to: "/settings" });
  };
  return (
    <PhoneFrame>
      <div className="relative flex flex-col min-h-dvh sm:min-h-[calc(100dvh-3rem)]">
        <SubHeader title="Help & Support" onBack={goBack} />
        <main className="flex-1 overflow-y-auto px-5 pb-10 flex flex-col gap-3">
          <p className="text-[13px] text-muted-foreground">
            We usually reply within a day. Please share as much context as you can.
          </p>
          <a
            href="mailto:hello@pulse.app"
            className="flex items-center gap-3 rounded-2xl border border-border/80 bg-card px-4 py-3.5 active:scale-[0.99]"
          >
            <Mail className="h-4 w-4 text-primary" strokeWidth={2.2} />
            <div className="flex-1 min-w-0">
              <div className="text-[14px] font-medium text-foreground">Email us</div>
              <div className="text-[12px] text-muted-foreground">hello@pulse.app</div>
            </div>
          </a>
          <a
            href="mailto:bugs@pulse.app?subject=Bug%20report"
            className="flex items-center gap-3 rounded-2xl border border-border/80 bg-card px-4 py-3.5 active:scale-[0.99]"
          >
            <Bug className="h-4 w-4 text-primary" strokeWidth={2.2} />
            <div className="flex-1 min-w-0">
              <div className="text-[14px] font-medium text-foreground">Report a Bug</div>
              <div className="text-[12px] text-muted-foreground">Tell us what went wrong.</div>
            </div>
          </a>
          <a
            href="mailto:support@pulse.app"
            className="flex items-center gap-3 rounded-2xl border border-border/80 bg-card px-4 py-3.5 active:scale-[0.99]"
          >
            <MessageCircle className="h-4 w-4 text-primary" strokeWidth={2.2} />
            <div className="flex-1 min-w-0">
              <div className="text-[14px] font-medium text-foreground">Contact Support</div>
              <div className="text-[12px] text-muted-foreground">General questions and feedback.</div>
            </div>
          </a>
        </main>
      </div>
    </PhoneFrame>
  );
}