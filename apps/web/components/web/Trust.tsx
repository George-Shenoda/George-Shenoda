import { CalendarCheck, FileText, KeyRound } from "lucide-react";
import { projects } from "@portfolio/shared";
import Cards from "./Cards";
import Reveal from "./Reveal";

function Trust() {
    return (
        <section aria-labelledby="trust-heading">
            <div className="flex flex-col mx-auto items-center text-center w-full pt-20 pb-20 sm:pt-28 sm:pb-28 px-4">
                <Reveal>
                    <h2 id="trust-heading" className="text-3xl sm:text-4xl font-bold mb-5">
                        A Low-Risk Way to Start
                    </h2>
                </Reveal>
                <Reveal delay="100">
                    <p className="text-base sm:text-lg max-w-xl text-muted-foreground leading-relaxed">
                        Hiring a developer is a leap of trust. Here is how I make
                        sure you are never guessing about cost, progress, or
                        ownership.
                    </p>
                </Reveal>

                <Reveal delay="150">
                    <dl className="mt-12 flex flex-wrap justify-center gap-x-14 gap-y-8">
                        <div className="flex flex-col items-center gap-1">
                            <dd className="font-mono text-4xl font-bold text-primary tabular-nums">
                                {projects.length}+
                            </dd>
                            <dt className="text-base font-medium text-muted-foreground">Projects delivered</dt>
                        </div>
                        <div className="flex flex-col items-center gap-1">
                            <dd className="font-mono text-4xl font-bold text-primary tabular-nums">24h</dd>
                            <dt className="text-base font-medium text-muted-foreground">Response time</dt>
                        </div>
                        <div className="flex flex-col items-center gap-1">
                            <dd className="font-mono text-4xl font-bold text-primary tabular-nums">100%</dd>
                            <dt className="text-base font-medium text-muted-foreground">Code ownership, yours</dt>
                        </div>
                    </dl>
                </Reveal>

                <div className="mt-14 grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 max-w-6xl mx-auto">
                    <Reveal delay="0" className="h-full">
                        <Cards
                            title="Free intro call"
                            description="Walk me through your idea and constraints. You get an honest feasibility read and a rough estimate before any commitment — no pressure, no obligation."
                            icon={<CalendarCheck className="w-6 h-6" />}
                            iconClassName="bg-secondary/10 text-secondary ring-1 ring-secondary/20"
                        />
                    </Reveal>
                    <Reveal delay="150" className="h-full">
                        <Cards
                            title="Fixed-scope quotes"
                            description="Every project begins with a written scope: deliverables, timeline, and price agreed upfront. If something changes, you hear it from me first — never on an invoice."
                            icon={<FileText className="w-6 h-6" />}
                            iconClassName="bg-tertiary/10 text-primary ring-1 ring-tertiary/20"
                        />
                    </Reveal>
                    <Reveal delay="300" className="h-full">
                        <Cards
                            title="Full handoff, no lock-in"
                            description="You own the code from day one. Documented repositories, credentials handed over, and a walkthrough session so your team can run and extend it without me."
                            icon={<KeyRound className="w-6 h-6" />}
                            iconClassName="bg-secondary/10 text-secondary ring-1 ring-secondary/20"
                        />
                    </Reveal>
                </div>
            </div>
        </section>
    );
}

export default Trust;
