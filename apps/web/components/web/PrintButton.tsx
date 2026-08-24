"use client";

import { Printer } from "lucide-react";

function PrintButton() {
    return (
        <button
            type="button"
            onClick={() => window.print()}
            className="no-print fixed bottom-6 right-6 z-50 inline-flex cursor-pointer items-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-primary/40 transition-all hover:scale-[1.03] hover:shadow-xl active:scale-[0.98] print:hidden"
        >
            <Printer className="size-4" />
            Save as PDF
        </button>
    );
}

export default PrintButton;
