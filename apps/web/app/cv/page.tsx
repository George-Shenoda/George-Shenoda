import type { Metadata } from "next";
import Link from "next/link";
import { cv } from "@portfolio/shared";
import { SITE_URL } from "@/lib/site";
import PrintButton from "@/components/web/PrintButton";
import { BackButton } from "@/components/web/BackButton";

export const metadata: Metadata = {
    title: "CV",
    description:
        "Curriculum vitae of George Shenoda — full-stack developer and mechatronics engineering student. Experience, projects, skills, and education.",
    alternates: {
        canonical: "/cv",
    },
};

const labelClass = "text-[11px] font-semibold uppercase tracking-[0.18em] text-primary";

function SectionLabel({ children }: { children: React.ReactNode }) {
    return (
        <div className="mb-3 flex items-center gap-3">
            <span className={labelClass}>{children}</span>
            <span aria-hidden className="h-px flex-1 bg-border" />
        </div>
    );
}

export default function CvPage() {
    const { profile, links, summary, experience, education, projects, skillGroups, certifications, languages } = cv;

    return (
        <div className="cv-page min-h-screen w-full bg-muted py-6 print:bg-background print:py-0">
            <BackButton />
            <PrintButton />
            <article className="cv-sheet mx-auto w-full max-w-[210mm] bg-card px-[9mm] py-[10mm] text-card-foreground shadow-xl sm:px-[16mm] sm:py-[14mm] print:max-w-none print:px-[16mm] print:py-[14mm] print:shadow-none">
                <header className="break-inside-avoid">
                    <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
                        {profile.name}
                    </h1>
                    <p className="mt-2 text-base font-medium text-primary sm:text-lg">
                        {profile.headline}
                    </p>
                    <p className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-muted-foreground">
                        <span>{profile.location}</span>
                        <span aria-hidden>·</span>
                        <a href={`mailto:${profile.email}`} className="hover:text-primary hover:underline">
                            {profile.email}
                        </a>
                        {links.map(({ label, href }) => (
                            <span key={label} className="flex items-center gap-2">
                                <span aria-hidden>·</span>
                                <a
                                    href={href}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="hover:text-primary hover:underline"
                                >
                                    {label}
                                </a>
                            </span>
                        ))}
                        <span className="flex items-center gap-2">
                            <span aria-hidden>·</span>
                            <Link
                                href="/"
                                className="hover:text-primary hover:underline"
                            >
                                Portfolio
                            </Link>
                        </span>
                    </p>
                </header>

                <section aria-label="Summary" className="mt-8 break-inside-avoid">
                    <p className="max-w-[65ch] text-[15px] leading-relaxed text-foreground">
                        {summary}
                    </p>
                </section>

                <section aria-label="Experience" className="mt-8">
                    <SectionLabel>Experience</SectionLabel>
                    <div className="flex flex-col gap-5">
                        {experience.map((entry) => (
                            <div key={`${entry.company}-${entry.period}`} className="break-inside-avoid">
                                <div className="flex flex-wrap items-baseline justify-between gap-x-4">
                                    <h3 className="text-base font-bold">
                                        {entry.role}
                                        <span className="font-medium text-muted-foreground">
                                            {" "}
                                            — {entry.company}
                                        </span>
                                    </h3>
                                    <p className="font-mono text-[13px] text-muted-foreground">
                                        {entry.period}
                                    </p>
                                </div>
                                <ul className="mt-1.5 list-disc space-y-1 pl-5 text-[14px] leading-relaxed text-foreground">
                                    {entry.highlights.map((highlight) => (
                                        <li key={highlight}>{highlight}</li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>
                </section>

                <section aria-label="Selected projects" className="mt-8">
                    <SectionLabel>Selected Projects</SectionLabel>
                    <div className="flex flex-col gap-3.5">
                        {projects.map((project) => (
                            <div key={project.id} className="break-inside-avoid">
                                <div className="flex flex-wrap items-baseline justify-between gap-x-4">
                                    <h3 className="text-[15px] font-bold">
                                        {project.link ? (
                                            <a
                                                href={project.link}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="hover:text-primary hover:underline"
                                            >
                                                {project.name}
                                            </a>
                                        ) : (
                                            project.name
                                        )}
                                    </h3>
                                    <p className="font-mono text-[12px] text-muted-foreground">
                                        {project.techstack.join(" · ")}
                                    </p>
                                </div>
                                <p className="mt-0.5 text-[14px] leading-relaxed text-foreground">
                                    {project.description}
                                </p>
                            </div>
                        ))}
                    </div>
                </section>

                <section aria-label="Education" className="mt-8 break-inside-avoid">
                    <SectionLabel>Education</SectionLabel>
                    {education.map((entry) => (
                        <div key={entry.degree} className="flex flex-wrap items-baseline justify-between gap-x-4">
                            <h3 className="text-[15px] font-bold">
                                {entry.degree}
                                <span className="font-medium text-muted-foreground">
                                    {" "}
                                    — {entry.school}
                                </span>
                            </h3>
                            <p className="font-mono text-[13px] text-muted-foreground">
                                {entry.period}
                            </p>
                        </div>
                    ))}
                </section>

                <section aria-label="Skills" className="mt-8 break-inside-avoid">
                    <SectionLabel>Skills</SectionLabel>
                    <dl className="grid grid-cols-1 gap-x-8 gap-y-2 text-[14px] leading-relaxed sm:grid-cols-2">
                        {skillGroups.map((group) => (
                            <div key={group.label} className="flex gap-2">
                                <dt className="min-w-32 font-semibold text-foreground">
                                    {group.label}
                                </dt>
                                <dd className="text-foreground">{group.items.join(", ")}</dd>
                            </div>
                        ))}
                    </dl>
                </section>

                <section
                    aria-label="Certifications and languages"
                    className="mt-8 grid grid-cols-1 break-inside-avoid gap-8 sm:grid-cols-2"
                >
                    <div>
                        <SectionLabel>Certifications</SectionLabel>
                        <ul className="flex flex-col gap-1.5 text-[14px] leading-relaxed">
                            {certifications.map((certification) => (
                                <li key={certification.title}>
                                    <span className="font-semibold text-foreground">{certification.title}</span>
                                    <span className="text-muted-foreground">
                                        {" "}
                                        — {certification.issuer} {certification.year}
                                    </span>
                                </li>
                            ))}
                        </ul>
                    </div>
                    <div>
                        <SectionLabel>Languages</SectionLabel>
                        <ul className="flex flex-col gap-1.5 text-[14px] leading-relaxed">
                            {languages.map((language) => (
                                <li key={language.name}>
                                    <span className="font-semibold text-foreground">{language.name}</span>
                                    <span className="text-muted-foreground"> — {language.level}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                </section>

                <footer className="mt-10 break-inside-avoid border-t border-border pt-3 text-[11px] text-muted-foreground">
                    <p>
                        {profile.name} — {profile.headline}. Latest version always at{" "}
                        {SITE_URL}/cv
                    </p>
                </footer>
            </article>
        </div>
    );
}