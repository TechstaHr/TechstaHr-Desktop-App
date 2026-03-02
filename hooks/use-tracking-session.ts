"use client";

import { useState, useEffect } from "react";
import {
  getTrackingSession,
  hasActiveTrackingSession,
  type TrackingSession,
} from "@/lib/utils/tracking-session";

/**
 * Custom hook to check if there is an active time tracking session
 * Updates reactively when session changes
 */
export const useTrackingSession = () => {
  const [isActive, setIsActive] = useState<boolean>(false);
  const [session, setSession] = useState<TrackingSession | null>(null);

  useEffect(() => {
    // Check on mount
    const checkSession = () => {
      const hasActive = hasActiveTrackingSession();
      const currentSession = getTrackingSession();
      setIsActive(hasActive);
      setSession(currentSession);
    };

    checkSession();

    // Listen for storage changes (for cross-tab sync)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "active_tracking_session") {
        checkSession();
      }
    };

    window.addEventListener("storage", handleStorageChange);

    // Also check periodically (in case localStorage is modified directly)
    const interval = setInterval(checkSession, 1000);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      clearInterval(interval);
    };
  }, []);

  return {
    isActive,
    session,
    projectId: session?.projectId || null,
  };
};

