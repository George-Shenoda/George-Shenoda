export type Project = {
  id: string;
  title: string;
  techstack: string[];
  link: string;
  image: string;
};

const projects: Project[] = [
  {
    id: "gvmt-marketplace",
    title: "GVMT Marketplace",
    techstack: ["Next.js", "TypeScript", "MongoDB", "Tailwind CSS"],
    link: "https://gvmt-two.vercel.app",
    image: "/assets/projects/gvmt-marketplace.png",
  },
  {
    id: "gvmt-admin",
    title: "GVMT Admin",
    techstack: ["Next.js", "TypeScript", "MongoDB", "Tailwind CSS"],
    link: "https://gvmt-admin.vercel.app",
    image: "/assets/projects/gvmt-admin.png",
  },
  {
    id: "gstack-landing-page",
    title: "GStack Landing Page",
    techstack: ["Next.js", "Nodemailer", "Tailwind CSS"],
    link: "https://gstack-ashen.vercel.app",
    image: "/assets/projects/gstack-landing-page.png",
  },
  {
    id: "elevate-studio",
    title: "Elevate Studio Website",
    techstack: ["Next.js", "Tailwind CSS"],
    link: "https://gstack-business-website.vercel.app",
    image: "/assets/projects/elevate-studio.png",
  },
  {
    id: "gstack-portal",
    title: "GStack Portal",
    techstack: ["Next.js", "Node.js", "Nodemailer", "MongoDB"],
    link: "https://gstack-client-portal.vercel.app",
    image: "/assets/projects/gstack-portal.png",
  },
];

export { projects };
