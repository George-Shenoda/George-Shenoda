import Image from "next/image";
import { ArrowUpRight } from "lucide-react";

interface ProjectProps {
    title: string;
    techstack: string[];
    link: string;
    image: string;
}

function Project({ title, techstack, link, image }: ProjectProps) {
    return (
        <a
            href={link}
            target="_blank"
            rel="noopener noreferrer"
            className="group bg-white dark:bg-[#192020] rounded-xl shadow-lg border overflow-hidden flex flex-col hover:scale-105 transition-all duration-300 dark:hover:shadow-primary/20"
        >
            <div className="relative w-full aspect-video overflow-hidden">
                <Image
                    unoptimized
                    src={image}
                    alt={`${title} screenshot`}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                />
            </div>
            <div className="p-6 flex flex-col gap-4 text-left">
                <div className="flex items-center justify-between">
                    <h3 className="text-xl font-bold text-foreground">{title}</h3>
                    <ArrowUpRight className="w-5 h-5 shrink-0 text-muted-foreground transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </div>
                <ul className="flex flex-wrap gap-2">
                    {techstack.map((tech) => (
                        <li
                            key={tech}
                            className="text-xs px-2.5 py-1 rounded-full ring-1 ring-secondary/20 bg-secondary/10 text-secondary"
                        >
                            {tech}
                        </li>
                    ))}
                </ul>
            </div>
        </a>
    );
}

export default Project;
