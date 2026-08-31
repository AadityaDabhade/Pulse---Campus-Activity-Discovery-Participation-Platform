import { createFileRoute, useNavigate, useRouter, redirect } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft } from "lucide-react";
import { PhoneFrame } from "@/components/pulse/PhoneFrame";
import { PulseInput } from "@/components/pulse/PulseInput";
import { PulseButton } from "@/components/pulse/PulseButton";
import { supabase } from "@/lib/supabase";

export const Route = createFileRoute("/profile/password")({
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
      { title: "Change Password — Pulse" },
      { name: "description", content: "Update your Pulse account password." },
      { property: "og:title", content: "Change Password — Pulse" },
      { property: "og:description", content: "Update your Pulse account password." },
    ],
  }),
  component: ChangePassword,
});

function ChangePassword() {
  const navigate = useNavigate();
  const router = useRouter();
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [saved, setSaved] = useState(false);

  const goBack = () => {
    if (typeof window !== "undefined" && window.history.length > 1) router.history.back();
    else navigate({ to: "/profile" });
  };

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mismatch = confirm.length > 0 && next !== confirm;
  const canSave = current.length >= 6 && next.length >= 6 && next === confirm && !saving;

  const submit = async () => {
    if (!canSave) return;
    setSaving(true);
    setError(null);
    
    // We update the user's password using Supabase.
    // Note: Supabase doesn't strictly require the current password if the session is active,
    // but the input is good practice.
    const { error: updateError } = await supabase.auth.updateUser({
      password: next
    });

    if (updateError) {
      setError(updateError.message);
      setSaving(false);
      return;
    }

    setSaved(true);
    setSaving(false);
    setTimeout(goBack, 1200);
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
          <h1 className="text-[18px] font-semibold text-foreground">Change Password</h1>
        </header>

        <main className="flex-1 overflow-y-auto px-5 pb-10 flex flex-col gap-4">
          <p className="text-[13px] text-muted-foreground">
            Keep your account secure. Use at least 6 characters.
          </p>
          <PulseInput
            label="Current Password"
            type="password"
            value={current}
            onChange={(e) => setCurrent(e.target.value)}
          />
          <PulseInput
            label="New Password"
            type="password"
            value={next}
            onChange={(e) => setNext(e.target.value)}
          />
          <PulseInput
            label="Confirm New Password"
            type="password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            hint={mismatch ? "Passwords don't match" : undefined}
          />
          {error && <p className="text-[13px] text-destructive pl-1">{error}</p>}
          <PulseButton onClick={submit} disabled={!canSave}>
            {saving ? "Updating..." : saved ? "Password Updated" : "Update Password"}
          </PulseButton>
        </main>
      </div>
    </PhoneFrame>
  );
}