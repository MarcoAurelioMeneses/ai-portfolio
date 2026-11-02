import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

export function Tag({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <p className={cn("font-mono text-sm tracking-wide text-accent", className)}>
      / {children} /
    </p>
  );
}
