export type Project = {
  title: string;
  techstack: string[];
  link: string;
  image: string;
};

const projects: Project[] = [
  {
    title: "Smart Inventory Dashboard",
    techstack: ["Next.js", "TypeScript", "MongoDB", "Tailwind CSS"],
    link: "https://example.com",
    image: "https://placehold.co/600x400",
  },
];

export { projects };
