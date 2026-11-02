"use client";

import { useEffect } from "react";
import * as Sentry from "@sentry/nextjs";

export default function GlobalError({
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
    <html lang="pt-BR">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          background: "#050505",
          color: "#f3f3f3",
          fontFamily: "ui-sans-serif, system-ui, sans-serif",
          display: "grid",
          placeItems: "center",
          padding: "2rem",
        }}
      >
        <main>
          <h1 style={{ fontSize: "2rem", fontWeight: 600 }}>Algo deu errado.</h1>
          <p style={{ color: "#b5b5b5" }}>A página não carregou. Você pode tentar de novo.</p>
          <button
            type="button"
            onClick={() => reset()}
            style={{
              marginTop: "1.25rem",
              background: "#f3f3f3",
              color: "#111",
              border: 0,
              borderRadius: "0.5rem",
              padding: "0.7rem 1rem",
              fontWeight: 600,
            }}
          >
            Tentar de novo
          </button>
        </main>
      </body>
    </html>
  );
}
