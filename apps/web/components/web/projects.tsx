'use client';

import { useEffect, useState } from "react";
import { projects as bundledProjects, type Project } from "@portfolio/shared";
import ProjectCard from "./Project";
import Reveal from "./Reveal";
import { Button } from "@/components/ui/button";

const INITIAL_COUNT = 6;
const LOAD_STEP = 6;

/**
 * Site origin baked at build time. Falls back to production so a desktop build
 * without a local .env still reaches the live site (fixes blank after push).
 */
const LIVE_BASE = (
  process.env.NEXT_PUBLIC_SITE_URL?.trim() || "https://george-shenoda.vercel.app"
).replace(/\/$/, "");

async function fetchProjectsJson(url: string): Promise<Project[] | null> {
    try {
        const res = await fetch(url, { cache: "no-store" });
        if (!res.ok) return null;
        return await res.json();
    } catch {
        return null;
    }
}

function Projects() {
    // Bundled snapshot renders immediately (SSR-safe); remote-first refresh
    // replaces it on mount so installed apps pick up data edits without reinstall.
    const [projects, setProjects] = useState<Project[]>(bundledProjects);
    const [visibleCount, setVisibleCount] = useState(INITIAL_COUNT);

    useEffect(() => {
        let cancelled = false;
        // Live site first (shared with mobile); fall back to the bundled API so
        // an offline desktop app still shows its snapshot.
        fetchProjectsJson(`${LIVE_BASE}/api/projects`)
            .then((live) =>
                live && live.length > 0 ? live : fetchProjectsJson("/api/projects")
            )
            .then((data) => {
                if (!cancelled && Array.isArray(data) && data.length > 0) {
                    setProjects(data);
                }
            });
        return () => {
            cancelled = true;
        };
    }, []);

    const visibleProjects = projects.slice(0, visibleCount);
    const remainingCount = projects.length - visibleProjects.length;

    return (
        <section id="projects" className="dark:bg-[#151d1d] bg-[#eee]">
            <div className="flex flex-col mx-auto items-center text-center w-full pt-20 pb-20 sm:pt-28 sm:pb-28 px-4">
                <Reveal>
                    <h2 className="text-3xl sm:text-4xl font-bold mb-5">Featured Projects</h2>
                </Reveal>
                <Reveal delay="100">
                    <p className="text-base sm:text-lg max-w-xl text-muted-foreground leading-relaxed">
                        A selection of applications I have designed and built,
                        combining full-stack development with practical engineering
                        solutions.
                    </p>
                </Reveal>
                <div className="mt-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
                    {visibleProjects.map((project, index) => (
                        <Reveal
                            key={project.title}
                            className="h-full"
                            delay={(index % 3) * 150 === 0 ? undefined : ((index % 3) === 1 ? "150" : "300")}
                        >
                            <ProjectCard
                                title={project.title}
                                techstack={project.techstack}
                                link={project.link}
                                image={`${LIVE_BASE}${project.image}`}
                            />
                        </Reveal>
                    ))}
                </div>
                {remainingCount > 0 && (
                    <Reveal className="mt-14 flex flex-col items-center gap-3">
                        <Button
                            variant="outline"
                            onClick={() =>
                                setVisibleCount((count) =>
                                    Math.min(count + LOAD_STEP, projects.length)
                                )
                            }
                            className="cursor-pointer px-8 py-6 h-auto text-base font-semibold text-primary hover:text-primary hover:bg-accent active:scale-[0.98]"
                        >
                            Load More ({remainingCount} more)
                        </Button>
                        <p className="text-sm text-muted-foreground">
                            Showing {visibleProjects.length} of {projects.length} projects
                        </p>
                    </Reveal>
                )}
            </div>
        </section>
    );
}

export default Projects;
