import { cn } from "@/lib/utils";
import { Compass, ClipboardList, Plus } from "lucide-react";
import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { getProfile, isHostReady } from "@/lib/profile-store";

export function BottomNav() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const navigate = useNavigate();
  const isActivity = pathname.startsWith("/activity");
  const isDiscover = !isActivity;

  const onCreate = (e: React.MouseEvent) => {
    e.preventDefault();
    navigate({ to: "/activity/new", search: { edit: undefined } });
  };

  return (
    <div className="pointer-events-none fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[440px] pb-[env(safe-area-inset-bottom)] z-40">
      <div className="pointer-events-auto relative mx-4 mb-4">
        <nav className="h-[68px] rounded-3xl bg-background border border-border shadow-lift flex items-center justify-between px-8">
          <NavItem to="/home" icon={Compass} label="Discover" active={isDiscover} />
          <div className="w-14" aria-hidden />
          <NavItem to="/activity" icon={ClipboardList} label="Activity Hub" active={isActivity} />
        </nav>
        <Link
          to="/activity/new"
          search={{ edit: undefined }}
          onClick={onCreate}
          aria-label="Create activity"
          className={cn(
            "absolute left-1/2 -translate-x-1/2 -top-6",
            "h-16 w-16 rounded-full bg-primary text-primary-foreground",
            "flex items-center justify-center shadow-green transition-transform active:scale-95",
          )}
        >
          <Plus className="h-7 w-7" strokeWidth={2.4} />
        </Link>
      </div>
    </div>
  );
}

function NavItem({
  to,
  icon: Icon,
  label,
  active,
}: {
  to: string;
  icon: typeof Compass;
  label: string;
  active?: boolean;
}) {
  return (
    <Link
      to={to}
      className="flex flex-col items-center gap-1 text-[11px] font-medium transition-colors"
    >
      <Icon
        className={cn(
          "h-5 w-5 transition-colors",
          active ? "text-primary" : "text-muted-foreground",
        )}
        strokeWidth={2.2}
      />
      <span className={cn(active ? "text-primary" : "text-muted-foreground")}>
        {label}
      </span>
    </Link>
  );
}