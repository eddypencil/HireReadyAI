// src/features/applicant/components/ApplicantHeader.jsx
import { useState } from "react";
import { Calendar, Mail, Phone, ChevronRight, Sparkles } from "lucide-react";
import AvatarModal from "./AvatarModal";
import { useTranslation } from "react-i18next";

export default function ApplicantHeader({
  fullName,
  profile_pic,
  email,
  phone,
  joinedDate,
  userId,
  onAvatarChange,
}) {
  const [open, setOpen] = useState(false);
  const { t } = useTranslation();

  const initials = fullName
    ? fullName
        .split(" ")
        .map((n) => n[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "U";

  const formattedJoinDate = joinedDate
    ? new Date(joinedDate).toLocaleDateString("en-US", {
        month: "long",
        year: "numeric",
      })
    : "September 2024";

  return (
    <>
      <div className="bg-gradient-to-br from-[#012a4a] via-[#01497c] to-[#2a6f97] rounded-2xl overflow-hidden relative shadow-[0_10px_30px_-12px_rgba(1,42,74,.28)]">
        {/* Decorative circles */}
        <div className="absolute -top-8 -right-8 size-[120px] rounded-full bg-white/5 pointer-events-none" />
        <div className="absolute -bottom-5 right-[80px] size-[80px] rounded-full bg-white/3 pointer-events-none" />

        <div className="p-5 flex flex-row items-center justify-between gap-4 flex-wrap relative z-1">
          {/* Left: Avatar + Info */}
          <div className="flex items-center gap-3">
            {/* Avatar */}
            <div onClick={() => setOpen(true)} className="relative cursor-pointer shrink-0">
              {profile_pic ? (
                <img
                  src={profile_pic}
                  alt={fullName}
                  className="size-14 rounded-full object-cover border-[3px] border-white/30"
                />
              ) : (
                <div className="size-14 rounded-full bg-white/15 border-[3px] border-white/25 flex items-center justify-center text-lg font-bold text-white font-sans">
                  {initials}
                </div>
              )}
              {/* Edit badge */}
              <div className="absolute bottom-[2px] right-[2px] size-4 rounded-full bg-white/30 border-2 border-sidebar flex items-center justify-center text-[8px] text-white">
                ✎
              </div>
            </div>

            {/* Name + meta */}
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="font-sans text-xl font-bold text-white m-0 tracking-tight">
                  {fullName || "Applicant"}
                </h1>
                <span className="bg-white/15 border border-white/25 text-stage-applied rounded-full px-2.5 py-0.5 text-[11px] font-semibold tracking-wider uppercase">
                  {t("applicant_dashboard.title")}
                </span>
              </div>

              <div className="flex gap-3 mt-1.5 flex-wrap">
                {email && (
                  <span className="flex items-center gap-1.5 text-xs text-white/65">
                    <Mail size={13} />
                    {email}
                  </span>
                )}
                {phone && (
                  <span className="flex items-center gap-1.5 text-[13px] text-white/65">
                    <Phone size={13} />
                    {phone}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Right: Joined date pill */}
          <div className="flex items-center gap-[7px] bg-white/8 border border-white/15 rounded-full px-3 py-1.5 text-white/70 text-xs font-medium">
            <Calendar size={14} />
            {t("applicant_dashboard.joined_since")} {formattedJoinDate}
          </div>
        </div>
      </div>

      <AvatarModal
        open={open}
        onClose={() => setOpen(false)}
        userId={userId}
        currentUrl={profile_pic}
        onUpdated={(url) => onAvatarChange?.(url)}
        onDeleted={() => onAvatarChange?.(null)}
      />
    </>
  );
}