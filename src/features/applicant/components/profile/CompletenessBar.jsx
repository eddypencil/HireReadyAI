import React from 'react';
import { Sparkles, AlertCircle } from 'lucide-react';

export function calcCompleteness(profile) {
    const fields = [
        { key: 'profile_pic', label: 'Profile photo', weight: 10 },
        { key: 'headline', label: 'Headline', weight: 10 },
        { key: 'bio', label: 'Bio / Summary', weight: 15 },
        { key: 'experience', label: 'Experience', weight: 20 },
        { key: 'education', label: 'Education', weight: 15 },
        { key: 'skills', label: 'Skills', weight: 15 },
        { key: 'languages', label: 'Languages', weight: 15 },
    ];

    let score = 0;
    const missing = [];

    fields.forEach(f => {
        const val = profile[f.key];
        let filled = false;
        if (Array.isArray(val)) filled = val.length > 0;
        else if (typeof val === 'string') filled = val.trim().length > 0;
        else if (val != null) filled = true;

        if (filled) {
            score += f.weight;
        } else {
            missing.push(f.label);
        }
    });

    return { score: Math.min(score, 100), missing };
}

export default function CompletenessBar({ profile, onAddMissing }) {
    const { score, missing } = calcCompleteness(profile);

    const getLabel = (s) => {
        if (s >= 91) return { text: 'Your profile is complete and recruiter-ready! 🎉', color: 'text-green-600', bg: 'bg-green-50 border-green-200' };
        if (s >= 71) return { text: 'Almost there! A few more fields will make you shine.', color: 'text-blue-600', bg: 'bg-blue-50 border-blue-200' };
        if (s >= 41) return { text: 'Good start! Add more details to stand out.', color: 'text-amber-600', bg: 'bg-amber-50 border-amber-200' };
        return { text: 'Your profile needs work — recruiters may skip incomplete profiles.', color: 'text-red-600', bg: 'bg-red-50 border-red-200' };
    };

    const getBarColor = (s) => {
        if (s >= 91) return 'bg-green-500';
        if (s >= 71) return 'bg-blue-600';
        if (s >= 41) return 'bg-amber-500';
        return 'bg-red-500';
    };

    const status = getLabel(score);

    return (
        <div className="bg-background rounded-xl border border-border/60 p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-2xl font-extrabold text-foreground">{score}%</h3>
                    <p className="text-xs font-medium text-muted-foreground mt-0.5">Profile Completeness</p>
                </div>
                <span className={`inline-flex items-center gap-1 border px-2.5 py-1 rounded-full text-xs font-bold ${status.bg} ${status.color}`}>
                    <Sparkles className="w-3.5 h-3.5" /> {score >= 91 ? 'Ready' : 'Progressing'}
                </span>
            </div>

            <div className="w-full h-2.5 bg-secondary rounded-full overflow-hidden">
                <div
                    className={`h-full transition-all duration-500 rounded-full ${getBarColor(score)}`}
                    style={{ width: `${score}%` }}
                />
            </div>

            <p className="text-xs font-medium leading-relaxed text-muted-foreground">
                {status.text}
            </p>

            {missing.length > 0 && (
                <div className="border-t border-border/50 pt-3 space-y-2">
                    <span className="flex items-center gap-1 text-xs font-bold text-muted-foreground">
                        <AlertCircle className="w-3.5 h-3.5 text-amber-500" /> Missing sections:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                        {missing.map((m, idx) => (
                            <span
                                key={idx}
                                onClick={() => onAddMissing && onAddMissing(m)}
                                className="inline-flex items-center gap-1 bg-primary/5 border border-primary/10 text-primary/80 px-2.5 py-1 rounded-full text-xs font-medium cursor-pointer hover:bg-primary/10 transition-colors"
                            >
                                {m}
                            </span>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}