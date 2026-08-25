import Script from "next/script";

/**
 * Google Analytics 4 (gtag.js), rendered once from the root layout.
 * afterInteractive keeps it off the critical path (LCP-safe).
 *
 * The measurement ID is read exclusively from NEXT_PUBLIC_GA_ID (set in
 * apps/web/.env locally and in the Vercel project env vars). Nothing is
 * hardcoded: without the variable the component renders nothing.
 */
const GA_ID = process.env.NEXT_PUBLIC_GA_ID;

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
