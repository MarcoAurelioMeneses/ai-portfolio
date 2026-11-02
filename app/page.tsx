import { AboutSection } from "@/components/about-section";
import { CasesSection } from "@/components/cases-section";
import { ContactSection } from "@/components/contact-section";
import { ExperienceSection } from "@/components/experience-section";
import { HeroSection } from "@/components/hero-section";
import { StackSection } from "@/components/stack-section";

export default function HomePage() {
  return (
    <main id="conteudo">
      <HeroSection />
      <AboutSection />
      <CasesSection />
      <ExperienceSection />
      <StackSection />
      <ContactSection />
    </main>
  );
}
