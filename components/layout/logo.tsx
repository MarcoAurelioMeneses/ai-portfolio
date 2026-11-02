import { cn } from "@/lib/cn";

export function Logo({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 64 36"
      className={cn("h-7 w-auto text-foreground", className)}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.25"
      strokeLinejoin="miter"
      aria-hidden="true"
    >
      <path d="M3 33V5l11 16L25 5v28" />
      <path d="M37 33 46.5 5 56 33" />
      <path d="M40.2 22.5h12.6" />
    </svg>
  );
}
