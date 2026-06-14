import { motion } from "framer-motion";
import AuthLayout from "../components/AuthLayout";
import { useNavigate } from "react-router-dom";

import {
    FileText,
    CheckCircle,
    AlertCircle,
    Scale,
    X,
} from "lucide-react";

export default function TermsPage() {
    const navigate = useNavigate();


    const terms = [
        {
            icon: CheckCircle,
            title: "User Agreement",
            content:
                "By accessing HireReadyAI, you agree to provide truthful, accurate, and complete information regarding your professional identity and qualifications.",
        },
        {
            icon: Scale,
            title: "Platform Usage",
            content:
                "Users are prohibited from using automated systems to scrape data, misrepresenting their identity, or attempting to bypass the AI interview integrity protocols.",
        },
        {
            icon: AlertCircle,
            title: "Account Responsibility",
            content:
                "You are responsible for maintaining the confidentiality of your login credentials. HireReadyAI is not liable for any unauthorized access resulting from user negligence.",
        },
    ];

    return (
        <AuthLayout
            headline="Terms of Service"
            subheading="Please read our platform rules carefully"
        >
            <div className="flex justify-end w-full mb-2">
                <button
                    type="button"
                    onClick={() => navigate(-1)}
                    className="flex items-center justify-center w-7 h-7 rounded-lg text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors cursor-pointer"
                    aria-label="Close"
                >
                    <X size={16} aria-hidden="true" />
                </button>
            </div>
            <div className="flex flex-col gap-4 max-h-[55vh] overflow-y-auto pr-2 custom-scrollbar 
  [&::-webkit-scrollbar]:w-2 
  [&::-webkit-scrollbar-track]:bg-transparent 
  [&::-webkit-scrollbar-thumb]:bg-slate-300 
  dark:[&::-webkit-scrollbar-thumb]:bg-slate-700 
  dark:[&::-webkit-scrollbar-thumb]:hover:bg-slate-600">
                {terms.map((item, index) => {
                    const Icon = item.icon;
                    return (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{
                                duration: 0.4,
                                delay: index * 0.1,
                            }}
                            key={item.title}
                            className="flex gap-4 p-4 rounded-xl border border-border bg-card/50"
                        >
                            <div className="shrink-0 w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center text-accent">
                                <Icon size={18} aria-hidden="true" />
                            </div>
                            <div>
                                <h3 className="font-bold text-sm text-foreground mb-1">
                                    {item.title}
                                </h3>
                                <p className="text-muted-foreground text-sm leading-relaxed">
                                    {item.content}
                                </p>
                            </div>
                        </motion.div>
                    );
                })}

                <div className="mt-2 p-4 rounded-xl border border-border bg-card/50">
                    <h4 className="text-foreground text-xs font-bold mb-2 flex items-center gap-2 uppercase tracking-wider">
                        <FileText size={14} className="text-accent" aria-hidden="true" />
                        Intellectual Property
                    </h4>
                    <p className="text-muted-foreground text-xs leading-relaxed">
                        All AI algorithms, video processing technologies, and branding
                        elements are the exclusive property of HireReadyAI. Unauthorized
                        reproduction or reverse engineering is strictly prohibited.
                    </p>
                </div>


            </div>
        </AuthLayout >
    );
}