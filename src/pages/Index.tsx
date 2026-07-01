import { ImageBackground } from '@/components/background/ImageBackground';
import { Nav } from "@/components/Nav";
import { WindowChrome } from "@/components/window/WindowChrome";
import { HeroSplitScroll } from "@/components/sections/HeroSplitScroll";
import { Hero } from "@/components/sections/Hero";
import { Profile } from "@/components/sections/Profile";
import { About } from "@/components/sections/About";
import { TechStack } from "@/components/sections/TechStack";
import { Experience } from "@/components/sections/Experience";
import { Projects } from "@/components/sections/Projects";
import { Education } from "@/components/sections/Education";
import { Footer } from "@/components/sections/Footer";
import { useLenis } from "@/hooks/useLenis";

const Index = () => {
  useLenis();
  return (
    <main className="relative min-h-screen pb-32">
      {/* Full-viewport Pexels background with responsive srcset. */}
      <ImageBackground
        src="/pexels-1920.webp"
        srcSet="/pexels-640.webp 640w, /pexels-1280.webp 1280w, /pexels-1920.webp 1920w, /pexels-2560.webp 2560w"
        sizes="100vw"
      />
      <Nav />
      <div className="relative z-10">
        {/* Hero + About live inside a 40/60 split-scroll: the 3D figure
            stays pinned on the left while the right side scrolls through
            the hero text and then the "resumen profesional" (About).
            HeroSplitScroll handles its own padding to avoid double-padding. */}
        <HeroSplitScroll>
          <WindowChrome title="~/welcome.sh — zsh" id="hero" className="max-w-none w-full my-0 mx-0 h-[calc(100vh-5rem)]" fullHeight>
            <Hero />
          </WindowChrome>
          <WindowChrome title="~/about.md" id="about" className="max-w-none w-full my-0 mx-0">
            <About />
          </WindowChrome>
        </HeroSplitScroll>

        {/* Remaining sections share the same horizontal padding. */}
        <div className="section-px">
          <WindowChrome title="~/profile.json" id="profile" className="max-w-none w-full">
            <Profile />
          </WindowChrome>
          <WindowChrome title="~/stack — npx skills" id="stack" className="max-w-none w-full">
            <TechStack />
          </WindowChrome>
          <WindowChrome title="~/experience.log — tail -f" id="experience" className="max-w-none w-full">
            <Experience />
          </WindowChrome>
          <WindowChrome title="~/projects — ls -la" id="projects" className="max-w-none w-full">
            <Projects />
          </WindowChrome>
          <WindowChrome title="~/education.txt" id="education" className="max-w-none w-full">
            <Education />
          </WindowChrome>
          <WindowChrome title="~/contact — mail" id="contact" className="max-w-none w-full">
            <Footer />
          </WindowChrome>
        </div>
      </div>
    </main>
  );
};

export default Index;
