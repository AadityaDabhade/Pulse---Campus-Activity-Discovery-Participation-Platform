import { createFileRoute, useNavigate, useRouter } from "@tanstack/react-router";
import { PhoneFrame } from "@/components/pulse/PhoneFrame";
import { SubHeader } from "./settings.notifications";

export const Route = createFileRoute("/settings/terms")({
  head: () => ({
    meta: [
      { title: "Terms & Conditions — Pulse" },
      { name: "description", content: "The rules of using Pulse." },
      { property: "og:title", content: "Terms & Conditions — Pulse" },
      { property: "og:description", content: "The rules of using Pulse." },
    ],
  }),
  component: TermsPage,
});

function TermsPage() {
  const navigate = useNavigate();
  const router = useRouter();
  const goBack = () => {
    if (typeof window !== "undefined" && window.history.length > 1) router.history.back();
    else navigate({ to: "/settings" });
  };
  return (
    <PhoneFrame>
      <div className="relative flex flex-col min-h-dvh sm:min-h-[calc(100dvh-3rem)]">
        <SubHeader title="Terms & Conditions" onBack={goBack} />
        <main className="flex-1 overflow-y-auto px-5 pb-10 flex flex-col gap-3 text-[13px] text-foreground/85 leading-relaxed">
          <p>
            Pulse is a student community app built for IIT Kharagpur. By using it, you agree to be
            respectful, honest about who you are, and mindful of the people you meet.
          </p>
          <h3 className="text-[14px] font-semibold text-foreground mt-2">Your account</h3>
          <p>
            You are responsible for the accuracy of the information on your profile and for anything
            that happens under your account. Keep your login private.
          </p>
          <h3 className="text-[14px] font-semibold text-foreground mt-2">Community</h3>
          <p>
            Harassment, spam, hateful content, and impersonation are not allowed. Hosts are expected
            to honour the meet-ups they create. Participants are expected to show up or cancel early.
          </p>
          <h3 className="text-[14px] font-semibold text-foreground mt-2">Safety</h3>
          <p>
            Pulse helps you find people to meet, but the meet-ups themselves are between you and them.
            Use common sense — stick to public spaces and trust your gut.
          </p>
          <h3 className="text-[14px] font-semibold text-foreground mt-2">Content</h3>
          <p>
            You own what you post. By posting, you allow Pulse to display it within the app to relevant
            participants.
          </p>
          <p className="mt-4 text-[12px] text-muted-foreground">Last updated: July 2026</p>
        </main>
      </div>
    </PhoneFrame>
  );
}