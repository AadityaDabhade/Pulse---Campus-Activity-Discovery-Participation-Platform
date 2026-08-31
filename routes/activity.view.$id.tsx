import { createFileRoute, Link, useNavigate, useRouter } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  ChevronLeft,
  Bell,
  Calendar,
  Clock,
  MapPin,
  Users,
  Wallet,
  GraduationCap,
  Phone,
} from "lucide-react";
import { PhoneFrame } from "@/components/pulse/PhoneFrame";
import { FileAttachList } from "@/components/pulse/FileAttachList";
import { ActivityChat } from "@/components/pulse/ActivityChat";
import { LeaveActivityDialog } from "@/components/pulse/LeaveActivityDialog";
import { PhotoGallery } from "@/components/pulse/PhotoGallery";
import { ParticipantsSheet } from "@/components/pulse/ParticipantsSheet";
import { ChevronRight } from "lucide-react";
import { supabase } from "@/lib/supabase";

export const Route = createFileRoute("/activity/view/$id")({
  head: () => ({
    meta: [
      { title: "Activity — Pulse" },
      { name: "description", content: "View activity details, chat with the group, and manage your participation." },
    ],
  }),
  component: ParticipantView,
});

function ParticipantView() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const router = useRouter();
  const goBack = () => {
    if (window.history.length > 1) router.history.back();
    else navigate({ to: "/activity" });
  };
  
  const [a, setA] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [leaveOpen, setLeaveOpen] = useState(false);
  const [pSheet, setPSheet] = useState(false);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const { data, error } = await supabase
        .from('activities')
        .select('*, host:users(*)')
        .eq('id', id)
        .single();
      
      if (!error && data) {
        setA(data);
      }
      setLoading(false);
    }
    load();
  }, [id]);

  if (loading) {
    return (
      <PhoneFrame>
        <div className="min-h-dvh flex items-center justify-center">
          <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      </PhoneFrame>
    );
  }

  if (!a) {
    return (
      <PhoneFrame>
        <div className="min-h-dvh flex flex-col items-center justify-center gap-3 px-6">
          <p className="text-[14px] text-muted-foreground">Activity not found.</p>
          <Link to="/activity" className="text-[13px] font-medium text-primary underline underline-offset-2">
            Back to Activity Hub
          </Link>
        </div>
      </PhoneFrame>
    );
  }

  const completed = a.status === "COMPLETED";
  const activeParticipants = []; // TODO: fetch actual participants if needed

  const onLeave = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await supabase.from('activity_requests').update({ status: 'LEFT' }).match({ activity_id: a.id, user_id: user.id });
    }
    setLeaveOpen(false);
    navigate({ to: "/activity" });
  };

  return (
    <PhoneFrame>
      <div className="relative flex flex-col min-h-dvh sm:min-h-[calc(100dvh-3rem)]">
        <Header title={a.title} id={a.id} onBack={goBack} live={a.status === "ONGOING"} />
        <main className="flex-1 overflow-y-auto px-5 pb-16 pt-2 flex flex-col gap-5">
          <Section title="About this activity">
            <p className="text-[13.5px] text-foreground leading-relaxed">
              {a.about || "Join us for a laid-back campus meet-up."}
            </p>
          </Section>

          <Section title="Activity details">
            <Details a={a} />
          </Section>

          {a.documents.length > 0 && (
            <Section title="Documents & materials">
              <FileAttachList docs={a.documents} readOnly />
            </Section>
          )}

          {a.chatEnabled !== false && (
            <Section title="Activity chat">
              <ActivityChat readOnly={completed} />
            </Section>
          )}

          {completed && a.photos.length > 0 && (
            <Section title="Activity gallery">
              <PhotoGallery photos={a.photos} />
            </Section>
          )}

          <Section title="Hosted by">
            <HostCard host={a.hostProfile} />
          </Section>

          <Section title="Participants">
              <button
                type="button"
                onClick={() => setPSheet(true)}
                className="w-full rounded-2xl border border-border/80 bg-card px-4 py-3 flex items-center gap-3 active:scale-[0.99]"
              >
                <Users className="h-4 w-4 text-muted-foreground" strokeWidth={2.2} />
                <span className="text-[13px] font-medium text-foreground flex-1 text-left">
                  {activeParticipants.length} Participant{activeParticipants.length === 1 ? "" : "s"}
                </span>
                <ChevronRight className="h-4 w-4 text-muted-foreground" strokeWidth={2.2} />
              </button>
          </Section>

          {completed ? (
            <Section title="Did you enjoy this activity?">
              <div className="flex items-center justify-center gap-4">
                <button type="button" className="h-12 w-12 rounded-2xl border border-border/80 bg-card text-2xl active:scale-95">👍</button>
                <button type="button" className="h-12 w-12 rounded-2xl border border-border/80 bg-card text-2xl active:scale-95">👎</button>
              </div>
            </Section>
          ) : (
            <div className="pt-2 flex justify-center">
              <button
                type="button"
                onClick={() => setLeaveOpen(true)}
                className="text-[12px] font-medium text-muted-foreground underline underline-offset-2 hover:text-destructive"
              >
                Leave activity
              </button>
            </div>
          )}
        </main>
        <LeaveActivityDialog open={leaveOpen} onClose={() => setLeaveOpen(false)} onConfirm={onLeave} />
        <ParticipantsSheet
          open={pSheet}
          onClose={() => setPSheet(false)}
          participants={[]} // TODO: Fetch from activity_requests
        />
      </div>
    </PhoneFrame>
  );
}

export function Header({ title, id, onBack, live }: { title: string; id: string; onBack: () => void; live?: boolean }) {
  return (
    <header className="flex items-center gap-3 px-5 pt-6 pb-3">
      <button
        type="button"
        onClick={onBack}
        aria-label="Back"
        className="h-10 w-10 rounded-full bg-secondary border border-border shadow-soft flex items-center justify-center text-muted-foreground active:scale-95"
      >
        <ChevronLeft className="h-5 w-5" strokeWidth={2.2} />
      </button>
      <div className="flex-1 min-w-0 flex items-center gap-2">
        <h1 className="min-w-0 text-[18px] font-semibold text-foreground truncate">{title}</h1>
        {live && (
          <span className="shrink-0 inline-flex items-center gap-1 h-5 px-2 rounded-full bg-primary/10 border border-primary/30 text-primary text-[10px] font-semibold tracking-wide uppercase">
            <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" aria-hidden />
            Live Now
          </span>
        )}
      </div>
      <Link
        to="/activity/$id/notifications"
        params={{ id }}
        aria-label="Notifications"
        className="h-10 w-10 rounded-full bg-secondary border border-border shadow-soft flex items-center justify-center text-muted-foreground active:scale-95"
      >
        <Bell className="h-5 w-5" strokeWidth={2.2} />
      </Link>
    </header>
  );
}

export function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="text-[12.5px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">
        {title}
      </h2>
      {children}
    </section>
  );
}

export function Details({ a }: { a: any }) {
  const activeParticipants = 0; // TODO: Calculate this from activity_requests
  const startsAt = new Date(a.starts_at);
  const dateStr = startsAt.toLocaleDateString();
  const timeStr = startsAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return (
    <ul className="rounded-2xl border border-border/80 bg-card divide-y divide-border/70">
      <Row icon={Calendar} label="Date" value={dateStr} />
      <Row icon={Clock} label="Time" value={timeStr} />
      {a.activity_location && <Row icon={MapPin} label="Activity location" value={a.activity_location} />}
      <Row icon={MapPin} label="Meet-up point" value={a.meetup_point} />
      <Row icon={Users} label="Participants" value={`${activeParticipants} / ${a.max_participants}`} />
      {a.eligibility_tags && a.eligibility_tags.length > 0 && (
        <Row icon={GraduationCap} label="Eligibility" value={a.eligibility_tags.join(", ")} />
      )}
      {a.estimated_cost && <Row icon={Wallet} label="Estimated cost" value={`₹${a.estimated_cost}`} />}
    </ul>
  );
}

function Row({ icon: Icon, label, value }: { icon: typeof Calendar; label: string; value: string }) {
  return (
    <li className="flex items-center gap-3 px-4 py-3">
      <Icon className="h-4 w-4 text-muted-foreground" strokeWidth={2.2} />
      <span className="text-[12.5px] text-muted-foreground flex-1">{label}</span>
      <span className="text-[13px] font-medium text-foreground text-right">{value}</span>
    </li>
  );
}

export function HostCard({
  host,
}: {
  host: { name: string; hall: string; year: string; phone: string; avatar?: string };
}) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-border/80 bg-card p-3">
      <div className="h-12 w-12 rounded-full bg-accent/70 flex items-center justify-center text-[15px] font-semibold text-accent-foreground">
        {host.name.charAt(0)}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[14px] font-semibold text-foreground">{host.name}</p>
        <p className="text-[11.5px] text-muted-foreground">
          {host.hall} • {host.year}
        </p>
      </div>
      <a
        href={`tel:${host.phone.replace(/\s/g, "")}`}
        aria-label="Call host"
        className="h-9 w-9 rounded-full border border-border/80 bg-background flex items-center justify-center text-muted-foreground hover:text-primary"
      >
        <Phone className="h-4 w-4" strokeWidth={2.2} />
      </a>
    </div>
  );
}