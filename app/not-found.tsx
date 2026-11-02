import Link from "next/link";
import { Logo } from "@/components/layout/logo";

export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-[60vh] max-w-xl flex-col items-start justify-center px-6">
      <Logo />
      <h1 className="mt-6 text-3xl font-semibold tracking-tight">Página não encontrada.</h1>
      <p className="mt-3 text-muted">Esse endereço não existe neste portfólio.</p>
      <Link
        href="/"
        className="mt-6 inline-flex h-11 items-center rounded-lg bg-foreground px-5 text-sm font-medium text-background"
      >
        Voltar ao início
      </Link>
    </main>
  );
}
