import type { Metadata } from "next";
import { Inter, JetBrains_Mono, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { SITE_URL, SITE_NAME, SITE_DESCRIPTION } from "@/lib/site";
import Navbar from "@/components/web/navbar";
import TitleBar from "@/components/desktop/TitleBar";
import ElectronThemeSync from "@/components/desktop/ElectronThemeSync";
import { ThemeProvider } from "next-themes";

// Self-hosted at build time (zero runtime font requests — required for the offline desktop app).
const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });
const jakarta = Plus_Jakarta_Sans({ subsets: ["latin"], variable: "--font-jakarta" });
const jetbrainsMono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-jetbrains" });

export const metadata: Metadata = {
    metadataBase: new URL(SITE_URL),
    title: {
        default: `${SITE_NAME} | Full-Stack Developer`,
        template: `%s | ${SITE_NAME}`,
    },
    description: SITE_DESCRIPTION,
    keywords: [
        "George Shenoda",
        "full-stack developer",
        "mechatronics",
        "web development",
        "business automation",
        "IoT dashboards",
        "Next.js",
        "React",
    ],
    authors: [{ name: SITE_NAME }],
    alternates: {
        canonical: "/",
    },
    openGraph: {
        type: "website",
        siteName: SITE_NAME,
        title: `${SITE_NAME} | Full-Stack Developer`,
        description: SITE_DESCRIPTION,
        url: SITE_URL,
        locale: "en_US",
    },
    twitter: {
        card: "summary",
        title: `${SITE_NAME} | Full-Stack Developer`,
        description: SITE_DESCRIPTION,
    },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
    return (
        <html
            lang="en"
            className={cn(
                "h-full",
                "antialiased",
                "font-sans",
                inter.variable,
                jakarta.variable,
                jetbrainsMono.variable,
            )}
            suppressHydrationWarning
            style={{ scrollBehavior: "smooth" }}
        >
            <body className="min-h-full flex flex-col dark:bg-[#0d1515] ">
                <ThemeProvider 
                    attribute="class" 
                    defaultTheme="system" 
                    enableSystem
                >
                    <TitleBar />
                    <ElectronThemeSync />
                    <Navbar />
                    {children}
                </ThemeProvider>
            </body>
        </html>
    );
}
