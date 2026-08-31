import { createFileRoute, useNavigate, redirect } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { ArrowRight, Check, Search } from "lucide-react";
import { PhoneFrame, Screen } from "@/components/pulse/PhoneFrame";
import { Logo } from "@/components/pulse/Logo";
import { PulseButton } from "@/components/pulse/PulseButton";
import { PulseInput } from "@/components/pulse/PulseInput";
import { PulseSelect } from "@/components/pulse/PulseSelect";
import { HallCard } from "@/components/pulse/HallCard";
import { SuccessCheck } from "@/components/pulse/SuccessCheck";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { supabase, fetchProfile, isProfileComplete } from "@/lib/supabase";

export const Route = createFileRoute("/")({
  // If the user already has a valid session AND a complete profile, skip onboarding
  beforeLoad: async ({ context }) => {
    const session = context.session;
    if (!session) return; // Not logged in → show onboarding normally

    const profile = await fetchProfile(session.user.id);
    if (isProfileComplete(profile)) {
      // Returning user with complete profile → go straight to home
      throw redirect({ to: "/home" });
    }
    // Logged in but onboarding not done → fall through to show profile/hall steps
  },
  component: Onboarding,
});


type Step = "welcome" | "auth" | "profile" | "hall" | "celebrate";

const EMAIL_DOMAIN = "@kgpian.iitkgp.ac.in";

const HALLS = [
  { name: "RK Hall", gradient: "linear-gradient(135deg,#f2c14e,#c48b26)" },
  { name: "Nehru Hall", gradient: "linear-gradient(135deg,#8ecae6,#2a6f97)" },
  { name: "Patel Hall", gradient: "linear-gradient(135deg,#b7e4c7,#40916c)" },
  { name: "LLR Hall", gradient: "linear-gradient(135deg,#ffb5a7,#e56b6f)" },
  { name: "Azad Hall", gradient: "linear-gradient(135deg,#cdb4db,#7b2cbf)" },
  { name: "SN Hall", gradient: "linear-gradient(135deg,#a2d2ff,#3a86ff)" },
  { name: "MMM Hall", gradient: "linear-gradient(135deg,#ffd6a5,#e07a5f)" },
  { name: "MS Hall", gradient: "linear-gradient(135deg,#caffbf,#38b000)" },
];

// Profile draft shared between ProfileScreen and HallScreen
type ProfileDraft = {
  name: string;
  phone: string;
  gender: string;
  year: string;
};

function Onboarding() {
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>("welcome");
  const [leaving, setLeaving] = useState(false);
  // Shared profile draft — filled in ProfileScreen, saved on HallScreen completion
  const profileDraft = useRef<ProfileDraft>({ name: "", phone: "", gender: "", year: "" });

  const goHome = () => {
    setLeaving(true);
    setTimeout(() => navigate({ to: "/home" }), 1050);
  };

  const handleOnboardingComplete = async (hall: string) => {
    try {
      const draft = profileDraft.current;
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        alert("Authentication error: You are not logged in. If you just signed up, you may need to confirm your email or disable 'Confirm Email' in Supabase settings.");
        // If they can't continue, let them know, but we should probably unmount or just return.
        return;
      }

      const { error } = await supabase
        .from("users")
        .update({
          name: draft.name,
          phone: draft.phone ? `+91${draft.phone}` : null,
          gender: draft.gender,
          graduation_year: draft.year,
          hall,
        })
        .eq("id", user.id);

      if (error) {
        console.error("Failed to save profile:", error);
      }
      setStep("celebrate");
    } catch (err) {
      console.error("Exception in onboarding:", err);
      setStep("celebrate");
    }
  };

  return (
    <PhoneFrame>
      {step === "welcome" ? (
        <WelcomeScreen onNext={() => setStep("auth")} />
      ) : step === "auth" ? (
        <AuthScreen
          onExistingDone={goHome}
          onNewUserDone={() => setStep("profile")}
        />
      ) : step === "profile" ? (
        <ProfileScreen
          onNext={(draft) => {
            profileDraft.current = draft;
            setStep("hall");
          }}
        />
      ) : step === "hall" ? (
        <HallScreen onNext={handleOnboardingComplete} />
      ) : (
        <CelebrateScreen leaving={leaving} onFinish={goHome} />
      )}
    </PhoneFrame>
  );
}

/* ------------------------------ WELCOME ---------------------------------- */

const WELCOME_ITEMS = [
  { emoji: "☕", label: "Chai at Chedi's?" },
  { emoji: "🛺", label: "Anyone Heading to Nalanda?" },
  { emoji: "🚶", label: "Anyone for a 2.2 Walk?" },
  { emoji: "🏸", label: "Badminton This Evening?" },
  { emoji: "📸", label: "Golden Hour Photo Walk" },
  { emoji: "🎮", label: "FIFA Night" },
  { emoji: "🎉", label: "House Party Tonight" },
  { emoji: "✨", label: "…and Many More" },
];

function WelcomeCycler() {
  const [index, setIndex] = useState(0);
  useEffect(() => {
    const t = setInterval(
      () => setIndex((i) => (i + 1) % WELCOME_ITEMS.length),
      1600,
    );
    return () => clearInterval(t);
  }, []);
  const item = WELCOME_ITEMS[index];
  return (
    <div className="relative h-[76px] w-full max-w-[320px] mx-auto">
      <div
        key={index}
        className="absolute inset-0 rounded-2xl bg-background border border-border/70 shadow-lift flex items-center gap-3 px-5 animate-slide-in"
      >
        <span className="text-2xl leading-none">{item.emoji}</span>
        <span className="text-[16px] font-medium text-foreground">
          {item.label}
        </span>
      </div>
    </div>
  );
}

function WelcomeScreen({ onNext }: { onNext: () => void }) {
  return (
    <Screen className="animate-fade-up">
      <div className="pt-1">
        <Logo />
      </div>
      <div className="mt-16 text-center">
        <h1 className="text-[32px] leading-tight font-semibold tracking-tight text-foreground">
          Welcome to <span className="text-primary">Pulse</span>
        </h1>
        <p className="mt-3 text-[15px] text-muted-foreground">
          Make the most of your campus life.
        </p>
      </div>

      <div className="mt-14 flex items-center justify-center">
        <WelcomeCycler />
      </div>

      <div className="mt-14 px-2 text-center">
        <p className="text-[15px] text-foreground/80 leading-relaxed">
          Create plans, join others, and never miss out on what&apos;s
          happening around campus.
        </p>
      </div>

      <div className="mt-auto pt-10">
        <PulseButton onClick={onNext}>
          Get Started
          <ArrowRight className="ml-2 h-4 w-4" />
        </PulseButton>
      </div>
    </Screen>
  );
}

/* ------------------------------- AUTH ------------------------------------ */

type AuthPhase =
  | "username"
  | "checking"
  | "otp"
  | "password-entry"
  | "success";

function AuthScreen({
  onExistingDone,
  onNewUserDone,
}: {
  onExistingDone: () => void;
  onNewUserDone: () => void;
}) {
  const [phase, setPhase] = useState<AuthPhase>("username");
  const [username, setUsername] = useState("");
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isExisting, setIsExisting] = useState(false);

  const fullEmail = username ? username + EMAIL_DOMAIN : "your email";

  useEffect(() => {
    if (phase === "success") {
      const t = setTimeout(() => {
        if (isExisting) onExistingDone();
        else onNewUserDone();
      }, 1200);
      return () => clearTimeout(t);
    }
  }, [phase, isExisting, onExistingDone, onNewUserDone]);

  // ── Step 1: Username entered -> Just go to password screen ──────────────
  const handleContinueUsername = async () => {
    setError(null);
    const trimmed = username.trim().toLowerCase();
    if (!trimmed || trimmed.length < 2) return;
    setPhase("password-entry" as AuthPhase);
  };

  // ── Step 2: Password entered -> Seamless Login / Signup ─────────────────
  const handleForgotPassword = async () => {
    setError(null);
    const email = `${username.trim().toLowerCase()}${EMAIL_DOMAIN}`;
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/profile/password`,
    });
    if (error) {
      setError(error.message);
    } else {
      setError("Password reset email sent. Please check your inbox.");
    }
  };

  const handlePasswordSubmit = async () => {
    if (!password) {
      setError("Enter your password.");
      return;
    }
    setError(null);
    setPhase("checking");

    const email = `${username.trim().toLowerCase()}${EMAIL_DOMAIN}`;

    // 1. Try to log in first
    const { error: loginError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (!loginError) {
      // Login successful
      setIsExisting(true);
      setPhase("success");
      return;
    }

    // 2. If login failed with "Invalid login credentials", it might be a new user. Try sign up.
    const { error: signUpError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (!signUpError) {
      // Sign up successful!
      setPhase("success");
      return;
    }

    // 3. If sign up failed because the user already exists, it means they ARE an existing user
    // who simply typed the wrong password in step 1.
    setPhase("password-entry" as AuthPhase);
    if (signUpError.message.toLowerCase().includes("already registered")) {
      setError("Incorrect password. Please try again.");
    } else {
      // e.g., "Password should be at least 6 characters"
      setError(signUpError.message);
    }
  };

  if (phase === "success") {
    return (
      <Screen className="animate-fade-up">
        <div className="pt-1">
          <Logo />
        </div>
        <div className="flex-1 flex flex-col items-center justify-center gap-6">
          <SuccessCheck />
          <div className="text-center animate-fade-up">
            <p className="text-2xl font-semibold text-foreground">
              You&apos;re in.
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              Getting things ready&hellip;
            </p>
          </div>
        </div>
      </Screen>
    );
  }

  const title =
    phase === "otp"
      ? "Check your mail."
      : phase === "password-entry"
        ? "Enter a password."
        : "Hey there.";

  const subtitle =
    phase === "otp"
      ? `We sent a code to ${fullEmail}.`
      : phase === "password-entry"
        ? "Enter your password to log in or sign up."
        : "Sign in with your institute email.";

  const usernameLocked = phase !== "username" && phase !== "checking";
  const verified = phase === "password-entry";

  return (
    <Screen className="animate-fade-up">
      <div className="pt-1">
        <Logo />
      </div>

      <div className="mt-14">
        <h1 className="text-[34px] leading-[1.05] font-semibold tracking-tight text-foreground">
          {title}
        </h1>
        <p className="mt-3 text-[15px] text-muted-foreground">{subtitle}</p>
      </div>

      <div className="mt-10 flex flex-col gap-4">
        <div className="relative">
          <PulseInput
            name="email"
            type="text"
            label="Institute email"
            placeholder="yourname"
            autoFocus={phase === "username"}
            autoCapitalize="none"
            autoCorrect="off"
            spellCheck={false}
            value={username}
            disabled={usernameLocked}
            onChange={(e) =>
              setUsername(
                e.target.value
                  .replace(/@.*$/, "")
                  .replace(/\s+/g, "")
                  .toLowerCase(),
              )
            }
            trailing={
              verified ? (
                <span className="flex items-center gap-1 text-primary">
                  {EMAIL_DOMAIN}
                  <span className="h-5 w-5 rounded-full bg-primary text-primary-foreground flex items-center justify-center animate-pop">
                    <Check className="h-3 w-3" strokeWidth={3} />
                  </span>
                </span>
              ) : (
                EMAIL_DOMAIN
              )
            }
          />
        </div>

        {phase === "otp" && (
          <div className="flex flex-col items-center gap-3 animate-fade-up">
            <InputOTP
              maxLength={6}
              value={otp}
              onChange={setOtp}
              containerClassName="justify-center"
            >
              <InputOTPGroup className="gap-2">
                {[0, 1, 2, 3, 4, 5].map((i) => (
                  <InputOTPSlot
                    key={i}
                    index={i}
                    className="h-14 w-11 rounded-xl border-border bg-secondary/60 text-lg data-[active=true]:border-primary data-[active=true]:ring-primary/30"
                  />
                ))}
              </InputOTPGroup>
            </InputOTP>
            <button
              type="button"
              onClick={() => {
                setOtp("");
                setPhase("username");
              }}
              className="text-xs text-muted-foreground hover:text-foreground mt-2"
            >
              Use a different email
            </button>
          </div>
        )}

        {phase === "password-entry" && (
          <form 
            className="flex flex-col gap-3 animate-fade-up"
            onSubmit={(e) => {
              e.preventDefault();
              if (password.length > 0) handlePasswordSubmit();
            }}
          >
            <PulseInput
              name="password"
              type="password"
              label="Password"
              placeholder="Your password"
              autoFocus
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setError(null);
              }}
            />
            <button
              type="button"
              onClick={handleForgotPassword}
              className="text-xs text-muted-foreground hover:text-foreground text-left mt-1"
            >
              Forgot password?
            </button>
            {/* Hidden submit button to allow Enter key submission */}
            <button type="submit" className="hidden" />
          </form>
        )}

        {error && (
          <p className="text-[12.5px] text-destructive pl-1">{error}</p>
        )}
      </div>

      <div className="mt-auto pt-8">
        <PulseButton
          disabled={
            phase === "checking" ||
            (phase === "username" && username.trim().length < 2) ||
            (phase === "otp" && otp.length < 6) ||
            (phase === "password-entry" && password.length === 0)
          }
          onClick={() => {
            if (phase === "username") handleContinueUsername();
            else if (phase === "password-entry") handlePasswordSubmit();
          }}
        >
          {phase === "checking"
            ? "Checking…"
            : phase === "otp"
              ? "Verify"
              : "Continue"}
          <ArrowRight className="ml-2 h-4 w-4" />
        </PulseButton>
        <p className="mt-4 text-center text-[11px] text-muted-foreground">
          By continuing you agree to our community guidelines.
        </p>
      </div>
    </Screen>
  );
}

/* ------------------------------- PROFILE --------------------------------- */

function ProfileScreen({ onNext }: { onNext: (draft: ProfileDraft) => void }) {
  const [form, setForm] = useState<ProfileDraft>({
    name: "",
    phone: "",
    gender: "",
    year: "",
  });
  const valid =
    form.name.trim() && form.phone.trim() && form.gender && form.year;

  return (
    <Screen className="animate-fade-up">
      <div className="pt-1 flex items-center justify-between">
        <Logo />
        <StepDots current={1} total={3} />
      </div>
      <div className="mt-12">
        <h1 className="text-[30px] leading-tight font-semibold tracking-tight text-foreground">
          A little about you.
        </h1>
        <p className="mt-2 text-[14.5px] text-muted-foreground">
          Just the basics.
        </p>
      </div>

      <div className="mt-10 flex flex-col gap-5">
        <PulseInput
          label="Full name"
          placeholder="Aarav Sharma"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
        />
        <PulseInput
          label="Phone number"
          type="tel"
          placeholder="98765 43210"
          leading={<span>+91</span>}
          value={form.phone}
          onChange={(e) => setForm({ ...form, phone: e.target.value })}
        />
        <div className="grid grid-cols-2 gap-3">
          <PulseSelect
            label="Gender"
            placeholder="Select"
            value={form.gender}
            onChange={(e) => setForm({ ...form, gender: e.target.value })}
            options={[
              { value: "female", label: "Female" },
              { value: "male", label: "Male" },
              { value: "nonbinary", label: "Non-binary" },
              { value: "prefer_not", label: "Prefer not to say" },
            ]}
          />
          <PulseSelect
            label="Graduation"
            placeholder="Year"
            value={form.year}
            onChange={(e) => setForm({ ...form, year: e.target.value })}
            options={["2026", "2027", "2028", "2029", "2030"].map((y) => ({
              value: y,
              label: y,
            }))}
          />
        </div>
      </div>

      <div className="mt-auto pt-8">
        <PulseButton disabled={!valid} onClick={() => onNext(form)}>
          Continue
          <ArrowRight className="ml-2 h-4 w-4" />
        </PulseButton>
      </div>
    </Screen>
  );
}

/* --------------------------------- HALL ---------------------------------- */

function HallScreen({ onNext }: { onNext: (hall: string) => Promise<void> }) {
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const filtered = HALLS.filter((h) =>
    h.name.toLowerCase().includes(query.toLowerCase()),
  );

  const handleContinue = async () => {
    if (!selected) return;
    setSaving(true);
    try {
      await onNext(selected);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Screen className="animate-fade-up">
      <div className="pt-1 flex items-center justify-between">
        <Logo />
        <StepDots current={2} total={3} />
      </div>

      <div className="mt-12">
        <h1 className="text-[30px] leading-tight font-semibold tracking-tight text-foreground">
          Which hall do you call home?
        </h1>
        <p className="mt-2 text-[14.5px] text-muted-foreground">
          Pick your hall.
        </p>
      </div>

      <div className="mt-6">
        <div className="flex items-center gap-2 rounded-full bg-secondary/70 h-11 px-4 focus-within:bg-background focus-within:shadow-soft focus-within:ring-1 focus-within:ring-border transition-all">
          <Search className="h-4 w-4 text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search halls"
            className="flex-1 bg-transparent outline-none text-[14px] text-foreground placeholder:text-muted-foreground/60"
          />
        </div>
      </div>

      <div className="mt-8 -mx-6">
        <div
          ref={scrollRef}
          className="flex gap-5 overflow-x-auto px-6 pb-6 snap-x snap-mandatory scrollbar-none"
        >
          {filtered.map((h) => (
            <div key={h.name} className="snap-start">
              <HallCard
                name={h.name}
                gradient={h.gradient}
                selected={selected === h.name}
                onClick={() => setSelected(h.name)}
              />
            </div>
          ))}
        </div>
      </div>

      <div className="mt-auto pt-8">
        <PulseButton disabled={!selected || saving} onClick={handleContinue}>
          {saving ? "Saving…" : "Continue"}
          <ArrowRight className="ml-2 h-4 w-4" />
        </PulseButton>
      </div>
    </Screen>
  );
}

/* ------------------------------ CELEBRATE -------------------------------- */

function CelebrateScreen({
  onFinish,
  leaving,
}: {
  onFinish: () => void;
  leaving: boolean;
}) {
  return (
    <Screen className="animate-fade-up">
      <div className="pt-1 flex items-center justify-between">
        <Logo className={leaving ? "animate-heartbeat inline-block" : undefined} />
        <StepDots current={3} total={3} />
      </div>

      <div className="flex-1 flex flex-col items-center justify-center translate-y-6 px-2">
        <div className="text-center">
          <h1 className="text-[30px] leading-tight font-semibold tracking-tight text-foreground">
            You&apos;re now part of <span className="text-primary">Pulse</span>.
          </h1>
          <p className="mt-3 text-[15px] text-muted-foreground">
            Host, participate, and live your campus life to the fullest.
          </p>
        </div>

        <div className="mt-16">
          <PulseButton onClick={onFinish} disabled={leaving}>
            Enter Pulse
            <ArrowRight className="ml-2 h-4 w-4" />
          </PulseButton>
        </div>
      </div>
    </Screen>
  );
}

/* --------------------------------- utils --------------------------------- */

function StepDots({ current, total }: { current: number; total: number }) {
  return (
    <div className="flex items-center gap-1.5">
      {Array.from({ length: total }).map((_, i) => (
        <span
          key={i}
          className={
            "h-1.5 rounded-full transition-all " +
            (i === current ? "w-6 bg-primary" : "w-1.5 bg-border")
          }
        />
      ))}
    </div>
  );
}
