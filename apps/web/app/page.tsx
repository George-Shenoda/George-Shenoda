import Hero from "@/components/web/hero";
import Workflow from "@/components/web/workflow";
import Business from "@/components/web/Buisness";
import Contact from "@/components/web/Contact";
import Projects from "@/components/web/projects";
import Footer from "@/components/web/footer";


export default function Home() {
  return (
    <>
      <Hero />
      <Workflow />
      <Business />
      <Projects />
      <Contact />
      <Footer />
    </>
  );
}
