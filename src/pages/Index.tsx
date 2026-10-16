import { ImageBackground } from '@/components/background/ImageBackground';
import Noise from '@/components/fx/Noise';
import { Nav } from "@/components/Nav";
import { SectionDivider } from "@/components/section/SectionDivider";
import { HeroShowcase } from "@/components/sections/HeroShowcase";
import { Hero } from "@/components/sections/Hero";
import { About } from "@/components/sections/About";
import { Trayectoria } from "@/components/sections/Trayectoria";
import { Contributions } from "@/components/sections/Contributions";
import { Projects } from "@/components/sections/Projects";
import { AIWorkbench } from "@/components/sections/AIWorkbench";
import { Education } from "@/components/sections/Education";
import { Certifications } from "@/components/sections/Certifications";
import { SideQuests } from "@/components/sections/SideQuests";
import { Stats } from "@/components/sections/Stats";
import { Contact } from "@/components/sections/Contact";
import { Footer } from "@/components/Footer";
import { useLenis } from "@/hooks/useLenis";

// Hoja continua: 9 secciones seguidas sin ventanas. El único ritmo es el
// divisor (filete + folio); los anchors de navegación viven en cada <section>.

const Index = () => {
  useLenis();
  return (
    // md:pl-16 reserves the permanent left gutter the dock rail occupies
    // (collapsed width); the fixed Nav stays full-width above it. The rail
    // expands by floating over this gutter — the layout never re-flows.
    <main className="relative min-h-screen md:pl-16">
      <ImageBackground
        src="/pexels-1920.webp"
        srcSet="/pexels-640.webp 640w, /pexels-1280.webp 1280w, /pexels-1920.webp 1920w, /pexels-2560.webp 2560w"
        sizes="100vw"
      />
      {/* Grain film sobre la foto (fx/Noise): tapa el dineral de pérdida de detalle del cover — sutileza */}
      <div className="fixed inset-0 z-0 pointer-events-none" aria-hidden="true">
        <Noise patternAlpha={8} patternRefreshInterval={6} />
      </div>
      <Nav />
      <div className="relative z-10">
        <HeroShowcase>
          <section id="hero" className="max-w-none w-full mx-0 viewport-content section-y">
            <Hero />
          </section>
          <section id="about" className="max-w-none w-full mx-0 viewport-content section-y">
            <About />
          </section>
        </HeroShowcase>

        {/* Vertical rhythm is declared HERE, once per section, via .section-y
            + SectionDivider. .section-px owns horizontal padding. */}
        <div className="section-px">
          <section id="projects" className="max-w-none w-full section-y">
            <Projects />
          </section>
          <SectionDivider index={2} total={9} label="Workbench" />
          <section id="ai-workbench" className="max-w-none w-full section-y">
            <AIWorkbench />
          </section>
          <SectionDivider index={3} total={9} label="Trayectoria" />
          <Trayectoria />
          <SectionDivider index={4} total={9} label="Contribuciones" />
          <section id="contributions" className="max-w-none w-full section-y">
            <Contributions />
          </section>
          <SectionDivider index={5} total={9} label="Formación" />
          <section id="formacion" className="max-w-none w-full section-y">
            <div id="education" style={{ scrollMarginTop: "calc(var(--nav-height, 60px) + 8px)" }}>
              <Education />
            </div>
            <div aria-hidden="true" className="rule-double my-8" />
            <div id="certifications" style={{ scrollMarginTop: "calc(var(--nav-height, 60px) + 8px)" }}>
              <Certifications />
            </div>
          </section>
          <SectionDivider index={6} total={9} label="Side quests" />
          <section id="sidequests" className="max-w-none w-full section-y">
            <SideQuests />
          </section>
          <SectionDivider index={7} total={9} label="Métricas" />
          {/* Stats subordinado (max-w-5xl centrado): infografía dentro del
              ejemplar, no sección gemela. */}
          <section id="stats" className="mx-auto max-w-5xl section-y">
            <Stats />
          </section>
          <SectionDivider index={8} total={9} label="Contacto" />
          <section id="contact" className="max-w-none w-full section-y">
            <Contact />
          </section>
          <SectionDivider index={9} total={9} label="Cierre" />
          <Footer />
        </div>
        <div className="window-rail" />
      </div>
    </main>
  );
};

export default Index;
