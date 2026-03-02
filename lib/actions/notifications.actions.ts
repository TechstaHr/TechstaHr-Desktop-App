// Notification Queries
import {
  NotificationPayload,
  NotificationPreferences,
  NotificationProps,
} from "@/types";
import axios from "axios";
import { getToken } from "@/lib/auth";
import { handleError } from "../utils";

const url = "https://techstahr-backend.onrender.com/api/v1";

export const updateNotificationPreferences = async (
  preferences: NotificationPreferences,
) => {
  const token = getToken();

  if (!token) throw new Error("Authentication token not found.");

  try {
    const response = await axios.put(
      `${url}/notifications/preference`,
      preferences,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      },
    );

    return response.data;
  } catch (error: any) {
    handleError("Update preferences", error);
  }
};

export const getNotificationPreferences = async () => {
  const token = getToken();

  if (!token) throw new Error("Authentication token not found.");

  try {
    const response = await axios.get(`${url}/notifications/preference`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data;
  } catch (error: any) {
    handleError("Get preferences", error);
  }
};

export const createNotification = async (data: NotificationPayload) => {
  const token = getToken();

  if (!token) throw new Error("Authentication token not found.");

  try {
    const response = await axios.post(`${url}/notifications/create`, data, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data;
  } catch (error: any) {
    handleError("Create notification", error);
  }
};

export const getAllNotifications = async (): Promise<NotificationProps[]> => {
  const token = getToken();

  if (!token) throw new Error("Authentication token not found.");

  try {
    const response = await axios.get(`${url}/notifications`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data;
  } catch (error: any) {
    handleError("Get notifications", error);
  }
};

export const markNotificationAsRead = async (notificationId: string) => {
  const token = getToken();

  if (!token) throw new Error("Authentication token not found.");

  try {
    const response = await axios.put(
      `${url}/notifications/${notificationId}/read`,
      null,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );

    return response.data;
  } catch (error: any) {
    handleError("Mark notification as read", error);
  }
};

export const markAllNotificationsAsRead = async () => {
  const token = getToken();

  if (!token) throw new Error("Authentication token not found.");

  try {
    const response = await axios.put(`${url}/notifications/read-all`, null, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data;
  } catch (error: any) {
    handleError("Mark all notifications as read", error);
  }
};
