// src/features/landing-page/components/Customers.jsx
import { Star, Quote } from "lucide-react";

export default function Customers() {
    const testimonials = [
        {
            id: 1,
            content: "HireReadyAI transformed our hiring process completely. The AI-driven resume screening saved us countless hours and brought the best talent directly to our pipeline.",
            name: "Sarah Jenkins",
            role: "HR Manager at TechCorp",
            avatar: "S"
        },
        {
            id: 2,
            content: "The collaborative team voting and clear candidate pipeline made decision-making effortless. It perfectly aligns our hiring team to choose the best talent.",
            name: "Layla Ibrahim",
            role: "Recruitment Manager at InnovateAI",
            avatar: "L"
        },
        {
            id: 3,
            content: "The candidate pipeline management is incredibly intuitive. We can easily track scores, advance candidates, and make confident hiring decisions fast.",
            name: "Maria Rodriguez",
            role: "Recruitment Lead at GlobalHire",
            avatar: "M"
        }
    ];

    return (
        <section id="customers" className="bg-surface-muted px-6 py-20 border-y border-border/40">
            <style>{`
                .testimonial-card::before {
                    content: '';
                    position: absolute;
                    inset: 0;
                    border-radius: 1rem;
                    padding: 1.5px;
                    background: linear-gradient(
                        135deg,
                        #6366f1 0%,
                        #3b82f6 40%,
                        transparent 60%,
                        transparent 70%,
                        #06b6d4 90%,
                        #3b82f6 100%
                    );
                    -webkit-mask:
                        linear-gradient(#fff 0 0) content-box,
                        linear-gradient(#fff 0 0);
                    -webkit-mask-composite: xor;
                    mask-composite: exclude;
                    pointer-events: none;
                }
                .testimonial-card {
                    transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
                }
                .testimonial-card:hover {
                    transform: translateY(-6px);
                    box-shadow: 0 20px 40px -12px rgba(59, 130, 246, 0.3), 0 10px 20px -8px rgba(6, 182, 212, 0.2);
                }
            `}</style>

            <div className="max-w-6xl mx-auto space-y-12 relative z-10">
                <div className="text-center space-y-3 max-w-2xl mx-auto">
                    <span className="inline-block text-[10px] font-extrabold tracking-[0.2em] text-primary bg-primary/10 px-3 py-1 rounded-full border border-primary/10 uppercase">
                        Customers
                    </span>
                    <h2 className="text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl">
                        Loved by hiring teams
                    </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {testimonials.map((item) => (
                        <div
                            key={item.id}
                            className="testimonial-card group relative bg-card rounded-2xl p-6 flex flex-col justify-between space-y-6 overflow-hidden"
                        >
                            <Quote className="absolute top-4 right-4 w-10 h-10 text-primary/5 select-none z-10" />

                            <div className="flex items-center gap-0.5 text-warning z-10 relative">
                                <Star className="w-4 h-4 fill-current" />
                                <Star className="w-4 h-4 fill-current" />
                                <Star className="w-4 h-4 fill-current" />
                                <Star className="w-4 h-4 fill-current" />
                                <Star className="w-4 h-4 fill-current" />
                            </div>

                            <p className="text-xs text-muted-foreground leading-relaxed flex-1 z-10 relative">
                                "{item.content}"
                            </p>

                            <div className="flex items-center gap-3 pt-2 border-t border-border/40 z-10 relative">
                                <div className="w-9 h-9 bg-primary/10 text-primary rounded-xl flex items-center justify-center font-bold text-sm shrink-0">
                                    {item.avatar}
                                </div>
                                <div className="min-w-0">
                                    <h4 className="text-xs font-bold text-foreground truncate">{item.name}</h4>
                                    <p className="text-[10px] text-muted-foreground truncate">{item.role}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}