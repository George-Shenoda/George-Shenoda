"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

export function BackButton() {
    const router = useRouter();

    const handleBack = () => {
        if (window.history.length > 1 && document.referrer.includes(window.location.origin)) {
            router.back();
        } else {
            router.push("/");
        }
    };

    return (
        <button
            type="button"
            onClick={handleBack}
            className="no-print fixed top-25 left-6 z-50 inline-flex items-center gap-2 rounded-full bg-background px-4 py-2 text-sm font-medium text-foreground shadow-lg transition-all hover:bg-muted hover:scale-[1.03] active:scale-[0.98] print:hidden"
        >
            <ArrowLeft className="size-4" />
            Back
        </button>
    );
}