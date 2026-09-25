import Link from 'next/link';

const ALL_FOOTER_LINKS = [
    { href: "#workflow", label: "Workflow" },
    { href: "#projects", label: "Projects" },
    { href: "#contact", label: "Contact" },
    { href: "/privacy", label: "Privacy" },
    { href: "/download", label: "Download" },
] as const;

function Footer() {
    const links = ALL_FOOTER_LINKS;

    return (
        <footer className="flex flex-col sm:flex-row justify-between items-center gap-4 w-full px-8 py-8 dark:bg-[#151d1d] bg-[#eee]">
            <div className="text-xl sm:text-2xl font-bold text-primary">
                George Shenoda
            </div>
            <nav aria-label="Footer" className="flex items-center gap-5">
                {links.map(({ href, label }) => (
                    <Link
                        key={href}
                        href={href}
                        className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
                    >
                        {label}
                    </Link>
                ))}
            </nav>
            <div className="text-sm text-muted-foreground">
                © {new Date().getFullYear()} George Shenoda. All rights reserved.
            </div>
        </footer>
    );
}

export default Footer;
