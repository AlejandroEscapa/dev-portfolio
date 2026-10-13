import { ImageBackground } from '@/components/background/ImageBackground';
import Noise from '@/components/fx/Noise';
import { Nav } from "@/components/Nav";
import { WindowChrome } from "@/components/window/WindowChrome";
import { HeroShowcase } from "@/components/sections/HeroShowcase";
import { Hero } from "@/components/sections/Hero";
import { About } from "@/components/sections/About";
import { Trayectoria } from "@/components/sections/Trayectoria";
import { Contributions } from "@/components/sections/Contributions";
import { Projects } from "@/components/sections/Projects";
import { Education } from "@/components/sections/Education";
import { Certifications } from "@/components/sections/Certifications";
import { SideQuests } from "@/components/sections/SideQuests";
import { Stats } from "@/components/sections/Stats";
import { Contact } from "@/components/sections/Contact";
import { Footer } from "@/components/Footer";
import { useLenis } from "@/hooks/useLenis";

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
        <Noise patternAlpha={10} patternRefreshInterval={4} />
      </div>
      <Nav />
      <div className="relative z-10">
        <HeroShowcase>
          <WindowChrome title="~/welcome.sh — zsh" id="hero" className="max-w-none w-full mx-0 viewport-content" fullHeight>
            <Hero />
          </WindowChrome>
          <WindowChrome title="~/stack — npx skills" id="about" className="max-w-none w-full mx-0 viewport-content" fullHeight>
            <About />
          </WindowChrome>
        </HeroShowcase>

        {/* Vertical rhythm is declared HERE, once per section, via .section-y.
            .section-px owns horizontal padding; WindowChrome adds no margins. */}
        <div className="section-px">
          <WindowChrome title="~/projects — ls -la" id="projects" className="max-w-none w-full section-y">
            <Projects />
          </WindowChrome>
          <Trayectoria />
          <WindowChrome title="~/contributions — git log --author=alejandro" id="contributions" className="max-w-none w-full section-y">
            <Contributions />
          </WindowChrome>
          {/* F1.1 Formación verificable: un solo chrome visual con anclas internas education + certifications intactas. */}
          <WindowChrome title="~/formacion — cat education.txt certifications --verify" id="formacion" className="max-w-none w-full section-y">
            <div id="education" style={{ scrollMarginTop: "calc(var(--nav-height, 60px) + 8px)" }}>
              <Education />
            </div>
            <div aria-hidden="true" className="my-8 h-px bg-neutral-tint/10" />
            <div id="certifications" style={{ scrollMarginTop: "calc(var(--nav-height, 60px) + 8px)" }}>
              <Certifications />
            </div>
          </WindowChrome>
          <WindowChrome title="~/side-quests — ls ~/hobbies" id="sidequests" className="max-w-none w-full section-y">
            <SideQuests />
          </WindowChrome>
          {/* F1.2 Stats tira compacta sin chrome propio; id stats conservado para anchors/Spotlight. */}
          <div id="stats" style={{ scrollMarginTop: "calc(var(--nav-height, 60px) + 8px)" }} className="mx-auto max-w-5xl section-y">
            <Stats />
          </div>
          <WindowChrome title="~/contact — mail" id="contact" className="max-w-none w-full section-y">
            <Contact />
          </WindowChrome>
          <Footer />
        </div>
        <div className="window-rail" />
      </div>
    </main>
  );
};

export default Index;
