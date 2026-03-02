import { TimesheetData } from "@/types";
import axios from "axios";
import { getToken } from "@/lib/auth";
import { handleError } from "../utils";

const url = "https://techstahr-backend.onrender.com/api/v1";

// In-memory cache for weekly timesheet to handle 304 Not Modified responses
let cachedWeeklyTimesheet: any | null = null;

// Submit timesheet
export const submitTimesheet = async (timeLogId: string) => {
  const token = getToken();

  if (!token) {
    throw new Error("Authentication token not found.");
  }

  try {
    const response = await axios.post(
      `${url}/time/submit`,
      { entryId: timeLogId },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      },
    );

    return response.data;
  } catch (error: any) {
    handleError("Create timesheet", error);
  }
};

// Get timesheet
export const getTimesheets = async () => {
  const token = getToken();

  if (!token) {
    throw new Error("Authentication token not found.");
  }

  try {
    const response = await axios.get(`${url}/time/all`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data;
  } catch (error: any) {
    handleError("Get timesheets", error);
  }
};

export const getWeeklyTimeSheet = async (): Promise<any> => {
  const token = getToken();

  if (!token) throw new Error("Authentication token not found.");

  try {
    const response = await axios.get(`${url}/time/all`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      validateStatus: (status) => status < 400, // accept 304 as valid
    });

    // If the server indicates data not modified, serve from our cache.
    if (response.status === 304) {
      if (cachedWeeklyTimesheet) return cachedWeeklyTimesheet;

      // Fallback: perform a cache-busting retry to obtain fresh data.
      const retry = await axios.get(`${url}/time/all`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Cache-Control": "no-cache",
        },
        validateStatus: (status) => status < 400,
      });

      if (retry.status >= 200 && retry.status < 300 && retry.data) {
        cachedWeeklyTimesheet = retry.data;
        return cachedWeeklyTimesheet;
      }

      throw new Error(
        "Weekly timesheet not modified (304) and no cached data available.",
      );
    }

    // Normal 2xx response: update cache and return.
    cachedWeeklyTimesheet = response.data as any;
    return cachedWeeklyTimesheet;
  } catch (error: any) {
    handleError("Get weekly timesheets", error);
  }
};

export const resetWeeklyTimesheetCache = () => {
  cachedWeeklyTimesheet = null;
};

// Get submitted timesheets by project ID
export const getSubmittedTimesheetsByProject = async (projectId: string) => {
  const token = getToken();

  if (!token) {
    throw new Error("Authentication token not found.");
  }

  try {
    const response = await axios.get(
      `${url}/time/submitted/project/${projectId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      },
    );

    return response.data;
  } catch (error: any) {
    handleError("Get submitted timesheets", error);
  }
};

// Approve all timesheets submitted by a user for a project
export const approveTimesheets = async (userId: string, projectId: string) => {
  const token = getToken();

  if (!token) {
    throw new Error("Authentication token not found.");
  }

  try {
    const response = await axios.post(
      `${url}/time/approve`,
      { userId, projectId },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      },
    );

    return response.data;
  } catch (error: any) {
    handleError("Approve timesheets", error);
  }
};
