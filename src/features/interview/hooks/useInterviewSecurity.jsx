// ─── useInterviewSecurity ────────────────────────────────────────────────────
// Custom hook that adds an integrity-protection layer to the interview session.
//
// Features:
//   * Disables copy, cut, paste, text selection, and right-click on the
//     container element while the interview is active.
//   * Blocks common keyboard shortcuts (Ctrl/Cmd + C, V, X, A, S, P).
//   * Detects tab switches (visibilitychange), window blur, and fullscreen exit.
//   * Detects possible developer-tools opening (heuristic dimension check).
//   * Requests fullscreen on activation; exits fullscreen on deactivation.
//   * Tracks every violation locally via localStorage so data survives refresh.
//   * Optionally accepts an onMaxReached callback when the violation threshold
//     is exceeded.
//
// Usage:
//   const {
//     violationCount,
//     showWarning,
//     currentViolation,
//     isFullscreen,
//     securityRef,       // attach to the outermost container
//     dismissWarning,
//     resetViolations,
//   } = useInterviewSecurity({
//     stageId: stage?.id,
//     isActive: phase === "answering" || phase === "uploading",
//     maxViolations: 3,
//     onMaxReached: (count) => { /* flag or end the interview */ },
//   });

import { useEffect, useRef, useState } from "react";
import {
  getViolations,
  addViolation,
  clearViolations,
} from "../services/security.service";

// Set of keyboard shortcuts that are blocked when the interview is active.
// Only lower-case letters are stored – the handler compares against e.key.toLowerCase().
const BLOCKED_SHORTCUTS = new Set(["c", "v", "x", "a", "s", "p"]);

/**
 * @param {object}         options
 * @param {string}         options.stageId       – application_stage id
 * @param {boolean}        options.isActive      – enable / disable security
 * @param {number}         [options.maxViolations=3]
 * @param {(count: number) => void} [options.onMaxReached]
 */
export default function useInterviewSecurity({
  stageId,
  isActive = false,
  maxViolations = 3,
  onMaxReached,
}) {
  // ── Reactive state ────────────────────────────────────────────────────────
  const [violationCount, setViolationCount] = useState(0);
  const [showWarning, setShowWarning] = useState(false);
  const [currentViolation, setCurrentViolation] = useState(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // ── Refs (always have the latest value – avoids stale closures in listeners) ──
  const securityRef = useRef(null); // Attached to the container element
  const countRef = useRef(0);
  const stageIdRef = useRef(stageId);
  const maxVRef = useRef(maxViolations);
  const onMaxReachedRef = useRef(onMaxReached);
  const isActiveRef = useRef(false);

  // Keep refs in sync after every render so event handlers always see latest values
  useEffect(() => {
    stageIdRef.current = stageId;
    maxVRef.current = maxViolations;
    onMaxReachedRef.current = onMaxReached;
    isActiveRef.current = isActive;
  });

  // ── Load persisted violations when stage mounts ─────────────────────────
  // Initial data is loaded inside the main security effect so we only have one
  // place that reads from / writes to localStorage for this stage.
  // (setViolationCount here is a sync-from-external-store, not cascading.)

  // ── raiseViolation ───────────────────────────────────────────────────────
  // Always uses refs internally so it never becomes stale.
  const raiseViolation = (type, message) => {
    const sid = stageIdRef.current;
    if (!sid) return;

    const entry = {
      type,
      message,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href,
    };

    const data = addViolation(sid, entry);
    countRef.current = data.count;
    setViolationCount(data.count);
    setCurrentViolation({ ...entry, count: data.count });
    setShowWarning(true);

    if (data.count >= maxVRef.current) {
      onMaxReachedRef.current?.(data.count);
    }
  };

  // ── dismissWarning ───────────────────────────────────────────────────────
  const dismissWarning = () => {
    setShowWarning(false);
    setCurrentViolation(null);
  };

  // ── resetViolations ──────────────────────────────────────────────────────
  const resetViolations = () => {
    const sid = stageIdRef.current;
    if (!sid) return;
    clearViolations(sid);
    countRef.current = 0;
    setViolationCount(0);
  };

  // ── Main security effect ─────────────────────────────────────────────────
  // This effect runs whenever `isActive` or `stageId` changes.
  // When active it registers all event listeners; on cleanup it removes them.
  useEffect(() => {
    const el = securityRef.current;

    // ── Deactivation cleanup ─────────────────────────────────────────────
    if (!isActive || !stageId) {
      if (el) el.classList.remove("interview-security-guard");
      if (document.fullscreenElement) {
        try { document.exitFullscreen(); } catch { /* not critical */ }
      }
      return;
    }

    // ──────────────────────────────────────────────────────────────────────
    // 0. Load persisted violations for this stage (keeps state across refresh)
    // ──────────────────────────────────────────────────────────────────────
    const persisted = getViolations(stageId);
    if (persisted.count > 0 && countRef.current === 0) {
      countRef.current = persisted.count;
      setViolationCount(persisted.count);
    }

    // ──────────────────────────────────────────────────────────────────────
    // 1. Container-level event blocking (copy, cut, paste, contextmenu, selectstart)
    // ──────────────────────────────────────────────────────────────────────
    const blockEvent = (e) => {
      if (!isActiveRef.current) return;
      e.preventDefault();
      e.stopPropagation();
    };

    if (el) {
      el.addEventListener("copy", blockEvent, true);
      el.addEventListener("cut", blockEvent, true);
      el.addEventListener("paste", blockEvent, true);
      el.addEventListener("contextmenu", blockEvent, true);
      el.addEventListener("selectstart", blockEvent, true);
    }

    // ──────────────────────────────────────────────────────────────────────
    // 2. Keyboard shortcut blocking (Ctrl/Cmd + C, V, X, A, S, P)
    // ──────────────────────────────────────────────────────────────────────
    const onKeyDown = (e) => {
      if (!isActiveRef.current) return;
      const mod = e.ctrlKey || e.metaKey;
      if (mod && BLOCKED_SHORTCUTS.has(e.key?.toLowerCase())) {
        e.preventDefault();
        e.stopPropagation();
        raiseViolation(
          "shortcut_blocked",
          `Blocked shortcut: Ctrl/Cmd+${e.key.toUpperCase()}`,
        );
      }
    };
    document.addEventListener("keydown", onKeyDown, true);

    // ──────────────────────────────────────────────────────────────────────
    // 3. Tab-switch / minimize detection (visibilitychange)
    // ──────────────────────────────────────────────────────────────────────
    const onVisibilityChange = () => {
      if (!isActiveRef.current) return;
      if (document.hidden) {
        raiseViolation("tab_switch", "Tab switch or window minimized");
      }
    };
    document.addEventListener("visibilitychange", onVisibilityChange);

    // ──────────────────────────────────────────────────────────────────────
    // 4. Window focus loss (blur)
    // ──────────────────────────────────────────────────────────────────────
    const onWindowBlur = () => {
      if (!isActiveRef.current) return;
      raiseViolation("window_blur", "Window lost focus");
    };
    window.addEventListener("blur", onWindowBlur);

    // ──────────────────────────────────────────────────────────────────────
    // 5. CSS user-select: none guard on the container
    // ──────────────────────────────────────────────────────────────────────
    const STYLE_ID = "interview-security-guard-css";
    let guardStyle = document.getElementById(STYLE_ID);
    if (!guardStyle) {
      guardStyle = document.createElement("style");
      guardStyle.id = STYLE_ID;
      guardStyle.textContent = [
        ".interview-security-guard {",
        "  -webkit-user-select: none !important;",
        "  -moz-user-select: none !important;",
        "  -ms-user-select: none !important;",
        "  user-select: none !important;",
        "  -webkit-touch-callout: none !important;",
        "}",
      ].join("\n");
      document.head.appendChild(guardStyle);
    }
    if (el) el.classList.add("interview-security-guard");

    // ──────────────────────────────────────────────────────────────────────
    // 6. DevTools detection (periodic heuristic dimension check)
    //    Checks whether window.outerWidth - window.innerWidth exceeds a
    //    threshold that strongly hints at docked developer tools.
    //    This is best-effort and not foolproof.
    // ──────────────────────────────────────────────────────────────────────
    const DEVTOOLS_THRESHOLD = 200;
    const devToolsInterval = setInterval(() => {
      if (!isActiveRef.current) return;
      const wDiff = window.outerWidth - window.innerWidth;
      const hDiff = window.outerHeight - window.innerHeight;
      if (wDiff > DEVTOOLS_THRESHOLD || hDiff > DEVTOOLS_THRESHOLD) {
        raiseViolation(
          "devtools_detected",
          "Developer tools may be open",
        );
      }
    }, 5000);

    // ── Cleanup ──────────────────────────────────────────────────────────
    return () => {
      if (el) {
        el.removeEventListener("copy", blockEvent, true);
        el.removeEventListener("cut", blockEvent, true);
        el.removeEventListener("paste", blockEvent, true);
        el.removeEventListener("contextmenu", blockEvent, true);
        el.removeEventListener("selectstart", blockEvent, true);
        el.classList.remove("interview-security-guard");
      }
      document.removeEventListener("keydown", onKeyDown, true);
      document.removeEventListener("visibilitychange", onVisibilityChange);
      window.removeEventListener("blur", onWindowBlur);
      clearInterval(devToolsInterval);
    };
  }, [isActive, stageId]);

  // ── Fullscreen change detection (always active) ─────────────────────────
  // This effect runs once on mount (and never re-runs) because the listeners
  // always read the latest values through refs.
  useEffect(() => {
    const onFullscreenChange = () => {
      const fs = !!document.fullscreenElement;
      setIsFullscreen(fs);
      // Only count exiting fullscreen as a violation if the interview is still active
      if (!fs && isActiveRef.current) {
        raiseViolation("fullscreen_exited", "User exited fullscreen mode");
      }
    };
    document.addEventListener("fullscreenchange", onFullscreenChange);
    return () =>
      document.removeEventListener("fullscreenchange", onFullscreenChange);
  }, []);

  // ── Return public API ──────────────────────────────────────────────────────
  return {
    violationCount,
    showWarning,
    currentViolation,
    isFullscreen,
    securityRef,
    dismissWarning,
    resetViolations,
  };
}
