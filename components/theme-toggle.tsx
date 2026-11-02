"use client";

import { useSyncExternalStore } from "react";
import { useTheme } from "next-themes";
import { MoonIcon, SunIcon } from "@/components/icons";

function subscribe(): () => void {
  return () => {};
}

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const mounted = useSyncExternalStore(subscribe, () => true, () => false);
  const dark = mounted && resolvedTheme === "dark";
  const label = dark ? "Ativar tema claro" : "Ativar tema escuro";

  return (
    <button
      type="button"
      className="inline-flex size-9 items-center justify-center rounded-full text-foreground"
      aria-label={mounted ? label : "Alternar tema"}
      onClick={() => setTheme(dark ? "light" : "dark")}
    >
      {mounted && dark ? <MoonIcon className="size-[18px]" /> : <SunIcon className="size-[18px]" />}
    </button>
  );
}
