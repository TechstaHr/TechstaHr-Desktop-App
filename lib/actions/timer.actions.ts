import { TimesheetData } from "@/types";
import axios from "axios";
import { getToken } from "@/lib/auth";
import { handleError } from "../utils";

const url = "https://techstahr-backend.onrender.com/api/v1";

// Simple in-memory cache to handle 304 Not Modified responses.
let cachedTimesheet: any | null = null;

// POST: Start timer for a project
export const startProjectTimer = async (projectId: string) => {
  const token = getToken();

  if (!token) throw new Error("Authentication token not found.");

  try {
    const response = await axios.post(
      `${url}/time/clock-in `,
      { projectId },
      {
        headers: {
          Authorization: `Bearer ${token} `,
        },
      },
    );

    // Save tracking session to localStorage
    if (typeof window !== "undefined" && response.data?.entry) {
      const { saveTrackingSession } = await import("@/lib/utils/tracking-session");
      saveTrackingSession({
        projectId,
        startTime: new Date().toISOString(),
        entryId: response.data.entry._id,
        type: "timer",
      });
    }

    return response.data;
  } catch (error: any) {
    if (axios.isAxiosError(error) && error.response) {
      console.error("Error starting timer:", error.response.data);
      throw error.response.data;
    }
    throw error;
  }
};

// POST: Stop timer for a project
export const stopProjectTimer = async (entryId: string) => {
  const token = getToken();

  if (!token) throw new Error("Authentication token not found.");

  try {
    const response = await axios.post(
      `${url}/time/clock-out`,
      { entryId },
      {
        headers: {
          Authorization: `Bearer ${token} `,
        },
      },
    );

    // Clear tracking session from localStorage
    if (typeof window !== "undefined") {
      const { clearTrackingSession } = await import("@/lib/utils/tracking-session");
      clearTrackingSession();
    }

    return response.data;
  } catch (error: any) {
    if (axios.isAxiosError(error) && error.response) {
      console.error("Error stopping timer:", error.response.data);
      throw error.response.data;
    }
    throw error;
  }
};

export const getTimeSheet = async (): Promise<any> => {
  const token = getToken();

  if (!token) throw new Error("Authentication token not found.");

  try {
    const response = await axios.get(`${url}/time/my`, {
      headers: {
        Authorization: `Bearer ${token} `,
      },
      validateStatus: (status) => status < 400, // accept 304 as valid
    });

    // If the server indicates data not modified, serve from our cache.
    if (response.status === 304) {
      if (cachedTimesheet) return cachedTimesheet;

      // Fallback: perform a cache-busting retry to obtain fresh data.
      const retry = await axios.get(`${url}/time/my`, {
        headers: {
          Authorization: `Bearer ${token} `,
          "Cache-Control": "no-cache",
        },
        params: { cb: Date.now() },
        validateStatus: (status) => status < 400,
      });

      if (retry.status >= 200 && retry.status < 300 && retry.data) {
        cachedTimesheet = retry.data
        return cachedTimesheet.entries;
      }

      throw new Error("Timesheet not modified (304) and no cached data available.");
    }

    // Normal 2xx response: update cache and return.
    cachedTimesheet = response.data as any;
    return cachedTimesheet.entries;
  } catch (error: any) {
    if (axios.isAxiosError(error) && error.response) {
      console.error("Error fetching timesheet:", error.response.data);
      throw error.response.data;
    }
    throw error;
  }
};

export const resetTimerCache = () => {
  cachedTimesheet = null;
};
