import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "@/features/auth/context/user.context";
import { ShieldAlert, Send, Loader2, UserMinus } from "lucide-react";
import { supabase } from "@/shared/services/supabase";
import { submitAppeal, getAppealMessages, sendAppealMessage, removeCompanyMember } from "@/features/admin/services/admin.service";

export default function CompanySuspended({ company, membershipPermission }) {
  const { profile } = useUser();
  const navigate = useNavigate();
  const [showForm, setShowForm] = useState(false);
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [appealMessages, setAppealMessages] = useState([]);
  const [chatInput, setChatInput] = useState("");
  const [sending, setSending] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const [localAppealStatus, setLocalAppealStatus] = useState(null);
  const bottomRef = useRef(null);

  const isHrManager = membershipPermission === "hr_manager";
  const appealStatus = localAppealStatus || company?.appeal_status || "none";

  useEffect(() => {
    const status = localAppealStatus || company?.appeal_status;
    if (company?.id && (status === "pending_review" || status === "rejected")) {
      loadMessages();
    }
  }, [company?.id, company?.appeal_status, localAppealStatus]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [appealMessages]);

  useEffect(() => {
    if (!company?.id) return;
    const channel = supabase
      .channel(`company-suspended-${company.id}-${Date.now()}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "companies",
          filter: `id=eq.${company.id}`,
        },
        (payload) => {
          if (payload.new.account_status === "active") {
            window.location.reload();
          }
          if (payload.new.appeal_status && payload.new.appeal_status !== localAppealStatus) {
            setLocalAppealStatus(payload.new.appeal_status);
          }
        }
      )
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "appeal_messages",
          filter: `entity_type=eq.company`,
        },
        (payload) => {
          if (payload.new.entity_id === company.id) {
            setAppealMessages((prev) => [...prev, payload.new]);
          }
        }
      )
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [company?.id]);

  async function loadMessages() {
    try {
      const data = await getAppealMessages({ entityType: "company", entityId: company.id });
      setAppealMessages(data);
    } catch (err) {
      console.error("Failed to load messages:", err);
    }
  }

  async function handleSubmitAppeal(e) {
    e.preventDefault();
    if (!message.trim()) return;
    setSubmitting(true);
    try {
      await submitAppeal({
        entityType: "company",
        entityId: company.id,
        senderId: profile?.id,
        message: message.trim(),
      });
      setLocalAppealStatus("pending_review");
      setMessage("");
      loadMessages();
    } catch (err) {
      console.error("Failed to submit appeal:", err);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleSendChat(e) {
    e.preventDefault();
    if (!chatInput.trim() || sending) return;
    setSending(true);
    try {
      await sendAppealMessage({
        entityType: "company",
        entityId: company.id,
        senderId: profile?.id,
        message: chatInput.trim(),
      });
      setChatInput("");
    } catch (err) {
      console.error("Failed to send message:", err);
    } finally {
      setSending(false);
    }
  }

  async function handleLeave() {
    setLeaving(true);
    try {
      await removeCompanyMember(profile?.id, company.id);
      navigate("/", { replace: true });
    } catch (err) {
      console.error("Failed to leave company:", err);
    } finally {
      setLeaving(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 py-8">
      <div className="w-full max-w-md text-center">
        <div className="w-16 h-16 mx-auto rounded-2xl bg-destructive/15 border border-destructive/20 flex items-center justify-center mb-6">
          <ShieldAlert className="w-8 h-8 text-destructive" />
        </div>

        <h1 className="text-2xl font-bold text-foreground mb-2">Company Banned</h1>

        <p className="text-sm text-muted-foreground mb-1">
          This company has been banned due to a violation of our terms.
        </p>

        {company?.suspension_reason && (
          <div className="bg-muted rounded-xl px-4 py-3 mb-6 text-left">
            <p className="text-xs font-semibold text-foreground mb-1">Reason:</p>
            <p className="text-xs text-muted-foreground">{company.suspension_reason}</p>
          </div>
        )}

        {/* HR Manager: appeal flow */}
        {isHrManager && appealStatus === "none" && !showForm && (
          <div className="flex flex-col gap-3">
            <button
              onClick={() => setShowForm(true)}
              className="w-full h-11 rounded-xl text-sm font-semibold bg-primary text-white hover:bg-primary-hover transition-colors cursor-pointer"
            >
              Submit Appeal
            </button>
            <button
              onClick={handleLeave}
              disabled={leaving}
              className="w-full h-11 rounded-xl text-sm font-semibold bg-muted text-muted-foreground hover:bg-muted/80 transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              {leaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserMinus className="w-4 h-4" />}
              Leave Company
            </button>
          </div>
        )}

        {isHrManager && appealStatus === "none" && showForm && (
          <div className="text-left space-y-3 mb-3">
            <p className="text-xs font-semibold text-foreground mb-2">
              Explain your situation to the admin team.
            </p>
            <form onSubmit={handleSubmitAppeal} className="space-y-3">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Your Appeal</label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Explain why your company should be reinstated..."
                  required
                  rows={5}
                  className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 resize-none"
                />
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="flex-1 h-11 rounded-xl text-sm font-semibold bg-muted text-muted-foreground hover:bg-muted/80 transition-colors cursor-pointer"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={submitting || !message.trim()}
                  className="flex-1 h-11 rounded-xl text-sm font-semibold bg-primary text-white hover:bg-primary-hover transition-colors disabled:opacity-60 flex items-center justify-center gap-2 cursor-pointer"
                >
                  {submitting ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                  {submitting ? "Submitting..." : "Submit Appeal"}
                </button>
              </div>
            </form>
          </div>
        )}

        {isHrManager && appealStatus === "pending_review" && (
          <div className="space-y-4">
            <div className="px-4 py-3 rounded-xl bg-warning/10 border border-warning/20 text-left">
              <p className="text-xs font-semibold text-warning">Appeal Pending Review</p>
              <p className="text-xs text-muted-foreground mt-1">
                Your appeal has been submitted and is awaiting admin review. You'll be notified when a decision is made.
              </p>
            </div>

            {appealMessages.length > 0 && (
              <div className="bg-card rounded-xl border border-border p-3 max-h-48 overflow-y-auto text-left space-y-2">
                {appealMessages.map((msg) => {
                  const isMe = msg.sender_id === profile?.id;
                  return (
                    <div key={msg.id} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                      <div className={`max-w-[80%] rounded-xl px-3 py-2 text-xs ${
                        isMe ? "bg-primary text-white rounded-br-sm" : "bg-muted text-foreground rounded-bl-sm"
                      }`}>
                        <p className="font-semibold text-[10px] opacity-70 mb-0.5">
                          {isMe ? "You" : "Admin"}
                        </p>
                        <p>{msg.message}</p>
                        <p className="text-[9px] opacity-50 mt-0.5">
                          {new Date(msg.created_at).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  );
                })}
                <div ref={bottomRef} />
              </div>
            )}

            <form onSubmit={handleSendChat} className="flex gap-2">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="Reply to admin..."
                className="flex-1 bg-background border border-border rounded-xl px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
              />
              <button
                type="submit"
                disabled={sending || !chatInput.trim()}
                className="w-10 h-10 rounded-xl bg-primary text-white hover:bg-primary-hover transition-colors disabled:opacity-60 flex items-center justify-center cursor-pointer"
              >
                {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              </button>
            </form>

            <button
              onClick={handleLeave}
              disabled={leaving}
              className="w-full h-11 rounded-xl text-sm font-semibold bg-muted text-muted-foreground hover:bg-muted/80 transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              {leaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserMinus className="w-4 h-4" />}
              Leave Company
            </button>
          </div>
        )}

        {isHrManager && appealStatus === "rejected" && (
          <div className="space-y-4">
            <div className="px-4 py-3 rounded-xl bg-destructive/10 border border-destructive/20 text-left">
              <p className="text-xs font-semibold text-destructive">Appeal Rejected</p>
              <p className="text-xs text-muted-foreground mt-1">
                Your appeal has been reviewed and rejected. This decision is final.
              </p>
            </div>
            <button
              onClick={handleLeave}
              disabled={leaving}
              className="w-full h-11 rounded-xl text-sm font-semibold bg-muted text-muted-foreground hover:bg-muted/80 transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              {leaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserMinus className="w-4 h-4" />}
              Leave Company
            </button>
          </div>
        )}

        {/* Not HR manager: read-only */}
        {!isHrManager && (
          <div className="flex flex-col gap-3">
            <p className="text-xs text-muted-foreground mb-2">
              Only HR managers can submit an appeal. Contact your HR team for more information.
            </p>
            <button
              onClick={handleLeave}
              disabled={leaving}
              className="w-full h-11 rounded-xl text-sm font-semibold bg-muted text-muted-foreground hover:bg-muted/80 transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              {leaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserMinus className="w-4 h-4" />}
              Leave Company
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
