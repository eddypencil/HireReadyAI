//src\features\shortlist\components\ShortlistDetailPanel.jsx
import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ThumbsUp,
  ThumbsDown,
  Minus,
  Sparkles,
  X,
  ChevronUp,
  Send,
  Clock,
  UserCheck,
  ExternalLink,
} from "lucide-react";
import { supabase } from "@/shared/services/supabase";
import OfferEmailModal from "./OfferEmailModal";
import { useTranslation } from "react-i18next";
import { t } from "i18next";

function getInitials(name = "") {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

// HireReadyAI Avatar style - Consistent brand identity tint
function getAvatarStyles() {
  return "bg-primary/10 text-primary";
}

function timeAgo(dateString) {
  if (!dateString) return "";
  const diff = Date.now() - new Date(dateString).getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  if (days > 0) return t("shortlist.timeAgo.days", { count: days });
  if (hours > 0) return t("shortlist.timeAgo.hours", { count: hours });
  return t("shortlist.timeAgo.justNow");
}

// Semantic tag colors aligned with Design System states
const TAG_COLORS = {
  "Strong Fit": "bg-success/10 text-success border-success/20",
  "Leaning hire": "bg-accent/10 text-accent border-accent/20",
  "Needs Review": "bg-warning/10 text-warning border-warning/20",
};

// Vote Config mapped to semantic system values
const VOTE_CONFIG = {
  up: {
    label: "Up",
    Icon: ThumbsUp,
    active: "bg-success text-white",
    inactive:
      "bg-secondary text-muted-foreground hover:bg-success/10 hover:text-success",
  },
  neutral: {
    label: "Neutral",
    Icon: Minus,
    active: "bg-muted-foreground text-white",
    inactive: "bg-secondary text-muted-foreground hover:bg-muted",
  },
  down: {
    label: "Down",
    Icon: ThumbsDown,
    active: "bg-destructive text-white",
    inactive:
      "bg-secondary text-muted-foreground hover:bg-destructive/10 hover:text-destructive",
  },
};

export default function ShortlistDetailPanel({
  entry,
  myVote,
  notes,
  notesLoading,
  onClose,
  onCastVote,
  onReject,
  onPostNote,
  isOverlay,
  recruiterName = "",
  recruiterEmail = "",
  companyName = "",
}) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [noteBody, setNoteBody] = useState("");
  const [visibleToTeam, setVisibleToTeam] = useState(true);
  const [showRejectInput, setShowRejectInput] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [postingNote, setPostingNote] = useState(false);
  const [rejecting, setRejecting] = useState(false);
  const [emailModalAction, setEmailModalAction] = useState(null);
  const notesEndRef = useRef(null);

  const { applications: app, tags = [] } = entry;
  const {
    profiles: candidate,
    shortlist_votes: votes = [],
    composite_score,
    ai_rationale,
    ai_confidence,
    is_rejected,
    rejection_reason,
    application_stages = [],
  } = app;

  const hasOffer = application_stages.some(
    (s) =>
      s.recruitment_stages?.stage_type === "offer" &&
      s.status === "in_progress",
  );

  const handleEmailSend = async ({
    fromName,
    fromEmail,
    to,
    subject,
    body,
  }) => {
    const { error } = await supabase.functions.invoke("send-offer-email", {
      body: {
        to,
        fromName,
        fromEmail,
        subject,
        body,
        applicationId: app.id,
        jobId: app.job_id,
        action: emailModalAction,
      },
    });
    if (error) throw new Error(error.message || "Failed to send email");
    window.location.reload();
  };

  useEffect(() => {
    notesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [notes]);

  const upVotes = votes.filter((v) => v.vote === "up").length;
  const totalVoters = votes.length;

  const handlePostNote = async () => {
    if (!noteBody.trim()) return;
    setPostingNote(true);
    await onPostNote(noteBody.trim(), visibleToTeam);
    setNoteBody("");
    setPostingNote(false);
  };

  const handleReject = async () => {
    setRejecting(true);
    try {
      //Send rejection email silently before updating DB
      const candidateEmail = app.answers?.info?.email;
      if (candidateEmail) {
        const rejectionSubject = `Update on Your Application — ${companyName || 'Our Company'}`;
        const rejectionBody = `Dear ${candidate?.full_name || 'Candidate'},

        Thank you for your interest in joining ${companyName || 'our company'} and for taking the time to go through our hiring process.

        After careful consideration, we have decided to move forward with other candidates whose qualifications more closely match the requirements of the role.
        ${rejectReason ? `\nFeedback: ${rejectReason}` : ''}
        We appreciate your effort and wish you the very best in your future endeavors.

        Sincerely,
        ${recruiterName || 'The Hiring Team'}`;

        
        supabase.functions.invoke('send-offer-email', {
          body: {
            to: candidateEmail,
            fromName: recruiterName || 'Hiring Team',
            fromEmail: recruiterEmail || '',
            subject: rejectionSubject,
            body: rejectionBody,
            applicationId: app.id,
            jobId: app.job_id,
            action: 'reject',
          },
        }).catch(err => console.warn('Rejection email failed:', err));
      }

      await onReject(app.id, rejectReason.trim());
      setShowRejectInput(false);
    } finally {
      setRejecting(false);
    }
  };

  // const handleReject = async () => {
  //   setRejecting(true);
  //   await onReject(app.id, rejectReason.trim());
  //   setRejecting(false);
  //   setShowRejectInput(false);
  // };

  return (
    <>
      {/* Backdrop overlay utilizing system muted foreground opacity */}
      {isOverlay && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 bg-foreground/40 backdrop-blur-sm z-100"
          onClick={onClose}
        />
      )}

      <motion.div
        key={app.id}
        initial={isOverlay ? { x: "100%" } : { opacity: 0 }}
        animate={isOverlay ? { x: 0 } : { opacity: 1 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className={`bg-background flex flex-col overflow-hidden border-l border-border ${isOverlay
            ? "fixed right-0 top-0 bottom-0 z-110 w-95 shadow-(--shadow-lift)"
            : "w-95 shrink-0 h-full"
          }`}
      >
        {/* Header */}
        <div className="px-5 pt-5 pb-4 border-b border-border bg-background shrink-0">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div
                className={`w-11 h-11 rounded-full flex items-center justify-center text-sm font-bold shrink-0 ${getAvatarStyles()}`}
              >
                {getInitials(candidate?.full_name)}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-foreground font-display text-[17px]">
                    {candidate?.full_name}
                  </span>
                  <button
                    onClick={(e) => { e.stopPropagation(); navigate(`/companies/applicants/${candidate?.id}/profile`); }}
                    className="flex items-center gap-1 px-2 py-0.5 text-[10px] font-medium text-primary bg-primary/5 border border-primary/15 rounded-md hover:bg-primary/10 transition-colors shrink-0"
                  >
                    Show Profile <ExternalLink className="w-3 h-3" />
                  </button>
                  {composite_score != null && (
                    <span
                      className={`text-xs font-bold px-2 py-0.5 rounded-full border ${composite_score >= 80
                          ? "bg-success/10 text-success border-success/20"
                          : composite_score >= 65
                            ? "bg-warning/10 text-warning border-warning/20"
                            : "bg-secondary text-muted-foreground border-border"
                        }`}
                    >
                      {composite_score}
                    </span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  {candidate?.headline || candidate?.role}
                </p>
                <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                  {app.answers?.info?.email && (
                    <span>{app.answers.info.email}</span>
                  )}
                  {app.answers?.info?.phone && (
                    <span>{app.answers.info.phone}</span>
                  )}
                </div>
                <div className="flex flex-wrap gap-1 mt-1">
                  {tags.map((tag) => (
                    <span
                      key={tag}
                      className={`text-[10px] px-2 py-0.5 rounded-full border font-medium ${TAG_COLORS[tag] ||
                        "bg-secondary text-muted-foreground border-border"
                        }`}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 hover:bg-secondary rounded-lg text-muted-foreground shrink-0 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Scrollable body */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={{
            visible: { transition: { staggerChildren: 0.08 } },
          }}
          className="flex-1 overflow-y-auto"
        >
          {/* YOUR VOTE */}
          <motion.div
            variants={{
              hidden: { opacity: 0, y: 15 },
              visible: { opacity: 1, y: 0 },
            }}
            className="px-5 py-4 border-b border-border"
          >
            <p className="text-[10px] font-bold tracking-widest uppercase text-muted-foreground mb-3 font-display">
              {t("shortlist.yourVote")}
            </p>
            {myVote ? (
              <div
                className={`rounded-lg px-4 py-3 text-sm font-medium mb-3 border ${myVote === "up"
                    ? "bg-success/10 text-success border-success/20"
                    : myVote === "down"
                      ? "bg-destructive/10 text-destructive border-destructive/20"
                      : "bg-secondary text-muted-foreground border-border"
                  }`}
              >
                {t("shortlist.votedMessage", { vote: myVote })}
              </div>
            ) : (
              <p className="text-xs text-muted-foreground mb-3">
                {t("shortlist.noVoteYet")}
              </p>
            )}
            <div className="flex gap-2">
              {Object.entries(VOTE_CONFIG).map(
                ([value, { label, Icon, active, inactive }]) => (
                  <button
                    key={value}
                    onClick={() =>
                      onCastVote(app.id, myVote === value ? null : value)
                    }
                    className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-medium transition-all ${myVote === value ? active : inactive
                      }`}
                  >
                    <Icon className="w-3.5 h-3.5" /> {label}
                  </button>
                ),
              )}
            </div>
          </motion.div>

          {/* TEAM VOTES */}
          <motion.div
            variants={{
              hidden: { opacity: 0, y: 15 },
              visible: { opacity: 1, y: 0 },
            }}
            className="px-5 py-4 border-b border-border"
          >
            <div className="flex items-center justify-between mb-3">
              <p className="text-[10px] font-bold tracking-widest uppercase text-muted-foreground font-display">
                {t("shortlist.teamVotes")}
              </p>
              <span className="text-xs text-muted-foreground">
                {totalVoters} cast
              </span>
            </div>
            {totalVoters > 0 && (
              <div className="w-full bg-secondary rounded-full h-1.5 mb-3 overflow-hidden">
                <div
                  className="h-1.5 rounded-full bg-success transition-all"
                  style={{
                    width: `${(upVotes / Math.max(totalVoters, 1)) * 100}%`,
                  }}
                />
              </div>
            )}
            <div className="space-y-2">
              {votes.map((v, i) => (
                <div
                  key={v.id || i}
                  className="flex items-center justify-between"
                >
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-7 h-7 rounded-full text-[10px] font-bold flex items-center justify-center ${getAvatarStyles()}`}
                    >
                      {getInitials(v.profiles?.full_name)}
                    </div>
                    <div>
                      <p className="text-xs font-medium text-foreground">
                        {v.profiles?.full_name}
                      </p>
                      <p className="text-[10px] text-muted-foreground">
                        {v.profiles?.headline || v.profiles?.role}
                      </p>
                    </div>
                  </div>
                  <span
                    className={`text-xs font-medium px-2.5 py-1 rounded-full border ${v.vote === "up"
                        ? "bg-success/10 text-success border-success/20"
                        : v.vote === "down"
                          ? "bg-destructive/10 text-destructive border-destructive/20"
                          : "bg-secondary text-muted-foreground border-border"
                      }`}
                  >
                    {v.vote === "up"
                      ? t("shortlist.vote.up")
                      : v.vote === "down"
                        ? t("shortlist.vote.down")
                        : t("shortlist.vote.neutral")}
                  </span>
                </div>
              ))}
              {votes.length === 0 && (
                <p className="text-xs text-muted-foreground">
                  {t("shortlist.noVotes")}
                </p>
              )}
            </div>
          </motion.div>

          {/* AI RATIONALE - Uses Accent Tokens */}
          <motion.div
            variants={{
              hidden: { opacity: 0, y: 15 },
              visible: { opacity: 1, y: 0 },
            }}
            className="px-5 py-4 border-b border-border"
          >
            <div className="bg-accent/5 border border-accent/20 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-accent" />
                  <p className="text-[10px] font-bold tracking-widest uppercase text-accent font-display">
                    {t("shortlist.aiRationale")}
                  </p>
                </div>
                {ai_confidence != null && (
                  <span className="text-[10px] font-bold text-accent bg-accent/10 px-2 py-0.5 rounded-full">
                    {t("shortlist.confidence", {
                      value: Math.round(ai_confidence * 100),
                    })}
                  </span>
                )}
              </div>
              <p className="text-sm text-foreground leading-relaxed">
                {ai_rationale ||
                  "No AI rationale available for this candidate."}
              </p>
              {!is_rejected && (
                <button className="mt-3 text-xs font-semibold text-accent hover:opacity-90 transition-opacity">
                  {t("shortlist.proceedNext")}
                </button>
              )}
            </div>
          </motion.div>

          {/* TEAM NOTES */}
          <motion.div
            variants={{
              hidden: { opacity: 0, y: 15 },
              visible: { opacity: 1, y: 0 },
            }}
            className="px-5 py-4 border-b border-border"
          >
            <p className="text-[10px] font-bold tracking-widest uppercase text-muted-foreground mb-3 font-display">
              {t("shortlist.teamNotes")}
            </p>
            {notesLoading ? (
              <div className="text-xs text-muted-foreground">
                {t("shortlist.loadingNotes")}
              </div>
            ) : (
              <div className="space-y-3 mb-3">
                {notes.length === 0 && (
                  <p className="text-xs text-muted-foreground">
                    {t("shortlist.noNotes")}
                  </p>
                )}
                {notes.map((note) => (
                  <div
                    key={note.id}
                    className="bg-secondary/50 rounded-lg p-3 border border-border"
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-semibold text-foreground">
                        {note.profiles?.full_name || t("shortlist.teamMember")}
                      </span>
                      <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                        <Clock className="w-3 h-3" />
                        {timeAgo(note.created_at)}
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {note.body}
                    </p>
                  </div>
                ))}
                <div ref={notesEndRef} />
              </div>
            )}
            <textarea
              rows={2}
              value={noteBody}
              onChange={(e) => setNoteBody(e.target.value)}
              placeholder="Leave a note for the hiring team..."
              className="w-full text-xs border border-border bg-background rounded-lg px-3 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-accent/30 text-foreground placeholder:text-muted-foreground"
            />
            <div className="flex items-center justify-between mt-2">
              <label className="flex items-center gap-1.5 text-xs text-muted-foreground cursor-pointer">
                <input
                  type="checkbox"
                  checked={visibleToTeam}
                  onChange={(e) => setVisibleToTeam(e.target.checked)}
                  className="accent-primary rounded"
                />
                <UserCheck className="w-3 h-3" />
                {t("shortlist.visibleToTeam")}
              </label>
              <div className="flex gap-2">
                <button
                  onClick={() => setNoteBody("")}
                  className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                >
                  {t("shortlist.cancel")}
                </button>
                <button
                  onClick={handlePostNote}
                  disabled={!noteBody.trim() || postingNote}
                  className="flex items-center gap-1.5 text-xs font-semibold bg-primary text-white px-3 py-1.5 rounded-lg transition-opacity hover:opacity-90 disabled:opacity-50"
                >
                  <Send className="w-3 h-3" />
                  {postingNote
                    ? t("shortlist.posting")
                    : t("shortlist.postNote")}
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>

        {/* ACTION BUTTONS */}
        {!is_rejected ? (
          <div className="px-5 py-4 border-t border-border bg-background shrink-0 space-y-2">
            {showRejectInput ? (
              <div className="space-y-2">
                <p className="text-xs text-muted-foreground font-medium">
                  {t("shortlist.rejectionReason")}
                </p>
                <textarea
                  rows={3}
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  className="w-full text-xs border border-destructive/30 rounded-lg px-3 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-destructive/20 text-foreground"
                />
                <div className="flex gap-2">
                  <button
                    onClick={() => setShowRejectInput(false)}
                    className="flex-1 py-2 border border-border bg-background rounded-lg text-sm font-medium text-muted-foreground hover:bg-secondary transition-colors"
                  >
                    {t("shortlist.cancel")}
                  </button>
                  <button
                    onClick={handleReject}
                    disabled={rejecting}
                    className="flex-1 py-2 bg-destructive text-white rounded-lg text-sm font-semibold transition-opacity hover:opacity-90 disabled:opacity-50"
                  >
                    {rejecting
                      ? t("shortlist.rejecting")
                      : t("shortlist.confirmReject")}
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex gap-2">
                <button
                  onClick={() => setEmailModalAction("offer")}
                  disabled={hasOffer}
                  className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all shadow-sm ${
                    hasOffer
                      ? "bg-muted text-muted-foreground cursor-not-allowed shadow-none"
                      : "bg-primary hover:bg-primary-hover text-white"
                  }`}
                >
                  <ChevronUp className="w-4 h-4" />
                  {hasOffer ? "Offer already sent" : "Advance to offer"}
                </button>
                <button
                  onClick={() => {
                    setShowRejectInput(true);
                    if (!rejectReason && ai_rationale)
                      setRejectReason(ai_rationale);
                  }}
                  disabled={hasOffer}
                  className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                    hasOffer
                      ? "bg-muted text-muted-foreground cursor-not-allowed border-0"
                      : "border border-border hover:bg-muted text-foreground"
                  }`}
                >
                  {hasOffer ? "Offer in progress" : "Move to rejected"}
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="px-5 py-4 border-t border-border bg-destructive/10 shrink-0">
            <p className="text-xs text-destructive font-semibold mb-1">
              {t("shortlist.rejected")}
            </p>
            {rejection_reason && (
              <p className="text-xs text-muted-foreground leading-relaxed">
                {rejection_reason}
              </p>
            )}
          </div>
        )}
      </motion.div>

      {/* ── Email Modal ── */}
      {emailModalAction && (
        <OfferEmailModal
          candidateName={candidate?.full_name}
          candidateEmail={app.answers?.info?.email}
          recruiterName={recruiterName}
          recruiterEmail={recruiterEmail}
          companyName={companyName}
          action={emailModalAction}
          onClose={() => setEmailModalAction(null)}
          onSend={handleEmailSend}
        />
      )}
    </>
  );
}
