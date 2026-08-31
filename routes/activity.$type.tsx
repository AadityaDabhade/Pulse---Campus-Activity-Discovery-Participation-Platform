import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { ChevronLeft } from "lucide-react";
import { PhoneFrame } from "@/components/pulse/PhoneFrame";
import { ActivityCard } from "@/components/pulse/ActivityCard";
import { EmptyState } from "@/components/pulse/EmptyState";
import { JoinRequestSheet } from "@/components/pulse/JoinRequestSheet";
import { supabase } from "@/lib/supabase";
import { getActivityType, type Activity } from "@/lib/discover-data";

export const Route = createFileRoute("/activity/$type")({
  head: () => ({
    meta: [
      { title: "Activities — Pulse" },
      {
        name: "description",
        content: "Browse student-hosted activities happening around campus.",
      },
    ],
  }),
  component: ActivityListing,
});

function ActivityListing() {
  const { type } = Route.useParams();
  const navigate = useNavigate();
  const activityType = getActivityType(type);
  const [loading, setLoading] = useState(true);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [sheetOpen, setSheetOpen] = useState(false);

  useEffect(() => {
    async function fetchActivities() {
      setLoading(true);
      const { data, error } = await supabase
        .from('activities')
        .select(`
          id, title, starts_at, accept_requests_until, meetup_point, max_participants, 
          eligibility_tags, estimated_cost, status,
          host:users ( name )
        `)
        .eq('subcategory', type)
        .eq('status', 'UPCOMING')
        .order('starts_at', { ascending: true });
        
      if (error) {
        console.error("Error fetching activities:", error);
      } else if (data) {
        const mapped: Activity[] = data.map((row: any) => {
          const startsAt = new Date(row.starts_at);
          const isToday = startsAt.toDateString() === new Date().toDateString();
          const isTomorrow = startsAt.toDateString() === new Date(Date.now() + 86400000).toDateString();
          const dateStr = isToday ? "Today" : isTomorrow ? "Tomorrow" : startsAt.toLocaleDateString();
          const timeStr = startsAt.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
          
          let deadlineStr = undefined;
          if (row.accept_requests_until) {
            deadlineStr = new Date(row.accept_requests_until).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
          }

          return {
            id: row.id,
            emoji: activityType?.emoji || "🔥",
            title: row.title,
            time: `${dateStr} • ${timeStr}`,
            host: row.host?.name?.split(' ')[0] || "User",
            joined: 0, // Mocking joined count for now
            capacity: row.max_participants,
            eligibility: row.eligibility_tags || [],
            meetupPoint: row.meetup_point || "",
            cost: row.estimated_cost ? `₹${row.estimated_cost}/person` : undefined,
            cta: "Join",
            deadline: deadlineStr
          };
        });
        setActivities(mapped);
      }
      setLoading(false);
    }
    
    fetchActivities();
  }, [type, activityType]);

  const handleJoin = async (activityId: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      alert("Please log in to join activities!");
      return;
    }
    
    const { error } = await supabase.from('activity_requests').insert({
      activity_id: activityId,
      user_id: user.id,
      status: 'REQUESTED'
    });
    
    if (error) {
      console.error("Failed to join activity:", error);
      alert("Failed to join. " + (error.message || "Please try again."));
      return;
    }
    
    setSheetOpen(true);
  };

  const goToHub = () => {
    navigate({ to: "/activity" });
  };

  return (
    <PhoneFrame>
      <div className="relative flex flex-col min-h-dvh sm:min-h-[calc(100dvh-3rem)]">
        <header className="flex items-center gap-3 px-5 pt-6 pb-4">
          <Link
            to="/home"
            aria-label="Back"
            className="h-10 w-10 rounded-full bg-secondary border border-border shadow-soft flex items-center justify-center text-muted-foreground transition-transform active:scale-95"
          >
            <ChevronLeft className="h-5 w-5" strokeWidth={2.2} />
          </Link>
          <div className="min-w-0">
            <p className="text-[11px] tracking-[0.18em] uppercase font-semibold text-primary">
              Activities
            </p>
            <h1 className="text-[20px] font-semibold text-foreground leading-tight truncate">
              {activityType?.name ?? "Activities"}
            </h1>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto pb-10">
          {loading ? (
            <div className="px-5 pt-8 flex justify-center">
              <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          ) : activities.length > 0 ? (
            <div className="px-5 pt-2 flex flex-col gap-4">
              {activities.map((a) => (
                <ActivityCard
                  key={a.id}
                  activity={a}
                  onJoin={() => handleJoin(a.id)}
                />
              ))}
            </div>
          ) : (
            <EmptyState onExplore={() => navigate({ to: "/home" })} />
          )}
        </main>
        <JoinRequestSheet
          open={sheetOpen}
          onClose={() => setSheetOpen(false)}
          onGoToHub={goToHub}
        />
      </div>
    </PhoneFrame>
  );
}