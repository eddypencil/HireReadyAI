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
      <div
        style={{
          background:
            "linear-gradient(135deg, #012a4a 0%, #01497c 60%, #2a6f97 100%)",
          borderRadius: "1rem",
          padding: "0",
          boxShadow: "0 10px 30px -12px rgba(1,42,74,.28)",
          overflow: "hidden",
          position: "relative",
        }}
      >
        {/* Decorative circles */}
        <div
          style={{
            position: "absolute",
            top: "-40px",
            right: "-40px",
            width: "180px",
            height: "180px",
            borderRadius: "50%",
            background: "rgba(70,143,175,0.12)",
            pointerEvents: "none",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: "-30px",
            right: "120px",
            width: "120px",
            height: "120px",
            borderRadius: "50%",
            background: "rgba(70,143,175,0.08)",
            pointerEvents: "none",
          }}
        />

        <div
          style={{
            padding: "28px 32px",
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "20px",
            flexWrap: "wrap",
            position: "relative",
            zIndex: 1,
          }}
        >
          {/* Left: Avatar + Info */}
          <div style={{ display: "flex", alignItems: "center", gap: "18px" }}>
            {/* Avatar */}
            <div
              onClick={() => setOpen(true)}
              style={{
                position: "relative",
                cursor: "pointer",
                flexShrink: 0,
              }}
            >
              {profile_pic ? (
                <img
                  src={profile_pic}
                  alt={fullName}
                  style={{
                    width: "68px",
                    height: "68px",
                    borderRadius: "50%",
                    objectFit: "cover",
                    border: "3px solid rgba(70,143,175,0.5)",
                  }}
                />
              ) : (
                <div
                  style={{
                    width: "68px",
                    height: "68px",
                    borderRadius: "50%",
                    background: "rgba(70,143,175,0.25)",
                    border: "3px solid rgba(70,143,175,0.4)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "22px",
                    fontWeight: "700",
                    color: "#eef7fa",
                    fontFamily: "'Plus Jakarta Sans', sans-serif",
                  }}
                >
                  {initials}
                </div>
              )}
              {/* Edit badge */}
              <div
                style={{
                  position: "absolute",
                  bottom: "2px",
                  right: "2px",
                  width: "20px",
                  height: "20px",
                  borderRadius: "50%",
                  background: "#468faf",
                  border: "2px solid #012a4a",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "9px",
                  color: "white",
                }}
              >
                ✎
              </div>
            </div>

            {/* Name + meta */}
            <div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  flexWrap: "wrap",
                }}
              >
                <h1
                  style={{
                    fontFamily: "'Plus Jakarta Sans', sans-serif",
                    fontSize: "22px",
                    fontWeight: "700",
                    color: "#ffffff",
                    margin: 0,
                    letterSpacing: "-0.02em",
                  }}
                >
                  {fullName || "Applicant"}
                </h1>
                <span
                  style={{
                    background: "rgba(70,143,175,0.25)",
                    border: "1px solid rgba(70,143,175,0.4)",
                    color: "#89c2d9",
                    borderRadius: "999px",
                    padding: "2px 10px",
                    fontSize: "11px",
                    fontWeight: "600",
                    letterSpacing: "0.03em",
                    textTransform: "uppercase",
                  }}
                >
                  {t("applicant_dashboard.title")}
                </span>
              </div>

              <div
                style={{
                  display: "flex",
                  gap: "18px",
                  marginTop: "8px",
                  flexWrap: "wrap",
                }}
              >
                {email && (
                  <span
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "5px",
                      fontSize: "13px",
                      color: "rgba(207,231,242,0.8)",
                    }}
                  >
                    <Mail size={13} />
                    {email}
                  </span>
                )}
                {phone && (
                  <span
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "5px",
                      fontSize: "13px",
                      color: "rgba(207,231,242,0.8)",
                    }}
                  >
                    <Phone size={13} />
                    {phone}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Right: Joined date pill */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "7px",
              background: "rgba(255,255,255,0.08)",
              border: "1px solid rgba(207,231,242,0.2)",
              borderRadius: "999px",
              padding: "8px 16px",
              color: "rgba(207,231,242,0.85)",
              fontSize: "13px",
              fontWeight: "500",
            }}
          >
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