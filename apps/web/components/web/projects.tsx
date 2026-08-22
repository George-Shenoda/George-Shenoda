'use client';

import { useEffect, useState } from "react";
import { projects as bundledProjects, type Project } from "@portfolio/shared";
import ProjectCard from "./Project";
import Reveal from "./Reveal";
import { Button } from "@/components/ui/button";

const INITIAL_COUNT = 6;
const LOAD_STEP = 6;

function Projects() {
    // Bundled snapshot renders immediately (SSR-safe); remote-first refresh
    // replaces it on mount so installed apps pick up data edits without reinstall.
    const [projects, setProjects] = useState<Project[]>(bundledProjects);
    const [visibleCount, setVisibleCount] = useState(INITIAL_COUNT);

    useEffect(() => {
        let cancelled = false;
        fetch("/api/projects")
            .then((res) => (res.ok ? res.json() : null))
            .then((data: Project[] | null) => {
                if (!cancelled && Array.isArray(data) && data.length > 0) {
                    setProjects(data);
                }
            })
            .catch(() => {});
        return () => {
            cancelled = true;
        };
    }, []);

    const visibleProjects = projects.slice(0, visibleCount);
    const remainingCount = projects.length - visibleProjects.length;

    return (
        <section id="projects" className="dark:bg-[#151d1d] bg-[#eee]">
            <div className="flex flex-col mx-auto items-center text-center w-full pt-20 pb-20">
                <Reveal>
                    <h2 className="text-3xl font-bold mb-5">Featured Projects</h2>
                </Reveal>
                <Reveal delay="100">
                    <p className="text-sm max-w-xl text-foreground/70">
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
                                image={project.image}
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
                            className="cursor-pointer px-8 py-6 text-primary hover:text-primary hover:bg-accent"
                        >
                            Load More ({remainingCount} more)
                        </Button>
                        <p className="text-xs text-muted-foreground">
                            Showing {visibleProjects.length} of {projects.length} projects
                        </p>
                    </Reveal>
                )}
            </div>
        </section>
    );
}

export default Projects;
