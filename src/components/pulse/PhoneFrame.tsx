import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

export function PhoneFrame({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className="min-h-dvh w-full bg-secondary/40 flex justify-center">
      <div
        className={cn(
          "relative w-full max-w-[440px] min-h-dvh bg-background",
          "sm:my-6 sm:min-h-[calc(100dvh-3rem)] sm:rounded-[2.25rem] sm:shadow-lift sm:overflow-hidden",
          className,
        )}
      >
        {children}
      </div>
    </div>
  );
}

export function Screen({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col min-h-dvh sm:min-h-[calc(100dvh-3rem)] px-6 pt-5 pb-8",
        className,
      )}
    >
      {children}
    </div>
  );
}