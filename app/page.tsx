import { AboutSection } from "@/components/sections/about-section";
import { CasesSection } from "@/components/sections/cases-section";
import { ContactSection } from "@/components/sections/contact-section";
import { ExperienceSection } from "@/components/sections/experience-section";
import { HeroSection } from "@/components/sections/hero-section";
import { StackSection } from "@/components/sections/stack-section";

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
