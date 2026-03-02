"use client";

import { Switch } from "@/components/ui/switch";
import React from "react";
import {
  getNotificationPreferences,
  updateNotificationPreferences,
} from "@/lib/actions/notifications.actions";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

const notificationOptions = [
  {
    title: "Email notifications",
    description: "Enable or disable receiving email alert.",
    tag: "email_notification",
  },
  {
    title: "Comment notifications",
    description: "Enable or disable receiving comments alert.",
    tag: "comment_notification",
  },
  {
    title: "New task assigned",
    description: "Enable or disable receiving new task assigned alert.",
    tag: "task_assigned_notification",
  },
  {
    title: "Project invitation",
    description: "Enable or disable receiving project invitation alert.",
    tag: "project_invitation_notification",
  },
];

const getDefaultPreferences = () =>
  Object.fromEntries(notificationOptions.map((item) => [item.tag, false]));

const Notifications = () => {
  const queryClient = useQueryClient();

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["notification-preferences"],
    queryFn: getNotificationPreferences,
    retry: false,
    staleTime: 5 * 60 * 1000,
  });

  const preferences =
    isError && error?.message === "Notification settings not found"
      ? getDefaultPreferences()
      : data || getDefaultPreferences();

  const updatePrefMutation = useMutation({
    mutationFn: updateNotificationPreferences,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notification-preferences"] });
      toast.success("Preferences updated.");
    },
    onError: () => toast.error("Failed to update preferences."),
  });

  const handlePreferenceChange = (tag: string, value: boolean) => {
    const updated = { ...preferences, [tag]: value };
    updatePrefMutation.mutate(updated);
  };

  return (
    <div className="space-y-10">
      <div className="w-full border-b border-[#D9D9D9] px-5 pb-3 lg:px-8">
        <h2 className="text-2xl font-medium text-[#333333]">
          Notifications & Alerts
        </h2>
      </div>

      {error?.message === "Notification settings not found" && (
        <p className="px-5 text-xs text-red-400 italic">
          You haven&apos;t set any preferences yet. Defaults applied.
        </p>
      )}

      {isLoading ? (
        <p className="px-5 text-sm text-gray-600">Loading preferences...</p>
      ) : (
        <div className="flex flex-col items-start justify-start gap-8 px-5 md:gap-12 lg:px-8">
          {notificationOptions.map((item) => (
            <div
              key={item.tag}
              className="flex items-center justify-between gap-4 sm:justify-normal"
            >
              <div className="w-[280px] space-y-2 sm:w-[300px] md:w-[330px]">
                <h3 className="text-xl font-medium">{item.title}</h3>
                <p className="text-[#71717A]">{item.description}</p>
              </div>
              <div>
                <Switch
                  className="bg-[#4CAF50] focus-visible:ring-[#4CAF50] data-[state=checked]:bg-[#4CAF50]"
                  checked={preferences[item.tag] || false}
                  onCheckedChange={(value) =>
                    handlePreferenceChange(item.tag, value)
                  }
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Notifications;
