import { _user, ClockInResponse, ClockOutResponse } from "@/types";
import axios from "axios";
import { getToken } from "@/lib/auth";
import { handleError } from "../utils";

const url = "https://techstahr-backend.onrender.com/api/v1";

// User Profile Queries

export const getUserProfile = async () => {
  const token = getToken();

  if (!token) {
    throw new Error("Authentication token not found.");
  }

  try {
    const response = await axios.get(`${url}/user/profile`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error: any) {
    handleError("Get profile", error);
  }
};

export const getAllUsers = async () => {
  const token = getToken();

  if (!token) {
    throw new Error("Authentication token not found.");
  }

  try {
    const response = await axios.get(`${url}/user/users`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error: any) {
    handleError("Get users", error);
  }
};

/**
 * Fetch a single user by ID
 * Route: /api/v1/user/users/:userId
 */
export const getUserById = async (userId: string) => {
  const token = getToken();

  if (!token) {
    throw new Error("Authentication token not found.");
  }

  try {
    const response = await axios.get(`${url}/user/users/${userId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error: any) {
    handleError(`Get user by id: ${userId}`, error);
  }
};

/**
 * Convenience helper to fetch a user's email by ID
 */
export const getUserEmailById = async (userId: string): Promise<string | null> => {
  try {
    const user = await getUserById(userId);
    // Common patterns: user.email or user.data.email
    const email = user.user?.email ?? user?.data?.email ?? null;
    return typeof email === "string" ? email : null;
  } catch (error) {
    // Already handled in getUserById; return null on failure
    return null;
  }
};

// user.actions.ts
export const editUserProfile = async (formData: FormData) => {
  const token = getToken();

  if (!token) {
    throw new Error("Authentication token not found.");
  }

  try {
    const response = await axios.put(`${url}/user/profile`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error: any) {
    handleError("Edit profile", error);
  }
};

export const uploadProfilePicture = async (formData: FormData) => {
  const token = getToken();

  if (!token) {
    throw new Error("Authentication token not found.");
  }

  try {
    const response = await axios.post(
      `${url}/user/upload-profile-picture`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      },
    );
    return response.data;
  } catch (error: any) {
    handleError("Upload profile picture", error);
  }
};

export const changeUserRole = async (id: string, role: string) => {
  const token = getToken();

  if (!token) {
    throw new Error("Authentication token not found.");
  }

  try {
    const response = await axios.put(
      `${url}/user/role/${id}`,
      { role },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );
    return response.data;
  } catch (error: any) {
    handleError("Change role", error);
  }
};

/**
 * Deletes a specific user by ID
 * @param userId - The ID of the user to delete
 */
export const deleteUserById = async (userId: string) => {
  const token = getToken();

  if (!token) throw new Error("Authentication token not found.");

  try {
    const response = await axios.delete(`${url}/user/delete/${userId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data;
  } catch (error: any) {
    handleError("deleteUserById", error);
  }
};

/**
 * Deletes the currently authenticated user
 */
export const deleteCurrentUser = async () => {
  const token = getToken();

  if (!token) throw new Error("Authentication token not found.");

  try {
    const response = await axios.delete(`${url}/user/delete`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data;
  } catch (error: any) {
    handleError("deleteCurrentUser", error);
  }
};

export const clockIn = async (
  projectId: string,
  startTime: string,
): Promise<ClockInResponse> => {
  const token = getToken();
  if (!token) throw new Error("Authentication token not found.");

  try {
    const response = await axios.post(
      `${url}/user/clock-in/${projectId}`,
      { startTime },
      { headers: { Authorization: `Bearer ${token}` } },
    );

    // Save tracking session to localStorage
    if (typeof window !== "undefined" && response.data?.entry) {
      const { saveTrackingSession } = await import("@/lib/utils/tracking-session");
      saveTrackingSession({
        projectId,
        startTime,
        entryId: response.data.entry._id,
        type: "clock-in",
      });
    }

    return response.data;
  } catch (error: any) {
    handleError(`Clock in to project ${projectId}`, error);
  }
};

export const clockOut = async (
  projectId: string,
): Promise<ClockOutResponse> => {
  const token = getToken();
  if (!token) throw new Error("Authentication token not found.");

  try {
    const response = await axios.post(
      `${url}/user/clock-out/${projectId}`,
      {},
      { headers: { Authorization: `Bearer ${token}` } },
    );

    // Clear tracking session from localStorage
    if (typeof window !== "undefined") {
      const { clearTrackingSession } = await import("@/lib/utils/tracking-session");
      clearTrackingSession();
    }

    return response.data;
  } catch (error: any) {
    handleError(`Clock out of project ${projectId}`, error);
  }
};

export const adminClockOut = async (
  userId: string,
  projectId: string,
): Promise<ClockOutResponse> => {
  const token = getToken();
  if (!token) throw new Error("Authentication token not found.");

  try {
    const response = await axios.post(
      `${url}/user/admin-clock-out/${userId}/${projectId}`,
      {},
      { headers: { Authorization: `Bearer ${token}` } },
    );
    return response.data;
  } catch (error: any) {
    handleError(
      `Admin clock out for user ${userId} on project ${projectId}`,
      error,
    );
  }
};

export const getZones = async () => {
  const token = getToken();

  if (!token) throw new Error("Authentication token not found.");

  try {
    const response = await axios.get(`${url}/user/zones`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error: any) {
    handleError(`Get zones`, error);
  }
};

export const updateRegion = async (region: string) => {
  const token = getToken();

  if (!token) throw new Error("Authentication token not found.");

  try {
    const response = await axios.put(
      `${url}/user/update-region`,
      { region },
      {
        headers: { Authorization: `Bearer ${token}` },
      },
    );
    return response.data;
  } catch (error: any) {
    handleError(`Get zones`, error);
  }
};
