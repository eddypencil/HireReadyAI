import { useState } from "react";
import { Upload, X } from "lucide-react";
import { uploadFile, deleteFile } from "@/shared/services/upload.service";
import { useTranslation } from "react-i18next";
export default function ImageUpload({ bucket, currentUrls = [], onUploaded }) {
  const [uploading, setUploading] = useState(false);
  const { t } = useTranslation();
  const handleFile = async (file) => {
    if (!file) return;
    setUploading(true);
    try {
      const url = await uploadFile(file, bucket);
      onUploaded(url);
    } catch (err) {
      console.error("Upload failed:", err);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <div className="flex flex-wrap gap-2 mb-2">
        {currentUrls.map((url, i) => (
          <div key={i} className="relative group">
            <img
              src={url}
              alt=""
              className="w-20 h-16 rounded-lg object-cover border border-border/60"
            />
            <button
              type="button"
              onClick={() => {
                deleteFile(url, bucket);
                onUploaded(null, i);
              }}
              className="absolute -top-1.5 -right-1.5 size-4 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <X className="w-2.5 h-2.5" />
            </button>
          </div>
        ))}
      </div>
      <label className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-muted-foreground border border-border/60 rounded-md cursor-pointer hover:bg-secondary/50 transition-colors">
        <Upload className="w-3 h-3" />
        {uploading
          ? t("avatar_modal.uploading")
          : t("avatar_modal.upload_only")}
        <input
          type="file"
          hidden
          accept="image/*"
          onChange={(e) => handleFile(e.target.files[0])}
          disabled={uploading}
        />
      </label>
    </div>
  );
}
