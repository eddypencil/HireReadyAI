import { BookOpen, Pencil, Check } from "lucide-react";
import SectionCard from "./SectionCard";
import { EmptyState } from "./FormFields";

export default function BioSection({
  profile, isOwn,
  editBio, setEditBio, savingBio,
  onBioChange, onSaveBio, onCancelBio,
}) {
  if (editBio) {
    return (
      <SectionCard icon={BookOpen} title="About">
        <div>
          <textarea className="w-full text-sm bg-background border border-border/70 rounded-lg px-3 py-2 text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/30 min-h-[100px] resize-y" value={profile.bio || ""} onChange={(e) => onBioChange(e.target.value)} placeholder="Tell us about yourself..." />
          <div className="flex items-center gap-2 mt-3">
            <button onClick={onCancelBio} className="px-2.5 py-1 text-xs font-medium text-muted-foreground border border-border/70 rounded-md hover:bg-secondary/50 transition-colors">Cancel</button>
            <button onClick={onSaveBio} disabled={savingBio} className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-white bg-primary rounded-md hover:bg-primary/90 disabled:opacity-50 transition-colors">
              <Check className="w-3 h-3" />{savingBio ? "Saving..." : "Save"}
            </button>
          </div>
        </div>
      </SectionCard>
    );
  }

  return (
    <SectionCard icon={BookOpen} title="About">
      {profile.bio ? <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">{profile.bio}</p> : <EmptyState message="No bio added yet" />}
      {isOwn && <button onClick={() => setEditBio(true)} className="mt-3 flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-muted-foreground hover:text-primary border border-border/60 rounded-md hover:border-primary/30 transition-colors"><Pencil className="w-3 h-3" />Edit</button>}
    </SectionCard>
  );
}
