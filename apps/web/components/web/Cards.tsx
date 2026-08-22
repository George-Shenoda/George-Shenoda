interface CardProps {
    title: string;
    description: string;
    icon: React.ReactNode;
    iconClassName: string; 
}

function Cards({ title, description, icon, iconClassName }: CardProps) {
    return (
        <div className="p-6 rounded-xl flex flex-col gap-4 relative text-left group border border-black/5 dark:border-white/10 bg-white dark:bg-[#192020] shadow-sm hover:-translate-y-1.5 hover:border-primary/40 dark:hover:border-secondary/50 hover:shadow-lg transition-all duration-300">
            <div className={`p-4 w-fit rounded-2xl transition-transform duration-300 group-hover:-translate-y-1 ${iconClassName}`}>
                {icon}
            </div>
            
            <div>
                <h3 className="text-xl font-bold text-foreground mb-2">{title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{description}</p>
            </div>
            
        </div>
    )
}

export default Cards;