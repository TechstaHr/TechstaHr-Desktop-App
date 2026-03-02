import axios from "axios";
import { _siteConfig } from "../config/site";

import { clsx, type ClassValue } from "clsx";
import toast from "react-hot-toast";
import { twMerge } from "tailwind-merge";
import { z } from "zod";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function _formatNumberToMoney(number: number) {
  return Intl.NumberFormat("en-US").format(number);
}

export default function _slugify(str: string) {
  str = str.replace(/^\s+|\s+$/g, "");
  str = str.toLowerCase();
  str = str
    .replace(/[^a-z0-9 -]/g, "-")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
  return str;
}

export const _handleShare = (path: string) => {
  if (navigator.share) {
    navigator.share({
      url: _siteConfig.domain + path,
    });
  }
};

export function handleError(action: string, error: any): never {
  if (axios.isAxiosError(error) && error.response) {
    console.error(`${action} error:`, error.response.data);
    throw error.response.data;
  }
  throw error;
}

export const copyToClipboard = async (
  text: string,
  showToast: boolean = true,
) => {
  try {
    await navigator.clipboard.writeText(text);
    if (showToast) {
      toast.success("Copied to clipboard!");
    }
  } catch (error) {
    console.error("Failed to copy:", error);
    toast.error("Failed to copy.");
  }
};

export const authFormSchema = (type: string) =>
  z.object({
    email:
      type === "sign-in" || type === "sign-up" || type === "forgot-password"
        ? z.string().email()
        : z.string().optional(),
    team_name: type === "sign-up" ? z.string() : z.string().optional(),
    password:
      type === "sign-in" || type === "sign-up" || type === "new-password"
        ? z.string().min(6)
        : z.string().optional(),
    confirmPassword:
      type === "new-password" ? z.string().min(8) : z.string().optional(),
    code:
      type === "reset-password"
        ? z.string().regex(/^\d{6}$/, "Code must be exactly 6 digits")
        : z.string().optional(),
    terms:
      type === "sign-up"
        ? z.literal(true, {
            errorMap: () => ({ message: "You must agree to the terms" }),
          })
        : z.literal(false).optional(),
  });

export const formatTime = (seconds: number) => {
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  return `${hrs}:${mins.toString().padStart(2, "0")}:${secs
    .toString()
    .padStart(2, "0")}`;
};

export const formatISOString = (iso: string) => {
  const date = new Date(iso);
  let hours = date.getHours();
  const minutes = date.getMinutes().toString().padStart(2, "0");
  const ampm = hours >= 12 ? "pm" : "am";
  hours = hours % 12 || 12;
  return `${hours}:${minutes}${ampm}`;
};

export function transformProductivityData(productivityData: any[]) {
  const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

  // Initialize base data: one object per day
  const chartData = daysOfWeek.map((day) => ({ name: day }));

  productivityData.forEach((entry) => {
    const userLabel = entry.user.email; // or entry.user.fullName if available

    daysOfWeek.forEach((day, i) => {
      chartData[i][userLabel] = entry.productivity[day] ?? 0;
    });
  });

  return chartData;
}

export function buildChartConfig(productivityData: any[]) {
  const colors = [
    "#0ea5e9", // blue
    "#22c55e", // green
    "#facc15", // yellow
    "#ef4444", // red
    "#8b5cf6", // purple
    "#ec4899", // pink
  ];

  const config: Record<string, { label: string; color: string }> = {};

  productivityData.forEach((entry, index) => {
    const userLabel = entry.user.email;
    config[userLabel] = {
      label: userLabel,
      color: colors[index % colors.length],
    };
  });

  return config;
}

export const getButtonColorClass = (label: string) => {
  const normalized = label.toLowerCase();
  if (normalized.includes("accept") || normalized.includes("approve"))
    return "bg-[#059669] hover:bg-green-700"; // green
  if (normalized.includes("reject") || normalized.includes("decline"))
    return "bg-[#DC2626] hover:bg-red-700"; // red
  if (normalized.includes("remind")) return "bg-[#F59E0B] hover:bg-yellow-600"; // amber
  return "bg-gray-600 hover:bg-gray-700"; // fallback
};

export const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
};

export const calculateDuration = (start: string, end: string) => {
  const startTime = new Date(start);
  const endTime = new Date(end);
  const diffMs = endTime.getTime() - startTime.getTime();
  const hours = Math.floor(diffMs / (1000 * 60 * 60));
  const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
  return `${hours}h ${minutes}m`;
};
