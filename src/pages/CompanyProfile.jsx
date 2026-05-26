import { Building2, UploadCloud, Plus, ShieldAlert, FileText } from "lucide-react";
import { useState } from "react";

export default function CompanyProfile({ members, onInvite, frameworkFile, setFrameworkFile }) {
    const [memberName, setMemberName] = useState("");
    const [memberEmail, setMemberEmail] = useState("");

    const handleInviteSubmit = (e) => {
        e.preventDefault();
        if (!memberName || !memberEmail) return;
        onInvite(memberName, memberEmail);
        setMemberName("");
        setMemberEmail("");
        alert("Member invited successfully!");
    };

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            setFrameworkFile(e.target.files[0].name);
        }
    };

    return (
        <div className="p-8 bg-gray-50/50 min-h-screen font-sans">
            <div className="max-w-4xl mx-auto space-y-8">

                {/* Company Info */}
                <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                    <h2 className="text-xl font-bold text-dark-amethyst-950 mb-1">Company Profile</h2>
                    <p className="text-xs text-gray-400 mb-6">Manage your workspace details and branding.</p>

                    <div className="flex gap-6 items-start">
                        <div className="w-16 h-16 bg-red-50 border border-red-100 rounded-xl flex items-center justify-center text-red-600 flex-shrink-0 font-bold text-xl">
                            V
                        </div>

                        <div className="grid grid-cols-2 gap-4 flex-grow">
                            <div>
                                <label className="block text-xs font-semibold text-gray-500 mb-1.5">Company Name</label>
                                <input type="text" defaultValue="Vodafone Egypt" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50/30 focus:outline-none focus:border-dark-amethyst-400 focus:bg-white" />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-gray-500 mb-1.5">Industry</label>
                                <input type="text" defaultValue="Telecommunications" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50/30 focus:outline-none focus:border-dark-amethyst-400 focus:bg-white" />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-gray-500 mb-1.5">Website URL</label>
                                <input type="text" defaultValue="vodafone.com.eg" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50/30 focus:outline-none focus:border-dark-amethyst-400 focus:bg-white" />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-gray-500 mb-1.5">Company Size</label>
                                <input type="text" defaultValue="5000+ employees" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50/30 focus:outline-none focus:border-dark-amethyst-400 focus:bg-white" />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                    <h2 className="text-xl font-bold text-dark-amethyst-950 mb-1">Competency Framework</h2>
                    <p className="text-xs text-gray-400 mb-6">Upload your grading framework for AI analysis.</p>

                    <label className="border-2 border-dashed border-gray-200 rounded-xl p-8 text-center bg-gray-50/30 hover:bg-gray-50 transition-colors cursor-pointer group flex flex-col items-center justify-center">
                        <input type="file" accept=".pdf,.docx" onChange={handleFileChange} className="hidden" />
                        <UploadCloud className="w-8 h-8 text-gray-400 mb-2 group-hover:text-dark-amethyst-500 transition-colors" />
                        <p className="text-sm font-medium text-gray-700">Click to upload your framework file</p>
                        <p className="text-xs text-gray-400 mt-1">PDF or DOCX up to 25MB</p>
                    </label>

                    {frameworkFile && (
                        <div className="mt-4 flex items-center justify-between bg-indigo-velvet-50/40 px-4 py-2.5 rounded-lg border border-indigo-velvet-100">
                            <div className="flex items-center gap-2 text-indigo-velvet-950 text-xs font-medium">
                                <FileText className="w-4 h-4 text-indigo-velvet-500" />
                                {frameworkFile}
                            </div>
                            <span className="bg-emerald-50 text-emerald-600 border border-emerald-100 px-2 py-0.5 rounded text-[10px] font-bold">Active & Indexed</span>
                        </div>
                    )}
                </div>

                <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                    <h2 className="text-xl font-bold text-dark-amethyst-950 mb-1">Team Members</h2>
                    <p className="text-xs text-gray-400 mb-4">Invite and manage your recruitment team permissions.</p>

                    <form onSubmit={handleInviteSubmit} className="flex gap-3 mb-6 bg-gray-50 p-3 rounded-lg border border-gray-100">
                        <input required type="text" value={memberName} onChange={(e) => setMemberName(e.target.value)} placeholder="Full Name" className="flex-1 px-3 py-1.5 bg-white border border-gray-200 rounded-md text-xs focus:outline-none focus:border-dark-amethyst-400" />
                        <input required type="email" value={memberEmail} onChange={(e) => setMemberEmail(e.target.value)} placeholder="Email Address" className="flex-1 px-3 py-1.5 bg-white border border-gray-200 rounded-md text-xs focus:outline-none focus:border-dark-amethyst-400" />
                        <button type="submit" className="flex items-center gap-1 bg-dark-amethyst-950 text-white px-4 py-1.5 rounded-md text-xs font-medium hover:bg-dark-amethyst-900 transition-colors cursor-pointer">
                            <Plus className="w-3.5 h-3.5" /> Invite
                        </button>
                    </form>

                    <div className="space-y-4">
                        {members.map((member, i) => (
                            <div key={i} className="flex items-center justify-between pb-4 border-b border-gray-50 last:border-0 last:pb-0">
                                <div className="flex items-center gap-3">
                                    <div className="w-9 h-9 rounded-full bg-dark-amethyst-100 text-dark-amethyst-800 flex items-center justify-center text-xs font-bold">
                                        {member.name.split(' ').map(n => n[0]).join('')}
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-medium text-dark-amethyst-950">{member.name}</h4>
                                        <p className="text-xs text-gray-400">{member.email}</p>
                                    </div>
                                </div>
                                <span className={`px-2.5 py-1 rounded-md text-[11px] font-medium border border-black/5 ${member.style}`}>
                                    {member.role}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

