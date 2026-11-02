"use client";

import { useEffect } from "react";
import * as Sentry from "@sentry/nextjs";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    if (process.env.NEXT_PUBLIC_SENTRY_DSN) {
      Sentry.captureException(error);
    }
  }, [error]);

  return (
    <main className="mx-auto flex min-h-[60vh] max-w-xl flex-col items-start justify-center px-6">
      <p className="font-mono text-sm text-accent">/ Erro /</p>
      <h1 className="mt-3 text-3xl font-semibold tracking-tight">Algo deu errado.</h1>
      <p className="mt-3 text-muted">A página não carregou. Você pode tentar de novo.</p>
      <button
        type="button"
        className="mt-6 inline-flex h-11 items-center rounded-lg bg-foreground px-5 text-sm font-medium text-background"
        onClick={() => reset()}
      >
        Tentar de novo
      </button>
    </main>
  );
}
