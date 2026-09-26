import { ImageBackground } from '@/components/background/ImageBackground';
import { Nav } from "@/components/Nav";
import { WindowChrome } from "@/components/window/WindowChrome";
import { HeroShowcase } from "@/components/sections/HeroShowcase";
import { Hero } from "@/components/sections/Hero";
import { About } from "@/components/sections/About";
import { Trayectoria } from "@/components/sections/Trayectoria";
import { Projects } from "@/components/sections/Projects";
import { Education } from "@/components/sections/Education";
import { Contact } from "@/components/sections/Contact";
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
          <WindowChrome title="~/education.txt" id="education" className="max-w-none w-full section-y">
            <Education />
          </WindowChrome>
          <WindowChrome title="~/contact — mail" id="contact" className="max-w-none w-full section-y">
            <Contact />
          </WindowChrome>
        </div>
        <div className="window-rail" />
      </div>
    </main>
  );
};

export default Index;
