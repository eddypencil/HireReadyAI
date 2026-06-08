// src\features\applicant\components\AvatarModal.jsx
import { useRef, useState } from "react";
import { uploadAndSaveAvatar } from "@/features/auth/services/avatar.service";
import { supabase } from "@/shared/services/supabase";
import { useTranslation } from "react-i18next";
export default function AvatarModal({
  open,
  onClose,
  userId,
  currentUrl,
  onUpdated,
  onDeleted,
}) {
  const fileRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const { t } = useTranslation();

  if (!open) return null;

  const handleUpload = async (file) => {
    if (!file) return;
    try {
      setLoading(true);
      const url = await uploadAndSaveAvatar(file, userId);
      onUpdated(url);
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };


  const handleDelete = async () => {
    try {
      setLoading(true);
      const { error } = await supabase
        .from("profiles")
        .update({ profile_pic: null })
        .eq("id", userId);
      if (error) throw error;
      onDeleted?.();
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) onClose();
  };

  return (
    <div
      className="fixed inset-0 bg-foreground/40 backdrop-blur-sm flex items-center justify-center z-50"
      onClick={handleOverlayClick}
    >
      <div className="bg-card rounded-2xl border shadow-[var(--shadow-lift)] p-6 max-w-md w-full mx-4">
        <h2 className="font-display text-xl font-semibold text-foreground mb-4">
          {t("avatar_modal.title")}
        </h2>

        <div className="space-y-3">
          <button
            className="w-full rounded-lg bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground px-4 py-2.5 text-sm font-medium transition-all duration-180 disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={() => fileRef.current.click()}
            disabled={loading}
          >
            {loading ? t("avatar_modal.uploading") : t("avatar_modal.upload")}
          </button>

          <button
            className="w-full rounded-lg border border-destructive/30 text-destructive hover:bg-destructive hover:text-destructive-foreground hover:border-destructive px-4 py-2.5 text-sm font-medium transition-all duration-180 disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={handleDelete}
            disabled={loading}
          >
            {t("avatar_modal.remove")}
          </button>

          <button
            className="w-full rounded-lg border border-border bg-background text-muted-foreground hover:bg-primary hover:text-primary-foreground hover:border-primary px-4 py-2.5 text-sm font-medium transition-all duration-180"
            onClick={onClose}
          >
            {t("avatar_modal.cancel")}
          </button>
        </div>

        <input
          type="file"
          hidden
          ref={fileRef}
          accept="image/*"
          onChange={(e) => handleUpload(e.target.files[0])}
        />
      </div>
    </div>
  );
}