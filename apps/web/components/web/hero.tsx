'use client';
import { Button } from '@/components/ui/button'
import { scrollToView } from '@/utils/scroll'
import { ChevronDown } from 'lucide-react'
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

            <div className="flex flex-col m-30 items-center relative mx-auto text-center">
                <Reveal delay="100">
                    <h1 className="font-bold text-5xl leading-16 max-w-2xl">Bridging Mechatronics & Code:</h1>
                </Reveal>
                <Reveal delay="200">
                    <h2 className="text-5xl font-bold mt-2 bg-linear-to-br from-primary to-secondary dark:from-tertiary dark:to-secondary bg-clip-text text-transparent leading-12 max-w-2xl">Full-Stack Solutions & Business Automation.</h2>
                </Reveal>
                <Reveal delay="300">
                    <p className="mt-5 text-sm text-foreground/70 leading-5 max-w-lg">I apply engineering logic to web development. I specialize in building responsive full-stack applications and automating business workflows, delivering clean code and practical solutions from concept to deployment.</p>
                </Reveal>
                <Reveal delay="400">
                    <p className="mt-6 font-mono text-xs tracking-wider text-muted-foreground">
                        {capabilities.join("  /  ")}
                    </p>
                </Reveal>
                <Reveal delay="500">
                    <div className="mt-8 flex gap-4">
                        <Button onClick={() => scrollToView("projects")} className='cursor-pointer px-7 py-6 bg-linear-to-br from-primary to-secondary text-white font-semibold shadow-lg shadow-primary/30 transition-all duration-300 hover:scale-110'>
                            View My Work
                        </Button>
                        <Button variant="outline" className='cursor-pointer px-6 py-6 text-primary hover:text-primary hover:bg-accent' onClick={async () => {
                            const response = await fetch("/assets/resume.pdf");
                            const blob = await response.blob();
                            const url = URL.createObjectURL(blob);
                            const a = document.createElement("a");
                            a.href = url;
                            a.download = "resume.pdf";
                            a.click();
                            URL.revokeObjectURL(url);
                        }}>Download CV</Button>
                    </div>
                </Reveal>
            </div>

            <button
                onClick={() => scrollToView("workflow")}
                aria-label="Scroll to workflow"
                className="absolute bottom-8 left-1/2 -translate-x-1/2 text-muted-foreground/60 hover:text-primary transition-colors cursor-pointer"
            >
                <ChevronDown className="w-6 h-6 animate-bounce" />
            </button>
        </section>
    );
}

export default Hero;
