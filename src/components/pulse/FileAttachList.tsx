import { FileText, Download, Trash2, Plus, Paperclip, X, Image as ImageIcon, Link2 } from "lucide-react";

export type StoredDoc = { id: string; name: string; url?: string; size?: string; kind: "image" | "pdf" | "link" | "file" };

export function FileAttachList({
  docs,
  onAdd,
  onRemove,
  readOnly,
  label = "Add documents or material (optional)",
}: {
  docs: StoredDoc[];
  onAdd?: (file: File) => void;
  onRemove?: (id: string) => void;
  readOnly?: boolean;
  label?: string;
}) {
  const handleFiles = (files: FileList | null) => {
    if (!files || !onAdd) return;
    Array.from(files).forEach((f) => {
      onAdd(f);
    });
  };

  return (
    <div className="flex flex-col gap-2">
      {docs.length > 0 && (
        <ul className="flex flex-col gap-2">
          {docs.map((d) => (
            <li
              key={d.id}
              className="flex items-center gap-3 rounded-2xl border border-border/70 bg-card px-3 py-2.5"
            >
              <span className="h-8 w-8 rounded-xl bg-accent/60 flex items-center justify-center text-muted-foreground">
                {d.kind === "image" ? (
                  <ImageIcon className="h-4 w-4" strokeWidth={2.2} />
                ) : d.kind === "link" ? (
                  <Link2 className="h-4 w-4" strokeWidth={2.2} />
                ) : (
                  <FileText className="h-4 w-4" strokeWidth={2.2} />
                )}
              </span>
              <div className="flex-1 min-w-0">
                {readOnly && d.url ? (
                  <a
                    href={d.url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[13px] text-foreground font-medium truncate block hover:text-primary"
                  >
                    {d.name}
                  </a>
                ) : (
                  <span className="text-[13px] text-foreground font-medium truncate block">
                    {d.name}
                  </span>
                )}
                <span className="text-[11px] text-muted-foreground uppercase tracking-wide">
                  {d.kind}
                </span>
              </div>
              {!readOnly && onRemove && (
                <button
                  type="button"
                  onClick={() => onRemove(d.id)}
                  aria-label="Remove"
                  className="h-7 w-7 rounded-full inline-flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-accent/60"
                >
                  <X className="h-4 w-4" strokeWidth={2.2} />
                </button>
              )}
            </li>
          ))}
        </ul>
      )}

      {!readOnly && (
        <label className="cursor-pointer rounded-2xl border border-dashed border-border/80 bg-background hover:bg-accent/30 transition-colors px-4 py-3 flex items-center gap-2.5 text-[12.5px] text-muted-foreground">
          <Paperclip className="h-4 w-4" strokeWidth={2.2} />
          <span>{label}</span>
          <input
            type="file"
            multiple
            className="hidden"
            onChange={(e) => {
              handleFiles(e.target.files);
              e.currentTarget.value = "";
            }}
          />
        </label>
      )}
    </div>
  );
}