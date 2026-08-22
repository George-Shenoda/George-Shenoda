import type { Metadata } from "next";
import { Geist, Geist_Mono, Inter } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
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
    title: "George Shenoda | Full-Stack Developer",
    description:
        "Portfolio of George Shenoda — full-stack developer bridging mechatronics and code. Responsive web apps, IoT dashboards, and business automation from concept to deployment.",
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
