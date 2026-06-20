import { supabase } from "./supabase";

export async function createInAppNotification({
  userId,
  title,
  message,
  type,
  relatedApplicationId = null,
  relatedJobId = null,
}) {
  try {
    const { error } = await supabase.from("notifications").insert({
      user_id: userId,
      title,
      message,
      type,
      related_application_id: relatedApplicationId,
      related_job_id: relatedJobId,
    });

    if (error) {
      console.warn("[Notifications] createInAppNotification error:", error.message);
    }
  } catch (err) {
    console.warn("[Notifications] createInAppNotification failed:", err.message);
  }
}

export async function getNotifications(userId, limit = 50) {
  if (!userId) return [];
  const { data, error } = await supabase
    .from("notifications")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    console.warn("[Notifications] getNotifications error:", error.message);
    return [];
  }
  return data || [];
}

export async function getUnreadCount(userId) {
  if (!userId) return 0;
  const { count, error } = await supabase
    .from("notifications")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId)
    .eq("is_read", false);

  if (error) {
    console.warn("[Notifications] getUnreadCount error:", error.message);
    return 0;
  }
  return count || 0;
}

export async function markAsRead(notificationId) {
  const { error } = await supabase
    .from("notifications")
    .update({ is_read: true })
    .eq("id", notificationId);

  if (error) {
    console.warn("[Notifications] markAsRead error:", error.message);
  }
}

export async function markAllAsRead(userId) {
  const { error } = await supabase
    .from("notifications")
    .update({ is_read: true })
    .eq("user_id", userId)
    .eq("is_read", false);

  if (error) {
    console.warn("[Notifications] markAllAsRead error:", error.message);
  }
}

/* ── Push notification helpers (kept for mobile Expo support) ── */

export async function sendPushNotification({ token, title, body, data = {} }) {
  if (!token) return;

  try {
    const { error } = await supabase.functions.invoke("send-push-notification", {
      body: { token, title, body, data },
    });

    if (error) {
      console.warn("[Notifications] Edge function warning:", error.message);
    }
  } catch (err) {
    console.warn("[Notifications] sendPushNotification failed:", err.message);
  }
}

export async function notifyStageChange(applicationId, targetStageId) {
  try {
    const { data: app } = await supabase
      .from("applications")
      .select(`
        candidate_profile_id,
        profiles ( expo_push_token, full_name ),
        job_postings ( id, title )
      `)
      .eq("id", applicationId)
      .single();

    if (!app) return;

    const pushToken = app?.profiles?.expo_push_token;
    const jobTitle = app?.job_postings?.title ?? "your application";
    const applicantId = app.candidate_profile_id;

    const { data: stage } = await supabase
      .from("recruitment_stages")
      .select("name, stage_type")
      .eq("id", targetStageId)
      .single();

    if (!stage) return;

    const stageMessages = {
      shortlist: `Great news! You have been shortlisted for "${jobTitle}"`,
      offer:     `Congratulations! You have received an offer for "${jobTitle}"`,
    };

    const body =
      stageMessages[stage.stage_type] ??
      `Your application for "${jobTitle}" has moved to the ${stage.name} stage.`;

    await createInAppNotification({
      userId: applicantId,
      title: "Application Update",
      message: body,
      type: "stage_update",
      relatedApplicationId: applicationId,
      relatedJobId: app?.job_postings?.id,
    });

    if (pushToken) {
      await sendPushNotification({
        token: pushToken,
        title: "Application Update",
        body,
        data: {
          type: "stage_update",
          application_id: applicationId,
          stage_id: targetStageId,
          stage_type: stage.stage_type,
        },
      });
    }
  } catch (err) {
    console.warn("[Notifications] Error in notifyStageChange:", err.message);
  }
}

export async function notifyNewApplication(application) {
  try {
    if (!application?.id || !application?.job_id) return;

    const { data: job } = await supabase
      .from("job_postings")
      .select("title, company_id")
      .eq("id", application.job_id)
      .single();

    if (!job?.company_id) return;

    const { data: members } = await supabase
      .from("company_memberships")
      .select("profile_id")
      .eq("company_id", job.company_id);

    if (!members || members.length === 0) return;

    const { data: applicantProfile } = await supabase
      .from("profiles")
      .select("full_name")
      .eq("id", application.candidate_profile_id)
      .single();

    const applicantName = applicantProfile?.full_name ?? "A candidate";

    for (const member of members) {
      await createInAppNotification({
        userId: member.profile_id,
        title: "New Application Received",
        message: `${applicantName} applied for "${job.title}"`,
        type: "new_application",
        relatedApplicationId: application.id,
        relatedJobId: application.job_id,
      });
    }

    const { data: membersWithTokens } = await supabase
      .from("company_memberships")
      .select(`
        profile_id,
        profiles ( expo_push_token )
      `)
      .eq("company_id", job.company_id)
      .limit(5);

    if (membersWithTokens) {
      for (const member of membersWithTokens) {
        const token = member.profiles?.expo_push_token;
        if (token) {
          sendPushNotification({
            token,
            title: "New Application Received",
            body: `${applicantName} applied for "${job.title}"`,
            data: {
              type: "new_application",
              application_id: application.id,
              job_id: application.job_id,
            },
          });
        }
      }
    }
  } catch (err) {
    console.warn("[Notifications] Error in notifyNewApplication:", err.message);
  }
}
