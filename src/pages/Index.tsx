import { MeshBackground } from "@/components/MeshBackground";
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

const Index = () => {
  return (
    <main className="relative min-h-screen pb-32">
      <MeshBackground />
      <Nav />
      <div className="relative z-10 pt-20">
        <WindowChrome title="~/welcome.sh — zsh" id="hero"><Hero /></WindowChrome>
        <WindowChrome title="~/about.md" id="about"><About /></WindowChrome>
        <WindowChrome title="~/profile.json" id="profile"><Profile /></WindowChrome>
        <WindowChrome title="~/stack — npx skills" id="stack"><TechStack /></WindowChrome>
        <WindowChrome title="~/experience.log — tail -f" id="experience"><Experience /></WindowChrome>
        <WindowChrome title="~/projects — ls -la" id="projects"><Projects /></WindowChrome>
        <WindowChrome title="~/education.txt" id="education"><Education /></WindowChrome>
        <WindowChrome title="~/contact — mail" id="contact"><Footer /></WindowChrome>
      </div>
    </main>
  );
};

export default Index;
