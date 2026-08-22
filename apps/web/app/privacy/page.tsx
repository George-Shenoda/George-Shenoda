import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Privacy Policy | George Shenoda",
    description:
        "Privacy policy for George Shenoda's portfolio website and mobile applications.",
};

const sectionClass = "max-w-3xl mx-auto px-4 py-16 text-sm leading-relaxed";
const headingClass = "text-2xl font-bold mb-6";
const subHeadingClass = "text-lg font-semibold mt-10 mb-3";

export default function PrivacyPolicy() {
    return (
        <article className={sectionClass}>
            <h1 className={headingClass}>Privacy Policy</h1>
            <p className="text-muted-foreground">
                Last updated: August 22, 2026
            </p>

            <h2 className={subHeadingClass}>Overview</h2>
            <p>
                This privacy policy covers the portfolio website at this domain
                and the associated desktop and mobile applications (collectively,
                the &quot;Services&quot;). The Services are designed to be
                privacy-friendly: they collect the minimum information necessary
                and include no advertising, tracking, or analytics.
            </p>

            <h2 className={subHeadingClass}>Information Collected</h2>
            <p>
                The only personal information processed is what you voluntarily
                submit through the contact form:
            </p>
            <ul className="list-disc pl-6 space-y-1">
                <li>Name</li>
                <li>Email address</li>
                <li>Message content</li>
            </ul>
            <p className="mt-3">
                This information is used solely to respond to your inquiry. It is
                transmitted by email to George Shenoda and is not stored in any
                database, sold, shared, or used for marketing purposes. You may
                also contact me directly by email instead of using the form.
            </p>

            <h2 className={subHeadingClass}>Tracking & Analytics</h2>
            <p>
                The Services contain no analytics, telemetry, cookies for
                tracking, advertising identifiers, or third-party trackers of any
                kind.
            </p>

            <h2 className={subHeadingClass}>Third-Party Processors</h2>
            <ul className="list-disc pl-6 space-y-1">
                <li>
                    Hosting infrastructure (e.g., Vercel) processes standard
                    technical request data necessary to serve the website.
                </li>
                <li>
                    Contact form submissions are delivered through a transactional
                    email service (Gmail SMTP).
                </li>
            </ul>

            <h2 className={subHeadingClass}>Children&apos;s Privacy</h2>
            <p>
                The Services are not directed at children under 13, and no
                information is knowingly collected from them.
            </p>

            <h2 className={subHeadingClass}>Changes</h2>
            <p>
                Material changes to this policy will be reflected on this page
                with an updated revision date.
            </p>

            <h2 className={subHeadingClass}>Contact</h2>
            <p>
                Questions about this policy can be sent through the contact form
                on the home page.
            </p>
        </article>
    );
}
