'use client';

import { useEffect, useState } from "react";
import Image from "next/image";
import { ArrowUpRight } from "lucide-react";

// Baked at build time. Falls back to production URL so desktop builds without
// a local .env still OTA-load live assets (fixes blank after `git push` without rebuild).
const LIVE_BASE = (
  process.env.NEXT_PUBLIC_SITE_URL?.trim() || "https://george-shenoda.vercel.app"
).replace(/\/$/, "");

interface ProjectProps {
    title: string;
    techstack: string[];
    link: string;
    image: string;
}

function Project({ title, techstack, link, image }: ProjectProps) {
    // Synchronous desktop detection avoids first-render flash of local 404 for
    // new OTA images that aren't in the bundled snapshot (installed desktop).
    const [isDesktop] = useState(
        () =>
            typeof window !== "undefined" &&
            Boolean(
                (window as unknown as { electronAPI?: { isDesktop?: boolean } })
                    .electronAPI?.isDesktop
            )
    );
    const [remoteFailed, setRemoteFailed] = useState(false);

    // Reset fallback when image URL changes (e.g. hash-renamed asset or new project)
    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect -- reset transient error state for new src
        setRemoteFailed(false);
    }, [image]);

    const isLiveRemote = LIVE_BASE !== "" && image.startsWith(`${LIVE_BASE}/`);
    // Desktop OTA: keep remote LIVE_BASE URL as cross-origin so installed app
    // loads the current deployed asset without requiring a rebuild. Falls back
    // to bundled local copy if remote fails (offline / 404).
    const shouldUseRemote = isLiveRemote && isDesktop && !remoteFailed;

    const isOwnAsset = shouldUseRemote
        ? false
        : !image.startsWith("http") || isLiveRemote;
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
                {shouldUseRemote ? (
                    // eslint-disable-next-line @next/next/no-img-element -- desktop OTA remote asset; falls back to local onError
                    <img
                        src={image}
                        alt={`${title} screenshot`}
                        loading="lazy"
                        decoding="async"
                        onError={() => setRemoteFailed(true)}
                        className="absolute inset-0 h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                ) : isOwnAsset ? (
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
