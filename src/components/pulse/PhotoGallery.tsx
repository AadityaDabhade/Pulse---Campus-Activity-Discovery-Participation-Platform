import { Plus } from "lucide-react";
import { cn } from "@/lib/utils";

export type StoredPhoto = { id: string; url: string };

export function PhotoGallery({
  photos,
  onAdd,
  canUpload,
}: {
  photos: StoredPhoto[];
  onAdd?: (f: File) => void;
  canUpload?: boolean;
}) {
  const handle = (files: FileList | null) => {
    if (!files || !onAdd) return;
    Array.from(files).forEach((f) => {
      if (!f.type.startsWith("image/")) return;
      onAdd(f);
    });
  };

  return (
    <div className="grid grid-cols-3 gap-2">
      {photos.map((p) => (
        <a
          key={p.id}
          href={p.url}
          target="_blank"
          rel="noreferrer"
          className="aspect-square rounded-2xl overflow-hidden border border-border/70 bg-secondary/40"
        >
          <img src={p.url} alt="" className="h-full w-full object-cover" />
        </a>
      ))}
      {canUpload && (
        <label className="aspect-square rounded-2xl border border-dashed border-border/80 bg-background hover:bg-accent/30 transition-colors flex flex-col items-center justify-center gap-1 cursor-pointer text-muted-foreground">
          <Plus className="h-5 w-5" strokeWidth={2.2} />
          <span className="text-[10.5px] font-medium">Upload</span>
          <input
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={(e) => {
              handle(e.target.files);
              e.currentTarget.value = "";
            }}
          />
        </label>
      )}
      {photos.length === 0 && !canUpload && (
        <p className="col-span-3 text-center text-[12.5px] text-muted-foreground py-6">
          No photos yet.
        </p>
      )}
    </div>
  );
}