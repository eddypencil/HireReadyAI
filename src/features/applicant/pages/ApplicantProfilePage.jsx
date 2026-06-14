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
  BadgeCheck,
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
import SectionCard from "../components/profile/SectionCard";
import ContactSection from "../components/profile/ContactSection";
import BioSection from "../components/profile/BioSection";
import ArraySection from "../components/profile/ArraySection";
import SkillsSection from "../components/profile/SkillsSection";
import LanguagesSection from "../components/profile/LanguagesSection";
import DialogForms from "../components/profile/DialogForms";
import ImageLightbox from "../components/profile/ImageLightbox";
import { InputField, getInitials } from "../components/profile/FormFields";
import { useTranslation } from "react-i18next";

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
  const [savingDialog, setSavingDialog] = useState(false);
  const [lightboxSrc, setLightboxSrc] = useState(null);
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
    setSavingBasic(true);
    try {
      await updateApplicantProfile(fetchId, {
        full_name: profile.full_name,
        headline: profile.headline,
        phone: profile.phone,
        location: profile.location,
        linkedin_url: profile.linkedin_url,
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
  };

  const handleOpenEdit = (section, index) => {
    const items = profile[section] || [];
    setDialog({ section, index, data: { ...items[index] } });
  };

  const handleCloseDialog = () => {
    setDialog(null);
    setSavingDialog(false);
  };

  const handleDialogChange = (key, value) => {
    setDialog((prev) => ({ ...prev, data: { ...prev.data, [key]: value } }));
  };

  const handleSaveDialog = async () => {
    if (!dialog) return;
    setSavingDialog(true);
    try {
      const { section, index, data } = dialog;
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
        {/* Header */}
        <div className="bg-background rounded-xl border border-border/60 p-5 shadow-xs flex items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            <div
              className="relative shrink-0 cursor-pointer"
              onClick={() => isOwn && setAvatarOpen(true)}
            >
              {profile.profile_pic ? (
                <img
                  src={profile.profile_pic}
                  alt={profile.full_name}
                  className="w-16 h-16 rounded-full object-cover border-[3px] border-border/60"
                />
              ) : (
                <div className="w-16 h-16 rounded-full bg-primary/10 border-[3px] border-border/60 flex items-center justify-center text-lg font-bold text-primary">
                  {getInitials(profile.full_name)}
                </div>
              )}
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">
                {profile.full_name}
              </h1>
              {profile.headline && (
                <p className="text-sm text-muted-foreground mt-0.5">
                  {profile.headline}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Contact */}
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

        {/* Bio */}
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

        {/* Experience */}
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

        {/* Education */}
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

        {/* Skills */}
        <SkillsSection
          items={profile.skills || []}
          isOwn={isOwn}
          onEdit={handleOpenEdit}
          onDelete={handleDeleteItem}
          onAdd={handleOpenAdd}
        />

        {/* Languages */}
        <LanguagesSection
          items={profile.languages || []}
          isOwn={isOwn}
          onEdit={handleOpenEdit}
          onDelete={handleDeleteItem}
          onAdd={handleOpenAdd}
        />

        {/* Certificates */}
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

        {/* Projects */}
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

        {/* Volunteering */}
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
      </div>

      {/* Item Dialog */}
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
            handleDialogChange={handleDialogChange}
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
