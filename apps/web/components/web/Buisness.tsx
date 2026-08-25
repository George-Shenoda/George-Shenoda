import { CheckCircle, Cloud, Columns3, Settings, Webhook } from "lucide-react";
import Reveal from "./Reveal";

function Business() {
    return (
        <section>

            <div className="py-24 flex flex-col md:flex-row justify-between items-center gap-12 md:gap-24 mx-auto max-w-4xl px-4 ">
                <Reveal className="flex-1">
                    <h2 className="text-3xl sm:text-4xl font-bold mb-4 text-foreground">Business Automation &amp; Optimization</h2>
                    <p className="text-base sm:text-lg text-muted-foreground leading-relaxed">
                        Beyond standard web interfaces, I engineer automated workflows that eliminate manual tasks. By leveraging Node.js and integrating custom APIs, I connect disparate business tools into unified, real-time systems.
                    </p>
                    <div className="mt-8 flex flex-col gap-4">
                        <div className="flex items-center gap-3">
                            <CheckCircle className="h-5 w-5 shrink-0 text-primary" />
                            <span className="text-base font-medium text-foreground">Automated Email Workflows &amp; Notifications</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <CheckCircle className="h-5 w-5 shrink-0 text-primary" />
                            <span className="text-base font-medium text-foreground">Real-time Data Dashboards &amp; Syncing</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <CheckCircle className="h-5 w-5 shrink-0 text-primary" />
                            <span className="text-base font-medium text-foreground">Third-party API Interfacing &amp; Webhooks</span>
                        </div>
                    </div>
                </Reveal>

                <Reveal delay="200" className="flex-1 relative min-h-87.5 w-full items-center justify-center md:flex hidden">

                    <div className="absolute top-1/2 left-1/2 -translate-y-1/2 -translate-x-1/2 w-40 h-40 rounded-full bg-gray-400/10 shadow-2xl"></div>

                    <div className="absolute top-1/2 left-1/2 -translate-y-1/2 -translate-x-1/2 w-32 h-32 rounded-full bg-tertiary/60 flex items-center justify-center animate-pulse text-gray-900">
                        <Settings className="w-16 h-16" />
                    </div>

                    <div className="absolute top-4 left-4 w-16 h-16 rounded-full bg-background dark:bg-[#161d1d] shadow-xl border border-border p-3 flex items-center justify-center hover:scale-110 transition-transform duration-300 ease-in-out text-foreground">
                        <Webhook className="w-8 h-8" />
                    </div>

                    <div className="absolute bottom-4 left-0 w-16 h-16 rounded-2xl bg-background dark:bg-[#161d1d] shadow-xl border border-border p-3 flex items-center justify-center hover:scale-110 transition-transform duration-300 ease-in-out text-primary">
                        <Columns3 className="w-8 h-8" />
                    </div>

                    <div className="absolute top-12 right-0 w-16 h-16 rounded-2xl bg-background dark:bg-[#161d1d] shadow-xl border border-border p-3 flex items-center justify-center hover:scale-110 transition-transform duration-300 ease-in-out text-secondary">
                        <Cloud className="w-8 h-8 fill-secondary" />
                    </div>

                </Reveal>
            </div>
        </section>
    );
}

export default Business;
