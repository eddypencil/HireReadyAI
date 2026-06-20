// src/features/landing-page/components/Footer.jsx
export default function Footer() {
    return (
        <footer className="bg-background border-t border-border/60 px-6 py-12 lg:px-8">
            <div className="max-w-7xl mx-auto flex flex-col items-center justify-between gap-6 sm:flex-row">


                <div className="flex items-center gap-3 group cursor-pointer">
                    <span
                        className="flex items-center justify-center w-9 h-9 rounded-xl bg-accent text-white font-bold text-sm shadow-sm transition-transform group-hover:scale-105"
                        style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
                    >
                        H
                    </span>
                    <span
                        className="text-muted-foreground text-base font-medium tracking-tight"
                        style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
                    >
                        HireReadyAI
                    </span>
                </div>


                <p className="text-[11px] text-muted-foreground font-medium tracking-wide">
                    &copy; {new Date().getFullYear()} HireReadyAI. All rights reserved.
                </p>

            </div>
        </footer>
    );
}