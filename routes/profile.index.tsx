import { createFileRoute, Link, useNavigate, useRouter, redirect } from "@tanstack/react-router";
import { ArrowLeft, Camera, KeyRound } from "lucide-react";
import { useRef, useState, useEffect } from "react";
import { PhoneFrame } from "@/components/pulse/PhoneFrame";
import { PulseInput } from "@/components/pulse/PulseInput";
import { PulseSelect } from "@/components/pulse/PulseSelect";
import { PulseButton } from "@/components/pulse/PulseButton";
import { useProfile, updateProfile } from "@/lib/profile-store";

export const Route = createFileRoute("/profile/")({
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
      { title: "Profile — Pulse" },
      { name: "description", content: "Your Pulse profile and verified campus info." },
      { property: "og:title", content: "Profile — Pulse" },
      { property: "og:description", content: "Your Pulse profile and verified campus info." },
    ],
  }),
  component: ProfilePage,
});

const YEARS = ["1st Year", "2nd Year", "3rd Year", "4th Year", "5th Year", "PG"];
const GENDERS = ["Male", "Female", "Non-binary", "Prefer not to say"];
const HALLS = [
  "RP Hall",
  "LLR Hall",
  "Nehru Hall",
  "Azad Hall",
  "Patel Hall",
  "RK Hall",
  "MMM Hall",
  "SNIG Hall",
  "MS Hall",
  "HJB Hall",
  "VS Hall",
  "BR Hall",
  "SAM Hall",
];

import { useSupabaseProfile } from "@/lib/profile-store";
import { supabase, type SupabaseUserProfile } from "@/lib/supabase";

function ProfilePage() {
  const { profile, loading } = useSupabaseProfile();

  if (loading) {
    return (
      <PhoneFrame>
        <div className="flex-1 flex items-center justify-center min-h-dvh">
          <div className="h-6 w-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      </PhoneFrame>
    );
  }

  return <ProfileForm profile={profile} />;
}

function ProfileForm({ profile }: { profile: SupabaseUserProfile | null }) {
  const [hostedCount, setHostedCount] = useState(0);
  const [joinedCount, setJoinedCount] = useState(0);
  const router = useRouter();
  const navigate = useNavigate();
  const fileRef = useRef<HTMLInputElement>(null);

  const [saving, setSaving] = useState(false);

  const [name, setName] = useState(profile?.name || "");
  const [year, setYear] = useState(profile?.graduation_year || "");
  const [department, setDepartment] = useState("");
  const [hall, setHall] = useState(profile?.hall || "");
  const [gender, setGender] = useState(profile?.gender || "");
  const [photo, setPhoto] = useState(profile?.avatar_url || "");

  const emailLocal = ((profile?.email || "").split("@")[0] || "").trim();
  const [emailUser, setEmailUser] = useState(emailLocal);
  const [phone, setPhone] = useState(profile?.phone || "");

  useEffect(() => {
    if (profile) {
      setName(profile.name || "");
      setYear(profile.graduation_year || "");
      setHall(profile.hall || "");
      setGender(profile.gender || "");
      setPhoto(profile.avatar_url || "");
      setEmailUser(((profile.email || "").split("@")[0] || "").trim());
      setPhone(profile.phone || "");

      const fetchStats = async () => {
        const { count: hCount } = await supabase
          .from("activities")
          .select("*", { count: "exact", head: true })
          .eq("host_id", profile.id);
        
        const { count: jCount } = await supabase
          .from("activity_requests")
          .select("*", { count: "exact", head: true })
          .eq("user_id", profile.id)
          .in("status", ["REQUESTED", "APPROVED"]);

        if (hCount !== null) setHostedCount(hCount);
        if (jCount !== null) setJoinedCount(jCount);
      };
      fetchStats();
    }
  }, [profile]);

  const [emailOtp, setEmailOtp] = useState("");
  const [phoneOtp, setPhoneOtp] = useState("");
  const [emailOtpSent, setEmailOtpSent] = useState(false);
  const [phoneOtpSent, setPhoneOtpSent] = useState(false);

  const emailChanged = emailUser !== emailLocal;
  const phoneChanged = phone !== (profile?.phone || "");

  const goBack = () => {
    if (typeof window !== "undefined" && window.history.length > 1) router.history.back();
    else navigate({ to: "/home" });
  };

  const canSave =
    !!name.trim() &&
    !!year &&
    !!department.trim() &&
    !!hall &&
    !!gender &&
    (!emailChanged || emailOtp.length === 6) &&
    (!phoneChanged || phoneOtp.length === 6);

  const handleSave = async () => {
    if (!profile) return;
    setSaving(true);
    
    let updatedPhone = profile.phone;
    if (phoneChanged && phoneOtp.length === 6) {
      updatedPhone = phone;
    }

    const { error } = await supabase
      .from("users")
      .update({
        name: name.trim(),
        graduation_year: year,
        hall,
        gender,
        avatar_url: photo,
        phone: updatedPhone,
      })
      .eq("id", profile.id);
      
    setSaving(false);
    if (!error) {
      alert("Profile updated successfully!");
    } else {
      alert("Failed to update profile.");
    }
  };

  const onPhoto = (f: File | undefined) => {
    if (!f || !f.type.startsWith("image/")) return;
    setPhoto(URL.createObjectURL(f));
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
          <h1 className="text-[18px] font-semibold text-foreground">Profile</h1>
        </header>

        <main className="flex-1 overflow-y-auto px-5 pb-10 flex flex-col gap-5">
          <section className="flex flex-col items-center pt-1">
            <div className="relative">
              <Avatar name={name || "?"} photo={photo} size={96} />
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                aria-label="Change photo"
                className="absolute -bottom-1 -right-1 h-8 w-8 rounded-full bg-primary text-primary-foreground shadow-green flex items-center justify-center active:scale-95"
              >
                <Camera className="h-4 w-4" strokeWidth={2.2} />
              </button>
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => onPhoto(e.target.files?.[0])}
              />
            </div>
            <p className="mt-3 text-[12.5px] text-muted-foreground">Tap to change photo</p>
          </section>

          <section className="grid grid-cols-2 gap-3">
            <StatCard label="Hosted Activities" value={hostedCount} />
            <StatCard label="Joined Activities" value={joinedCount} />
          </section>

          <section className="flex flex-col gap-3">
            <PulseInput label="Name" value={name} onChange={(e) => setName(e.target.value)} />
            <PulseSelect
              label="Year"
              value={year}
              onChange={(e) => setYear(e.target.value)}
              options={YEARS.map((y) => ({ value: y, label: y }))}
            />
            <PulseInput
              label="Department"
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
            />
            <PulseSelect
              label="Hall"
              value={hall}
              onChange={(e) => setHall(e.target.value)}
              options={HALLS.map((h) => ({ value: h, label: h }))}
            />
            <PulseSelect
              label="Gender"
              value={gender}
              onChange={(e) => setGender(e.target.value)}
              options={GENDERS.map((g) => ({ value: g, label: g }))}
            />
          </section>

          <section className="flex flex-col gap-3">
            <h3 className="text-[13px] font-semibold text-muted-foreground uppercase tracking-wide px-1">
              Contact
            </h3>
            <PulseInput
              label="Institute Email"
              value={emailUser}
              onChange={(e) => {
                setEmailUser(e.target.value.replace(/@.*/, ""));
                setEmailOtpSent(false);
                setEmailOtp("");
              }}
              trailing="@kgpian.iitkgp.ac.in"
            />
            {emailChanged && !emailOtpSent && (
              <button
                type="button"
                onClick={() => setEmailOtpSent(true)}
                className="self-start text-[12.5px] font-medium text-primary underline underline-offset-2"
              >
                Send OTP to verify new email
              </button>
            )}
            {emailChanged && emailOtpSent && (
              <PulseInput
                label="Email OTP"
                inputMode="numeric"
                maxLength={6}
                value={emailOtp}
                onChange={(e) => setEmailOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                hint="Enter the 6-digit code sent to your new email"
              />
            )}

            <PulseInput
              label="Phone Number"
              value={phone}
              onChange={(e) => {
                setPhone(e.target.value);
                setPhoneOtpSent(false);
                setPhoneOtp("");
              }}
              leading="+91"
              inputMode="tel"
              placeholder="98xxxxxxxx"
            />
            {phoneChanged && !phoneOtpSent && phone.replace(/\D/g, "").length >= 10 && (
              <button
                type="button"
                onClick={() => setPhoneOtpSent(true)}
                className="self-start text-[12.5px] font-medium text-primary underline underline-offset-2"
              >
                Send OTP to verify new number
              </button>
            )}
            {phoneChanged && phoneOtpSent && (
              <PulseInput
                label="Phone OTP"
                inputMode="numeric"
                maxLength={6}
                value={phoneOtp}
                onChange={(e) => setPhoneOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                hint="Enter the 6-digit code sent to your new number"
              />
            )}
          </section>

          <Link
            to="/profile/password"
            className="flex items-center gap-3 rounded-2xl border border-border/80 bg-card px-4 py-3.5 active:scale-[0.99]"
          >
            <KeyRound className="h-4 w-4 text-primary" strokeWidth={2.2} />
            <span className="text-[14px] font-medium text-foreground flex-1">Change Password</span>
          </Link>

          <PulseButton onClick={handleSave} disabled={!canSave || saving}>
            {saving ? "Saving..." : "Save Changes"}
          </PulseButton>
        </main>
      </div>
    </PhoneFrame>
  );
}

export function Avatar({ name, photo, size = 40 }: { name: string; photo?: string; size?: number }) {
  const initials = name
    .split(/\s+/)
    .map((s) => s[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
  return (
    <div
      className="rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center overflow-hidden text-primary font-semibold"
      style={{ height: size, width: size, fontSize: size * 0.36 }}
    >
      {photo ? <img src={photo} alt="" className="h-full w-full object-cover" /> : initials || "•"}
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl border border-border/80 bg-card px-4 py-4">
      <div className="text-[24px] font-semibold text-foreground leading-none">{value}</div>
      <div className="mt-1.5 text-[12px] text-muted-foreground">{label}</div>
    </div>
  );
}
