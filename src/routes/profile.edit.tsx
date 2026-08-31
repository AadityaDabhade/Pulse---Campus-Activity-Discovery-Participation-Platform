import { createFileRoute, useNavigate, useRouter } from "@tanstack/react-router";
import { useRef, useState } from "react";
import { ArrowLeft, Camera } from "lucide-react";
import { PhoneFrame } from "@/components/pulse/PhoneFrame";
import { PulseInput } from "@/components/pulse/PulseInput";
import { PulseSelect } from "@/components/pulse/PulseSelect";
import { PulseButton } from "@/components/pulse/PulseButton";
import { Avatar } from "./profile.index";
import { useProfile, updateProfile } from "@/lib/profile-store";

export const Route = createFileRoute("/profile/edit")({
  head: () => ({
    meta: [
      { title: "Edit Profile — Pulse" },
      { name: "description", content: "Update your Pulse profile details." },
      { property: "og:title", content: "Edit Profile — Pulse" },
      { property: "og:description", content: "Update your Pulse profile details." },
    ],
  }),
  component: EditProfile,
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

function EditProfile() {
  const p = useProfile();
  const navigate = useNavigate();
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);

  const [name, setName] = useState(p.name);
  const [year, setYear] = useState(p.year);
  const [department, setDepartment] = useState(p.department);
  const [hall, setHall] = useState(p.hall);
  const [gender, setGender] = useState(p.gender);
  const [photo, setPhoto] = useState(p.photo);

  const emailLocal = (p.email.split("@")[0] || "").trim();
  const [emailUser, setEmailUser] = useState(emailLocal);
  const [phone, setPhone] = useState(p.phone);

  const [emailOtp, setEmailOtp] = useState("");
  const [phoneOtp, setPhoneOtp] = useState("");
  const [emailOtpSent, setEmailOtpSent] = useState(false);
  const [phoneOtpSent, setPhoneOtpSent] = useState(false);

  const emailChanged = emailUser !== emailLocal;
  const phoneChanged = phone !== p.phone;

  const goBack = () => {
    if (typeof window !== "undefined" && window.history.length > 1) router.history.back();
    else navigate({ to: "/profile" });
  };

  const canSave =
    name.trim() &&
    year &&
    department.trim() &&
    hall &&
    gender &&
    (!emailChanged || emailOtp.length === 6) &&
    (!phoneChanged || phoneOtp.length === 6);

  const handleSave = () => {
    const patch: Partial<typeof p> = {
      name: name.trim(),
      year,
      department: department.trim(),
      hall,
      gender,
      photo,
    };
    if (emailChanged && emailOtp.length === 6) {
      patch.email = `${emailUser}@kgpian.iitkgp.ac.in`;
      patch.emailVerified = true;
    }
    if (phoneChanged && phoneOtp.length === 6) {
      patch.phone = phone;
      patch.phoneVerified = true;
    }
    updateProfile(patch);
    goBack();
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
          <h1 className="text-[18px] font-semibold text-foreground">Edit Profile</h1>
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

          <PulseButton onClick={handleSave} disabled={!canSave}>
            Save Changes
          </PulseButton>
        </main>
      </div>
    </PhoneFrame>
  );
}