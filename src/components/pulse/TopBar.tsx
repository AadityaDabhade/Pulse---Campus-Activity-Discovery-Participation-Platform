import { useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { Menu, Settings as SettingsIcon, FileText, LogOut } from "lucide-react";
import { Logo } from "./Logo";
import { Avatar } from "@/routes/profile.index";
import { useSupabaseProfile } from "@/lib/profile-store";
import { supabase } from "@/lib/supabase";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

const VISITED_KEY = "pulse_visited";

export function TopBar() {
  const { profile, loading } = useSupabaseProfile();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const close = () => setOpen(false);
  const go = (to: string) => {
    setOpen(false);
    navigate({ to });
  };
  const handleLogout = async () => {
    if (typeof window !== "undefined") {
      window.localStorage.removeItem(VISITED_KEY);
    }
    setOpen(false);
    await supabase.auth.signOut();
    navigate({ to: "/" });
  };

  const displayName = profile?.name || "Student";
  const displayPhoto = profile?.avatar_url || undefined;

  return (
    <header className="flex items-center justify-between px-6 pt-6 pb-3">
      <Link to="/home" aria-label="Go to Discover" className="active:scale-95 transition-transform">
        <Logo />
      </Link>
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <button
            type="button"
            aria-label="Open menu"
            className="h-10 w-10 rounded-full bg-secondary border border-border shadow-soft flex items-center justify-center text-muted-foreground transition-transform active:scale-95"
          >
            <Menu className="h-5 w-5" strokeWidth={2.2} />
          </button>
        </SheetTrigger>
        <SheetContent side="right" className="w-3/4 sm:max-w-xs flex flex-col">
          <SheetHeader>
            <SheetTitle className="text-left text-sm tracking-[0.22em] font-semibold text-primary">
              PULSE
            </SheetTitle>
          </SheetHeader>

          <button
            type="button"
            onClick={() => go("/profile")}
            className="mt-6 flex items-center gap-3 rounded-2xl border border-border/80 bg-card px-3 py-3 text-left active:scale-[0.99]"
          >
            <Avatar name={displayName} photo={displayPhoto} size={44} />
            <div className="flex-1 min-w-0">
              <div className="text-[14px] font-semibold text-foreground truncate">{loading ? "Loading..." : displayName}</div>
              <div className="text-[12px] text-muted-foreground truncate">View profile</div>
            </div>
          </button>

          <div className="mt-6 flex flex-col gap-1">
            <MenuRow icon={SettingsIcon} label="Settings" onClick={() => go("/settings")} />
            <MenuRow icon={FileText} label="Terms & Conditions" onClick={() => go("/settings/terms")} />
          </div>

          <div className="mt-auto pt-6">
            <button
              type="button"
              onClick={handleLogout}
              className="w-full flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-destructive transition-colors hover:bg-destructive/10"
            >
              <LogOut className="h-4 w-4" />
              Log out
            </button>
          </div>
        </SheetContent>
      </Sheet>
    </header>
  );
}

function MenuRow({
  icon: Icon,
  label,
  onClick,
}: {
  icon: typeof SettingsIcon;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-foreground hover:bg-secondary/60 active:scale-[0.99]"
    >
      <Icon className="h-4 w-4 text-primary" strokeWidth={2.2} />
      {label}
    </button>
  );
}