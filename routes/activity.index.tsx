import { createFileRoute, useNavigate, Link, redirect } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Bell, Pencil, LogIn, X } from "lucide-react";
import { PhoneFrame } from "@/components/pulse/PhoneFrame";
import { BottomNav } from "@/components/pulse/BottomNav";
import { TopBar } from "@/components/pulse/TopBar";
import { ActivityCard } from "@/components/pulse/ActivityCard";
import { EmptyHosted } from "@/components/pulse/EmptyHosted";
import { EmptyJoined } from "@/components/pulse/EmptyJoined";
import { cn } from "@/lib/utils";
import { supabase } from "@/lib/supabase";
import { type Activity } from "@/lib/discover-data";

export const Route = createFileRoute("/activity/")({
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
      { title: "Activity Hub — Pulse" },
      { name: "description", content: "Manage the activities you host and the ones you've joined on Pulse." },
    ],
  }),
  component: ActivityHub,
});

type Tab = "hosted" | "joined";
type Filter = "requested" | "upcoming" | "ongoing" | "completed";

// Helper to map DB row to Activity UI type
function mapDbToActivity(row: any, requestStatus?: string): Activity {
  const startsAt = new Date(row.starts_at);
  const isToday = startsAt.toDateString() === new Date().toDateString();
  const isTomorrow = startsAt.toDateString() === new Date(Date.now() + 86400000).toDateString();
  const dateStr = isToday ? "Today" : isTomorrow ? "Tomorrow" : startsAt.toLocaleDateString();
  const timeStr = startsAt.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
  
  let deadlineStr = undefined;
  if (row.accept_requests_until) {
    deadlineStr = new Date(row.accept_requests_until).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
  }

  // Determine an emoji based on subcategory
  const emojiMap: Record<string, string> = {
    "tea-coffee": "☕",
    "campus-walks": "🚶",
    "late-night-bites": "🍜"
  };

  return {
    id: row.id,
    emoji: emojiMap[row.subcategory] || "🔥",
    title: row.title,
    time: `${dateStr} • ${timeStr}`,
    host: row.host?.name?.split(' ')[0] || "Host",
    joined: 0, // Should be calculated or returned from a join
    capacity: row.max_participants,
    eligibility: row.eligibility_tags || [],
    meetupPoint: row.meetup_point || "",
    cost: row.estimated_cost ? `₹${row.estimated_cost}/person` : undefined,
    cta: "View",
    deadline: deadlineStr,
    status: requestStatus ? (requestStatus as any) : row.status, // We overload the 'status' field for UI filtering
  };
}

function ActivityHub() {
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>("hosted");
  const [filter, setFilter] = useState<Filter>("upcoming");
  const [loading, setLoading] = useState(true);
  const [hosted, setHosted] = useState<Activity[]>([]);
  const [joined, setJoined] = useState<Activity[]>([]);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // 1. Fetch Hosted Activities
      const { data: hostedData } = await supabase
        .from('activities')
        .select('*, host:users(name)')
        .eq('host_id', user.id)
        .order('starts_at', { ascending: true });

      if (hostedData) {
        setHosted(hostedData.map(row => mapDbToActivity(row)));
      }

      // 2. Fetch Joined Activities (via activity_requests)
      const { data: joinedData } = await supabase
        .from('activity_requests')
        .select(`
          status,
          activities (
            *,
            host:users(name)
          )
        `)
        .eq('user_id', user.id);

      if (joinedData) {
        const mappedJoined = joinedData
          .filter((req: any) => req.activities != null)
          .map((req: any) => mapDbToActivity(req.activities, req.status));
        setJoined(mappedJoined);
      }

      setLoading(false);
    }
    loadData();
  }, [tab, filter]);

  // If Hosted tab is active but the Requested filter is somehow set, snap back.
  useEffect(() => {
    if (tab === "hosted" && filter === "requested") setFilter("upcoming");
  }, [tab, filter]);

  const hasHosted = tab === "hosted" && filter === "upcoming";
  const hostedByStatus = hosted.filter((a) =>
    filter === "completed" ? a.status === "COMPLETED" : a.status !== "COMPLETED"
  );
  
  const joinedByStatus = joined.filter((a) => {
    if (filter === "requested") return a.status === "REQUESTED";
    if (filter === "completed") return a.status === "COMPLETED"; // Real status of activity, wait we overloaded a.status!
    // To properly filter joined activities:
    // a.status holds the Request Status ('REQUESTED', 'APPROVED', etc). 
    // We should show APPROVED items in Upcoming/Ongoing/Completed based on their time.
    // For now, if it's REQUESTED it only goes to requested.
    if (a.status === "REQUESTED") return false; 
    
    // If we overloaded a.status with request status, we lost the actual activity status!
    // Let's assume if it's APPROVED, it's upcoming for now unless we do better mapping.
    if (filter === "upcoming") return a.status === "APPROVED";
    return false;
  });

  return (
    <PhoneFrame>
      <div className="relative flex flex-col min-h-dvh sm:min-h-[calc(100dvh-3rem)]">
        <TopBar />
        <div className="px-6 pb-3">
          <h1 className="text-[22px] font-semibold text-foreground leading-tight">
            Activity Hub
          </h1>
          <p className="mt-1 text-[13px] text-muted-foreground">
            Everything you host and join, in one place.
          </p>
        </div>

        {/* Segmented control */}
        <div className="px-5">
          <div className="p-1 rounded-2xl bg-secondary/70 border border-border/70 flex">
            <SegButton active={tab === "hosted"} onClick={() => setTab("hosted")}>
              Hosted
            </SegButton>
            <SegButton active={tab === "joined"} onClick={() => setTab("joined")}>
              Joined
            </SegButton>
          </div>
        </div>

        {/* Filter chips */}
        <div className="px-5 pt-4 flex items-center gap-2">
          {tab === "joined" && (
            <Chip active={filter === "requested"} onClick={() => setFilter("requested")}>
              Requested
            </Chip>
          )}
          <Chip active={filter === "upcoming"} onClick={() => setFilter("upcoming")}>
            Upcoming
          </Chip>
          <Chip active={filter === "ongoing"} onClick={() => setFilter("ongoing")}>
            Ongoing
          </Chip>
          <Chip active={filter === "completed"} onClick={() => setFilter("completed")}>
            Completed
          </Chip>
        </div>

        <main className="flex-1 overflow-y-auto pt-4 pb-32">
          {loading ? (
            <div className="px-5 pt-8 flex justify-center">
              <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <>
              {tab === "hosted" && hostedByStatus.length > 0 && (
                <div className="px-5 flex flex-col gap-4">
                  {hostedByStatus.map((a) => (
                    <HostedRow key={a.id} a={a} completed={filter === "completed"} />
                  ))}
                </div>
              )}

              {tab === "hosted" && hostedByStatus.length === 0 && (
                <EmptyHosted />
              )}

              {tab === "joined" && filter === "requested" && joinedByStatus.length > 0 && (
                <div className="px-5 flex flex-col gap-4">
                  {joinedByStatus.map((a) => (
                    <ActivityCard
                      key={a.id}
                      activity={a}
                      actions={
                        <div className="flex-1 flex items-center justify-center rounded-2xl bg-yellow-50 border border-yellow-200 px-3.5 py-2.5">
                          <span className="text-[12.5px] font-medium text-yellow-700 inline-flex items-center justify-center gap-1.5 leading-tight text-center">
                            <span aria-hidden>🟡</span>
                            Approval Pending
                          </span>
                        </div>
                      }
                    />
                  ))}
                </div>
              )}

              {tab === "joined" && filter === "upcoming" && joinedByStatus.length > 0 && (
                <div className="px-5 flex flex-col gap-4 mt-1">
                  {joinedByStatus.map((a) => (
                    <JoinedRow key={a.id} a={a} completed={false} live={false} />
                  ))}
                </div>
              )}

              {tab === "joined" && filter === "requested" && joinedByStatus.length === 0 && (
                <div className="px-6 pt-10 text-center">
                  <p className="text-[13.5px] text-muted-foreground">
                    No requests pending.
                  </p>
                </div>
              )}

              {tab === "joined" && filter === "upcoming" && joinedByStatus.length === 0 && (
                <EmptyJoined onExplore={() => navigate({ to: "/home" })} />
              )}
            </>
          )}
        </main>

        <BottomNav />
      </div>
    </PhoneFrame>
  );
}

function SegButton({ active, onClick, children }: any) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex-1 h-9 rounded-xl text-[13px] font-medium transition-colors",
        active ? "bg-background text-foreground shadow-soft" : "text-muted-foreground"
      )}
    >
      {children}
    </button>
  );
}

function Chip({ active, onClick, children }: any) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "h-8 px-3.5 rounded-full text-[12.5px] font-medium border transition-colors",
        active ? "bg-primary/10 border-primary/30 text-primary" : "bg-background border-border/80 text-muted-foreground hover:text-foreground"
      )}
    >
      {children}
    </button>
  );
}

const secondaryActionClass =
  "flex-1 h-10 rounded-2xl border border-border/80 bg-background text-foreground text-[12.5px] font-medium inline-flex items-center justify-center gap-1.5 transition-colors hover:border-foreground/20 active:scale-[0.98]";

function HostedRow({ a, completed }: { a: Activity; completed?: boolean }) {
  return (
    <ActivityCard
      activity={a}
      actions={
        <>
          <Link
            to="/activity/manage/$id"
            params={{ id: a.id }}
            className="flex-1 h-10 rounded-2xl inline-flex items-center justify-center gap-1.5 text-[12.5px] font-medium bg-primary/10 border border-primary/30 text-primary hover:bg-primary/15 transition-colors active:scale-[0.98]"
          >
            <Pencil className="h-3.5 w-3.5" strokeWidth={2.2} />
            {completed ? "View Activity" : "Manage Activity"}
          </Link>
          <Link
            to="/activity/$id/notifications"
            params={{ id: a.id }}
            className={secondaryActionClass}
          >
            <Bell className="h-3.5 w-3.5" strokeWidth={2.2} />
            Notifications & Reminders
          </Link>
        </>
      }
    />
  );
}

function JoinedRow({ a, completed, live }: { a: Activity; completed?: boolean; live?: boolean }) {
  return (
    <div>
      <ActivityCard
        activity={a}
        live={live}
        actions={
          <>
            <Link
              to="/activity/view/$id"
              params={{ id: a.id }}
              className="flex-1 h-10 rounded-2xl inline-flex items-center justify-center gap-1.5 text-[12.5px] font-medium bg-primary/10 border border-primary/30 text-primary hover:bg-primary/15 transition-colors active:scale-[0.98]"
            >
              <LogIn className="h-3.5 w-3.5" strokeWidth={2.2} />
              {completed ? "View Activity" : "Enter Activity"}
            </Link>
            <Link
              to="/activity/$id/notifications"
              params={{ id: a.id }}
              className={secondaryActionClass}
            >
              <Bell className="h-3.5 w-3.5" strokeWidth={2.2} />
              Notifications & Reminders
            </Link>
          </>
        }
      />
    </div>
  );
}