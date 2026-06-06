import { useState } from "react";
import AvatarModal from "./AvatarModal";

export default function ApplicantHeader({
  fullName,
  profile_pic,
  userId,
  onAvatarChange,
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <div className="bg-background border border-border rounded-2xl p-7 flex flex-col md:flex-row md:items-center md:justify-between gap-4 shadow-xs">
        <div className="flex items-center gap-3">
          <div
            className="cursor-pointer relative group"
            onClick={() => setOpen(true)}
          >
            {profile_pic ? (
              <img
                src={profile_pic}
                className="w-11 h-11 rounded-full object-cover border border-border group-hover:opacity-80 transition"
              />
            ) : (
              <div className="w-11 h-11 rounded-full bg-secondary flex items-center justify-center text-sidebar font-bold group-hover:opacity-80 transition">
                {fullName?.[0] || "U"}
              </div>
            )}

            <div className="absolute bottom-0 right-0 bg-accent text-white text-[10px] px-1 rounded-full shadow-xs">
              ✎
            </div>
          </div>

          <div>
            <h1 className="text-2xl font-bold text-sidebar">
              HireReadyAI
            </h1>

            <p className="text-sm text-muted-foreground/80 mt-1">
              Welcome back, {fullName}
            </p>
          </div>
        </div>

        <div className="text-sm font-medium px-4 py-2 rounded-full bg-secondary text-sidebar border border-border/60">
          Your applications
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