import axios from "axios";
import { getToken } from "@/lib/auth";
import { handleError } from "../utils";

const url = "https://techstahr-backend.onrender.com/api/v1";

// 1. Update Screenshot Settings
export const updateScreenshotSettings = async ({
  taskId,
  enableScreenshot,
  screenshotIntervalMinutes,
}: {
  taskId: string;
  enableScreenshot: boolean;
  screenshotIntervalMinutes: number;
}) => {
  const token = getToken();

  if (!token) {
    throw new Error("Authentication token not found.");
  }

  try {
    const response = await axios.put(
      `${url}/screenshot/${taskId}/screenshot-settings`,
      {
        enableScreenshot,
        screenshotIntervalMinutes,
      },
      {
        headers: { Authorization: `Bearer ${token}` },
      },
    );
    return response.data;
  } catch (error: any) {
    handleError("Update Screenshot Settings", error);
  }
};

export const getScreenshotSettings = async ({
  projectId,
}: {
  projectId: string;
}) => {
  const token = getToken();

  if (!token) {
    throw new Error("Authentication token not found.");
  }

  try {
    const response = await axios.get(
      `${url}/screenshot/${projectId}/get-screenshot-settings`,
      {
        headers: { Authorization: `Bearer ${token}` },
      },
    );
    return response.data;
  } catch (error: any) {
    handleError("Get Screenshot Settings", error);
  }
};

// 2. Get All Screenshots
export const getAllScreenshots = async (projectId: string) => {
  const token = getToken();

  if (!token) {
    throw new Error("Authentication token not found.");
  }

  try {
    const response = await axios.get(
      `${url}/screenshot/${projectId}/screenshots`,
      {
        headers: { Authorization: `Bearer ${token}` },
      },
    );
    return response.data;
  } catch (error: any) {
    handleError("Get All Screenshots", error);
  }
};

// 3. Stop Screenshot Capture
export const stopScreenshotCapture = async (taskId: string) => {
  const token = getToken();

  if (!token) {
    throw new Error("Authentication token not found.");
  }

  try {
    const response = await axios.put(
      `${url}/screenshot/${taskId}/stop-screenshot`,
      {},
      {
        headers: { Authorization: `Bearer ${token}` },
      },
    );
    return response.data;
  } catch (error: any) {
    handleError("Stop Screenshot Capture", error);
  }
};
