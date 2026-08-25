import Image from "next/image";
import { ArrowUpRight } from "lucide-react";

// Same origin baked at build time (see projects.tsx); "" when unset.
const LIVE_BASE = (process.env.NEXT_PUBLIC_SITE_URL ?? "").replace(/\/$/, "");

interface ProjectProps {
    title: string;
    techstack: string[];
    link: string;
    image: string;
}

function Project({ title, techstack, link, image }: ProjectProps) {
    // Assets served by this deployment go through next/image optimization
    // (AVIF/WebP, right-sized). Cross-origin URLs (desktop live-fetch of newer
    // content than its bundle) fall back to a plain lazy <img>.
    const isOwnAsset =
        !image.startsWith("http") ||
        (LIVE_BASE !== "" && image.startsWith(`${LIVE_BASE}/`));
    const optimizedSrc =
        isOwnAsset && LIVE_BASE !== "" && image.startsWith(LIVE_BASE)
            ? image.slice(LIVE_BASE.length)
            : image;

    return (
        <a
            href={link}
            target="_blank"
            rel="noopener noreferrer"
            className="group bg-white dark:bg-[#192020] rounded-xl shadow-md border border-black/10 dark:border-white/10 overflow-hidden flex flex-col hover:scale-[1.02] hover:border-primary/40 hover:shadow-xl transition-[transform,border-color,box-shadow] duration-300 dark:hover:shadow-primary/20"
        >
            <div className="relative w-full aspect-video overflow-hidden">
                {isOwnAsset ? (
                    <Image
                        src={optimizedSrc}
                        alt={`${title} screenshot`}
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                ) : (
                    // eslint-disable-next-line @next/next/no-img-element -- cross-origin asset; the optimizer only handles same-origin paths
                    <img
                        src={image}
                        alt={`${title} screenshot`}
                        loading="lazy"
                        decoding="async"
                        className="absolute inset-0 h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                )}
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
                            className="text-[13px] font-medium px-3 py-1 rounded-full ring-1 ring-secondary/25 bg-secondary/10 text-secondary"
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
