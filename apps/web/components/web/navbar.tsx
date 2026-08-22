"use client";
import { Button } from "../ui/button";
import { scrollToView } from "@/utils/scroll";
import { ThemeSwitcher } from "./themeSwitcher";

function Navbar() {
    return (
        <>
            <div className="px-4 py-5 flex justify-between items-center dark:bg-[#151d1d] bg-[#eee]">
                <div className="text-2xl font-bold text-primary">
                    George Shenoda
                </div>
                <div className="hidden items-center gap-5 md:flex">
                    <div
                        onClick={() => scrollToView("workflow")}
                        className="cursor-pointer hover:scale-105 hover:text-primary transition-all"
                    >
                        Workflow
                    </div>
                    <div
                        onClick={() => scrollToView("projects")}
                        className="cursor-pointer hover:scale-105 hover:text-primary transition-all"
                    >
                        Projects
                    </div>
                    <div
                        onClick={() => scrollToView("contact")}
                        className="cursor-pointer hover:scale-105 hover:text-primary transition-all"
                    >
                        Contact
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <ThemeSwitcher />
                    <Button
                        className="rounded-full hover:scale-110 transition-all text-white"
                        onClick={async () => {
                            const response = await fetch("/assets/resume.pdf");
                            const blob = await response.blob();
                            const url = URL.createObjectURL(blob);
                            const a = document.createElement("a");
                            a.href = url;
                            a.download = "resume.pdf";
                            a.click();
                            URL.revokeObjectURL(url);
                        }}
                    >
                        Resume
                    </Button>
                </div>
            </div>
        </>
    );
}

export default Navbar;
