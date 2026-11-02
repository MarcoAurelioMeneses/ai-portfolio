import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CaseFacts } from "@/components/sections/case-facts";
import { SiteFooter } from "@/components/layout/site-footer";
import { Tag } from "@/components/ui/tag";
import { site } from "@/content/site";

type CasePageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return site.cases.map((item) => ({ slug: item.id }));
}

export async function generateMetadata({ params }: CasePageProps): Promise<Metadata> {
  const { slug } = await params;
  const item = site.cases.find((entry) => entry.id === slug);
  if (!item) return { title: site.name };
  return {
    title: `${item.title} — ${site.name}`,
    description: item.result,
  };
}

export default async function CasePage({ params }: CasePageProps) {
  const { slug } = await params;
  const item = site.cases.find((entry) => entry.id === slug);
  if (!item) notFound();

  return (
    <main
      id="conteudo"
      className="mx-auto flex min-h-[calc(100dvh-4.5rem)] max-w-6xl flex-col px-5 pt-16 md:px-10 md:pt-24"
    >
      <Link href="/#cases" className="w-fit text-sm text-muted hover:text-foreground">
        ← Cases
      </Link>
      <article className="mt-8 max-w-3xl">
        <Tag>{item.client}</Tag>
        <h1 className="mt-4 text-4xl font-semibold tracking-tight sm:text-5xl">{item.title}</h1>
        <CaseFacts item={item} />
      </article>
      <div className="mt-auto pt-16">
        <SiteFooter />
      </div>
    </main>
  );
}
