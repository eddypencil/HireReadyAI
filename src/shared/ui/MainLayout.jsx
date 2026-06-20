// src\shared\ui\MainLayout.jsx
import { useState } from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
import { useUser } from "@/features/auth/context/user.context";
import { USER_ROLE } from "@/shared/constants/enums";
import { useEffect } from "react";
import LanguageSwitcher from "@/shared/ui/LanguageSwitcher";
import { useTranslation } from "react-i18next";
import { useTheme } from "@/shared/context/theme";
import {
  Briefcase,
  Building2,
  Menu,
  X,
  FileCheck,
  FileText,
  LogOut,
  LayoutDashboard,
  CheckCircle,
  Wand2,
  KanbanSquare,
  User,
  Sun,
  Moon,
  Bell,
  Shield,
  Flag,
  Bug,
  MessageCircle,
  AlertTriangle,
  Send,
  Loader2,
} from "lucide-react";

import { supabase } from "@/shared/services/supabase";
import {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
} from "@/shared/services/notifications";
import { fetchCompanyByProfileId } from "@/features/companies/services/companies.service";
import { processExpiredDeadlines, sendAppealMessage } from "@/features/admin/services/admin.service";

export default function MainLayout() {
  const { profile, signOutUser } = useUser();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const location = useLocation();
  const isApplicant = profile?.role === USER_ROLE.applicant;
  const isAdmin = profile?.role === USER_ROLE.admin;
  const [pendingReports, setPendingReports] = useState(0);
  const [companyData, setCompanyData] = useState(null);
  const [membershipPermission, setMembershipPermission] = useState(null);
  const [showCompanyBanner, setShowCompanyBanner] = useState(true);
  const [showContactModal, setShowContactModal] = useState(false);
  const [contactMessages, setContactMessages] = useState([]);
  const [contactLoading, setContactLoading] = useState(false);
  const [contactInput, setContactInput] = useState("");
  const [contactSending, setContactSending] = useState(false);
  const isCompanyUser = profile?.role === USER_ROLE.recruiter || profile?.role === USER_ROLE.hrManager;

  // In-app notification state
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState(null);

  // Fetch notifications on mount / when profile changes
  useEffect(() => {
    if (!profile?.id) return;
    getNotifications(profile.id).then(setNotifications);
    getUnreadCount(profile.id).then(setUnreadCount);
  }, [profile?.id]);

  // Fetch + realtime subscription for pending report count
  useEffect(() => {
    if (!isAdmin) return;
    const fetchCount = () => {
      supabase
        .from("reports")
        .select("*", { count: "exact", head: true })
        .eq("status", "pending")
        .then(({ count }) => setPendingReports(count || 0))
        .catch(() => {});
    };
    fetchCount();
    const channel = supabase
      .channel(`admin-report-count-${Date.now()}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "reports" },
        fetchCount
      )
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [isAdmin]);

  // Process expired deadlines on mount
  useEffect(() => {
    processExpiredDeadlines().catch(() => {});
  }, []);

  // Fetch company info for recruiter/hrManager users
  useEffect(() => {
    if (!profile?.id || !isCompanyUser) return;
    fetchCompanyByProfileId(profile.id).then(({ company, permission }) => {
      setCompanyData(company);
      setMembershipPermission(permission);
    }).catch(() => {});
  }, [profile?.id, isCompanyUser]);

  // Realtime subscription for company status changes
  useEffect(() => {
    if (!companyData?.id) return;
    const channel = supabase
      .channel(`company-status-${companyData.id}-${Date.now()}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "companies",
          filter: `id=eq.${companyData.id}`,
        },
        (payload) => {
          setCompanyData((prev) => ({ ...prev, ...payload.new }));
        }
      )
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [companyData?.id]);

  // Load contact messages when modal opens
  useEffect(() => {
    if (!showContactModal || !companyData?.id) return;
    setContactLoading(true);
    supabase
      .from("appeal_messages")
      .select("*, sender:profiles!sender_id(id, full_name, role)")
      .eq("entity_type", "company")
      .eq("entity_id", companyData.id)
      .order("created_at", { ascending: true })
      .then(({ data }) => setContactMessages(data || []))
      .catch(() => {})
      .finally(() => setContactLoading(false));

    const channel = supabase
      .channel(`contact-${companyData.id}-${Date.now()}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "appeal_messages",
          filter: `entity_type=eq.company`,
        },
        (payload) => {
          if (payload.new.entity_id === companyData.id) {
            setContactMessages((prev) => [...prev, payload.new]);
          }
        }
      )
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [showContactModal, companyData?.id]);

  // Realtime subscriptions for notifications table
  useEffect(() => {
    if (!profile?.id) return;

    const channel = supabase
      .channel(`notifications-${profile.id}-${Date.now()}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${profile.id}`,
        },
        (payload) => {
          setNotifications((prev) => [payload.new, ...prev]);
          setUnreadCount((c) => c + 1);
        }
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${profile.id}`,
        },
        () => {
          getUnreadCount(profile.id).then(setUnreadCount);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [profile?.id]);

  const links = isAdmin
      ? [
          { to: "/admin", label: "nav.admin_dashboard", icon: Shield },
          { to: "/admin/reports", label: "nav.reports", icon: Flag, badge: pendingReports },
          { to: "/admin/companies", label: "nav.companies", icon: Building2 },
          { to: "/admin/appeals", label: "nav.appeals", icon: MessageCircle },
          { to: "/admin/technical-issues", label: "nav.technical_issues", icon: Bug },
        ]
    : isApplicant
      ? [
          { to: "/applicant", label: "nav.my_applications", icon: FileCheck },
          { to: "/applicant/feedback", label: "nav.my_feedback", icon: FileText },
          { to: "/applicant/profile", label: "nav.my_profile", icon: User },
          { to: "/jobs", label: "nav.explore_jobs", icon: Briefcase },
        ]
      : [
          {
            to: "/companies/dashboard",
            label: "nav.dashboard",
            icon: LayoutDashboard,
          },
          {
            to: "/companies/profile",
            label: "nav.company_profile",
            icon: Building2,
          },
          { to: "/companies/jobs", label: "nav.job_postings", icon: Briefcase },
          {
            to: "/companies/shortlists",
            label: "nav.shortlists",
            icon: CheckCircle,
          },
          {
            to: "/companies/candidates",
            label: "nav.candidate_pipeline",
            icon: KanbanSquare,
          },
          {
            to: "/companies/jd-generator",
            label: "nav.jd_generator",
            icon: Wand2,
          },
        ];

  const activeLink = (() => {
    const current = location.pathname;
    let best = null;
    let bestLen = 0;
    for (const link of links) {
      const p = link.to;
      const matches =
        current === p ||
        current.startsWith(p + "/") ||
        (p === "/companies/profile" && current === "/companies");
      if (matches && p.length > bestLen) {
        bestLen = p.length;
        best = p;
      }
    }
    return best;
  })();
  const { t, i18n } = useTranslation();
  const { darkMode, toggle: toggleTheme } = useTheme();

  useEffect(() => {
    const isArabic = i18n.language === "ar";

    document.documentElement.dir = isArabic ? "rtl" : "ltr";
    document.documentElement.lang = i18n.language;
  }, [i18n.language]);

  return (
    <div className="flex h-screen bg-secondary/50 font-sans relative overflow-hidden">
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-xs z-40 md:hidden transition-opacity duration-200"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      <div
        className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-sidebar text-white flex flex-col p-4 shrink-0
        transform transition-transform duration-200 ease-in-out md:relative md:transform-none md:flex
        ${isSidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
      `}
      >
        <div className="flex flex-col h-full justify-between">
          <div className="space-y-6">
            <div className="flex items-center justify-between px-3 py-2">
              <span className="text-xl font-bold tracking-tight text-white">
                HireReadyAI
              </span>
              <button
                onClick={() => setIsSidebarOpen(false)}
                className="text-white/60 hover:text-white p-1 rounded-lg md:hidden cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
              <LanguageSwitcher />
            </div>

            <nav className="space-y-1">
              {links.map((link) => {
                const Icon = link.icon;
                const active = link.to === activeLink;
                return (
                  <Link
                    key={link.to}
                    to={link.to}
                    onClick={() => setIsSidebarOpen(false)}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                      active
                        ? "bg-white/15 text-white font-semibold"
                        : "text-white/80 hover:bg-white/10 hover:text-white"
                    }`}
                  >
                    <Icon
                      className={`w-4 h-4 ${active ? "text-white" : "text-accent"}`}
                    />
                    {t(link.label)}
                    {link.badge != null && link.badge > 0 && (
                      <span className="ml-auto bg-red-500 text-white text-[10px] font-bold rounded-full px-1.5 py-0.5 min-w-[18px] text-center">
                        {link.badge > 99 ? "99+" : link.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </nav>
          </div>

          <div className="px-3 py-2 border-t border-white/10 mt-auto space-y-1">
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="w-full flex items-center gap-3 text-sm font-medium text-white/80 hover:text-white transition-colors py-2 cursor-pointer"
              >
                <Bell className="w-4 h-4" />
                {t("notifications")}
                {unreadCount > 0 && (
                  <span className="ml-auto bg-red-500 text-white text-xs rounded-full px-1.5 py-0.5 min-w-[20px] text-center font-bold">
                    {unreadCount > 99 ? "99+" : unreadCount}
                  </span>
                )}
              </button>

              {showNotifications && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setShowNotifications(false)}
                  />
                  <div className="absolute bottom-full left-0 right-0 mb-2 bg-card border-border rounded-xl shadow-2xl border z-50 max-h-96 overflow-y-auto">
                    <div className="sticky top-0 bg-card border-b border-border px-3 py-2 flex items-center justify-between">
                      <span className="text-xs font-semibold text-muted-foreground">
                        {t("notifications")}
                      </span>
                      {unreadCount > 0 && (
                        <button
                          onClick={async () => {
                            await markAllAsRead(profile.id);
                            setNotifications((prev) =>
                              prev.map((n) => ({ ...n, is_read: true })),
                            );
                            setUnreadCount(0);
                          }}
                          className="text-xs text-primary hover:text-primary-hover font-medium"
                        >
                          {t("mark_all_read")}
                        </button>
                      )}
                    </div>
                    {notifications.length === 0 ? (
                      <div className="px-3 py-6 text-center text-xs text-muted-foreground">
                        {t("no_notifications")}
                      </div>
                    ) : (
                      notifications.map((n) => (
                        <button
                          key={n.id}
                          onClick={async () => {
                            setSelectedNotification(n);
                            if (!n.is_read) {
                              await markAsRead(n.id);
                              setNotifications((prev) =>
                                prev.map((nn) =>
                                  nn.id === n.id
                                    ? { ...nn, is_read: true }
                                    : nn,
                                ),
                              );
                              setUnreadCount((c) => Math.max(0, c - 1));
                            }
                          }}
                          className={`w-full text-left px-3 py-2.5 border-b border-border last:border-0 hover:bg-muted transition-colors ${
                            n.is_read ? "opacity-60" : ""
                          }`}
                        >
                          <p className="text-sm font-semibold text-foreground">
                            {n.title}
                          </p>
                          <p className="text-sm text-muted-foreground mt-0.5 line-clamp-3">
                            {n.message}
                          </p>
                          <p className="text-xs text-muted-foreground/60 mt-1">
                            {new Date(n.created_at).toLocaleDateString()}
                          </p>
                        </button>
                      ))
                    )}
                  </div>
                </>
              )}
            </div>
            <button
              onClick={toggleTheme}
              className="w-full flex items-center gap-3 text-sm font-medium text-white/80 hover:text-white transition-colors py-2 cursor-pointer"
            >
              {darkMode ? (
                <Sun className="w-4 h-4" />
              ) : (
                <Moon className="w-4 h-4" />
              )}
              {darkMode ? t("light_mode") : t("dark_mode")}
            </button>
            <button
              onClick={signOutUser}
              className="w-full flex items-center gap-3 text-sm font-medium text-red-400 hover:text-red-300 transition-colors py-2 cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              {t("logout")}
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col overflow-hidden w-full">
        <div className="md:hidden flex items-center bg-background border-b border-border p-4 shrink-0">
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="p-1.5 text-foreground hover:text-foreground/80 rounded-lg cursor-pointer transition-colors border border-border bg-secondary"
          >
            <Menu className="w-5 h-5" />
          </button>
          <span className="ml-3 text-sm font-bold text-sidebar">
            {isApplicant ? "Applicant Dashboard" : "Recruiter Dashboard"}
          </span>
        </div>

        <div className="flex-1 overflow-y-auto">
          {/* Company closure warning banner — HR managers only */}
          {showCompanyBanner &&
            companyData?.account_status === "closing_warning" &&
            membershipPermission === "hr_manager" && (
              <div className="bg-background border-b border-warning/20 px-4 py-3 flex items-center gap-3 text-xs">
                <AlertTriangle className="w-4 h-4 text-warning shrink-0" />
                <p className="flex-1 text-foreground">
                  Your company (<strong>{companyData.name}</strong>) is
                  scheduled for closure on{" "}
                  <strong>
                    {companyData.closing_deadline
                      ? new Date(
                          companyData.closing_deadline,
                        ).toLocaleDateString()
                      : "soon"}
                  </strong>
                  {companyData.suspension_reason && (
                    <>
                      {" "}
                      — Reason: <strong>{companyData.suspension_reason}</strong>
                    </>
                  )}
                  .
                </p>
                <button
                  onClick={() => setShowContactModal(true)}
                  className="px-3 py-1.5 rounded-lg bg-primary text-white text-[10px] font-semibold hover:bg-primary-hover transition-colors shrink-0 cursor-pointer"
                >
                  Contact Support
                </button>
                <button
                  onClick={() => setShowCompanyBanner(false)}
                  className="text-muted-foreground hover:text-foreground p-1 rounded hover:bg-warning/10 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          <div className="h-full">
            <Outlet />
          </div>
        </div>

        {/* Contact Support chat modal */}
        {showContactModal && (
          <div
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-xs"
            onClick={() => setShowContactModal(false)}
          >
            <div
              className="bg-card rounded-2xl border border-border shadow-2xl w-full max-w-lg mx-4 max-h-[70vh] flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between p-4 border-b border-border shrink-0">
                <div>
                  <h3 className="text-sm font-bold text-foreground">
                    Contact Support
                  </h3>
                  {companyData?.suspension_reason && (
                    <p className="text-[10px] text-muted-foreground mt-0.5">
                      Reason: {companyData.suspension_reason}
                    </p>
                  )}
                </div>
                <button
                  onClick={() => {
                    setShowContactModal(false);
                    setContactInput("");
                  }}
                  className="p-1 rounded-lg hover:bg-muted text-muted-foreground cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-0">
                {contactLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                  </div>
                ) : contactMessages.length === 0 ? (
                  <p className="text-xs text-muted-foreground text-center py-8">
                    No messages yet. Send a message to start the conversation.
                  </p>
                ) : (
                  contactMessages.map((msg) => {
                    const isMe = msg.sender_id === profile?.id;
                    return (
                      <div
                        key={msg.id}
                        className={`flex ${isMe ? "justify-end" : "justify-start"}`}
                      >
                        <div
                          className={`max-w-[80%] rounded-xl px-3.5 py-2.5 text-xs ${
                            isMe
                              ? "bg-primary text-white rounded-br-sm"
                              : "bg-muted text-foreground rounded-bl-sm"
                          }`}
                        >
                          <p className="font-semibold text-[10px] opacity-70 mb-0.5">
                            {isMe ? "You" : "Admin"}
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
              </div>

              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  if (
                    !contactInput.trim() ||
                    !companyData?.id ||
                    !profile?.id ||
                    contactSending
                  )
                    return;
                  setContactSending(true);
                  try {
                    await sendAppealMessage({
                      entityType: "company",
                      entityId: companyData.id,
                      senderId: profile.id,
                      message: contactInput.trim(),
                    });
                    setContactInput("");
                  } catch (err) {
                    console.error("Failed to send message:", err);
                  } finally {
                    setContactSending(false);
                  }
                }}
                className="p-4 border-t border-border shrink-0 flex gap-2"
              >
                <input
                  type="text"
                  value={contactInput}
                  onChange={(e) => setContactInput(e.target.value)}
                  placeholder="Type a message..."
                  className="flex-1 bg-background border border-border rounded-xl px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
                />
                <button
                  type="submit"
                  disabled={contactSending || !contactInput.trim()}
                  className="w-10 h-10 rounded-xl bg-primary text-white hover:bg-primary-hover transition-colors disabled:opacity-60 flex items-center justify-center cursor-pointer"
                >
                  {contactSending ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
      {selectedNotification && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-xs"
          onClick={() => setSelectedNotification(null)}
        >
          <div
            className="bg-card rounded-2xl border border-border shadow-2xl w-full max-w-sm mx-4 p-5"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                {selectedNotification.type || "Notification"}
              </span>
              <button
                onClick={() => setSelectedNotification(null)}
                className="p-1 rounded-lg hover:bg-muted text-muted-foreground cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <h3 className="text-sm font-bold text-foreground mb-2">
              {selectedNotification.title}
            </h3>
            <p className="text-sm text-muted-foreground whitespace-pre-wrap">
              {selectedNotification.message}
            </p>
            <p className="text-xs text-muted-foreground/60 mt-3">
              {new Date(selectedNotification.created_at).toLocaleString()}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
