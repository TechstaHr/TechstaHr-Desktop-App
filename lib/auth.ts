/* eslint-disable @typescript-eslint/no-explicit-any */
import axios from "axios";

import {
  createAdminProps,
  createUserProps,
  InviteUserProps,
  resetPasswordProps,
  signInProps,
} from "@/types";
import { handleError } from "./utils";
import { resetTimerCache } from "@/lib/actions/timer.actions";
import { resetWeeklyTimesheetCache } from "@/lib/actions/timesheet.actions";

const url = "https://techstahr-backend.onrender.com/api/v1";

export const signUp = async ({ email, password, team_name }: signInProps) => {
  try {
    const response = await axios.post(`${url}/auth/signup`, {
      email,
      password,
      team_name,
    });
    return response.data;
  } catch (error: any) {
    handleError("Signup", error);
  }
};

export const signIn = async ({ email, password, keepMeLoggedIn }: signInProps) => {
  try {
    const response = await axios.post(`${url}/auth/login`, { email, password, keepMeLoggedIn });
    return response.data;
  } catch (error: any) {
    handleError("Login", error);
  }
};

export const createUser = async ({
  full_name,
  email,
  role_title,
  role,
  password,
}: createUserProps) => {
  try {
    const response = await axios.post(`${url}/auth/create-user`, {
      full_name,
      email,
      role_title,
      role,
      password,
    });
    return response.data;
  } catch (error: any) {
    handleError("Create user", error);
  }
};

export const getToken = () => {
  if (typeof window !== "undefined") {
    return localStorage.getItem("token");
  }
  return null;
};

export const getUserId = () => {
  if (typeof window !== "undefined") {
    return localStorage.getItem("userId");
  }
  return null;
};

export const logOut = async () => {
  const token = getToken();

  if (!token) {
    throw new Error("Authentication token not found.");
  }

  try {
    const response = await axios.post(
      `${url}/auth/logout`,
      {},
      {
        headers: { Authorization: `Bearer ${token}` },
      },
    );
    return response.data;
  } catch (error: any) {
    handleError("Logout", error);
  }
};

export const clearClientState = () => {
  try {
    localStorage.clear();
    sessionStorage.clear();
  } catch { }
  try {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("userId");
  } catch { }
  try {
    resetTimerCache();
    resetWeeklyTimesheetCache();
  } catch { }
};

export const inviteUser = async (data: InviteUserProps) => {
  const token = getToken();
  if (!token) throw new Error("Authentication token not found.");

  try {
    const response = await axios.post(`${url}/auth/invite-user`, data, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error: any) {
    handleError("Invite user", error);
  }
};

export const resendInvite = async (email: string) => {
  const token = getToken();
  if (!token) throw new Error("Authentication token not found.");

  try {
    const response = await axios.post(
      `${url}/auth/resend-invite`,
      { email, frontend_url: "https://techstahr.com/register" },
      {
        headers: { Authorization: `Bearer ${token}` },
      },
    );
    return response.data;
  } catch (error: any) {
    handleError("Resend Invite user", error);
  }
};

export const setPassword = async ({
  password,
  token,
}: {
  password: string;
  token: string;
}) => {
  try {
    const response = await axios.post(
      `${url}/auth/set-password?token=${token}`,
      { password },
    );
    return response.data;
  } catch (error: any) {
    handleError("Set password", error);
  }
};

export const forgotPassword = async ({ email }: signInProps) => {
  try {
    const response = await axios.post(`${url}/auth/forgot-password`, { email });
    return response.data;
  } catch (error: any) {
    handleError("Forgot password", error);
  }
};

export const resetPassword = async ({
  email,
  otp,
  newPassword,
}: resetPasswordProps) => {
  try {
    const response = await axios.post(`${url}/auth/reset-password`, {
      email,
      otp,
      newPassword,
    });
    return response.data;
  } catch (error: any) {
    handleError("Reset password", error);
  }
};

export const updatePassword = async ({
  currentPassword,
  newPassword,
}: resetPasswordProps) => {
  const token = getToken();

  if (!token) {
    throw new Error("Authentication token not found.");
  }
  try {
    const response = await axios.put(`${url}/auth/update-password`, {
      currentPassword,
      newPassword,
    }, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error: any) {
    handleError("Update password", error);
  }
};

export const sendOtp = async ({ email }: signInProps) => {
  try {
    const response = await axios.post(`${url}/auth/send-otp`, { email });
    return response.data;
  } catch (error: any) {
    handleError("Send OTP", error);
  }
};

export const verifyOtp = async ({ email, otp }: resetPasswordProps) => {
  try {
    const response = await axios.post(`${url}/auth/verify-otp`, { email, otp });
    return response.data;
  } catch (error: any) {
    handleError("Verify OTP", error);
  }
};

export const updateUserRole = async (newRole: string, id: string) => {
  const token = getToken();

  if (!token) {
    throw new Error("Authentication token not found.");
  }

  try {
    const response = await axios.patch(
      `${url}/auth/update-role/${id}`,
      { newRole },
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

export const createAdmin = async ({
  email,
  password,
  full_name,
  role_title,
}: createAdminProps) => {
  try {
    const response = await axios.post(`${url}/auth/create-admin`, {
      email,
      password,
      full_name,
      role_title,
    });
    return response.data;
  } catch (error: any) {
    handleError("Verify OTP", error);
  }
};
