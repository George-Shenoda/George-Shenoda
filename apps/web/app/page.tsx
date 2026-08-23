import Hero from "@/components/web/hero";
import Workflow from "@/components/web/workflow";
import Business from "@/components/web/Buisness";
import Contact from "@/components/web/Contact";
import Projects from "@/components/web/projects";
import Trust from "@/components/web/Trust";
import Footer from "@/components/web/footer";
import { SITE_NAME } from "@/lib/site";

const personJsonLd = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: SITE_NAME,
  jobTitle: "Full-Stack Developer",
  description:
    "Full-stack developer bridging mechatronics and code. Responsive web apps, IoT dashboards, and business automation from concept to deployment.",
  knowsAbout: [
    "Embedded Systems",
    "Full-Stack Web",
    "IoT Dashboards",
    "Business Automation",
  ],
};

export default function Home() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd) }}
      />
      <Hero />
      <Workflow />
      <Business />
      <Projects />
      <Trust />
      <Contact />
      <Footer />
    </>
  );
}
