import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import {
  User,
  Briefcase,
  GraduationCap,
  Wrench,
  Languages,
  FolderGit2,
  HeartHandshake,
  BadgeCheck, MapPin, Calendar, Camera,
} from "lucide-react";
import { useUser } from "@/features/auth/context/user.context";
import {
  fetchApplicantProfile,
  updateApplicantProfile,
} from "../services/profile.service";
import {
  addExperience,
  updateExperience,
  deleteExperience,
} from "../services/experience.service";
import {
  addEducation,
  updateEducation,
  deleteEducation,
} from "../services/education.service";
import { addSkill, updateSkill, deleteSkill } from "../services/skills.service";
import {
  addLanguage,
  updateLanguage,
  deleteLanguage,
} from "../services/languages.service";
import {
  addCertificate,
  updateCertificate,
  deleteCertificate,
} from "../services/certificates.service";
import {
  addProject,
  updateProject,
  deleteProject,
} from "../services/projects.service";
import {
  addVolunteering,
  updateVolunteering,
  deleteVolunteering,
} from "../services/volunteering.service";
import AvatarModal from "../components/AvatarModal";
import ItemDialog from "../components/ItemDialog";
import LoadingSpinner from "@/shared/ui/LoadingSpinner";
import {
  Experience,
  Education,
  Skill,
  Language,
  Certificate,
  Project,
  Volunteering,
} from "../models";
import ContactSection from "../components/profile/ContactSection";
import BioSection from "../components/profile/BioSection";
import ArraySection from "../components/profile/ArraySection";
import SkillsSection from "../components/profile/SkillsSection";
import LanguagesSection from "../components/profile/LanguagesSection";
import DialogForms from "../components/profile/DialogForms";
import ImageLightbox from "../components/profile/ImageLightbox";
import { getInitials } from "../components/profile/FormFields";
import { useTranslation } from "react-i18next";
import CompletenessBar from '../components/profile/CompletenessBar';

const SECTION_MODEL = {
  experience: Experience,
  education: Education,
  skills: Skill,
  languages: Language,
  certificates: Certificate,
  projects: Project,
  volunteering: Volunteering,
};

const SECTION_ADD = {
  experience: addExperience,
  education: addEducation,
  skills: addSkill,
  languages: addLanguage,
  certificates: addCertificate,
  projects: addProject,
  volunteering: addVolunteering,
};

const SECTION_UPDATE = {
  experience: updateExperience,
  education: updateEducation,
  skills: updateSkill,
  languages: updateLanguage,
  certificates: updateCertificate,
  projects: updateProject,
  volunteering: updateVolunteering,
};

const SECTION_DELETE = {
  experience: deleteExperience,
  education: deleteEducation,
  skills: deleteSkill,
  languages: deleteLanguage,
  certificates: deleteCertificate,
  projects: deleteProject,
  volunteering: deleteVolunteering,
};

export default function ApplicantProfilePage() {
  const { id } = useParams();
  const { user } = useUser();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [avatarOpen, setAvatarOpen] = useState(false);
  const [editBasic, setEditBasic] = useState(false);
  const [editBio, setEditBio] = useState(false);
  const [savingBasic, setSavingBasic] = useState(false);
  const [savingBio, setSavingBio] = useState(false);
  const [dialog, setDialog] = useState(null);
  const [errors, setErrors] = useState({});
  const [savingDialog, setSavingDialog] = useState(false);
  const [lightboxSrc, setLightboxSrc] = useState(null);

  const [activeTab, setActiveTab] = useState("about");
  const { t } = useTranslation();
  const viewingOwn = !id || id === user?.id;
  const fetchId = id || user?.id;

  async function loadProfile() {
    if (!fetchId) return;
    setLoading(true);
    try {
      const data = await fetchApplicantProfile(fetchId);
      setProfile(data);
    } catch (err) {
      console.error("Failed to load profile:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadProfile();
  }, [fetchId]);

  const handleSaveBasic = async () => {
    const basicErrors = {};
    if (!profile.full_name?.trim()) basicErrors.full_name = "Full name is required";

    if (Object.keys(basicErrors).length > 0) {
      setErrors(basicErrors);
      return;
    }

    setSavingBasic(true);
    try {
      await updateApplicantProfile(fetchId, {
        full_name: profile.full_name,
        headline: profile.headline,
        phone: profile.phone,
        location: profile.location,
        linkedin_url: profile.linkedin_url,
        github_url: profile.github_url,
        portfolio_url: profile.portfolio_url,
      });
      setEditBasic(false);
    } catch (err) {
      console.error("Failed to save basic info:", err);
    } finally {
      setSavingBasic(false);
    }
  };

  const handleCancelBasic = () => setEditBasic(false);

  const handleSaveBio = async () => {
    setSavingBio(true);
    try {
      await updateApplicantProfile(fetchId, { bio: profile.bio });
      setEditBio(false);
    } catch (err) {
      console.error("Failed to save bio:", err);
    } finally {
      setSavingBio(false);
    }
  };

  const handleCancelBio = () => setEditBio(false);

  const handleAvatarChange = (url) => {
    setProfile((prev) => ({ ...prev, profile_pic: url }));
  };

  const handleOpenAdd = (section) => {
    setDialog({ section, index: null, data: {} });
    setErrors({});
  };

  const handleOpenEdit = (section, index) => {
    const items = profile[section] || [];
    setDialog({ section, index, data: { ...items[index] } });
    setErrors({});
  };

  const handleCloseDialog = () => {
    setDialog(null);
    setErrors({});
    setSavingDialog(false);
  };

  const handleDialogChange = (key, value) => {
    setDialog((prev) => ({ ...prev, data: { ...prev.data, [key]: value } }));
    if (errors[key]) {
      setErrors((prevErrors) => {
        const next = { ...prevErrors };
        delete next[key];
        return next;
      });
    }
  };

  const handleSaveDialog = async () => {
    if (!dialog) return;

    const { section, data } = dialog;
    const newErrors = {};

    if (section === "experience") {
      if (!data.title?.trim()) newErrors.title = "Job title is required";
      if (!data.company_name?.trim()) newErrors.company_name = "Company name is required";
      if (!data.from) newErrors.from = "Start date is required";
      if (!data.to && data.to !== "present") newErrors.to = "End date is required";
    }

    if (section === "education") {
      if (!data.level) newErrors.level = "Degree level is required";
      if (!data.university?.trim()) newErrors.university = "University name is required";
      if (!data.start_year) newErrors.start_year = "Start year is required";
      if (!data.end_year && data.end_year !== "present") newErrors.end_year = "End year is required";
    }

    if (section === "skills") {
      if (!data.name?.trim()) newErrors.name = "Skill name is required";
    }

    if (section === "languages") {
      if (!data.name?.trim()) newErrors.name = "Language is required";
    }

    if (section === "certificates") {
      if (!data.name?.trim()) newErrors.name = "Certificate name is required";
      if (!data.organization?.trim()) newErrors.organization = "Organization is required";
      if (!data.date) newErrors.date = "Date is required";
    }

    if (section === "projects") {
      if (!data.name?.trim()) newErrors.name = "Project name is required";
    }

    if (section === "volunteering") {
      if (!data.organization?.trim()) newErrors.organization = "Organization is required";
      if (!data.role?.trim()) newErrors.role = "Role is required";
      if (!data.start) newErrors.start = "Start date is required";
      if (!data.end && data.end !== "present") newErrors.end = "End date is required";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setSavingDialog(true);
    try {
      const { index } = dialog;
      const Model = SECTION_MODEL[section];
      const item = Model ? Model.fromJson(data) : data;
      const json = item instanceof Model ? item.toJson() : item;

      if (index == null) {
        await SECTION_ADD[section](fetchId, json);
        setProfile((prev) => ({
          ...prev,
          [section]: [...(prev[section] || []), json],
        }));
      } else {
        await SECTION_UPDATE[section](fetchId, index, json);
        setProfile((prev) => {
          const arr = [...(prev[section] || [])];
          arr[index] = json;
          return { ...prev, [section]: arr };
        });
      }
      handleCloseDialog();
    } catch (err) {
      console.error("Failed to save dialog:", err);
    } finally {
      setSavingDialog(false);
    }
  };

  const handleDeleteItem = async (section, index) => {
    const removed = profile[section]?.[index];
    setProfile((prev) => ({
      ...prev,
      [section]: (prev[section] || []).filter((_, i) => i !== index),
    }));
    try {
      await SECTION_DELETE[section](fetchId, index);
    } catch (err) {
      console.error("Failed to delete:", err);
      setProfile((prev) => {
        const arr = [...(prev[section] || [])];
        arr.splice(index, 0, removed);
        return { ...prev, [section]: arr };
      });
    }
  };

  if (loading) return <LoadingSpinner message={t("common.loading_profile")} />;
  if (!profile) {
    return (
      <div className="min-h-screen bg-surface-muted flex items-center justify-center p-5">
        <div className="text-center">
          <User className="w-12 h-12 text-muted-foreground/40 mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">
            {t("profile_not_found")}
          </p>
        </div>
      </div>
    );
  }

  const isOwn = viewingOwn && user?.id === fetchId;

  return (
    <div className="min-h-screen bg-surface-muted font-sans text-foreground">
      <div className="max-w-4xl mx-auto p-4 sm:p-6 space-y-5">

        <div className="bg-[#0f2d4a] rounded-xl p-6 text-white shadow-md space-y-4">
          <div className="flex items-center gap-4">
            <div
              className="relative shrink-0 cursor-pointer"
              onClick={() => isOwn && setAvatarOpen(true)}
            >
              {profile.profile_pic ? (
                <img
                  src={profile.profile_pic}
                  alt={profile.full_name}
                  className="w-16 h-16 rounded-full object-cover border-[3px] border-white/20"
                />
              ) : (
                <div className="w-16 h-16 rounded-full bg-white/10 border-[3px] border-white/20 flex items-center justify-center text-lg font-bold text-white relative">
                  {getInitials(profile.full_name)}
                  {isOwn && (
                    <div className="absolute bottom-0 right-0 bg-primary p-1 rounded-full border border-white text-white">
                      <Camera className="w-3.5 h-3.5" />
                    </div>
                  )}
                </div>
              )}
            </div>
            <div>
              <h1 className="text-xl font-bold">{profile.full_name}</h1>
              {profile.headline && <p className="text-sm text-white/70 mt-0.5">{profile.headline}</p>}
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-2 text-xs text-white/60">
                {profile.location && (
                  <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> {profile.location}</span>
                )}
                {profile.created_at && (
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    Joined {new Date(profile.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {isOwn && (
          <CompletenessBar
            profile={profile}
            onAddMissing={(sectionLabel) => {
              console.log('Navigate to:', sectionLabel);
            }}
          />
        )}

        <div className="flex bg-secondary/50 p-1 rounded-xl border border-border/60 gap-1 overflow-x-auto">
          {[
            { id: "about", label: "About", icon: User },
            { id: "experience", label: "Experience", icon: Briefcase },
            { id: "education", label: "Education", icon: GraduationCap },
            { id: "skills_langs", label: "Skills & Langs", icon: Wrench },
            { id: "projects_certs", label: "Projects & Certs", icon: FolderGit2 },
            { id: "volunteering", label: "Volunteering", icon: HeartHandshake },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${isActive
                  ? "bg-background text-foreground shadow-xs border border-border/40"
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
                  }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? "text-primary/70" : "text-muted-foreground"}`} />
                {tab.label}
              </button>
            );
          })}
        </div>

        {activeTab === "about" && (
          <div className="space-y-5">
            <ContactSection
              profile={profile}
              user={user}
              isOwn={isOwn}
              editBasic={editBasic}
              setEditBasic={setEditBasic}
              savingBasic={savingBasic}
              onFieldChange={(key, value) =>
            setProfile((p) => ({ ...p, [key]: value }))
          }
              onSaveBasic={handleSaveBasic}
              onCancelBasic={handleCancelBasic}
            />

            <BioSection
              profile={profile}
              isOwn={isOwn}
              editBio={editBio}
              setEditBio={setEditBio}
              savingBio={savingBio}
              onBioChange={(value) => setProfile((p) => ({ ...p, bio: value }))}
              onSaveBio={handleSaveBio}
              onCancelBio={handleCancelBio}
            />
          </div>
        )}

        {activeTab === "experience" && (
          <ArraySection
            icon={Briefcase}
          title="Experience"
          section="experience"
            items={profile.experience || []}
          isOwn={isOwn}
            onEdit={handleOpenEdit}
          onDelete={handleDeleteItem}
          onAdd={handleOpenAdd}
          />
        )}

        {activeTab === "education" && (
          <ArraySection
            icon={GraduationCap}
          title="Education"
          section="education"
            items={profile.education || []}
          isOwn={isOwn}
            onEdit={handleOpenEdit}
          onDelete={handleDeleteItem}
          onAdd={handleOpenAdd}
          />
        )}

        {activeTab === "skills_langs" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <SkillsSection
              items={profile.skills || []}
          isOwn={isOwn}
              onEdit={handleOpenEdit}
          onDelete={handleDeleteItem}
          onAdd={handleOpenAdd}
            />
            <LanguagesSection
              items={profile.languages || []}
          isOwn={isOwn}
              onEdit={handleOpenEdit}
          onDelete={handleDeleteItem}
          onAdd={handleOpenAdd}
            />
          </div>
        )}

        {activeTab === "projects_certs" && (
          <div className="space-y-5">
            <ArraySection
              icon={BadgeCheck}
          title="Certificates"
          section="certificates"
              items={profile.certificates || []}
          isOwn={isOwn}
              onEdit={handleOpenEdit}
          onDelete={handleDeleteItem}
          onAdd={handleOpenAdd}
              onImageClick={(src) => setLightboxSrc(src)}
            />

            <ArraySection
              icon={FolderGit2}
          title="Projects"
          section="projects"
              items={profile.projects || []}
          isOwn={isOwn}
              onEdit={handleOpenEdit}
          onDelete={handleDeleteItem}
          onAdd={handleOpenAdd}
              onImageClick={(src) => setLightboxSrc(src)}
            />
          </div>
        )}

        {activeTab === "volunteering" && (
          <ArraySection
            icon={HeartHandshake}
          title="Volunteering"
          section="volunteering"
            items={profile.volunteering || []}
          isOwn={isOwn}
            onEdit={handleOpenEdit}
          onDelete={handleDeleteItem}
          onAdd={handleOpenAdd}
          />
        )}
      </div>

      {dialog && (
        <ItemDialog
          open
          onClose={handleCloseDialog}
          title={
            dialog.index == null
              ? `Add ${dialog.section}`
              : `Edit ${dialog.section}`
          }
          onSave={handleSaveDialog}
          saving={savingDialog}
        >
          <DialogForms
            dialog={dialog}
            handleDialogChange={handleDialogChange} errors={errors}
          />
        </ItemDialog>
      )}

      <AvatarModal
        open={avatarOpen}
        onClose={() => setAvatarOpen(false)}
        userId={user?.id}
        currentUrl={profile.profile_pic}
        onUpdated={handleAvatarChange}
        onDeleted={() => handleAvatarChange(null)}
      />

      {lightboxSrc && (
        <ImageLightbox
          src={lightboxSrc}
          alt=""
          onClose={() => setLightboxSrc(null)}
        />
      )}
    </div>
  );
}