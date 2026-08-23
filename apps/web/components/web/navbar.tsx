"use client";
import { useEffect, useState } from "react";
import { Button } from "../ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { scrollToView } from "@/utils/scroll";
import { ThemeSwitcher } from "./themeSwitcher";
import { Menu } from "lucide-react";

const NAV_LINKS = [
    { id: "workflow", label: "Workflow" },
    { id: "projects", label: "Projects" },
    { id: "contact", label: "Contact" },
] as const;

function Navbar() {
    const [activeSection, setActiveSection] = useState<string>("");
    const [scrolled, setScrolled] = useState(false);
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        const update = () => {
            const scrollY = window.scrollY;
            setScrolled(scrollY > 8);
            const max = document.documentElement.scrollHeight - window.innerHeight;
            setProgress(max > 0 ? Math.min(1, scrollY / max) : 0);

            let current = "";
            for (const { id } of NAV_LINKS) {
                const el = document.getElementById(id);
                if (!el) continue;
                if (el.getBoundingClientRect().top <= 160) current = id;
            }
            setActiveSection(current);
        };
        update();
        window.addEventListener("scroll", update, { passive: true });
        window.addEventListener("resize", update);
        return () => {
            window.removeEventListener("scroll", update);
            window.removeEventListener("resize", update);
        };
    }, []);

    return (
        <header
            className={`sticky top-0 z-40 transition-shadow duration-300 ${
                scrolled ? "shadow-md shadow-black/5 dark:shadow-black/30" : ""
            } dark:bg-[#151d1dee] bg-[#eeeeeef2] backdrop-blur-md`}
        >
            <div className="px-4 py-4 sm:py-5 flex justify-between items-center">
                <button
                    onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
                    className="text-xl sm:text-2xl font-bold text-primary cursor-pointer"
                >
                    George Shenoda
                </button>
                <nav className="hidden items-center gap-6 md:flex" aria-label="Primary">
                    {NAV_LINKS.map(({ id, label }) => (
                        <button
                            key={id}
                            onClick={() => scrollToView(id)}
                            aria-current={activeSection === id ? "true" : undefined}
                            className={`relative cursor-pointer text-[15px] font-medium transition-all hover:text-primary ${
                                activeSection === id ? "text-primary" : "text-foreground/80"
                            }`}
                        >
                            {label}
                            <span
                                className={`absolute -bottom-1 left-0 h-0.5 rounded-full bg-primary transition-all duration-300 ${
                                    activeSection === id ? "w-full" : "w-0"
                                }`}
                            />
                        </button>
                    ))}
                </nav>
                <div className="flex items-center gap-2">
                    <ThemeSwitcher />
                    <Button
                        className="hidden rounded-full h-11 px-5 text-white hover:scale-[1.03] active:scale-[0.98] transition-all sm:inline-flex"
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
                    >
                        Resume
                    </Button>
                    <DropdownMenu>
                        <DropdownMenuTrigger
                            render={
                                <Button variant="outline" size="icon" className="size-11 md:hidden" aria-label="Open navigation menu">
                                    <Menu className="size-5" />
                                </Button>
                            }
                        />
                        <DropdownMenuContent align="end" className="min-w-44">
                            {NAV_LINKS.map(({ id, label }) => (
                                <DropdownMenuItem
                                    key={id}
                                    onClick={() => scrollToView(id)}
                                    className={`text-base ${activeSection === id ? "text-primary font-semibold" : ""}`}
                                >
                                    {label}
                                </DropdownMenuItem>
                            ))}
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>
            <div aria-hidden className="h-0.5 w-full bg-transparent">
                <div
                    className="h-full bg-linear-to-r from-primary to-secondary transition-[width] duration-150 ease-out"
                    style={{ width: `${progress * 100}%` }}
                />
            </div>
        </header>
    );
}

export default Navbar;
