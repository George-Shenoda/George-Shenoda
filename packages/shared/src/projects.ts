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
    link: "https://github.com/george-shenoda",
    image: "/assets/projects/gvmt-marketplace.png",
  },
  {
    id: "gstack-client-portal",
    title: "GStack Client Portal",
    techstack: ["Next.js", "Node.js", "Nodemailer"],
    link: "https://github.com/george-shenoda",
    image: "/assets/projects/gstack-client-portal.png",
  },
  {
    id: "elevate-studio",
    title: "Elevate Studio Website",
    techstack: ["Next.js", "Tailwind CSS"],
    link: "https://github.com/george-shenoda",
    image: "/assets/projects/elevate-studio.png",
  },
  {
    id: "iot-smart-office",
    title: "IoT Smart Office System",
    techstack: ["ESP32", "MQTT", "React", "Node.js"],
    link: "https://github.com/george-shenoda",
    image: "/assets/projects/iot-smart-office.png",
  },
];

export { projects };
