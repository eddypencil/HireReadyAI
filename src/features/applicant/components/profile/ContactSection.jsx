import {
  Mail,
  Phone,
  MapPin,
  Globe,
  ExternalLink,
  Pencil,
  Check,
} from "lucide-react";
import SectionCard from "./SectionCard";
import { InputField } from "./FormFields";
import { useTranslation } from "react-i18next";
export default function ContactSection({
  profile,
  user,
  isOwn,
  editBasic,
  setEditBasic,
  savingBasic,
  onFieldChange,
  onSaveBasic,
  onCancelBasic,
}) {
  const { t } = useTranslation();
  if (editBasic) {
    return (
      <SectionCard icon={null} title="Contact Information">
        <div className="space-y-3">
          <InputField
            label="Full Name"
            value={profile.full_name || ""}
            onChange={(v) => onFieldChange("full_name", v)}
            placeholder="Your name"
          />
          <InputField
            label="Headline"
            value={profile.headline || ""}
            onChange={(v) => onFieldChange("headline", v)}
            placeholder="e.g. Frontend Developer"
          />
          <InputField
            label="Phone"
            value={profile.phone || ""}
            onChange={(v) => onFieldChange("phone", v)}
            placeholder="+20 10 0000 0000"
          />
          <InputField
            label="Location"
            value={profile.location || ""}
            onChange={(v) => onFieldChange("location", v)}
            placeholder="City, Country"
          />
          <InputField
            label="LinkedIn URL"
            value={profile.linkedin_url || ""}
            onChange={(v) => onFieldChange("linkedin_url", v)}
            placeholder="https://linkedin.com/in/..."
          />
          <div className="flex items-center gap-2 pt-1">
            <button
              onClick={onCancelBasic}
              className="px-2.5 py-1 text-xs font-medium text-muted-foreground border border-border/70 rounded-md hover:bg-secondary/50 transition-colors"
            >
              {t("avatar_modal.cancel")}
            </button>
            <button
              onClick={onSaveBasic}
              disabled={savingBasic}
              className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-white bg-primary rounded-md hover:bg-primary/90 disabled:opacity-50 transition-colors"
            >
              <Check className="w-3 h-3" />
              {savingBasic
                ? t("job_detail_header.saving")
                : t("job_detail_header.save")}
            </button>
          </div>

        </div>
      </SectionCard>
    );
  }

  return (
    <SectionCard icon={null} title="Contact Information">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {user?.email && (
          <div className="flex items-center gap-2.5 text-sm text-muted-foreground">
            <Mail className="w-4 h-4 shrink-0 text-primary/60" />
            <span>{user.email}</span>
          </div>
        )}
        {profile.phone && (
          <div className="flex items-center gap-2.5 text-sm text-muted-foreground">
            <Phone className="w-4 h-4 shrink-0 text-primary/60" />
            <span>{profile.phone}</span>
          </div>
        )}
        {profile.location && (
          <div className="flex items-center gap-2.5 text-sm text-muted-foreground">
            <MapPin className="w-4 h-4 shrink-0 text-primary/60" />
            <span>{profile.location}</span>
          </div>
        )}
        {profile.linkedin_url && (
          <a
            href={profile.linkedin_url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2.5 text-sm text-primary hover:underline"
          >
            <Globe className="w-4 h-4 shrink-0" />
            <span className="truncate">LinkedIn</span>
            <ExternalLink className="w-3 h-3 shrink-0 ml-auto" />
          </a>
        )}
      </div>
      {isOwn && (
        <button
          onClick={() => setEditBasic(true)}
          className="mt-3 flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-muted-foreground hover:text-primary border border-border/60 rounded-md hover:border-primary/30 transition-colors"
        >
          <Pencil className="w-3 h-3" />
          {t("job_detail_header.edit")}
        </button>
      )}
    </SectionCard>
  );
}
