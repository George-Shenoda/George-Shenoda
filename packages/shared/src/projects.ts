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
    title: "GVMT Marketplace + Admin",
    techstack: ["Next.js", "TypeScript", "MongoDB", "Tailwind CSS"],
    link: "https://gvmt-two.vercel.app",
    image: "https://placehold.co/600x400",
  },
  {
    id: "gstack-client-portal",
    title: "GStack Client Portal",
    techstack: ["Next.js", "Node.js", "Nodemailer", "MongoDB"],
    link: "https://gstack-ashen.vercel.app",
    image: "https://placehold.co/700x400",
  },
  {
    id: "elevate-studio",
    title: "Elevate Studio Website",
    techstack: ["Next.js", "Tailwind CSS"],
    link: "https://gstack-business-website.vercel.app",
    image: "https://placehold.co/800x500",
  },
  {
    id: "iot-smart-office",
    title: "IoT Smart Office System",
    techstack: ["Raspberry Pi", "MQTT", "Python", "Blynk"],
    link: "https://gstack-client-portal.vercel.app",
    image: "https://placehold.co/900x600",
  },
  {
    id: "iot-smart-office",
    title: "IoT Smart Office System",
    techstack: ["Raspberry Pi", "MQTT", "Python", "Blynk"],
    link: "https://gstack-client-portal.vercel.app",
    image: "https://placehold.co/1000x600",
  },
];

export { projects };
