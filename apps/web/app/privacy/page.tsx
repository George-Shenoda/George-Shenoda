import type { Metadata } from "next";
import Link from "next/link";
import { BackButton } from "@/components/web/BackButton";
import PrintButton from "@/components/web/PrintButton";

export const metadata: Metadata = {
    title: "Privacy Policy | George Shenoda",
    description:
        "Privacy policy for George Shenoda's portfolio website and mobile applications.",
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

export default function PrivacyPolicy() {
    return (
        <div className="cv-page min-h-screen w-full bg-muted py-6 print:bg-background print:py-0">
            <BackButton />
            <PrintButton />
            <article className="cv-sheet mx-auto w-full max-w-[210mm] bg-card px-[9mm] py-[10mm] text-card-foreground shadow-xl sm:px-[16mm] sm:py-[14mm] print:max-w-none print:px-[16mm] print:py-[14mm] print:shadow-none">
                <header className="break-inside-avoid">
                    <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
                        Privacy Policy
                    </h1>
                    <p className="mt-2 text-base font-medium text-primary sm:text-lg">
                        Last updated: August 22, 2026
                    </p>
                </header>

                <section aria-label="Overview" className="mt-8 break-inside-avoid">
                    <SectionLabel>Overview</SectionLabel>
                    <p className="max-w-[65ch] text-[15px] leading-relaxed text-foreground">
                        This privacy policy covers the portfolio website at this domain
                        and the associated desktop and mobile applications (collectively,
                        the "Services"). The Services are designed to be
                        privacy-friendly: they collect the minimum information necessary
                        and include no advertising, tracking, or analytics.
                    </p>
                </section>

                <section aria-label="Information Collected" className="mt-8 break-inside-avoid">
                    <SectionLabel>Information Collected</SectionLabel>
                    <p className="max-w-[65ch] text-[15px] leading-relaxed text-foreground">
                        The only personal information processed is what you voluntarily
                        submit through the contact form:
                    </p>
                    <ul className="mt-3 list-disc pl-6 space-y-1 text-[15px] leading-relaxed text-foreground">
                        <li>Name</li>
                        <li>Email address</li>
                        <li>Message content</li>
                    </ul>
                    <p className="mt-3 max-w-[65ch] text-[15px] leading-relaxed text-foreground">
                        This information is used solely to respond to your inquiry. It is
                        transmitted by email to George Shenoda and is not stored in any
                        database, sold, shared, or used for marketing purposes. You may
                        also contact me directly by email instead of using the form.
                    </p>
                </section>

                <section aria-label="Tracking & Analytics" className="mt-8 break-inside-avoid">
                    <SectionLabel>Tracking & Analytics</SectionLabel>
                    <p className="max-w-[65ch] text-[15px] leading-relaxed text-foreground">
                        The Services contain no analytics, telemetry, cookies for
                        tracking, advertising identifiers, or third-party trackers of any
                        kind.
                    </p>
                </section>

                <section aria-label="Third-Party Processors" className="mt-8 break-inside-avoid">
                    <SectionLabel>Third-Party Processors</SectionLabel>
                    <ul className="mt-3 list-disc pl-6 space-y-1 text-[15px] leading-relaxed text-foreground">
                        <li>
                            Hosting infrastructure (e.g., Vercel) processes standard
                            technical request data necessary to serve the website.
                        </li>
                        <li>
                            Contact form submissions are delivered through a transactional
                            email service (Gmail SMTP).
                        </li>
                    </ul>
                </section>

                <section aria-label="Children's Privacy" className="mt-8 break-inside-avoid">
                    <SectionLabel>Children&apos;s Privacy</SectionLabel>
                    <p className="max-w-[65ch] text-[15px] leading-relaxed text-foreground">
                        The Services are not directed at children under 13, and no
                        information is knowingly collected from them.
                    </p>
                </section>

                <section aria-label="Changes" className="mt-8 break-inside-avoid">
                    <SectionLabel>Changes</SectionLabel>
                    <p className="max-w-[65ch] text-[15px] leading-relaxed text-foreground">
                        Material changes to this policy will be reflected on this page
                        with an updated revision date.
                    </p>
                </section>

                <section aria-label="Contact" className="mt-8 break-inside-avoid">
                    <SectionLabel>Contact</SectionLabel>
                    <p className="max-w-[65ch] text-[15px] leading-relaxed text-foreground">
                        Questions about this policy can be sent through the contact form
                        on the home page.
                    </p>
                </section>

                <footer className="mt-10 break-inside-avoid border-t border-border pt-3 text-[11px] text-muted-foreground">
                    <p>
                        George Shenoda &mdash; Full-stack developer. Latest version always at{" "}
                        <Link href="/privacy" className="hover:text-primary hover:underline">
                            /privacy
                        </Link>
                    </p>
                </footer>
            </article>
        </div>
    );
}