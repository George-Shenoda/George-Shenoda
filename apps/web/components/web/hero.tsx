'use client';
import { Button } from '@/components/ui/button'
import { scrollToView } from '@/utils/scroll'
import { ChevronDown, FileDown } from 'lucide-react'
import Reveal from './Reveal'

const capabilities = [
    "Embedded Systems",
    "Full-Stack Web",
    "IoT Dashboards",
    "Business Automation",
];

function Hero() {
    return (
        <section className="relative overflow-hidden">
            <div aria-hidden className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-3xl h-96 -z-10 pointer-events-none">
                <div className="absolute inset-x-0 top-0 mx-auto w-[34rem] max-w-full h-full bg-primary/10 dark:bg-primary/20 blur-[110px] rounded-full"></div>
            </div>
            <div aria-hidden className="absolute inset-0 -z-10 pointer-events-none [background-image:radial-gradient(var(--border)_1px,transparent_1px)] [background-size:28px_28px] [mask-image:radial-gradient(ellipse_60%_65%_at_50%_30%,black,transparent)]"></div>

            <div className="flex flex-col px-5 pt-20 pb-24 sm:pt-28 sm:pb-28 items-center relative mx-auto text-center max-w-3xl">
                <Reveal delay="0">
                    <p className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 dark:bg-primary/15 px-4 py-1.5 text-sm font-medium text-primary">
                        <span className="relative flex size-2.5">
                            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-60"></span>
                            <span className="relative inline-flex size-2.5 rounded-full bg-primary"></span>
                        </span>
                        Available for new projects
                    </p>
                </Reveal>
                <Reveal delay="100">
                    <h1 className="font-bold text-4xl leading-tight sm:text-6xl sm:leading-[1.1] mt-6 max-w-2xl">Bridging Mechatronics &amp; Code:</h1>
                </Reveal>
                <Reveal delay="200">
                    <h2 className="text-4xl font-bold sm:text-6xl mt-2 bg-linear-to-br from-primary to-secondary dark:from-tertiary dark:to-secondary bg-clip-text text-transparent sm:leading-[1.1] max-w-2xl">Full-Stack Solutions &amp; Business Automation.</h2>
                </Reveal>
                <Reveal delay="300">
                    <p className="mt-6 text-base sm:text-lg text-muted-foreground leading-relaxed max-w-xl">I apply engineering logic to web development. I specialize in building responsive full-stack applications and automating business workflows, delivering clean code and practical solutions from concept to deployment.</p>
                </Reveal>
                <Reveal delay="400">
                    <p className="mt-6 font-mono text-sm tracking-wider text-muted-foreground">
                        {capabilities.join("  /  ")}
                    </p>
                </Reveal>
                <Reveal delay="500" className="flex flex-col items-center">
                    <div className="mt-9 flex flex-col sm:flex-row gap-3 sm:gap-4 w-full sm:w-auto">
                        <Button
                            onClick={() => scrollToView("contact")}
                            className='cursor-pointer px-8 py-6 h-auto bg-linear-to-br from-primary to-secondary text-base text-white font-semibold shadow-lg shadow-primary/40 transition-all duration-300 hover:scale-[1.03] hover:shadow-xl hover:shadow-primary/30 active:scale-[0.98]'
                        >
                            Start a Project
                        </Button>
                        <Button variant="outline" onClick={() => scrollToView("projects")} className='cursor-pointer px-8 py-6 h-auto text-base font-semibold text-primary hover:text-primary hover:bg-accent active:scale-[0.98]'>
                            View My Work
                        </Button>
                    </div>
                    <button
                        onClick={async () => {
                            const response = await fetch("/assets/resume.pdf");
                            const blob = await response.blob();
                            const url = URL.createObjectURL(blob);
                            const a = document.createElement("a");
                            a.href = url;
                            a.download = "resume.pdf";
                            a.click();
                            URL.revokeObjectURL(url);
                        }}
                        className="group mt-5 inline-flex cursor-pointer items-center gap-1.5 text-sm font-medium text-muted-foreground underline-offset-4 transition-colors hover:text-primary hover:underline"
                    >
                        <FileDown className="size-4 transition-transform group-hover:translate-y-0.5" />
                        Download CV
                    </button>
                </Reveal>
            </div>

            <button
                onClick={() => scrollToView("workflow")}
                aria-label="Scroll to workflow"
                className="absolute bottom-8 left-1/2 -translate-x-1/2 text-muted-foreground hover:text-primary transition-colors cursor-pointer"
            >
                <ChevronDown className="w-6 h-6 animate-bounce" />
            </button>
        </section>
    );
}

export default Hero;
