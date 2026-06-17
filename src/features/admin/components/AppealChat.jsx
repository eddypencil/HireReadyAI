import { useState, useEffect, useRef } from "react";
import { useUser } from "@/features/auth/context/user.context";
import { getAppealMessages, sendAppealMessage, resolveAppeal } from "../services/admin.service";
import { supabase } from "@/shared/services/supabase";
import { Send, Loader2, Check, X } from "lucide-react";

export default function AppealChat({ entityType, entity, onClose, onResolved }) {
  const { profile } = useUser();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    loadMessages();
    const channel = supabase
      .channel(`appeal-${entityType}-${entity.id}-${Date.now()}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "appeal_messages",
          filter: `entity_type=eq.${entityType}`,
        },
        (payload) => {
          const msg = payload.new;
          if (msg.entity_id === entity.id) {
            setMessages((prev) => [...prev, msg]);
          }
        }
      )
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [entityType, entity.id]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function loadMessages() {
    setLoading(true);
    try {
      const data = await getAppealMessages({ entityType, entityId: entity.id });
      setMessages(data);
    } catch (err) {
      console.error("Failed to load messages:", err);
    } finally {
      setLoading(false);
    }
  }

  async function handleSend(e) {
    e.preventDefault();
    if (!input.trim() || sending) return;
    setSending(true);
    try {
      await sendAppealMessage({
        entityType,
        entityId: entity.id,
        senderId: profile?.id,
        message: input.trim(),
      });
      setInput("");
    } catch (err) {
      console.error("Failed to send message:", err);
    } finally {
      setSending(false);
    }
  }

  async function handleResolve(approved) {
    try {
      await resolveAppeal({
        entityType,
        entityId: entity.id,
        adminId: profile?.id,
        approved,
        adminNote: approved ? "Appeal approved. Account reinstated." : "Appeal rejected.",
      });
      onResolved?.();
    } catch (err) {
      console.error("Failed to resolve appeal:", err);
    }
  }

  const displayName = entityType === "profile" ? entity.full_name : entity.name;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs">
          <div className="bg-card rounded-2xl border border-border shadow-2xl w-full max-w-2xl mx-4 max-h-[85vh] flex flex-col shadow-sm">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border shrink-0">
          <div>
            <h3 className="text-sm font-bold text-foreground">{displayName}</h3>
            <p className="text-[10px] text-muted-foreground capitalize">
              {entityType} appeal — {entity.suspension_reason || "No reason provided"}
            </p>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-muted text-muted-foreground cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-0">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
            </div>
          ) : messages.length === 0 ? (
            <p className="text-xs text-muted-foreground text-center py-8">No messages yet</p>
          ) : (
            messages.map((msg) => {
              const isAdmin = msg.sender_id === profile?.id;
              const isUser = !isAdmin && msg.sender;
              return (
                <div key={msg.id} className={`flex ${isAdmin ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`max-w-[75%] rounded-xl px-3.5 py-2.5 text-xs ${
                      isAdmin
                        ? "bg-primary text-white rounded-br-sm"
                        : "bg-muted text-foreground rounded-bl-sm"
                    }`}
                  >
                    <p className="font-semibold text-[10px] opacity-70 mb-0.5">
                      {isAdmin ? "Admin" : displayName}
                    </p>
                    <p>{msg.message}</p>
                    <p className="text-[9px] opacity-50 mt-1">
                      {new Date(msg.created_at).toLocaleString()}
                    </p>
                  </div>
                </div>
              );
            })
          )}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <form onSubmit={handleSend} className="p-4 border-t border-border shrink-0">
          <div className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type a message..."
              className="flex-1 bg-background border border-border rounded-xl px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
            />
            <button
              type="submit"
              disabled={sending || !input.trim()}
              className="w-10 h-10 rounded-xl bg-primary text-white hover:bg-primary-hover transition-colors disabled:opacity-60 flex items-center justify-center cursor-pointer"
            >
              {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            </button>
          </div>

          {/* Action buttons */}
          <div className="flex gap-2 mt-3">
            <button
              type="button"
              onClick={() => handleResolve(true)}
              className="flex-1 h-9 rounded-xl text-xs font-semibold bg-success text-white hover:bg-success/90 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Check className="w-3.5 h-3.5" />
              Approve Appeal
            </button>
            <button
              type="button"
              onClick={() => handleResolve(false)}
              className="flex-1 h-9 rounded-xl text-xs font-semibold bg-destructive/10 text-destructive hover:bg-destructive/20 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
              Reject
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
