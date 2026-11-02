import { Logo } from "@/components/layout/logo";
import { site } from "@/content/site";

export function SiteFooter() {
  return (
    <footer className="border-t border-border py-8">
      <div className="flex items-center justify-between gap-4">
        <Logo className="h-6" />
        <p className="text-sm text-muted">{site.contact.copyright}</p>
      </div>
    </footer>
  );
}
