import Script from "next/script";

/**
 * Google Analytics 4 (gtag.js), rendered once from the root layout.
 * afterInteractive keeps it off the critical path (LCP-safe).
 *
 * The measurement ID is read exclusively from GOOGLE_ANALYTICS_ID (set in
 * apps/web/.env locally and in the Vercel project env vars). No public
 * NEXT_PUBLIC_ prefix: this is a Server Component, so the value stays
 * server-side and is only baked into the rendered <script> tag. Nothing
 * is hardcoded — without the variable the component renders nothing.
 *
 * Note: the ID always ends up visible in page source; that is inherent to
 * how gtag.js works (the browser must know where to send hits).
 */
const GA_ID = process.env.GOOGLE_ANALYTICS_ID;

function Analytics() {
    if (!GA_ID) return null;

    return (
        <>
            <Script
                src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
                strategy="afterInteractive"
            />
            <Script id="google-analytics" strategy="afterInteractive">
                {`
                    window.dataLayer = window.dataLayer || [];
                    function gtag(){dataLayer.push(arguments);}
                    gtag('js', new Date());
                    gtag('config', '${GA_ID}');
                `}
            </Script>
        </>
    );
}

export default Analytics;
