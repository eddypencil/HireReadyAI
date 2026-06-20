// ─── Interview Security Service ─────────────────────────────────────────────
// Persists security violations to localStorage and provides optional sync to
// the backend via the existing Supabase application_stages table.
// Uses a namespaced storage key per stage to avoid collisions.

const STORAGE_PREFIX = "interview_security_";

/**
 * Retrieve the stored violation data for a given application stage.
 * @param {string} stageId
 * @returns {{ count: number, log: object[] }}
 */
export const getViolations = (stageId) => {
  try {
    const raw = localStorage.getItem(`${STORAGE_PREFIX}${stageId}`);
    if (!raw) return { count: 0, log: [] };
    return JSON.parse(raw);
  } catch {
    return { count: 0, log: [] };
  }
};

/**
 * Persist violation data for a stage to localStorage.
 * @param {string} stageId
 * @param {{ count: number, log: object[], updatedAt?: string }} data
 */
export const saveViolations = (stageId, data) => {
  try {
    localStorage.setItem(`${STORAGE_PREFIX}${stageId}`, JSON.stringify(data));
  } catch (err) {
    console.warn("[SecurityService] Failed to persist violations:", err);
  }
};

/**
 * Record a new violation entry for the stage and return the updated data.
 * @param {string} stageId
 * @param {{ type: string, message: string, timestamp: string, userAgent: string, url: string }} entry
 * @returns {{ count: number, log: object[] }}
 */
export const addViolation = (stageId, entry) => {
  const data = getViolations(stageId);
  data.count += 1;
  data.log.push({
    ...entry,
    timestamp: entry.timestamp || new Date().toISOString(),
  });
  data.updatedAt = new Date().toISOString();
  saveViolations(stageId, data);
  return data;
};

/**
 * Remove all stored violation data for a stage.
 * @param {string} stageId
 */
export const clearViolations = (stageId) => {
  try { localStorage.removeItem(`${STORAGE_PREFIX}${stageId}`); } catch { /* not critical */ }
};

/**
 * Return the total violation count for a stage.
 * @param {string} stageId
 * @returns {number}
 */
export const getViolationCount = (stageId) => {
  return getViolations(stageId).count;
};

/**
 * Optionally sync violation data to the application_stages row in Supabase.
 * Uses the existing updateApplicationStageStatus service to avoid duplicating
 * database logic. Silently fails if the backend is unavailable.
 * @param {string} stageId
 */
export const syncViolationsToBackend = async (stageId) => {
  try {
    const data = getViolations(stageId);
    if (data.count === 0) return;

    const { updateApplicationStageStatus } = await import(
      "./interview_database_service"
    );

    await updateApplicationStageStatus(stageId, {
      security_violations: data.count,
      security_log: data.log.slice(-100), // Keep last 100 entries
      last_security_violation_at: data.log[data.log.length - 1]?.timestamp,
    });
  } catch (err) {
    console.warn("[SecurityService] Backend sync failed:", err);
  }
};
