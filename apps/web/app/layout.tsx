import type { Metadata } from "next";
import { Geist, Geist_Mono, Inter } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { SITE_URL, SITE_NAME, SITE_DESCRIPTION } from "@/lib/site";
import Navbar from "@/components/web/navbar";
import TitleBar from "@/components/desktop/TitleBar";
import ElectronThemeSync from "@/components/desktop/ElectronThemeSync";
import { ThemeProvider } from "next-themes";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

const geistSans = Geist({
    variable: "--font-geist-sans",
    subsets: ["latin"],
});

const geistMono = Geist_Mono({
    variable: "--font-geist-mono",
    subsets: ["latin"],
});

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
                geistSans.variable,
                geistMono.variable,
                "font-sans",
                inter.variable,
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
