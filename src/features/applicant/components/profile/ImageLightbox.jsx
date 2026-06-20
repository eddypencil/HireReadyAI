import { X } from "lucide-react";

export default function ImageLightbox({ src, alt, onClose }) {
  if (!src) return null;
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
      <button onClick={onClose} className="absolute top-4 right-4 text-white/80 hover:text-white z-10">
        <X className="w-6 h-6" />
      </button>
      <img src={src} alt={alt || ""} className="relative max-w-full max-h-[90vh] rounded-xl shadow-2xl object-contain" onClick={(e) => e.stopPropagation()} />
    </div>
  );
}
