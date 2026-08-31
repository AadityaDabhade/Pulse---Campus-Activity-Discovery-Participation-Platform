import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ChevronLeft } from "lucide-react";
import { PhoneFrame } from "@/components/pulse/PhoneFrame";
import { FileAttachList } from "@/components/pulse/FileAttachList";
import { cn } from "@/lib/utils";
import { CATEGORIES, type ActivityType } from "@/lib/discover-data";
import type { StoredDoc } from "@/components/pulse/FileAttachList";
import { supabase } from "@/lib/supabase";

export const Route = createFileRoute("/activity/new")({
  validateSearch: (s: Record<string, unknown>) => ({
    edit: typeof s.edit === "string" ? s.edit : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Host an Activity — Pulse" },
      { name: "description", content: "Plan and host a new campus activity on Pulse." },
      { property: "og:title", content: "Host an Activity — Pulse" },
      { property: "og:description", content: "Plan and host a new campus activity on Pulse." },
    ],
  }),
  component: NewActivity,
});

function formatDate(d: string) {
  const dt = new Date(d);
  if (Number.isNaN(dt.getTime())) return d;
  return dt.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" });
}
function formatTime(t: string) {
  const [hs, ms] = t.split(":");
  const h = parseInt(hs, 10);
  const m = parseInt(ms, 10);
  if (Number.isNaN(h) || Number.isNaN(m)) return t;
  const p = h >= 12 ? "PM" : "AM";
  const hh = ((h + 11) % 12) + 1;
  return `${hh}:${m.toString().padStart(2, "0")} ${p}`;
}

const inputClass =
  "w-full h-11 rounded-2xl border border-border/80 bg-card px-3.5 text-[13.5px] outline-none focus:border-primary/50";

function NewActivity() {
  const navigate = useNavigate();
  const { edit } = Route.useSearch();
  const editing = !!edit;
  const [showPicker, setShowPicker] = useState(false);
  const [type, setType] = useState<ActivityType | null>(null);
  const [about, setAbout] = useState("");
  const [activityLocation, setActivityLocation] = useState("");
  const [meetupPoint, setMeetupPoint] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [gender, setGender] = useState("Everyone");
  const [eligibility, setEligibility] = useState<string[]>(["Everyone"]);
  const [participants, setParticipants] = useState<string>("");
  const [cost, setCost] = useState("");
  const [chatEnabled, setChatEnabled] = useState(true);
  const [docs, setDocs] = useState<StoredDoc[]>([]);
  const [sheet, setSheet] = useState(false);
  const [acceptUntil, setAcceptUntil] = useState("");
  const [acceptUntilDate, setAcceptUntilDate] = useState("");
  const [saving, setSaving] = useState(false);

  const participantsNum = parseInt(participants, 10);
  const canProceed = !!type && !!date && !!time && !!activityLocation && !!gender && eligibility.length > 0 && Number.isFinite(participantsNum) && participantsNum >= 1;
  void gender;

  useEffect(() => {
    if (!edit) return;
    async function load() {
      const { data: a, error } = await supabase.from('activities').select('*').eq('id', edit).single();
      if (error || !a) return;
      
      const categoryObj = CATEGORIES.find(c => c.types.some(t => t.slug === a.subcategory));
      const typeObj = categoryObj?.types.find(t => t.slug === a.subcategory);
      
      setType({ slug: a.subcategory, name: a.title, emoji: typeObj?.emoji || '📍' });
      setAbout(a.about ?? "");
      setActivityLocation(a.activity_location ?? "");
      setMeetupPoint(a.meetup_point ?? "");
      
      const startsAt = new Date(a.starts_at);
      setDate(startsAt.toISOString().split('T')[0]);
      setTime(startsAt.toTimeString().split(' ')[0].substring(0, 5));
      
      let mappedGender = "Everyone";
      if (a.gender === "Male") mappedGender = "Men";
      if (a.gender === "Female") mappedGender = "Women";
      setGender(mappedGender);
      
      setEligibility(a.eligibility_tags && a.eligibility_tags.length ? a.eligibility_tags : ["Everyone"]);
      setParticipants(String(Math.max(1, a.max_participants ?? 1)));
      setCost(a.estimated_cost ? String(a.estimated_cost) : "");
      setChatEnabled(a.chat_enabled !== false);
      setDocs([]); // Documents skipped for now
      
      if (a.accept_requests_until) {
        const acceptAt = new Date(a.accept_requests_until);
        setAcceptUntilDate(acceptAt.toISOString().split('T')[0]);
        setAcceptUntil(acceptAt.toTimeString().split(' ')[0].substring(0, 5));
      }
    }
    load();
  }, [edit]);

  const host = async () => {
    if (!type) return;
    setSaving(true);
    
    let starts_at = new Date().toISOString();
    if (date && time) {
      starts_at = new Date(`${date}T${time}:00`).toISOString();
    }
    
    let accept_requests_until = null;
    if (acceptUntil) {
      const d = acceptUntilDate || date || new Date().toISOString().split('T')[0];
      accept_requests_until = new Date(`${d}T${acceptUntil}:00`).toISOString();
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      alert("You must be logged in to host an activity.");
      setSaving(false);
      return;
    }

    const categoryStr = CATEGORIES.find(c => c.types.some(t => t.slug === type.slug))?.title || "Other";
    let dbGender = "Any";
    if (gender === "Men") dbGender = "Male";
    else if (gender === "Women") dbGender = "Female";

    const payload = {
      host_id: user.id,
      category: categoryStr,
      subcategory: type.slug,
      title: type.name,
      about: about || null,
      starts_at,
      meetup_point: meetupPoint || activityLocation || "",
      activity_location: activityLocation || null,
      max_participants: participantsNum,
      gender: dbGender,
      eligibility_tags: eligibility.length ? eligibility : null,
      estimated_cost: cost ? parseInt(cost, 10) : null,
      chat_enabled: chatEnabled,
      accept_requests_until,
      status: "UPCOMING"
    };

    if (editing && edit) {
      const { error } = await supabase.from('activities').update(payload).eq('id', edit);
      if (error) console.error("Error updating activity:", error);
    } else {
      const { error } = await supabase.from('activities').insert(payload);
      if (error) console.error("Error creating activity:", error);
    }
    
    setSaving(false);
    navigate({ to: "/activity" });
  };

  return (
    <PhoneFrame>
      <div className="relative flex flex-col min-h-dvh sm:min-h-[calc(100dvh-3rem)] bg-background">
        <header className="flex items-center gap-3 px-5 pt-6 pb-3">
          <button
            type="button"
            onClick={() => navigate({ to: "/activity" })}
            aria-label="Back"
            className="h-10 w-10 rounded-full bg-secondary border border-border shadow-soft flex items-center justify-center text-muted-foreground active:scale-95"
          >
            <ChevronLeft className="h-5 w-5" strokeWidth={2.2} />
          </button>
          <div className="min-w-0">
            <h1 className="text-[20px] font-semibold text-foreground leading-tight">
              {editing ? "Edit Activity" : "Host an Activity"}
            </h1>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto px-5 pb-28 flex flex-col gap-5">
          <Field label="What are you planning?">
            <button
              type="button"
              onClick={() => setShowPicker(true)}
              className="w-full h-14 rounded-2xl border border-border/80 bg-card px-4 flex items-center gap-3 text-left hover:border-primary/40 transition-colors active:scale-[0.99]"
            >
              {type ? (
                <>
                  <span className="text-2xl" aria-hidden>{type.emoji}</span>
                  <span className="text-[14px] font-medium text-foreground flex-1">{type.name}</span>
                </>
              ) : (
                <span className="text-[13.5px] text-muted-foreground flex-1">Pick an activity type</span>
              )}
            </button>
          </Field>

          <Field label="About this activity">
            <textarea
              value={about}
              onChange={(e) => setAbout(e.target.value)}
              rows={3}
              placeholder="A short description"
              className="w-full rounded-2xl border border-border/80 bg-card px-3.5 py-2.5 text-[13.5px] outline-none focus:border-primary/50"
            />
          </Field>

          <Field label="Activity location">
            <Input value={activityLocation} onChange={setActivityLocation} placeholder="Where will it happen?" />
          </Field>
          <Field label="Meet-up point (optional)">
            <Input value={meetupPoint} onChange={setMeetupPoint} placeholder="Where should people meet?" />
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Date">
              <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className={inputClass} />
            </Field>
            <Field label="Time">
              <input type="time" value={time} onChange={(e) => setTime(e.target.value)} className={inputClass} />
            </Field>
          </div>

          <div className="flex flex-col gap-3">
            <p className="text-[13px] font-semibold text-foreground">Who's invited</p>
            <Field label="Gender">
              <div className="flex gap-2 flex-wrap">
                {["Everyone", "Men", "Women"].map((g) => (
                  <Chip key={g} active={gender === g} onClick={() => setGender(g)}>{g}</Chip>
                ))}
              </div>
            </Field>
            <Field label="Eligibility">
              <div className="flex gap-2 flex-wrap">
                {["Everyone", "Freshers", "2nd Year", "3rd Year", "4th Year", "PG"].map((g) => (
                  <Chip
                    key={g}
                    active={eligibility.includes(g)}
                    onClick={() =>
                      setEligibility((e) =>
                        e.includes(g) ? e.filter((x) => x !== g) : [...e, g],
                      )
                    }
                  >
                    {g}
                  </Chip>
                ))}
              </div>
            </Field>
            <Field label="Participants">
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                min={1}
                max={99}
                value={participants}
                onChange={(e) => {
                  const digits = e.target.value.replace(/\D/g, "").replace(/^0+/, "");
                  setParticipants(digits);
                }}
                placeholder="e.g. 6"
                className={inputClass}
              />
            </Field>
          </div>

          <Field label="Estimated cost per person (optional)">
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[13.5px] text-muted-foreground">₹</span>
              <input
                type="number"
                value={cost}
                onChange={(e) => setCost(e.target.value)}
                className={cn(inputClass, "pl-7")}
                placeholder="0"
              />
            </div>
          </Field>

          <div className="flex items-center justify-between rounded-2xl border border-border/80 bg-card px-4 py-3">
            <div>
              <p className="text-[13.5px] font-medium text-foreground">Activity chat</p>
              <p className="text-[11.5px] text-muted-foreground">Let joined members chat.</p>
            </div>
            <button
              type="button"
              onClick={() => setChatEnabled((v) => !v)}
              aria-pressed={chatEnabled}
              className={cn(
                "relative h-6 w-11 rounded-full transition-colors",
                chatEnabled ? "bg-primary" : "bg-border",
              )}
            >
              <span
                className={cn(
                  "absolute top-0.5 h-5 w-5 rounded-full bg-background transition-transform",
                  chatEnabled ? "translate-x-5" : "translate-x-0.5",
                )}
              />
            </button>
          </div>

          <Field label="Documents & materials">
            <p className="text-[12.5px] text-muted-foreground">
              You can upload documents and materials for your activity after it has been created, from the "Manage Activity" page.
            </p>
          </Field>

          {editing && (
            <Field label="Accept join requests until">
              <input
                type="time"
                value={acceptUntil}
                onChange={(e) => setAcceptUntil(e.target.value)}
                className={inputClass}
              />
              <span className="text-[11.5px] text-muted-foreground mt-1">
                Requests received after this time won't be accepted.
              </span>
            </Field>
          )}
        </main>

        <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[440px] px-5 pb-[max(1rem,env(safe-area-inset-bottom))] pt-3 bg-gradient-to-t from-background via-background to-transparent">
          <button
            type="button"
            disabled={!canProceed}
            onClick={() => (editing ? host() : setSheet(true))}
            className={cn(
              "w-full h-11 rounded-2xl text-[13.5px] font-semibold transition-all",
              canProceed
                ? "bg-primary text-primary-foreground shadow-green active:scale-[0.98]"
                : "bg-secondary text-muted-foreground",
            )}
          >
            {editing ? "Save Changes" : "Proceed"}
          </button>
        </div>

        {showPicker && (
          <TypePicker
            onPick={(t) => {
              setType(t);
              setShowPicker(false);
            }}
            onClose={() => setShowPicker(false)}
          />
        )}

        {!editing && (
          <ProceedSheet
            open={sheet}
            onClose={() => setSheet(false)}
            acceptUntil={acceptUntil}
            setAcceptUntil={setAcceptUntil}
            acceptUntilDate={acceptUntilDate}
            setAcceptUntilDate={setAcceptUntilDate}
            activityDate={date}
            onHost={() => {
              setSheet(false);
              host();
            }}
            saving={saving}
          />
        )}
      </div>
    </PhoneFrame>
  );
}

function Input({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className={inputClass}
    />
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-[14px] font-semibold text-foreground">{label}</span>
      {children}
    </label>
  );
}

function Chip({ active, onClick, children }: { active?: boolean; onClick?: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "h-8 px-3.5 rounded-full text-[12.5px] font-medium border transition-colors",
        active
          ? "bg-primary/10 border-primary/30 text-primary"
          : "bg-background border-border/80 text-muted-foreground hover:text-foreground",
      )}
    >
      {children}
    </button>
  );
}

function TypePicker({ onPick, onClose }: { onPick: (t: ActivityType) => void; onClose: () => void }) {
  useEffect(() => {
    const k = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", k);
    return () => window.removeEventListener("keydown", k);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50">
      <button
        type="button"
        aria-label="Close"
        onClick={onClose}
        className="absolute inset-0 bg-foreground/30 backdrop-blur-[1px]"
      />
      <div
        role="dialog"
        aria-modal="true"
        className="absolute left-1/2 -translate-x-1/2 bottom-0 w-full max-w-[440px] max-h-[92dvh] rounded-t-3xl bg-background border-t border-x border-border shadow-lift flex flex-col animate-in slide-in-from-bottom duration-300"
      >
        <div className="mx-auto h-1.5 w-10 rounded-full bg-border mt-3 mb-1 shrink-0" aria-hidden />
        <header className="flex items-center justify-between px-5 pt-2 pb-3 shrink-0">
          <h2 className="text-[18px] font-semibold text-primary">Pick an activity</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="h-9 w-9 rounded-full bg-secondary border border-border flex items-center justify-center text-muted-foreground active:scale-95"
          >
            <ChevronLeft className="h-4 w-4" strokeWidth={2.2} />
          </button>
        </header>
        <div className="flex-1 overflow-y-auto px-5 pt-1 pb-[max(1.25rem,env(safe-area-inset-bottom))] flex flex-col gap-3.5">
          {CATEGORIES.map((c) => (
            <div key={c.title}>
              <div className="flex items-center gap-2 mb-2">
                <span className="w-1.5 h-1.5 rounded-full bg-primary" aria-hidden />
                <p className="text-[14px] font-semibold text-foreground">
                  {c.title}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                {c.types.map((t) => (
                  <button
                    key={t.slug}
                    type="button"
                    onClick={() => onPick(t)}
                    className="h-7 px-3 rounded-full border border-primary/20 bg-primary/5 text-[12px] font-medium text-foreground hover:border-primary/40 hover:bg-primary/10 hover:text-primary transition-colors active:scale-95"
                  >
                    {t.name}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ProceedSheet({
  open,
  onClose,
  acceptUntil,
  setAcceptUntil,
  acceptUntilDate,
  setAcceptUntilDate,
  activityDate,
  onHost,
  saving,
}: {
  open: boolean;
  onClose: () => void;
  acceptUntil: string;
  setAcceptUntil: (v: string) => void;
  acceptUntilDate: string;
  setAcceptUntilDate: (v: string) => void;
  activityDate: string;
  onHost: () => void;
  saving: boolean;
}) {
  useEffect(() => {
    if (!open) return;
    const k = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", k);
    return () => window.removeEventListener("keydown", k);
  }, [open, onClose]);

  return (
    <div
      className={cn(
        "fixed inset-0 z-50 transition-opacity duration-200",
        open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none",
      )}
      aria-hidden={!open}
    >
      <button
        type="button"
        aria-label="Close"
        onClick={onClose}
        className="absolute inset-0 bg-foreground/30 backdrop-blur-[1px]"
      />
      <div
        className={cn(
          "absolute left-1/2 -translate-x-1/2 bottom-0 w-full max-w-[440px]",
          "rounded-t-3xl bg-background border-t border-x border-border shadow-lift",
          "px-6 pt-3 pb-[max(1.5rem,env(safe-area-inset-bottom))]",
          "transition-transform duration-300 ease-out",
          open ? "translate-y-0" : "translate-y-full",
        )}
      >
        <div className="mx-auto h-1.5 w-10 rounded-full bg-border mb-4" aria-hidden />
        <h2 className="text-[17px] font-semibold text-foreground text-center">Accept join requests until</h2>
        <p className="mt-1 text-center text-[12.5px] text-muted-foreground">
          Requests received after this time won't be accepted.
        </p>
        <div className="mt-4 flex justify-center gap-3">
          <input
            type="date"
            value={acceptUntilDate || activityDate}
            max={activityDate}
            onChange={(e) => setAcceptUntilDate(e.target.value)}
            className="h-14 rounded-2xl border border-border/80 bg-card px-4 text-[15px] font-medium text-foreground outline-none focus:border-primary/50 text-center"
          />
          <input
            type="time"
            value={acceptUntil}
            onChange={(e) => setAcceptUntil(e.target.value)}
            className="h-14 rounded-2xl border border-border/80 bg-card px-4 text-[16px] font-medium text-foreground outline-none focus:border-primary/50 text-center"
          />
        </div>
        <button
          type="button"
          onClick={onHost}
          disabled={saving}
          className="mt-5 w-full h-11 rounded-2xl bg-primary text-primary-foreground text-[14px] font-semibold shadow-green active:scale-[0.98] disabled:opacity-70"
        >
          {saving ? "Saving…" : "Host Activity"}
        </button>
      </div>
    </div>
  );
}