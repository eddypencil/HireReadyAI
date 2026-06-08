//src\features\companies\pages\CompanyProfile.jsx
import { Plus } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";

export default function CompanyProfile({ company, members, onInvite }) {
  const { t } = useTranslation();
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

  return (
    <div className="p-4 sm:p-6 bg-background min-h-screen font-sans">
      <div className="max-w-4xl mx-auto space-y-4">
        {/* Profile Card */}
        <div className="bg-background p-5 rounded-xl border border-border/60 shadow-xs hover:border-accent/20 transition-colors duration-200">
          <h2 className="text-base font-bold text-sidebar mb-0.5">
            {t("company_profile.profile.title")}
          </h2>
          <p className="text-xs text-muted-foreground/70 mb-5">
            {t("company_profile.profile.subtitle")}
          </p>

          <div className="flex flex-col sm:flex-row gap-5 items-center sm:items-start">
            <div className="w-14 h-14 bg-primary/10 border border-primary/20 rounded-xl flex items-center justify-center text-primary shrink-0 font-bold text-lg shadow-xs select-none">
              {company?.name?.charAt(0).toUpperCase() || "?"}
            </div>

            {/* Grid fields layout */}
            <div
              dir="ltr"
              className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 w-full grow"
            >
              <div>
                <label className="block text-[11px] font-bold text-muted-foreground/80 uppercase tracking-wider mb-1">
                  Company Name
                </label>
                <input
                  type="text"
                  disabled
                  value={company?.name || ""}
                  className="w-full h-9 px-3 border border-border rounded-lg text-sm bg-secondary/15 text-sidebar font-medium"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-muted-foreground/80 uppercase tracking-wider mb-1">
                  Industry
                </label>
                <input
                  type="text"
                  disabled
                  value={company?.industry || ""}
                  className="w-full h-9 px-3 border border-border rounded-lg text-sm bg-secondary/15 text-sidebar font-medium"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-muted-foreground/80 uppercase tracking-wider mb-1">
                  Company Size
                </label>
                <input
                  type="text"
                  disabled
                  value={
                    company?.size
                      ? `${company.size.toLocaleString()} employees`
                      : ""
                  }
                  className="w-full h-9 px-3 border border-border rounded-lg text-sm bg-secondary/15 text-sidebar font-medium"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-muted-foreground/80 uppercase tracking-wider mb-1">
                  Created At
                </label>
                <input
                  type="text"
                  disabled
                  value={
                    company?.created_at
                      ? new Date(company.created_at).toLocaleDateString()
                      : ""
                  }
                  className="w-full h-9 px-3 border border-border rounded-lg text-sm bg-secondary/15 text-sidebar font-medium"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Team Members Card */}
        <div className="bg-background p-5 rounded-xl border border-border/60 shadow-xs hover:border-accent/20 transition-colors duration-200">
          <h2 className="text-base font-bold text-sidebar mb-0.5">
            {t("company_profile.team.title")}
          </h2>
          <p className="text-xs text-muted-foreground/70 mb-4">
            {t("company_profile.team.subtitle")}
          </p>

          <form
            dir="ltr"
            onSubmit={handleInviteSubmit}
            className="flex flex-col sm:flex-row gap-2 mb-4.5 bg-secondary/20 p-2.5 rounded-lg border border-border/50"
          >
            <input
              required
              type="text"
              value={memberName}
              onChange={(e) => setMemberName(e.target.value)}
              placeholder="Full Name"
              className="w-full sm:flex-1 h-9 px-3 bg-background border border-border rounded-lg text-xs font-medium focus:outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary transition-all"
            />
            <input
              required
              type="email"
              value={memberEmail}
              onChange={(e) => setMemberEmail(e.target.value)}
              placeholder="Email"
              className="w-full sm:flex-1 h-9 px-3 bg-background border border-border rounded-lg text-xs font-medium focus:outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary transition-all"
            />
            <button
              type="submit"
              className="w-full sm:w-auto flex items-center justify-center gap-1 bg-primary hover:bg-primary-hover text-white px-4 h-9 rounded-lg text-xs font-semibold transition-colors shadow-xs cursor-pointer select-none"
            >
              <Plus className="w-3.5 h-3.5" />{" "}
              {t("company_profile.team.invite")}
            </button>
          </form>

          <div className="space-y-3" dir="ltr">
            {members.map((member, i) => (
              <div
                key={i}
                className="flex items-center justify-between pb-3 border-b border-border/40 last:border-0 last:pb-0 gap-2"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold shrink-0 select-none">
                    {member.profiles?.full_name
                      ? member.profiles.full_name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")
                          .toUpperCase()
                      : "?"}
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-xs font-semibold text-sidebar truncate">
                      {member.profiles?.full_name ||
                        t("company_profile.team.unknown")}
                    </h4>
                    <p className="text-[11px] text-muted-foreground/70 truncate font-medium">
                      {member.profiles?.role ||
                        t("company_profile.team.team_member")}
                    </p>
                  </div>
                </div>
                <span className="px-2 h-5 flex items-center rounded-md text-[10px] font-bold border border-border bg-secondary/40 text-muted-foreground/90 shrink-0 capitalize">
                  {member.profiles?.role ||
                    t("company_profile.team.team_member")}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
