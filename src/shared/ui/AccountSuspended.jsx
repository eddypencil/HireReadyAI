import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "@/features/auth/context/user.context";
import { ShieldAlert, Clock, LogOut, Send, Loader2, MessageCircle } from "lucide-react";
import { supabase } from "@/shared/services/supabase";
import { submitAppeal, getAppealMessages, sendAppealMessage } from "@/features/admin/services/admin.service";

export default function AccountSuspended() {
  const { user, profile, loading, signOutUser } = useUser();
  const navigate = useNavigate();
  const [showForm, setShowForm] = useState(false);
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [frozenTimeLeft, setFrozenTimeLeft] = useState("");
  const [appealMessages, setAppealMessages] = useState([]);
  const [chatInput, setChatInput] = useState("");
  const [sending, setSending] = useState(false);
  const [deadlineLeft, setDeadlineLeft] = useState("");
  const [localAppealStatus, setLocalAppealStatus] = useState(null);

  useEffect(() => {
    if (!loading && !user) {
      navigate("/auth/sign-in", { replace: true });
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    if (profile?.account_status === "frozen" && profile?.frozen_until) {
      const until = new Date(profile.frozen_until);
      const now = new Date();
      const diff = until.getTime() - now.getTime();
      if (diff > 0) {
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        setFrozenTimeLeft(`${hours}h ${minutes}m remaining`);
      } else {
        setFrozenTimeLeft("Expiring soon");
      }
    }
  }, [profile]);

  useEffect(() => {
    if (profile?.appeal_deadline && profile?.appeal_status === "none") {
      const deadline = new Date(profile.appeal_deadline);
      const now = new Date();
      const diff = deadline.getTime() - now.getTime();
      if (diff > 0) {
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        setDeadlineLeft(`${days}d ${hours}h remaining to appeal`);
      } else {
        setDeadlineLeft("Appeal deadline passed");
      }
    }
  }, [profile]);

  useEffect(() => {
    const status = localAppealStatus || profile?.appeal_status;
    if (profile?.id && (status === "pending_review" || status === "rejected")) {
      loadMessages();
    }
  }, [profile?.id, profile?.appeal_status, localAppealStatus]);

  useEffect(() => {
    if (profile?.account_status !== "banned") return;
    const channel = supabase
      .channel(`account-status-${profile.id}-${Date.now()}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "profiles",
          filter: `id=eq.${profile.id}`,
        },
        (payload) => {
          if (payload.new.account_status === "active") {
            navigate("/", { replace: true });
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
          filter: `entity_type=eq.profile`,
        },
        (payload) => {
          if (payload.new.entity_id === profile.id) {
            setAppealMessages((prev) => [...prev, payload.new]);
          }
        }
      )
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [profile?.id, profile?.account_status]);

  async function loadMessages() {
    try {
      const data = await getAppealMessages({ entityType: "profile", entityId: user.id });
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
        entityType: "profile",
        entityId: user.id,
        senderId: user.id,
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
        entityType: "profile",
        entityId: user.id,
        senderId: user.id,
        message: chatInput.trim(),
      });
      setChatInput("");
    } catch (err) {
      console.error("Failed to send message:", err);
    } finally {
      setSending(false);
    }
  }

  async function handleLogout() {
    await signOutUser();
    navigate("/auth/sign-in", { replace: true });
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="inline-block w-6 h-6 rounded-full border-2 border-primary/30 border-t-primary animate-spin" />
      </div>
    );
  }

  const isBanned = profile?.account_status === "banned";
  const isFrozen = profile?.account_status === "frozen";
  const appealStatus = localAppealStatus || profile?.appeal_status || "none";

  if (!isBanned && !isFrozen) {
    navigate("/", { replace: true });
    return null;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 py-8">
      <div className="w-full max-w-md text-center">
        <div className="w-16 h-16 mx-auto rounded-2xl bg-destructive/15 border border-destructive/20 flex items-center justify-center mb-6">
          {isBanned ? (
            <ShieldAlert className="w-8 h-8 text-destructive" />
          ) : (
            <Clock className="w-8 h-8 text-warning" />
          )}
        </div>

        <h1 className="text-2xl font-bold text-foreground mb-2">
          {isBanned ? "Account Suspended" : "Account Frozen"}
        </h1>

        <p className="text-sm text-muted-foreground mb-1">
          {isBanned
            ? "Your account has been suspended due to a violation of our terms."
            : "Your account has been temporarily frozen."}
        </p>

        {isFrozen && frozenTimeLeft && (
          <p className="text-sm font-semibold text-warning mb-4">{frozenTimeLeft}</p>
        )}

        {isBanned && deadlineLeft && appealStatus === "none" && (
          <p className="text-sm font-semibold text-warning mb-4">{deadlineLeft}</p>
        )}

        {profile?.suspension_reason && (
          <div className="bg-muted rounded-xl px-4 py-3 mb-6 text-left">
            <p className="text-xs font-semibold text-foreground mb-1">Reason:</p>
            <p className="text-xs text-muted-foreground">{profile.suspension_reason}</p>
          </div>
        )}

        {/* Appeal states */}
        {isBanned && appealStatus === "none" && !showForm && (
          <div className="flex flex-col gap-3">
            <button
              onClick={() => setShowForm(true)}
              className="w-full h-11 rounded-xl text-sm font-semibold bg-primary text-white hover:bg-primary-hover transition-colors cursor-pointer"
            >
              Submit Appeal
            </button>
            <button
              onClick={handleLogout}
              className="w-full h-11 rounded-xl text-sm font-semibold bg-destructive/10 text-destructive hover:bg-destructive/20 transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
          </div>
        )}

        {isBanned && appealStatus === "none" && showForm && (
          <div className="text-left space-y-3 mb-3">
            <p className="text-xs font-semibold text-foreground mb-2">
              Explain your situation to the admin team. You have until{" "}
              {profile?.appeal_deadline ? new Date(profile.appeal_deadline).toLocaleDateString() : "soon"}.
            </p>
            <form onSubmit={handleSubmitAppeal} className="space-y-3">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Your Appeal</label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Explain why your account should be reinstated..."
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
            <button
              onClick={handleLogout}
              className="w-full h-11 rounded-xl text-sm font-semibold bg-destructive/10 text-destructive hover:bg-destructive/20 transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
          </div>
        )}

        {isBanned && appealStatus === "pending_review" && (
          <div className="space-y-4">
            <div className="px-4 py-3 rounded-xl bg-warning/10 border border-warning/20 text-left">
              <p className="text-xs font-semibold text-warning">Appeal Pending Review</p>
              <p className="text-xs text-muted-foreground mt-1">
                Your appeal has been submitted and is awaiting admin review. You'll be notified when a decision is made.
              </p>
            </div>

            {/* Chat conversation */}
            {appealMessages.length > 0 && (
              <div className="bg-card rounded-xl border border-border p-3 max-h-48 overflow-y-auto text-left space-y-2">
                {appealMessages.map((msg) => {
                  const isMe = msg.sender_id === user.id;
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
              </div>
            )}

            {/* Chat input */}
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
              onClick={handleLogout}
              className="w-full h-11 rounded-xl text-sm font-semibold bg-destructive/10 text-destructive hover:bg-destructive/20 transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
          </div>
        )}

        {isBanned && appealStatus === "rejected" && (
          <div className="space-y-4">
            <div className="px-4 py-3 rounded-xl bg-destructive/10 border border-destructive/20 text-left">
              <p className="text-xs font-semibold text-destructive">Appeal Rejected</p>
              <p className="text-xs text-muted-foreground mt-1">
                Your appeal has been reviewed and rejected. This decision is final.
              </p>
            </div>
            <button
              onClick={handleLogout}
              className="w-full h-11 rounded-xl text-sm font-semibold bg-destructive/10 text-destructive hover:bg-destructive/20 transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
          </div>
        )}

        {isFrozen && (
          <div className="flex flex-col gap-3">
            <button
              onClick={handleLogout}
              className="w-full h-11 rounded-xl text-sm font-semibold bg-destructive/10 text-destructive hover:bg-destructive/20 transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
