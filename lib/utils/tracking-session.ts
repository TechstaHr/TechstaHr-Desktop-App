// Utility functions for managing active time tracking session in localStorage

export interface TrackingSession {
  projectId: string;
  projectName?: string;
  startTime: string; // ISO string
  entryId?: string; // For timer.actions.ts
  type: "clock-in" | "timer"; // Type of tracking
}

const STORAGE_KEY = "active_tracking_session";

/**
 * Save active tracking session to localStorage
 */
export const saveTrackingSession = (session: TrackingSession): void => {
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
    } catch (error) {
      console.error("Failed to save tracking session:", error);
    }
  }
};

/**
 * Get active tracking session from localStorage
 */
export const getTrackingSession = (): TrackingSession | null => {
  if (typeof window === "undefined") return null;

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return null;

    const session: TrackingSession = JSON.parse(stored);
    return session;
  } catch (error) {
    console.error("Failed to get tracking session:", error);
    return null;
  }
};

/**
 * Clear active tracking session from localStorage
 */
export const clearTrackingSession = (): void => {
  if (typeof window !== "undefined") {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.error("Failed to clear tracking session:", error);
    }
  }
};

/**
 * Check if there is an active tracking session
 */
export const hasActiveTrackingSession = (): boolean => {
  return getTrackingSession() !== null;
};

/**
 * Get the active project ID from tracking session
 */
export const getActiveProjectId = (): string | null => {
  const session = getTrackingSession();
  return session?.projectId || null;
};


const CLOCKED_IN_KEY = "clockedInProjects";

/**
 * Get all clocked in projects from localStorage
 */
export const getClockedInProjects = (): string[] => {
  if (typeof window === "undefined") return [];
  try {
    const stored = localStorage.getItem(CLOCKED_IN_KEY);
    if (!stored) return [];
    const parsed = JSON.parse(stored);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.error("Failed to get clocked in projects:", error);
    return [];
  }
};

/**
 * Add a project ID to the clocked in projects list in localStorage
 */
export const addClockedInProject = (projectId: string): void => {
  if (typeof window === "undefined") return;
  try {
    const current = getClockedInProjects();
    if (!current.includes(projectId)) {
      const updated = [...current, projectId];
      localStorage.setItem(CLOCKED_IN_KEY, JSON.stringify(updated));
    }
  } catch (error) {
    console.error("Failed to add clocked in project:", error);
  }
};

/**
 * Remove a project ID from the clocked in projects list in localStorage
 */
export const removeClockedInProject = (projectId: string): void => {
  if (typeof window === "undefined") return;
  try {
    const current = getClockedInProjects();
    const updated = current.filter(id => id !== projectId);
    localStorage.setItem(CLOCKED_IN_KEY, JSON.stringify(updated));
  } catch (error) {
    console.error("Failed to remove clocked in project:", error);
  }
};
