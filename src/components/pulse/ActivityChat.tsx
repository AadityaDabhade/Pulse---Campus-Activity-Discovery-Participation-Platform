import { useState } from "react";
import { Send, Lock } from "lucide-react";

type Msg = { id: string; author: string; text: string; me?: boolean };

const SEED: Msg[] = [
  { id: "m1", author: "Rhea", text: "Hey! Excited for this ☕" },
  { id: "m2", author: "You", text: "Same here — see you at the gate.", me: true },
];

export function ActivityChat({ readOnly }: { readOnly?: boolean }) {
  const [msgs, setMsgs] = useState<Msg[]>(SEED);
  const [text, setText] = useState("");

  const send = () => {
    const t = text.trim();
    if (!t) return;
    setMsgs((m) => [...m, { id: `m_${Date.now()}`, author: "You", text: t, me: true }]);
    setText("");
  };

  return (
    <div className="rounded-2xl border border-border/80 bg-card overflow-hidden">
      <div className="max-h-56 overflow-y-auto px-3 py-3 flex flex-col gap-2">
        {msgs.map((m) => (
          <div
            key={m.id}
            className={`max-w-[80%] rounded-2xl px-3 py-2 text-[13px] leading-snug ${
              m.me
                ? "self-end bg-primary/10 text-foreground"
                : "self-start bg-secondary/70 text-foreground"
            }`}
          >
            {!m.me && (
              <p className="text-[10.5px] font-medium text-muted-foreground mb-0.5">
                {m.author}
              </p>
            )}
            {m.text}
          </div>
        ))}
      </div>
      {readOnly ? (
        <div className="border-t border-border/70 px-4 py-2.5 flex items-center gap-2 text-[12px] text-muted-foreground bg-secondary/40">
          <Lock className="h-3.5 w-3.5" strokeWidth={2.2} />
          Chat is locked. Activity has ended.
        </div>
      ) : (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            send();
          }}
          className="border-t border-border/70 px-2.5 py-2 flex items-center gap-2"
        >
          <input
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Send a message"
            className="flex-1 h-9 px-3 rounded-xl bg-secondary/60 text-[13px] outline-none placeholder:text-muted-foreground"
          />
          <button
            type="submit"
            aria-label="Send"
            className="h-9 w-9 rounded-xl bg-primary text-primary-foreground flex items-center justify-center active:scale-95"
          >
            <Send className="h-4 w-4" strokeWidth={2.2} />
          </button>
        </form>
      )}
    </div>
  );
}