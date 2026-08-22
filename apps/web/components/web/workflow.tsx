import { Code, DraftingCompass, Lightbulb, Rocket } from "lucide-react";
import Cards from "./Cards";
import Reveal from "./Reveal";

function workflow() {
    return (
        <section id="workflow" className="dark:bg-[#151d1d] bg-[#eee]">
            <div className="flex flex-col mx-auto items-center text-center w-full pt-20 pb-20">
                <Reveal>
                    <h2 className="text-3xl font-bold mb-5">
                        Concept to Deployment
                    </h2>
                </Reveal>
                <Reveal delay="100">
                    <p className="text-sm max-w-xl text-foreground/70">
                        Applying engineering precision to full-stack development. A
                        structured, independent workflow designed to build scalable
                        web applications and automate complex business processes.
                    </p>
                </Reveal>
                <div className="mt-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
                    <Reveal delay="0" className="h-full">
                        <Cards
                            title="1. Discovery"
                            description="Deep dive into your business workflows. Defining core application logic, data constraints, and identifying opportunities for digital automation."
                            icon={<Lightbulb className="w-6 h-6" />}
                            iconClassName="bg-tertiary/10 text-primary ring-1 ring-tertiary/20"
                        />
                    </Reveal>
                    <Reveal delay="150" className="h-full">
                        <Cards
                            title="2. Architecture"
                            description="Structuring scalable database models (like MongoDB) and mapping out secure API routes. Selecting the optimal modern stack (Next.js, Node.js) for high performance."
                            icon={<DraftingCompass className="w-6 h-6" />}
                            iconClassName="bg-secondary/10 text-secondary ring-1 ring-secondary/20"
                        />
                    </Reveal>
                    <Reveal delay="300" className="h-full">
                        <Cards
                            title="3. Development"
                            description="Building modular, responsive UI components with Tailwind CSS and TypeScript. Writing clean, maintainable backend code focused on seamless state management."
                            icon={<Code className="w-6 h-6" />}
                            iconClassName="bg-tertiary/10 text-primary ring-1 ring-tertiary/20"
                        />
                    </Reveal>
                    <Reveal delay="500" className="h-full">
                        <Cards
                            title="4. Launch"
                            description="Deploying optimized builds to production. Setting up continuous integration, performance monitoring, and ensuring a smooth, fully-documented handoff."
                            icon={<Rocket className="w-6 h-6" />}
                            iconClassName="bg-secondary/10 text-secondary ring-1 ring-secondary/20"
                        />
                    </Reveal>
                </div>
            </div>
        </section>
    );
}

export default workflow;
