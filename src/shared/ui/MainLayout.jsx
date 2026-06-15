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
} from "lucide-react";


import { supabase } from "@/shared/services/supabase";
import ToastNotification from "@/features/applications/components/apply/ToastNotification";
import { useRealtimeApplicant, useRealtimeRecruiter } from "@/shared/hooks/useRealtime";
import {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
} from "@/shared/services/notifications";

export default function MainLayout() {
  const { profile, signOutUser } = useUser();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const location = useLocation();
  const isApplicant = profile?.role === USER_ROLE.applicant;

  // Realtime notification state
  const [toast, setToast] = useState(null);
  const [companyId, setCompanyId] = useState(null);

  // In-app notification state
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);

  // Auto-dismiss toast
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  // Fetch company ID for recruiters
  useEffect(() => {
    if (profile && !isApplicant) {
      supabase
        .from("company_memberships")
        .select("company_id")
        .eq("profile_id", profile.id)
        .maybeSingle()
        .then(({ data }) => {
          if (data?.company_id) {
            setCompanyId(data.company_id);
          }
        });
    }
  }, [profile, isApplicant]);

  // Fetch notifications on mount / when profile changes
  useEffect(() => {
    if (!profile?.id) return;
    getNotifications(profile.id).then(setNotifications);
    getUnreadCount(profile.id).then(setUnreadCount);
  }, [profile?.id]);

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

  // Realtime subscriptions
  useRealtimeApplicant(isApplicant ? profile?.id : null, setToast);
  useRealtimeRecruiter(isApplicant ? null : companyId, setToast);

  const links = isApplicant
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
      <ToastNotification toast={toast} onDismiss={() => setToast(null)} />
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
                              prev.map((n) => ({ ...n, is_read: true }))
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
                            if (!n.is_read) {
                              await markAsRead(n.id);
                              setNotifications((prev) =>
                                prev.map((nn) =>
                                  nn.id === n.id ? { ...nn, is_read: true } : nn
                                )
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
          <div className="h-full">
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  );
}
