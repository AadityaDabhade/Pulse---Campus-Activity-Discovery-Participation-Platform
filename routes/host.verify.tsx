import { createFileRoute, Link, useNavigate, useRouter } from "@tanstack/react-router";
import { useRef, useState } from "react";
import { ArrowLeft, Camera, CheckCircle2, Image as ImageIcon } from "lucide-react";
import { PhoneFrame } from "@/components/pulse/PhoneFrame";
import { PulseInput } from "@/components/pulse/PulseInput";
import { PulseButton } from "@/components/pulse/PulseButton";
import { Avatar } from "./profile.index";
import { useSupabaseProfile } from "@/lib/profile-store";
import { supabase } from "@/lib/supabase";

export const Route = createFileRoute("/host/verify")({
  head: () => ({
    meta: [
      { title: "Complete Your Host Profile — Pulse" },
      { name: "description", content: "One-time host setup before creating your first activity." },
      { property: "og:title", content: "Complete Your Host Profile — Pulse" },
      { property: "og:description", content: "One-time host setup before creating your first activity." },
    ],
  }),
  component: HostVerify,
});

function HostVerify() {
  const { profile, loading } = useSupabaseProfile();
  const navigate = useNavigate();
  const router = useRouter();
  const galleryRef = useRef<HTMLInputElement>(null);
  const cameraRef = useRef<HTMLInputElement>(null);

  const isHostReady = Boolean(profile?.phone_verified && profile?.phone && profile?.avatar_url);

  const [step, setStep] = useState<"form" | "preview">(isHostReady ? "preview" : "form");
  const [phone, setPhone] = useState(profile?.phone || "");
  const [otpSent, setOtpSent] = useState(profile?.phone_verified || false);
  const [otp, setOtp] = useState("");
  const [phoneVerified, setPhoneVerified] = useState(profile?.phone_verified || false);
  const [photo, setPhoto] = useState(profile?.avatar_url || "");

  const goBack = () => {
    if (typeof window !== "undefined" && window.history.length > 1) router.history.back();
    else navigate({ to: "/home" });
  };

  const digits = phone.replace(/\D/g, "");
  const canSendOtp = digits.length >= 10 && !phoneVerified;
  const canVerify = otpSent && otp.length === 6;

  const sendOtp = () => setOtpSent(true);
  const verifyOtp = () => {
    if (otp.length !== 6) return;
    setPhoneVerified(true);
  };
  const setPhotoFromFile = (f?: File) => {
    if (!f || !f.type.startsWith("image/")) return;
    setPhoto(URL.createObjectURL(f));
  };

  const canContinue = phoneVerified && !!photo;
  const onContinueToPreview = () => {
    setStep("preview");
  };

  const onContinueToCreate = async () => {
    if (!profile) return;
    await supabase.from("users").update({ phone_verified: true, phone, avatar_url: photo, host_verified_at: new Date().toISOString() }).eq("id", profile.id);
    navigate({ to: "/activity/new", search: { edit: undefined } });
  };

  if (step === "preview") {
    return (
      <PhoneFrame>
        <div className="relative flex flex-col min-h-dvh sm:min-h-[calc(100dvh-3rem)]">
          <header className="flex items-center gap-3 px-5 pt-6 pb-3">
            <button
              type="button"
              onClick={() => setStep("form")}
              aria-label="Back"
              className="h-10 w-10 rounded-full bg-secondary border border-border flex items-center justify-center text-muted-foreground active:scale-95"
            >
              <ArrowLeft className="h-5 w-5" strokeWidth={2.2} />
            </button>
            <h1 className="text-[18px] font-semibold text-foreground">Profile Preview</h1>
          </header>
          <main className="flex-1 overflow-y-auto px-5 pb-10 flex flex-col gap-5">
            <section className="flex flex-col items-center pt-2 text-center">
              <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center text-2xl">
                🎉
              </div>
              <h2 className="mt-3 text-[22px] font-semibold text-foreground">You're Ready to Host!</h2>
              <p className="mt-1 text-[13px] text-muted-foreground max-w-[280px]">
                Everything looks good. Here's how participants will see your profile.
              </p>
            </section>

            <section className="rounded-2xl border border-border/80 bg-card p-5 flex flex-col items-center">
              <Avatar name={profile?.name || "Host"} photo={photo} size={80} />
              <h3 className="mt-3 text-[17px] font-semibold text-foreground">{profile?.name || "Host"}</h3>
              <p className="mt-1 text-[12.5px] text-muted-foreground text-center">
                {profile?.graduation_year} · {profile?.hall}
              </p>
            </section>

            <section className="rounded-2xl border border-border/80 bg-card divide-y divide-border/70">
              <PreviewRow label="Hall" value={profile?.hall || ""} />
              <PreviewRow label="Gender" value={profile?.gender || ""} />
              <PreviewRow label="Phone Number" value={phone || profile?.phone || ""} />
              <PreviewRow label="Institute Email" value={profile?.email || ""} />
            </section>

            <div className="flex flex-col gap-2 pt-1">
              <PulseButton onClick={onContinueToCreate}>Continue to Create Activity</PulseButton>
              <Link
                to="/profile/edit"
                className="h-12 rounded-2xl border border-border/80 bg-background text-foreground text-[14px] font-medium inline-flex items-center justify-center active:scale-[0.99]"
              >
                Edit Profile
              </Link>
            </div>
          </main>
        </div>
      </PhoneFrame>
    );
  }

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
          <h1 className="text-[18px] font-semibold text-foreground">Host Profile</h1>
        </header>

        <main className="flex-1 overflow-y-auto px-5 pb-10 flex flex-col gap-5">
          <section>
            <h2 className="text-[22px] font-semibold text-foreground leading-tight">
              Complete Your Host Profile
            </h2>
            <p className="mt-2 text-[13px] text-muted-foreground leading-relaxed">
              Complete these quick steps before hosting your first activity. This helps participants
              recognise and contact you during the meet-up.
            </p>
          </section>

          <section className="flex flex-col gap-3">
            <PulseInput
              label="Phone Number"
              leading="+91"
              inputMode="tel"
              value={phone}
              onChange={(e) => {
                setPhone(e.target.value);
                setPhoneVerified(false);
                setOtpSent(false);
                setOtp("");
              }}
              placeholder="98xxxxxxxx"
              disabled={phoneVerified}
            />
            {!phoneVerified && !otpSent && (
              <PulseButton
                variant="outline"
                disabled={!canSendOtp}
                onClick={sendOtp}
                className="h-12"
              >
                Send OTP
              </PulseButton>
            )}
            {!phoneVerified && otpSent && (
              <div className="flex flex-col gap-2">
                <PulseInput
                  label="Enter OTP"
                  inputMode="numeric"
                  maxLength={6}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  hint="A 6-digit code has been sent to your phone."
                />
                <PulseButton disabled={!canVerify} onClick={verifyOtp} className="h-12">
                  Verify Phone
                </PulseButton>
              </div>
            )}
            {phoneVerified && (
              <div className="inline-flex items-center gap-1.5 text-[12.5px] font-medium text-primary">
                <CheckCircle2 className="h-4 w-4" strokeWidth={2.2} />
                Phone Verified
              </div>
            )}
          </section>

          <section className="flex flex-col gap-3">
            <div>
              <h3 className="text-[15px] font-semibold text-foreground">Profile Photo</h3>
              <p className="mt-1 text-[12.5px] text-muted-foreground">
                Help participants recognise you during the meet-up.
              </p>
            </div>

            {photo && (
              <div className="flex flex-col items-center py-2">
                <Avatar name={profile?.name || "Host"} photo={photo} size={112} />
              </div>
            )}

            <div className="flex flex-col gap-2">
              <button
                type="button"
                onClick={() => galleryRef.current?.click()}
                className="h-12 rounded-2xl border border-border/80 bg-background text-foreground text-[13.5px] font-medium inline-flex items-center justify-center gap-2 active:scale-[0.99]"
              >
                <ImageIcon className="h-4 w-4" strokeWidth={2.2} />
                Upload from Gallery
              </button>
              <button
                type="button"
                onClick={() => cameraRef.current?.click()}
                className="h-12 rounded-2xl border border-border/80 bg-background text-foreground text-[13.5px] font-medium inline-flex items-center justify-center gap-2 active:scale-[0.99]"
              >
                <Camera className="h-4 w-4" strokeWidth={2.2} />
                Take Photo
              </button>
              <input
                ref={galleryRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => setPhotoFromFile(e.target.files?.[0])}
              />
              <input
                ref={cameraRef}
                type="file"
                accept="image/*"
                capture="user"
                className="hidden"
                onChange={(e) => setPhotoFromFile(e.target.files?.[0])}
              />
            </div>
          </section>

          <PulseButton disabled={!canContinue} onClick={onContinueToPreview}>
            Continue
          </PulseButton>
        </main>
      </div>
    </PhoneFrame>
  );
}

function PreviewRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center gap-3 px-4 py-3">
      <span className="text-[12px] font-medium text-muted-foreground uppercase tracking-wide flex-1">
        {label}
      </span>
      <span className="text-[13.5px] text-foreground text-right max-w-[60%] truncate">{value}</span>
    </div>
  );
}