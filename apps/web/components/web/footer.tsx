function Footer() {
    return (
        <div className="flex justify-between items-center w-full p-8 dark:bg-[#151d1d] bg-[#eee]">
            <div className="text-2xl font-bold text-primary">
                George Shenoda
            </div>
            <div className="text-sm text-muted-foreground">
                © {new Date().getFullYear()} George Shenoda. All rights reserved.
            </div>
        </div>
    );
}

export default Footer;