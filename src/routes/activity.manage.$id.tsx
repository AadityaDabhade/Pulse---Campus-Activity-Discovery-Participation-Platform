import { createFileRoute, useNavigate, useRouter } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ChevronRight, Users } from "lucide-react";
import { PhoneFrame } from "@/components/pulse/PhoneFrame";
import { FileAttachList } from "@/components/pulse/FileAttachList";
import { ActivityChat } from "@/components/pulse/ActivityChat";
import { PhotoGallery } from "@/components/pulse/PhotoGallery";
import { ParticipantsSheet, type ParticipantUI } from "@/components/pulse/ParticipantsSheet";
import { ConfirmDialog } from "@/components/pulse/ConfirmDialog";
import { Header, Section, Details } from "./activity.view.$id";
import { supabase } from "@/lib/supabase";

export const Route = createFileRoute("/activity/manage/$id")({
  head: () => ({
    meta: [
      { title: "Manage Activity — Pulse" },
      { name: "description", content: "Manage your hosted activity on Pulse." },
    ],
  }),
  component: ManageView,
});

function ManageView() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const router = useRouter();
  
  const goBack = () => {
    if (window.history.length > 1) router.history.back();
    else navigate({ to: "/activity" });
  };

  const [a, setA] = useState<any>(null);
  const [participants, setParticipants] = useState<ParticipantUI[]>([]);
  const [loading, setLoading] = useState(true);
  const [sheet, setSheet] = useState(false);
  const [confirmComplete, setConfirmComplete] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      // Fetch the activity
      const { data: actData, error: actError } = await supabase
        .from('activities')
        .select('*')
        .eq('id', id)
        .single();

      if (actError) {
        console.error(actError);
        setA(null);
        setLoading(false);
        return;
      }
      
      setA(actData);

      // Fetch participants
      const { data: reqData, error: reqError } = await supabase
        .from('activity_requests')
        .select('id, status, user_id, users(name)')
        .eq('activity_id', id);

      if (reqData) {
        const mapped: ParticipantUI[] = reqData.map((r: any) => ({
          id: r.id, // the activity_requests ID
          userId: r.user_id,
          name: r.users?.name || "Unknown",
          status: r.status,
        }));
        setParticipants(mapped);
      }
      setLoading(false);
    }
    loadData();
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
          <button
            type="button"
            onClick={() => navigate({ to: "/activity" })}
            className="text-[13px] font-medium text-primary underline underline-offset-2"
          >
            Back to Activity Hub
          </button>
        </div>
      </PhoneFrame>
    );
  }

  const completed = a.status === "COMPLETED";
  const activeCount = participants.filter((p) => p.status === "APPROVED").length;
  const requestedCount = participants.filter((p) => p.status === "REQUESTED").length;

  const updateStatus = async (requestId: string, newStatus: string) => {
    // Optimistic UI update
    setParticipants((prev) => 
      prev.map((p) => p.id === requestId ? { ...p, status: newStatus as any } : p)
    );
    
    // DB update
    const { error } = await supabase
      .from('activity_requests')
      .update({ status: newStatus })
      .eq('id', requestId);

    if (error) {
      alert("Failed to update status. Please try again.");
      console.error(error);
      // Depending on severity, we might want to refetch here
    }
  };

  const markCompleted = async () => {
    await supabase.from('activities').update({ status: 'COMPLETED' }).eq('id', a.id);
    navigate({ to: "/activity" });
  };

  const deleteActivity = async () => {
    await supabase.from('activities').delete().eq('id', a.id);
    navigate({ to: "/activity" });
  };

  const uploadFile = async (file: File, type: "photo" | "doc") => {
    const ext = file.name.split('.').pop();
    const fileName = `${a.id}/${type}_${Date.now()}.${ext}`;
    
    const { data, error } = await supabase.storage.from('pulse_media').upload(fileName, file);
    if (error) {
      alert("Upload failed: " + error.message);
      return;
    }
    
    const { data: { publicUrl } } = supabase.storage.from('pulse_media').getPublicUrl(fileName);
    
    if (type === "photo") {
      const newPhoto = { id: data.path, url: publicUrl };
      const updatedPhotos = [...(a.photos || []), newPhoto];
      await supabase.from('activities').update({ photos: updatedPhotos }).eq('id', a.id);
      setA({ ...a, photos: updatedPhotos });
    } else {
      const kind = file.type.startsWith("image/") ? "image" : file.type === "application/pdf" ? "pdf" : "file";
      const newDoc = { id: data.path, name: file.name, url: publicUrl, kind, size: (file.size / 1024).toFixed(0) + " KB" };
      const updatedDocs = [...(a.documents || []), newDoc];
      await supabase.from('activities').update({ documents: updatedDocs }).eq('id', a.id);
      setA({ ...a, documents: updatedDocs });
    }
  };

  const removeDoc = async (id: string) => {
    const updatedDocs = (a.documents || []).filter((d: any) => d.id !== id);
    await supabase.from('activities').update({ documents: updatedDocs }).eq('id', a.id);
    setA({ ...a, documents: updatedDocs });
  };

  const removePhoto = async (id: string) => {
    const updatedPhotos = (a.photos || []).filter((p: any) => p.id !== id);
    await supabase.from('activities').update({ photos: updatedPhotos }).eq('id', a.id);
    setA({ ...a, photos: updatedPhotos });
  };

  return (
    <PhoneFrame>
      <div className="relative flex flex-col min-h-dvh sm:min-h-[calc(100dvh-3rem)]">
        <Header title={a.title} id={a.id} onBack={goBack} live={a.status === "ONGOING"} />
        <main className="flex-1 overflow-y-auto px-5 pb-16 pt-2 flex flex-col gap-5">
          <Section title="About this activity">
            <p className="text-[13.5px] text-foreground leading-relaxed">
              {a.description || "Join us for a laid-back campus meet-up."}
            </p>
          </Section>

          <Section title="Activity details">
            <Details a={a} />
          </Section>

          <Section title="Documents & materials">
            <FileAttachList
              docs={a.documents || []}
              onAdd={(f: File) => uploadFile(f, "doc")}
              onRemove={removeDoc}
              label={completed ? "Add follow-up documents" : "Add documents or material (optional)"}
            />
          </Section>

          {a.chat_enabled !== false && (
            <Section title="Activity chat">
              <ActivityChat readOnly={completed} />
            </Section>
          )}

          <Section title="Participants">
            <button
              type="button"
              onClick={() => setSheet(true)}
              className="w-full rounded-2xl border border-border/80 bg-card px-4 py-3 flex items-center gap-3 active:scale-[0.99]"
            >
              <Users className="h-4 w-4 text-muted-foreground" strokeWidth={2.2} />
              <div className="flex-1 flex flex-col items-start min-w-0">
                <span className="text-[13px] font-medium text-foreground">
                  Participants
                </span>
                {requestedCount > 0 && (
                  <span className="text-[11px] text-yellow-600 font-medium">{requestedCount} Pending</span>
                )}
              </div>
              <span className="text-[13px] font-semibold text-foreground">
                {activeCount} / {a.max_participants}
              </span>
              <ChevronRight className="h-4 w-4 text-muted-foreground" strokeWidth={2.2} />
            </button>
          </Section>

          {completed && (
            <Section title="Activity gallery">
              <PhotoGallery photos={a.photos || []} onAdd={(f: File) => uploadFile(f, "photo")} canUpload />
            </Section>
          )}

          {!completed && (
            <div className="pt-2 flex flex-col gap-2">
              <button
                type="button"
                onClick={() => navigate({ to: "/activity/new", search: { edit: a.id } })}
                className="w-full h-11 rounded-2xl border border-border/80 bg-background text-foreground text-[13.5px] font-medium active:scale-[0.99]"
              >
                Edit Activity
              </button>
              {a.status === "ONGOING" && (
                <button
                  type="button"
                  onClick={() => setConfirmComplete(true)}
                  className="w-full h-11 rounded-2xl bg-primary text-primary-foreground text-[13.5px] font-semibold shadow-green active:scale-[0.98]"
                >
                  Mark as Completed
                </button>
              )}
            </div>
          )}

          <div className="pt-4 pb-2 flex justify-center">
            <button
              type="button"
              onClick={() => setConfirmDelete(true)}
              className="text-[12px] font-medium text-muted-foreground underline underline-offset-2 hover:text-destructive"
            >
              Delete Activity
            </button>
          </div>
        </main>
        
        <ParticipantsSheet
          open={sheet}
          onClose={() => setSheet(false)}
          participants={participants}
          onUpdateStatus={completed ? undefined : updateStatus}
        />
        
        <ConfirmDialog
          open={confirmComplete}
          onClose={() => setConfirmComplete(false)}
          onConfirm={() => {
            setConfirmComplete(false);
            markCompleted();
          }}
          title="Mark activity as completed?"
          description="Chat will be locked and the activity will move to Completed."
          confirmLabel="Mark as Completed"
        />
        <ConfirmDialog
          open={confirmDelete}
          onClose={() => setConfirmDelete(false)}
          onConfirm={() => {
            setConfirmDelete(false);
            deleteActivity();
          }}
          title="Delete this activity?"
          description="This can't be undone. Participants will lose access and chat, documents, and gallery photos will be removed."
          confirmLabel="Delete Activity"
          destructive
        />
      </div>
    </PhoneFrame>
  );
}