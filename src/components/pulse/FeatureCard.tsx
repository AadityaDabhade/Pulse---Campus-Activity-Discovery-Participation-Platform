import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

interface Props {
  title: string;
  description: string;
  icon: LucideIcon;
  delay?: number;
}

export function FeatureCard({ title, description, icon: Icon, delay = 0 }: Props) {
  return (
    <div
      className={cn(
        "rounded-3xl bg-background border border-border/70 p-5 shadow-soft animate-float",
      )}
      style={{ animationDelay: `${delay}s`, animationDuration: "5s" }}
    >
      <div className="h-10 w-10 rounded-2xl bg-accent flex items-center justify-center mb-3">
        <Icon className="h-5 w-5 text-primary" strokeWidth={2.2} />
      </div>
      <p className="text-[15px] font-semibold text-foreground">{title}</p>
      <p className="text-[12.5px] text-muted-foreground mt-1 leading-relaxed">
        {description}
      </p>
    </div>
  );
}