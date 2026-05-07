import { MeshBackground } from "@/components/MeshBackground";
import { Nav } from "@/components/Nav";
import { SectionZoom } from "@/components/SectionZoom";
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
    <main className="relative min-h-screen">
      <MeshBackground />
      <Nav />
      <Hero />
      <SectionZoom><About /></SectionZoom>
      <SectionZoom><Profile /></SectionZoom>
      <SectionZoom scaleRange={0.04}><TechStack /></SectionZoom>
      <SectionZoom><Experience /></SectionZoom>
      <SectionZoom scaleRange={0.04}><Projects /></SectionZoom>
      <SectionZoom><Education /></SectionZoom>
      <SectionZoom yRange={15}><Footer /></SectionZoom>
    </main>
  );
};

export default Index;
