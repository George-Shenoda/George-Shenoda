'use client';

import { useEffect, useRef, useState } from "react";

const delayClasses: Record<string, string> = {
    "0": "",
    "75": "delay-75",
    "100": "delay-100",
    "150": "delay-150",
    "200": "delay-200",
    "300": "delay-300",
    "400": "delay-[400ms]",
    "500": "delay-500",
};

interface RevealProps {
    children: React.ReactNode;
    delay?: keyof typeof delayClasses;
    className?: string;
    /**
     * Skip JS gating entirely: entrance runs as a pure-CSS animation from the
     * first paint. Required for above-the-fold/LCP content — the default
     * IntersectionObserver mode hides children (opacity-0) until hydration,
     * which delays LCP by seconds on slow networks.
     */
    immediate?: boolean;
}

const revealClasses = (delay: keyof typeof delayClasses, className?: string) =>
    "motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-4 duration-700 ease-out " +
    delayClasses[delay] +
    (className ? " " + className : "");

function Reveal({ children, delay = "0", className, immediate = false }: RevealProps) {
    const ref = useRef<HTMLDivElement | null>(null);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        if (immediate) return;
        const node = ref.current;
        if (!node) return;
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsVisible(true);
                    observer.disconnect();
                }
            },
            { threshold: 0.1, rootMargin: "0px 0px -40px 0px" }
        );
        observer.observe(node);
        return () => observer.disconnect();
    }, [immediate]);

    if (immediate) {
        return <div className={revealClasses(delay, className)}>{children}</div>;
    }

    return (
        <div
            ref={ref}
            className={
                isVisible
                    ? revealClasses(delay, className)
                    : "motion-safe:opacity-0" + (className ? " " + className : "")
            }
        >
            {children}
        </div>
    );
}

export default Reveal;
