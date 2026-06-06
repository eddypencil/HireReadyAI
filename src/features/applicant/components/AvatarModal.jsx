import { useRef, useState } from "react";
import { uploadAndSaveAvatar } from "@/features/auth/services/avatar.service";
import { supabase } from "@/shared/services/supabase";

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

      onDeleted?.(); // UI update
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center z-50 animate-fade-in">
      <div className="bg-background border border-border rounded-xl p-5 w-80 space-y-3 shadow-xl">
        <h2 className="text-sm font-semibold text-sidebar">Profile Picture</h2>

        <button
          type="button"
          disabled={loading}
          className="w-full py-2 rounded-lg bg-primary hover:bg-primary-hover text-white text-sm font-medium transition-colors cursor-pointer disabled:opacity-60"
          onClick={() => fileRef.current.click()}
        >
          {loading ? "Uploading..." : "Upload / Change"}
        </button>

        <button
          type="button"
          disabled={loading}
          className="w-full py-2 rounded-lg border border-destructive/20 text-destructive bg-destructive/5 hover:bg-destructive/10 text-sm font-medium transition-colors cursor-pointer disabled:opacity-60"
          onClick={handleDelete}
        >
          Remove
        </button>

        <button
          type="button"
          className="w-full py-2 text-sm font-medium text-muted-foreground hover:text-sidebar transition-colors cursor-pointer"
          onClick={onClose}
        >
          Cancel
        </button>

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