import { motion } from "framer-motion";
import AuthLayout from "../components/AuthLayout";
import { useNavigate } from "react-router-dom";
import {
    ShieldCheck,
    Lock,
    Eye,
    Database,
    Brain,
    UserCheck,
    X,
} from "lucide-react";

export default function PrivacyPage() {
    const navigate = useNavigate();

    const sections = [
        {
            icon: Eye,
            title: "Data Collection",
            content:
                "We collect information you provide directly to us, including your name, contact details, education, professional experience, portfolio links, and resume data when you create an account or apply for positions.",
        },
        {
            icon: Database,
            title: "How We Use Data",
            content:
                "Your information is used to match you with relevant job opportunities, improve recruiter-candidate connections, facilitate interview workflows, and enhance the overall platform experience.",
        },
        {
            icon: Brain,
            title: "AI Data Processing",
            content:
                "HireReadyAI uses artificial intelligence to analyze resumes, recommend job opportunities, support interview evaluations, and help identify potential hiring biases. AI-generated insights are intended to assist, not replace, human decision-making.",
        },
        {
            icon: Lock,
            title: "Data Protection",
            content:
                "We implement industry-standard security measures, including encrypted data storage and secure authentication protocols, to protect your personal information from unauthorized access.",
        },
        {
            icon: UserCheck,
            title: "User Rights",
            content:
                "You may request access to, correction of, or deletion of your personal information at any time, subject to applicable laws and legitimate business requirements.",
        },
        {
            icon: ShieldCheck,
            title: "Data Retention",
            content:
                "We retain your information only as long as necessary to provide our services, comply with legal obligations, resolve disputes, and enforce platform policies.",
        },
    ];

    return (
        <AuthLayout
            headline="Privacy Policy"
            subheading="Last updated: June 2026"
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
                  [&::-webkit-scrollbar]:w-1.5
                  [&::-webkit-scrollbar-track]:bg-transparent
                  [&::-webkit-scrollbar-thumb]:bg-slate-300
                  dark:[&::-webkit-scrollbar-thumb]:bg-slate-700
                  dark:[&::-webkit-scrollbar-thumb]:hover:bg-slate-600">
                {sections.map((section, index) => {
                    const Icon = section.icon;

                    return (
                        <motion.div
                            key={section.title}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{
                                duration: 0.4,
                                delay: index * 0.1,
                            }}
                            className="p-4 rounded-xl border border-border bg-card/50"
                        >
                            <div className="flex items-center gap-3 mb-2 text-accent">
                                <Icon size={18} aria-hidden="true" />

                                <h3 className="font-bold text-sm text-foreground uppercase tracking-wider">
                                    {section.title}
                                </h3>
                            </div>

                            <p className="text-muted-foreground text-sm leading-relaxed">
                                {section.content}
                            </p>
                        </motion.div>
                    );
                })}

                <div className="mt-2 p-4 border-t border-border">
                    <h3 className="text-foreground font-bold text-sm mb-2">
                        Third Party Sharing
                    </h3>

                    <p className="text-muted-foreground text-xs leading-relaxed">
                        We do not sell your personal information. Data is only shared with
                        verified recruiters, employers, or service providers necessary for
                        platform functionality and only when relevant to your interaction
                        with the platform.
                    </p>
                </div>
            </div>
        </AuthLayout >
    );
}