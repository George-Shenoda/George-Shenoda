"use client";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
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
import Link from "next/link";

const NAV_LINKS = [
    { id: "workflow", label: "Workflow", href: "#workflow" },
    { id: "projects", label: "Projects", href: "#projects" },
    { id: "contact", label: "Contact", href: "#contact" },
    { id: "download", label: "Download", href: "/download" },
] as const;

function Navbar() {
    const pathname = usePathname();
    const router = useRouter();
    const [activeSection, setActiveSection] = useState<string>("");
    const [scrolled, setScrolled] = useState(false);
    const [progress, setProgress] = useState(0);
    const [isDesktop, setIsDesktop] = useState(false);
    const [titlebarHeight, setTitlebarHeight] = useState(0);

    // Detect desktop mode once on mount
    useEffect(() => {
        const desktop = window.electronAPI?.isDesktop === true;
        if (desktop) {
            const height = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--titlebar-height')) || 40;
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setTitlebarHeight(height);
        }
        setIsDesktop(desktop);
    }, []);

    useEffect(() => {
        const update = () => {
            const scrollY = window.scrollY;
            setScrolled(scrollY > 8);
            const max = document.documentElement.scrollHeight - window.innerHeight;
            setProgress(max > 0 ? Math.min(1, scrollY / max) : 0);

            let current = "";
            const isNearBottom = max > 0 && scrollY >= max - 100;

            for (let i = NAV_LINKS.length - 1; i >= 0; i--) {
                const { id } = NAV_LINKS[i];
                const el = document.getElementById(id);
                if (!el) continue;

                if (isNearBottom && id === "contact") {
                    current = "contact";
                    break;
                }

                if (el.getBoundingClientRect().top <= 160) {
                    current = id;
                    break;
                }
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

    const topOffset = isDesktop ? titlebarHeight : 0;

    return (
        <header
            className={`sticky transition-shadow duration-300 z-50 ${
                scrolled ? "shadow-md shadow-black/5 dark:shadow-black/30" : ""
            } dark:bg-[#151d1dee] bg-[#eeeeeef2] backdrop-blur-md`}
            style={{ top: topOffset }}
        >
            <div className="px-4 py-4 sm:py-5 flex justify-between items-center">
                <button
                    onClick={() => router.push("/")}
                    className="text-xl sm:text-2xl font-bold text-primary cursor-pointer"
                >
                    George Shenoda
                </button>
                <nav className="hidden items-center gap-6 md:flex" aria-label="Primary">
                    {NAV_LINKS.map(({ id, label, href }) => (
                        <button
                            key={id}
                            onClick={() => {
                                if (href.startsWith('/')) {
                                    router.push(href);
                                } else {
                                    scrollToView(id, pathname);
                                }
                            }}
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
                        variant="ghost"
                        className="hidden h-11 rounded-full px-4 text-[15px] font-medium text-foreground/80 hover:text-primary sm:inline-flex"
                        render={<Link href="/cv" />}
                        nativeButton={false}
                    >
                        View CV
                    </Button>
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
                            {NAV_LINKS.map(({ id, label, href }) => (
                                <DropdownMenuItem
                                    key={id}
                                    onClick={() => {
                                        if (href.startsWith('/')) {
                                            router.push(href);
                                        } else {
                                            scrollToView(id, pathname);
                                        }
                                    }}
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
