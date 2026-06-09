// src/features/landing-page/components/HowItWorks.jsx
import { useEffect, useState } from "react";
import { FileText, MessageSquare, CheckCircle, ClipboardList, Eye, Users, Award } from "lucide-react";

export default function HowItWorks() {
    const [role, setRole] = useState("applicant");

    useEffect(() => {
        const storedRole = localStorage.getItem("user_role") || "applicant";
        setRole(storedRole);
    }, []);

    const applicantSteps = [
        { id: 1, title: "Browse Jobs", desc: "Explore and search for open positions easily.", icon: ClipboardList },
        { id: 2, title: "Apply & Submit", desc: "Attach your resume and fill out the application form.", icon: FileText },
        { id: 3, title: "AI Interviews & Tests", desc: "Complete AI-driven interviews and skill assessments.", icon: MessageSquare },
        { id: 4, title: "Track Results", desc: "Monitor your application status and performance feedback.", icon: CheckCircle }
    ];

    const recruiterSteps = [
        { id: 1, title: "Generate JD", desc: "Create accurate job descriptions using AI.", icon: FileText },
        { id: 2, title: "Auto-Screen & Shortlist", desc: "Auto advance candidate to shortlist automatically.", icon: Eye },
        { id: 3, title: "Team Voting", desc: "Vote into recruitment team for offer & reject.", icon: Users },
        { id: 4, title: "Final Decisions", desc: "Evaluate and shortlist for top candidate.", icon: Award }
    ];

    const steps = role === "applicant" ? applicantSteps : recruiterSteps;

    return (
        <section id="how-it-works" className="bg-background px-6 py-24 lg:px-8 relative overflow-hidden">
            <div className="absolute inset-0 pointer-events-none opacity-40">
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-[120px]" />
            </div>

            <div className="max-w-6xl mx-auto space-y-12 relative z-10">
                <div className="text-center space-y-3 max-w-2xl mx-auto">
                    <span className="inline-block text-[10px] font-extrabold tracking-[0.2em] text-primary bg-primary/10 px-3 py-1 rounded-full border border-primary/10 uppercase">
                        How it works
                    </span>
                    <h2 className="text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl">
                        How it works
                    </h2>
                    <p className="text-muted-foreground text-sm">
                        {role === "applicant"
                            ? "Your journey to your dream job designed to be seamless and transparent."
                            : "End-to-end talent acquisition platform powered by advanced AI."}
                    </p>
                </div>


                <div className="relative grid grid-cols-1 md:grid-cols-4 gap-8">
                    <div className="hidden md:block absolute left-0 right-0 top-[72%] h-px bg-border z-0" />

                    {steps.map((step, index) => {
                        const Icon = step.icon;
                        return (
                            <div key={step.id} className="relative flex flex-col items-center text-center group">
                                <div className="w-20 h-20 bg-card rounded-3xl border-2 border-border shadow-md flex items-center justify-center z-10 mb-6 transition-all duration-500 group-hover:scale-110 group-hover:border-primary group-hover:shadow-primary/20 group-hover:shadow-2xl relative">
                                    <div className="absolute inset-0 bg-primary/5 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity" />
                                    <Icon className="w-8 h-8 text-primary transition-colors duration-500 group-hover:text-primary" />

                                    <span className="absolute -top-2 -right-2 w-6 h-6 bg-foreground text-background rounded-full border-2 border-background flex items-center justify-center text-[10px] font-black shadow-sm">
                                        {index + 1}
                                    </span>
                                </div>

                                <div className="space-y-3 bg-card/60 backdrop-blur-md p-6 rounded-3xl border border-border/60 shadow-sm w-full transition-all duration-300 hover:shadow-xl hover:border-primary/40 hover:-translate-y-1">
                                    <h4 className="font-bold text-base text-foreground tracking-tight group-hover:text-primary transition-colors">
                                        {step.title}
                                    </h4>
                                    <p className="text-xs text-muted-foreground leading-relaxed">
                                        {step.desc}
                                    </p>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}