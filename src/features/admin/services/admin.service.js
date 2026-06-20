import { supabase } from "@/shared/services/supabase";
import { createInAppNotification, sendPushNotification } from "@/shared/services/notifications";

async function notifyAdmins(title, body, data = {}) {
  const { data: admins } = await supabase
    .from("profiles")
    .select("expo_push_token")
    .eq("role", "admin")
    .not("expo_push_token", "is", null);
  if (admins) {
    const seenTokens = new Set();
    for (const a of admins) {
      if (!seenTokens.has(a.expo_push_token)) {
        seenTokens.add(a.expo_push_token);
        sendPushNotification({ token: a.expo_push_token, title, body, data });
      }
    }
  }
}

async function notifyAdminsInApp(title, message, type = "admin_action", data = {}) {
  const { data: admins } = await supabase
    .from("profiles")
    .select("id")
    .eq("role", "admin");
  if (admins) {
    for (const a of admins) {
      createInAppNotification({ userId: a.id, title, message, type });
    }
  }
}

export const getUserCountsByRole = async () => {
  const { data, error } = await supabase
    .from("profiles")
    .select("role")
    .neq("role", "admin");
  if (error) throw error;
  const counts = { recruiter: 0, applicant: 0 };
  data.forEach((p) => {
    if (p.role === "recruiter" || p.role === "hr_manager") counts.recruiter++;
    if (p.role === "applicant") counts.applicant++;
  });
  return counts;
};

export const getAllUsers = async () => {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .neq("role", "admin")
    .order("created_at", { ascending: false });
  if (error) throw error;

  const usersWithViolations = await Promise.all(
    data.map(async (user) => {
      const { count } = await supabase
        .from("user_actions")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id)
        .in("action_type", ["ban", "freeze", "warn"]);
      return { ...user, violationCount: count || 0 };
    })
  );
  return usersWithViolations;
};

export const getFlaggedEntities = async () => {
  const { data: flaggedUsers, error: userErr } = await supabase
    .from("profiles")
    .select("id, full_name, email, role, severity_score")
    .gte("severity_score", 20);
  if (userErr) throw userErr;

  const { data: flaggedCompanies, error: compErr } = await supabase
    .from("companies")
    .select("id, name, severity_score")
    .gte("severity_score", 20);
  if (compErr) throw compErr;

  return { users: flaggedUsers || [], companies: flaggedCompanies || [] };
};

export const createAdminUser = async (email, password, fullName) => {
  const { data, error } = await supabase.auth.signUp({ email, password });
  if (error) throw error;

  const { error: profileError } = await supabase.from("profiles").insert([
    {
      id: data.user.id,
      full_name: fullName,
      role: "admin",
      is_active: true,
      account_status: "active",
      email,
    },
  ]);
  if (profileError) throw profileError;
  return data.user;
};

export const applyUserAction = async ({
  userId,
  actionType,
  reason,
  durationDays,
  durationHours,
  adminId,
}) => {
  const updates = {};
  const action = {
    user_id: userId,
    action_type: actionType,
    reason: reason || null,
    applied_by: adminId,
  };

  if (actionType === "ban") {
    const now = new Date();
    const deadline = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    updates.account_status = "banned";
    updates.suspension_reason = reason || null;
    updates.banned_at = now.toISOString();
    updates.appeal_deadline = deadline.toISOString();
    updates.appeal_status = "none";
  } else if (actionType === "freeze") {
    const days = durationDays || 0;
    const hours = durationHours || 0;
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + days);
    expiresAt.setHours(expiresAt.getHours() + hours);

    updates.account_status = "frozen";
    updates.frozen_until = expiresAt.toISOString();
    updates.suspension_reason = reason || null;
    action.duration_days = days;
    action.duration_hours = hours;
    action.expires_at = expiresAt.toISOString();
  } else if (actionType === "active") {
    updates.account_status = "active";
    updates.frozen_until = null;
    updates.suspension_reason = null;
  } else if (actionType === "warn") {
  }

  if (actionType === "warn") {
    await createInAppNotification({
      userId,
      title: "Admin Warning",
      message: `You have received a warning from the admin team.${reason ? ` Reason: ${reason}` : ""}`,
      type: "admin_action",
    });
  }

  const { error: updateError } = await supabase
    .from("profiles")
    .update(updates)
    .eq("id", userId);
  if (updateError) throw updateError;

  const { error: actionError } = await supabase
    .from("user_actions")
    .insert([action]);
  if (actionError) throw actionError;

  // Email + push for warn / ban / freeze / active
  if (["warn", "ban", "freeze", "active"].includes(actionType)) {
    const { data: userProfile } = await supabase
      .from("profiles")
      .select("full_name, email, expo_push_token")
      .eq("id", userId)
      .single();

    const labels = { warn: "Warned", ban: "Banned", freeze: "Frozen", active: "Reactivated" };
    await supabase.functions.invoke("send-admin-notification", {
      body: {
        to: userProfile?.email || "unknown@example.com",
        subject: `Account ${labels[actionType]} — HireReadyAI`,
        body: `Dear ${userProfile?.full_name || "User"},\n\nYour account has been ${labels[actionType].toLowerCase()}.${reason ? `\nReason: ${reason}` : ""}${actionType === "ban" ? "\nYou have 7 days to submit an appeal." : ""}${actionType === "freeze" && durationDays ? `\nDuration: ${durationDays} day(s)` : ""}`,
      },
    }).catch(err => console.warn("Admin email failed:", err));

    if (userProfile?.expo_push_token) {
      sendPushNotification({
        token: userProfile.expo_push_token,
        title: `Account ${labels[actionType]}`,
        body: `Your account has been ${labels[actionType].toLowerCase()}.${reason ? ` Reason: ${reason}` : ""}${actionType === "ban" ? " You have 7 days to submit an appeal." : ""}${actionType === "freeze" && durationDays ? ` Duration: ${durationDays} day(s).` : ""}`,
        data: { type: "admin_action", actionType },
      });
    }
  }
};

export const getViolationsByUser = async (userId) => {
  const { data, error } = await supabase
    .from("user_actions")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data;
};

export const submitReport = async ({
  reporterId,
  reportType,
  targetId,
  targetDetails,
  subject,
  description,
  severity,
}) => {
  const { data, error } = await supabase.from("reports").insert([
    {
      reporter_id: reporterId,
      report_type: reportType,
      target_id: targetId,
      target_details: targetDetails || null,
      subject,
      description,
      severity: severity || "medium",
    },
  ]);
  if (error) throw error;

  const { data: reporter } = await supabase
    .from("profiles")
    .select("full_name, email")
    .eq("id", reporterId)
    .single();

  const severityScores = { low: 1, medium: 3, high: 5, critical: 10 };
  await supabase.functions.invoke("send-contact-email", {
    body: {
      name: reporter?.full_name || "Unknown",
      email: reporter?.email || "unknown@example.com",
      company: `Report: ${reportType} (${severity}, +${severityScores[severity] || 0}pts)`,
      message: `[Report Type: ${reportType}]\n[Target ID: ${targetId}]\n[Subject: ${subject}]\n\n${description}`,
    },
  });

  notifyAdmins(
    "New Report Submitted",
    `${reporter?.full_name || "A user"} reported a ${reportType}: "${subject}"`,
    { type: "report", reportType, targetId }
  );
  notifyAdminsInApp(
    "New Report Submitted",
    `${reporter?.full_name || "A user"} reported a ${reportType}: "${subject}"`
  );

  return data;
};

export const getReports = async (filters = {}) => {
  let query = supabase.from("reports").select("*");

  if (filters.status) query = query.eq("status", filters.status);
  if (filters.reportType) query = query.eq("report_type", filters.reportType);
  if (filters.severity) query = query.eq("severity", filters.severity);

  const { data, error } = await query.order("created_at", { ascending: false });
  if (error) throw error;
  if (!data) return data;

  const userIds = data.filter((r) => r.report_type === "user").map((r) => r.target_id);
  const companyIds = data.filter((r) => r.report_type === "company").map((r) => r.target_id);

  const [profilesResult, companiesResult] = await Promise.all([
    userIds.length ? supabase.from("profiles").select("id, full_name").in("id", userIds) : { data: [] },
    companyIds.length ? supabase.from("companies").select("id, name").in("id", companyIds) : { data: [] },
  ]);

  const profileMap = Object.fromEntries((profilesResult.data || []).map((p) => [p.id, p]));
  const companyMap = Object.fromEntries((companiesResult.data || []).map((c) => [c.id, c]));

  return data.map((r) => {
    let targetDetails = null;
    if (r.report_type === "user") targetDetails = profileMap[r.target_id] || null;
    else if (r.report_type === "company") targetDetails = companyMap[r.target_id] || null;
    return { ...r, target_details: targetDetails };
  });
};

export const getReportById = async (id) => {
  const { data, error } = await supabase
    .from("reports")
    .select("*")
    .eq("id", id)
    .single();
  if (error) throw error;
  return data;
};

export const resolveReport = async ({
  reportId,
  status,
  reviewedBy,
  resolutionNotes,
  actionTaken,
  scoredEntityType,
  scoredEntityId,
  severityOverride,
}) => {
  const now = new Date().toISOString();
  const severityScores = { low: 1, medium: 3, high: 5, critical: 10 };
  const report = await getReportById(reportId);
  const effectiveSeverity = severityOverride || report.severity;

  const updates = {
    status,
    severity: effectiveSeverity,
    reviewed_by: reviewedBy,
    reviewed_at: now,
    resolution_notes: resolutionNotes || null,
    action_taken: actionTaken || null,
    scored_entity_type: scoredEntityType || null,
    scored_entity_id: scoredEntityId || null,
  };

  const { error: reportError } = await supabase
    .from("reports")
    .update(updates)
    .eq("id", reportId);
  if (reportError) throw reportError;

  if (scoredEntityType && scoredEntityId) {
    const points = severityScores[effectiveSeverity] || 0;

    const table = scoredEntityType === "user" ? "profiles" : "companies";
    const { error: scoreError } = await supabase.rpc("increment_severity_score", {
      target_table: table,
      target_id: scoredEntityId,
      points,
    });
    if (scoreError) {
      // fallback if RPC doesn't exist
      const { data: current } = await supabase
        .from(table)
        .select("severity_score")
        .eq("id", scoredEntityId)
        .single();
      const newScore = (current?.severity_score || 0) + points;
      await supabase
        .from(table)
        .update({ severity_score: newScore })
        .eq("id", scoredEntityId);
    }
  }

  if (scoredEntityType === null && scoredEntityId === null && status === "resolved") {
    const { error: issueError } = await supabase.from("technical_issues").insert([
      {
        reporter_id: report.reporter_id,
        issue_type: "other",
        title: `Platform issue: ${report.subject}`,
        description: report.description,
        severity: effectiveSeverity,
        related_report_id: reportId,
      },
    ]);
    if (issueError) throw issueError;
  }
};

export const getTechnicalIssues = async (filters = {}) => {
  let query = supabase.from("technical_issues").select("*");

  if (filters.status) query = query.eq("status", filters.status);
  if (filters.issueType) query = query.eq("issue_type", filters.issueType);

  const { data, error } = await query.order("created_at", { ascending: false });
  if (error) throw error;
  return data;
};

export const updateTechnicalIssueStatus = async ({ id, status, resolutionNotes, assignedTo }) => {
  const updates = {
    status,
    resolution_notes: resolutionNotes || null,
    updated_at: new Date().toISOString(),
  };
  if (assignedTo) updates.assigned_to = assignedTo;
  if (status === "resolved") updates.resolved_at = new Date().toISOString();

  const { error } = await supabase
    .from("technical_issues")
    .update(updates)
    .eq("id", id);
  if (error) throw error;
};

export const createTechnicalIssue = async ({ reporterId, issueType, title, description, severity, relatedReportId }) => {
  const { data, error } = await supabase.from("technical_issues").insert([
    {
      reporter_id: reporterId,
      issue_type: issueType,
      title,
      description,
      severity: severity || "medium",
      related_report_id: relatedReportId || null,
    },
  ]);
  if (error) throw error;
  return data;
};

// ─── Companies ──────────────────────────────────────────────────────

export const getAllCompaniesWithStats = async () => {
  const { data: companies, error } = await supabase
    .from("companies")
    .select(`
      *,
      job_postings(id, closed_at),
      company_memberships(id)
    `)
    .order("created_at", { ascending: false });
  if (error) throw error;

  return (companies || []).map((c) => {
    const totalJobs = c.job_postings?.length || 0;
    const activeJobs = c.job_postings?.filter((j) => !j.closed_at || new Date(j.closed_at) > new Date()).length || 0;
    const closedJobs = c.job_postings?.filter((j) => j.closed_at).length || 0;
    return {
      ...c,
      job_postings: undefined,
      company_memberships: undefined,
      totalJobs,
      activeJobs,
      closedJobs,
      memberCount: c.company_memberships?.length || 0,
    };
  });
};

export const getCompanyById = async (companyId) => {
  const { data, error } = await supabase
    .from("companies")
    .select(`
      *,
      job_postings(*),
      company_memberships(*, profiles(id, full_name, email, role))
    `)
    .eq("id", companyId)
    .single();
  if (error) throw error;
  return data;
};

export const applyCompanyAction = async ({
  companyId,
  actionType,
  reason,
  durationDays,
  adminId,
}) => {
  const updates = {};
  const action = {
    company_id: companyId,
    action_type: actionType,
    reason: reason || null,
    applied_by: adminId,
  };

  if (actionType === "ban") {
    updates.account_status = "banned";
    updates.suspension_reason = reason || null;
    updates.banned_at = new Date().toISOString();
  } else if (actionType === "closing_warning") {
    const deadline = new Date();
    deadline.setDate(deadline.getDate() + 7);
    updates.account_status = "closing_warning";
    updates.closing_deadline = deadline.toISOString();
    updates.suspension_reason = reason || null;
    action.duration_days = 7;
    action.expires_at = deadline.toISOString();
  } else if (actionType === "active") {
    updates.account_status = "active";
    updates.closing_deadline = null;
    updates.suspension_reason = null;
  } else if (actionType === "warn") {
  }

  if (actionType === "warn" || actionType === "closing_warning") {
    const { data: members } = await supabase
      .from("company_memberships")
      .select("profile_id")
      .eq("company_id", companyId);

    if (members) {
      const { data: company } = await supabase
        .from("companies")
        .select("name")
        .eq("id", companyId)
        .single();

      const title = actionType === "closing_warning" ? "Closure Warning" : "Admin Warning";
      const msg = actionType === "closing_warning"
        ? `Your company (${company?.name}) has been scheduled for closure in 7 days. Contact support to resolve this.`
        : `Your company (${company?.name}) has received a warning from the admin team.${reason ? ` Reason: ${reason}` : ""}`;

      const uniqueMemberIds = [...new Set(members.map((m) => m.profile_id))];

      for (const userId of uniqueMemberIds) {
        await createInAppNotification({
          userId,
          title,
          message: msg,
          type: "admin_action",
        });
      }

      const { data: memberProfiles } = await supabase
        .from("profiles")
        .select("expo_push_token")
        .in("id", uniqueMemberIds)
        .not("expo_push_token", "is", null);
      if (memberProfiles) {
        const seenTokens = new Set();
        for (const mp of memberProfiles) {
          if (!seenTokens.has(mp.expo_push_token)) {
            seenTokens.add(mp.expo_push_token);
            sendPushNotification({ token: mp.expo_push_token, title, body: msg, data: { type: "admin_action", actionType } });
          }
        }
      }
    }
  }

  const { error: updateError } = await supabase
    .from("companies")
    .update(updates)
    .eq("id", companyId);
  if (updateError) throw updateError;

  const { error: actionError } = await supabase
    .from("company_actions")
    .insert([action]);
  if (actionError) throw actionError;

  if (actionType === "ban") {
    await closeCompanyJobs(companyId).catch(() => {});
  }

  // Email for warn / ban / closing_warning / active — send to all HR managers
  if (["warn", "ban", "closing_warning", "active"].includes(actionType)) {
    const { data: company } = await supabase
      .from("companies")
      .select("name")
      .eq("id", companyId)
      .single();

    const { data: hrMembers } = await supabase
      .from("company_memberships")
      .select("profile_id")
      .eq("company_id", companyId)
      .eq("recruiter_permissions", "hr_manager");

    if (hrMembers?.length) {
      const hrIds = [...new Set(hrMembers.map((m) => m.profile_id))];
      const { data: hrProfiles } = await supabase
        .from("profiles")
        .select("full_name, email, expo_push_token")
        .in("id", hrIds);

      const labels = { warn: "Warned", ban: "Banned", closing_warning: "Closing Warning", active: "Reactivated" };
      if (hrProfiles) {
        const seenPushTokens = new Set();
        for (const hr of hrProfiles) {
          await supabase.functions.invoke("send-admin-notification", {
            body: {
              to: hr.email || "unknown@example.com",
              subject: `Company ${labels[actionType]} — HireReadyAI`,
              body: `Dear ${hr.full_name || "HR Manager"},\n\nYour company (${company?.name || "Unknown"}) has been ${labels[actionType].toLowerCase()}.${reason ? `\nReason: ${reason}` : ""}`,
            },
          }).catch(err => console.warn("Company admin email failed:", err));

          // Skip push for warn / closing_warning — already sent to all members above
          if (hr.expo_push_token && actionType !== "warn" && actionType !== "closing_warning" && !seenPushTokens.has(hr.expo_push_token)) {
            seenPushTokens.add(hr.expo_push_token);
            sendPushNotification({
              token: hr.expo_push_token,
              title: `Company ${labels[actionType]}`,
              body: `Your company (${company?.name || "Unknown"}) has been ${labels[actionType].toLowerCase()}.${reason ? ` Reason: ${reason}` : ""}`,
              data: { type: "admin_action", actionType },
            });
          }
        }
      }
    }
  }
};

export const getCompanyActions = async (companyId) => {
  const { data, error } = await supabase
    .from("company_actions")
    .select("*")
    .eq("company_id", companyId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data;
};

export const closeCompanyJobs = async (companyId) => {
  const now = new Date().toISOString();
  const { error } = await supabase
    .from("job_postings")
    .update({ closed_at: now })
    .eq("company_id", companyId)
    .is("closed_at", null);
  if (error) throw error;
};

export const removeCompanyMember = async (profileId, companyId) => {
  const { error } = await supabase
    .from("company_memberships")
    .delete()
    .eq("profile_id", profileId)
    .eq("company_id", companyId);
  if (error) throw error;
};

// ─── Appeals ────────────────────────────────────────────────────────

export const getResolvedAppeals = async () => {
  const { data: users, error: userErr } = await supabase
    .from("profiles")
    .select("id, full_name, email, role, appeal_message, appeal_status, appeal_deadline, banned_at, suspension_reason")
    .in("appeal_status", ["approved", "rejected"])
    .order("banned_at", { ascending: false });
  if (userErr) throw userErr;

  const { data: companies, error: compErr } = await supabase
    .from("companies")
    .select("id, name, appeal_message, appeal_status, closing_deadline, banned_at, suspension_reason")
    .in("appeal_status", ["approved", "rejected"])
    .order("banned_at", { ascending: false });
  if (compErr) throw compErr;

  return { users: users || [], companies: companies || [] };
};

export const getPendingAppeals = async () => {
  const { data: users, error: userErr } = await supabase
    .from("profiles")
    .select("id, full_name, email, role, appeal_message, appeal_status, appeal_deadline, banned_at, suspension_reason")
    .eq("appeal_status", "pending_review")
    .order("banned_at", { ascending: false });
  if (userErr) throw userErr;

  const { data: companies, error: compErr } = await supabase
    .from("companies")
    .select("id, name, appeal_message, appeal_status, closing_deadline, banned_at, suspension_reason")
    .eq("appeal_status", "pending_review")
    .order("banned_at", { ascending: false });
  if (compErr) throw compErr;

  return { users: users || [], companies: companies || [] };
};

export const submitAppeal = async ({ entityType, entityId, senderId, message }) => {
  const table = entityType === "profile" ? "profiles" : "companies";
  const { error: appealError } = await supabase
    .from(table)
    .update({ appeal_message: message, appeal_status: "pending_review" })
    .eq("id", entityId);
  if (appealError) throw appealError;

  const { error: msgError } = await supabase.from("appeal_messages").insert([
    { entity_type: entityType, entity_id: entityId, sender_id: senderId, message },
  ]);
  if (msgError) throw msgError;

  // Notify all admins
  const { data: userProfile } = await supabase
    .from("profiles")
    .select("full_name, email")
    .eq("id", senderId)
    .single();

  await supabase.functions.invoke("send-contact-email", {
    body: {
      name: userProfile?.full_name || "User",
      email: userProfile?.email || "unknown@example.com",
      company: entityType === "company" ? "Company Appeal" : "User Appeal",
      message: `Appeal submitted by ${userProfile?.full_name || "User"}:\n\n"${message}"`,
    },
  }).catch(err => console.warn("Appeal email (admin) failed:", err));

  notifyAdmins(
    "New Appeal Submitted",
    `${userProfile?.full_name || "A user"} submitted an appeal: "${message.slice(0, 100)}"`,
    { type: "appeal", entityType, entityId }
  );
  notifyAdminsInApp(
    "New Appeal Submitted",
    `${userProfile?.full_name || "A user"} submitted an appeal: "${message.slice(0, 100)}"`
  );
};

export const getAppealMessages = async ({ entityType, entityId }) => {
  const { data, error } = await supabase
    .from("appeal_messages")
    .select("*, sender:profiles!sender_id(id, full_name, role)")
    .eq("entity_type", entityType)
    .eq("entity_id", entityId)
    .order("created_at", { ascending: true });
  if (error) throw error;
  return data;
};

export const sendAppealMessage = async ({ entityType, entityId, senderId, message }) => {
  const { data, error } = await supabase.from("appeal_messages").insert([
    { entity_type: entityType, entity_id: entityId, sender_id: senderId, message },
  ]);
  if (error) throw error;

  // Send email + push notification
  const isAdmin = senderId !== entityId;
  try {
    if (isAdmin) {
      // Admin replied → notify the user / company
      if (entityType === "profile") {
        const { data: userProfile } = await supabase
          .from("profiles")
          .select("full_name, email, expo_push_token")
          .eq("id", entityId)
          .single();
        if (userProfile?.email) {
          await supabase.functions.invoke("send-admin-notification", {
            body: {
              to: userProfile.email,
              subject: "New Reply to Your Appeal — HireReadyAI",
              body: `Dear ${userProfile.full_name || "User"},\n\nAn admin has replied to your appeal:\n\n"${message}"\n\nPlease check your account status for updates.`,
            },
          }).catch(err => console.warn("Appeal email (user) failed:", err));
        }
        if (userProfile?.expo_push_token) {
          sendPushNotification({
            token: userProfile.expo_push_token,
            title: "New Reply to Your Appeal",
            body: `An admin replied: "${message.slice(0, 120)}"`,
            data: { type: "appeal", entityType, entityId },
          });
        }
      } else {
        const { data: company } = await supabase
          .from("companies")
          .select("name")
          .eq("id", entityId)
          .single();
        const { data: hrMembers } = await supabase
          .from("company_memberships")
          .select("profile_id")
          .eq("company_id", entityId)
          .eq("recruiter_permissions", "hr_manager");
        if (hrMembers?.length) {
          const { data: hrProfiles } = await supabase
            .from("profiles")
            .select("full_name, email, expo_push_token")
            .in("id", hrMembers.map((m) => m.profile_id));
          if (hrProfiles) {
            const seenAppealTokens = new Set();
            for (const hr of hrProfiles) {
              await supabase.functions.invoke("send-admin-notification", {
                body: {
                  to: hr.email,
                  subject: "New Reply to Your Company Appeal — HireReadyAI",
                  body: `Dear ${hr.full_name || "HR Manager"},\n\nAn admin has replied to ${company?.name || "your company"}'s appeal:\n\n"${message}"\n\nPlease check your company status for updates.`,
                },
              }).catch(err => console.warn("Appeal email (company) failed:", err));
              if (hr.expo_push_token && !seenAppealTokens.has(hr.expo_push_token)) {
                seenAppealTokens.add(hr.expo_push_token);
                sendPushNotification({
                  token: hr.expo_push_token,
                  title: "New Reply to Your Company Appeal",
                  body: `An admin replied: "${message.slice(0, 120)}"`,
                  data: { type: "appeal", entityType, entityId },
                });
              }
            }
          }
        }
      }
    } else {
      // User replied → notify admin via email + push
      const { data: userProfile } = await supabase
        .from("profiles")
        .select("full_name, email")
        .eq("id", senderId)
        .single();
      await supabase.functions.invoke("send-contact-email", {
        body: {
          name: userProfile?.full_name || "User",
          email: userProfile?.email || "unknown@example.com",
          company: entityType === "company" ? "Company Appeal" : "User Appeal",
          message: `Appeal reply from ${userProfile?.full_name || "User"}:\n\n"${message}"`,
        },
      }).catch(err => console.warn("Appeal email (admin) failed:", err));
      notifyAdmins(
        "New Appeal Reply",
        `${userProfile?.full_name || "A user"} replied to their appeal: "${message.slice(0, 120)}"`,
        { type: "appeal", entityType, entityId }
      );
      notifyAdminsInApp(
        "New Appeal Reply",
        `${userProfile?.full_name || "A user"} replied to their appeal: "${message.slice(0, 120)}"`
      );
    }
  } catch (emailErr) {
    console.warn("Appeal email notification failed:", emailErr);
  }

  return data;
};

export const resolveAppeal = async ({ entityType, entityId, adminId, approved, adminNote }) => {
  const table = entityType === "profile" ? "profiles" : "companies";
  const now = new Date().toISOString();

  if (approved) {
    const updates = {
      appeal_status: "approved",
      account_status: "active",
      suspension_reason: null,
      appeal_message: null,
      banned_at: null,
    };
    if (table === "profiles") {
      updates.frozen_until = null;
      updates.appeal_deadline = null;
    } else {
      updates.closing_deadline = null;
    }
    const { error } = await supabase.from(table).update(updates).eq("id", entityId);
    if (error) throw error;
  } else {
    const { error } = await supabase
      .from(table)
      .update({ appeal_status: "rejected" })
      .eq("id", entityId);
    if (error) throw error;

    if (table === "companies") {
      await closeCompanyJobs(entityId);
    }
  }

  if (adminNote) {
    const { error: msgError } = await supabase.from("appeal_messages").insert([
      { entity_type: entityType, entity_id: entityId, sender_id: adminId, message: adminNote },
    ]);
    if (msgError) throw msgError;
  }

  // Push notification to user / company
  const pushTitle = approved ? "Appeal Approved" : "Appeal Rejected";
  const pushBody = approved ? "Your appeal has been approved. Your account has been reinstated." : "Your appeal has been reviewed and rejected. This decision is final.";
  if (entityType === "profile") {
    const { data: profile } = await supabase
      .from("profiles")
      .select("expo_push_token")
      .eq("id", entityId)
      .single();
    if (profile?.expo_push_token) {
      sendPushNotification({ token: profile.expo_push_token, title: pushTitle, body: pushBody, data: { type: "appeal_resolved", entityType, entityId, approved } });
    }
  } else {
    const { data: hrMembers } = await supabase
      .from("company_memberships")
      .select("profile_id")
      .eq("company_id", entityId)
      .eq("recruiter_permissions", "hr_manager");
    if (hrMembers?.length) {
      const { data: hrProfiles } = await supabase
        .from("profiles")
        .select("expo_push_token")
        .in("id", hrMembers.map((m) => m.profile_id))
        .not("expo_push_token", "is", null);
      if (hrProfiles) {
        const seenResolveTokens = new Set();
        for (const hr of hrProfiles) {
          if (!seenResolveTokens.has(hr.expo_push_token)) {
            seenResolveTokens.add(hr.expo_push_token);
            sendPushNotification({ token: hr.expo_push_token, title: pushTitle, body: pushBody, data: { type: "appeal_resolved", entityType, entityId, approved } });
          }
        }
      }
    }
  }
};

// ─── Deadline processing ────────────────────────────────────────────

export const processExpiredDeadlines = async () => {
  const now = new Date().toISOString();

  // Users: ban expired appeal deadlines without submission
  const { data: expiredUsers } = await supabase
    .from("profiles")
    .select("id")
    .eq("account_status", "banned")
    .eq("appeal_status", "none")
    .lt("appeal_deadline", now)
    .limit(100);

  if (expiredUsers?.length) {
    const expiredIds = expiredUsers.map((u) => u.id);
    const { error: userErr } = await supabase
      .from("profiles")
      .update({ appeal_status: "rejected" })
      .in("id", expiredIds);
    if (userErr) console.error("Failed to update expired user appeals:", userErr);
  }

  // Companies: auto-ban expired closing warnings
  const { data: expiredCompanies } = await supabase
    .from("companies")
    .select("id")
    .eq("account_status", "closing_warning")
    .lt("closing_deadline", now)
    .limit(100);

  if (expiredCompanies?.length) {
    for (const c of expiredCompanies) {
      const { data: actions } = await supabase
        .from("company_actions")
        .select("applied_by")
        .eq("company_id", c.id)
        .eq("action_type", "closing_warning")
        .order("created_at", { ascending: false })
        .limit(1);
      const adminId = actions?.[0]?.applied_by || null;
      await applyCompanyAction({
        companyId: c.id,
        actionType: "ban",
        reason: "Closure deadline expired",
        adminId,
      }).catch((err) => console.error("Failed to auto-ban company:", err));
    }
  }

  return {
    usersExpired: expiredUsers?.length || 0,
    companiesClosed: expiredCompanies?.length || 0,
  };
};

export const getQuestionWithAnswer = async (questionId) => {
  const { data, error } = await supabase
    .from("application_questions")
    .select(`
      *,
      application_answers (
        id, answer_text, score, feedback, recording_url, transcript, strengths, weaknesses, created_at
      )
    `)
    .eq("id", questionId)
    .single();
  if (error) throw error;
  return data;
};

export const getStageWithEvaluation = async (stageId) => {
  const { data, error } = await supabase
    .from("application_stages")
    .select(`
      *,
      recruitment_stages ( id, name, stage_type, order_index ),
      application_stage_evaluations ( ai_score, confidence, recommendation, reasoning, strengths, weaknesses )
    `)
    .eq("id", stageId)
    .single();
  if (error) throw error;
  return data;
};
