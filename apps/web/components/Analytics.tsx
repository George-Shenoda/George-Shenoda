import Script from "next/script";

/**
 * Google Analytics 4 (gtag.js), rendered once from the root layout.
 * afterInteractive keeps it off the critical path (LCP-safe).
 * The ID can be overridden via NEXT_PUBLIC_GA_ID; measurement IDs are public,
 * so the code fallback guarantees analytics works without extra env config.
 */
const GA_ID = process.env.NEXT_PUBLIC_GA_ID ?? "G-JMPFJDFM5T";

function Analytics() {
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
