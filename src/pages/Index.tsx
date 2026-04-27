import { MeshBackground } from "@/components/MeshBackground";
import { Nav } from "@/components/Nav";
import { Hero } from "@/components/sections/Hero";
import { Profile } from "@/components/sections/Profile";
import { TechStack } from "@/components/sections/TechStack";
import { Experience } from "@/components/sections/Experience";
import { Projects } from "@/components/sections/Projects";
import { Education } from "@/components/sections/Education";
import { Footer } from "@/components/sections/Footer";

const Index = () => {
  return (
    <main className="relative min-h-screen">
      <MeshBackground />
      <Nav />
      <Hero />
      <Profile />
      <TechStack />
      <Experience />
      <Projects />
      <Education />
      <Footer />
    </main>
  );
};

export default Index;
