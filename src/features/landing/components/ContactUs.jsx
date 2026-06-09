// src/features/landing-page/components/ContactUs.jsx
import { useState } from "react";
import { Mail, Phone, MapPin, Send, Loader2 } from "lucide-react";

export default function ContactUs() {
    const [formData, setFormData] = useState({ name: "", email: "", company: "", message: "" });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        setTimeout(() => {
            setIsSubmitting(false);
            setSubmitted(true);
            setFormData({ name: "", email: "", company: "", message: "" });
            setTimeout(() => setSubmitted(false), 5000);
        }, 1500);
    };

    return (
        <section id="contact" className="bg-background px-6 py-24 lg:px-8">
            <div className="max-w-6xl mx-auto space-y-12">

                <div className="text-center space-y-3 max-w-2xl mx-auto">
                    <span className="inline-block text-[10px] font-extrabold tracking-[0.2em] text-primary bg-primary/10 px-3 py-1 rounded-full border border-primary/10 uppercase">
                        Contact us
                    </span>
                    <h2 className="text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl">
                        Get in touch
                    </h2>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
                    <div className="lg:col-span-7 bg-card p-8 rounded-2xl border border-border/40 shadow-sm">
                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-foreground" htmlFor="name">Your name</label>
                                    <input
                                        className="w-full bg-background border border-border rounded-xl px-4 py-3 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
                                        id="name"
                                        type="text"
                                        name="name"
                                        placeholder="Jane Cooper"
                                        value={formData.name}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-foreground" htmlFor="email">Work email</label>
                                    <input
                                        className="w-full bg-background border border-border rounded-xl px-4 py-3 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
                                        id="email"
                                        type="email"
                                        name="email"
                                        placeholder="jane@company.com"
                                        value={formData.email}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-foreground" htmlFor="company">Company</label>
                                <input
                                    className="w-full bg-background border border-border rounded-xl px-4 py-3 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
                                    id="company"
                                    type="text"
                                    name="company"
                                    placeholder="Acme Inc."
                                    value={formData.company}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-foreground" htmlFor="message">Message</label>
                                <textarea
                                    className="w-full bg-background border border-border rounded-xl px-4 py-3 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 h-32 resize-none"
                                    id="message"
                                    name="message"
                                    placeholder="Tell us a bit about what you're looking to solve..."
                                    value={formData.message}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
                                <p className="text-[9px] text-muted-foreground max-w-xs">
                                    By submitting, you agree to our <a href="/privacy" className="text-primary hover:underline">Privacy Policy</a>.
                                </p>
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="bg-foreground text-background font-bold rounded-xl px-6 py-3.5 text-xs flex items-center justify-center gap-2 transition-all hover:opacity-90 shadow-sm disabled:opacity-70"
                                >
                                    {isSubmitting ? (
                                        <>
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                            Sending...
                                        </>
                                    ) : (
                                        <>
                                            <Send className="w-4 h-4" />
                                            Send message
                                        </>
                                    )}
                                </button>
                            </div>

                            {submitted && (
                                <div className="p-3 bg-success/10 border border-success/20 rounded-xl text-center text-xs text-success font-medium">
                                    Your message has been sent successfully!
                                </div>
                            )}
                        </form>
                    </div>


                    <div className="lg:col-span-5">
                        <div className="bg-card p-8 rounded-2xl border border-border/40 shadow-sm space-y-6">
                            <div>
                                <h3 className="text-base font-bold tracking-tight text-foreground">Contact information</h3>
                                <p className="text-[10px] text-muted-foreground mt-1">Reach the team directly through any of the channels below.</p>
                            </div>

                            <div className="space-y-5 pt-2">

                                <div className="flex items-start gap-4">
                                    <div className="w-9 h-9 bg-secondary rounded-xl flex items-center justify-center shrink-0">
                                        <Mail className="w-4 h-4 text-foreground" />
                                    </div>
                                    <div>
                                        <h4 className="text-[10px] text-muted-foreground font-medium">EMAIL</h4>
                                        <a href="mailto:hello@hirereadyai.com" className="text-xs font-semibold text-foreground hover:underline mt-0.5 block">
                                            hello@hirereadyai.com
                                        </a>
                                    </div>
                                </div>


                                <div className="flex items-start gap-4">
                                    <div className="w-9 h-9 bg-secondary rounded-xl flex items-center justify-center shrink-0">
                                        <Phone className="w-4 h-4 text-foreground" />
                                    </div>
                                    <div>
                                        <h4 className="text-[10px] text-muted-foreground font-medium">PHONE</h4>
                                        <a href="tel:+201227541128" className="text-xs font-semibold text-foreground hover:underline mt-0.5 block">
                                            +20 122 754 1128
                                        </a>
                                    </div>
                                </div>


                                <div className="flex items-start gap-4">
                                    <div className="w-9 h-9 bg-secondary rounded-xl flex items-center justify-center shrink-0">
                                        <MapPin className="w-4 h-4 text-foreground" />
                                    </div>
                                    <div>
                                        <h4 className="text-[10px] text-muted-foreground font-medium">OFFICE</h4>
                                        <p className="text-xs font-semibold text-foreground mt-0.5">Smart Village, Cairo, Egypt</p>
                                    </div>
                                </div>
                            </div>

                            <div className="border-t border-border/60 pt-4 mt-4">
                                <h5 className="text-[9px] text-muted-foreground uppercase tracking-wider font-bold">Support Hours</h5>
                                <p className="text-[10px] text-foreground font-medium mt-0.5">Mon – Fri · 9:00 – 18:00 (GMT+2)</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}