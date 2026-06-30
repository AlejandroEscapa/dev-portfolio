import { Scene } from '@/components/three/Scene';
import { FlowFieldBackground } from '@/components/three/FlowFieldBackground';
import { Nav } from "@/components/Nav";
import { WindowChrome } from "@/components/window/WindowChrome";
import { Hero } from "@/components/sections/Hero";
import { Profile } from "@/components/sections/Profile";
import { About } from "@/components/sections/About";
import { TechStack } from "@/components/sections/TechStack";
import { Experience } from "@/components/sections/Experience";
import { Projects } from "@/components/sections/Projects";
import { Education } from "@/components/sections/Education";
import { Footer } from "@/components/sections/Footer";
import { SidePanel } from "@/components/SidePanel";

const Index = () => {
  return (
    <main className="relative min-h-screen pb-32">
      <div className="fixed inset-0 z-0 pointer-events-none">
        <Scene className="!fixed inset-0" camera={{ position: [0, 0, 5], fov: 75 }}>
          <FlowFieldBackground />
        </Scene>
      </div>
      <Nav />
      <div className="relative z-10 pt-20">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <div className="grid gap-8 lg:grid-cols-12">
            {/* Main content - left column */}
            <div className="lg:col-span-8">
              <WindowChrome title="~/welcome.sh — zsh" id="hero"><Hero /></WindowChrome>
              <WindowChrome title="~/about.md" id="about"><About /></WindowChrome>
              <WindowChrome title="~/profile.json" id="profile"><Profile /></WindowChrome>
              <WindowChrome title="~/stack — npx skills" id="stack"><TechStack /></WindowChrome>
              <WindowChrome title="~/experience.log — tail -f" id="experience"><Experience /></WindowChrome>
              <WindowChrome title="~/projects — ls -la" id="projects"><Projects /></WindowChrome>
              <WindowChrome title="~/education.txt" id="education"><Education /></WindowChrome>
              <WindowChrome title="~/contact — mail" id="contact"><Footer /></WindowChrome>
            </div>

            {/* Side panel - right column */}
            <aside className="hidden lg:block lg:col-span-4">
              <SidePanel />
            </aside>
          </div>
        </div>
      </div>
    </main>
  );
};

export default Index;
