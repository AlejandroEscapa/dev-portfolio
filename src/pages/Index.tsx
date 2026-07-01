import { ImageBackground } from '@/components/background/ImageBackground';
import { Nav } from "@/components/Nav";
import { WindowChrome } from "@/components/window/WindowChrome";
import { HeroShowcase } from "@/components/sections/HeroShowcase";
import { Hero } from "@/components/sections/Hero";
import { Profile } from "@/components/sections/Profile";
import { About } from "@/components/sections/About";
import { Trayectoria } from "@/components/sections/Trayectoria";
import { Projects } from "@/components/sections/Projects";
import { Education } from "@/components/sections/Education";
import { Contact } from "@/components/sections/Contact";
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
        {/* Hero + About live inside a 40/60 split layout (HeroShowcase):
            3D figure stays pinned on the left while the right column scrolls
            through Hero → About. All three windows share the SAME height
            (.viewport-content tied to --nav-height). About uses fullHeight
            so its content scrolls inside the window — keeping the three
            windows equal-height at all viewport sizes. */}
        <HeroShowcase>
          <WindowChrome title="~/welcome.sh — zsh" id="hero" className="max-w-none w-full mx-0 my-0 viewport-content" fullHeight>
            <Hero />
          </WindowChrome>
          <WindowChrome title="~/stack — npx skills" id="about" className="max-w-none w-full mx-0 my-0 viewport-content" fullHeight>
            <About />
          </WindowChrome>
        </HeroShowcase>

        {/* Remaining sections share the same horizontal padding. */}
        <div className="section-px">
          <WindowChrome title="~/profile.json" id="profile" className="max-w-none w-full">
            <Profile />
          </WindowChrome>
          <Trayectoria />
          <WindowChrome title="~/projects — ls -la" id="projects" className="max-w-none w-full">
            <Projects />
          </WindowChrome>
          <WindowChrome title="~/education.txt" id="education" className="max-w-none w-full">
            <Education />
          </WindowChrome>
          <WindowChrome title="~/contact — mail" id="contact" className="max-w-none w-full">
            <Contact />
          </WindowChrome>
        </div>
      </div>
    </main>
  );
};

export default Index;
