// components/NotificationDialog.tsx

"use client";

import { useState } from "react";
import { Check, Link2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import toast from "react-hot-toast";
import {
  getNotificationPreferences,
  markAllNotificationsAsRead,
  markNotificationAsRead,
  updateNotificationPreferences,
} from "@/lib/actions/notifications.actions";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { NotificationProps } from "@/types";
import axios from "axios";
import { getButtonColorClass } from "@/lib/utils";

interface NotificationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  notifications: NotificationProps[];
  isLoadingNotifications: boolean;
}

export function NotificationCard({
  open,
  onOpenChange,
  notifications,
  isLoadingNotifications,
}: NotificationDialogProps) {
  const queryClient = useQueryClient();

  const [acceptingId, setAcceptingId] = useState<string | null>(null);
  const [decliningId, setDecliningId] = useState<string | null>(null);

  // Fetch preferences
  const { data: preferences } = useMutation({
    mutationFn: getNotificationPreferences,
  });

  // Update preferences
  const updatePrefMutation = useMutation({
    mutationFn: updateNotificationPreferences,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notification-preferences"] });
      toast.success("Preferences updated.");
    },
    onError: () => toast.error("Failed to update preferences."),
  });

  // Mark one as read
  const markAsReadMutation = useMutation({
    mutationFn: markNotificationAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
    onError: () => toast.error("Failed to mark as read."),
  });

  // Mark all as read
  const markAllAsReadMutation = useMutation({
    mutationFn: markAllNotificationsAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      toast.success("All notifications marked as read.");
    },
    onError: () => toast.error("Failed to mark all as read."),
  });

  const handlePreferenceChange = (key: string, value: boolean) => {
    if (!preferences) return;
    const updated = { ...preferences, [key]: value };
    updatePrefMutation.mutate(updated);
  };

  const handleMarkAsRead = (id: string) => {
    markAsReadMutation.mutate(id);
  };

  const handleNotificationAction = async (url: string, label: string) => {
    try {
      toast.loading(`${label} in progress...`);

      const token = localStorage.getItem("token");
      if (!token) throw new Error("Authentication token not found.");

      const response = await axios.post(
        url,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      toast.dismiss();
      toast.success(
        response.data?.message || `${label} completed successfully`,
      );

      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    } catch (error: any) {
      toast.dismiss();
      const message =
        error.response?.data?.message ||
        error.message ||
        `Failed to ${label.toLowerCase()}`;
      toast.error(message);
    }
  };

  const unreadNotifications = notifications.filter((n) => !n.isRead);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[360px] sm:max-w-[400px] lg:w-[480px]">
        <DialogHeader>
          <DialogTitle>Notifications</DialogTitle>
          <DialogDescription>
            You have {notifications?.filter((n) => !n.isRead)?.length || 0}{" "}
            unread message(s).
          </DialogDescription>
        </DialogHeader>

        {isLoadingNotifications ? (
          <p className="text-center text-sm">Loading...</p>
        ) : (
          <>
            {preferences && (
              <div className="mb-4 space-y-2 border-b pb-4">
                {[
                  "email_notification",
                  "comment_notification",
                  "task_assigned_notification",
                  "project_invitation_notification",
                ].map((key) => (
                  <div
                    key={key}
                    className="flex items-center justify-between capitalize"
                  >
                    <span className="text-sm font-medium">
                      {key.replace(/_/g, " ")}
                    </span>
                    <Switch
                      checked={preferences[key]}
                      onCheckedChange={(v) => handlePreferenceChange(key, v)}
                    />
                  </div>
                ))}
              </div>
            )}

            <div className="hide-scrollbar max-h-[250px] space-y-3 overflow-y-auto">
              {unreadNotifications.length === 0 ? (
                <p className="text-center text-sm text-muted-foreground">
                  No notifications yet.
                </p>
              ) : (
                unreadNotifications.map((notif) => (
                  <div
                    key={notif._id}
                    className="flex flex-col gap-1 rounded-sm border p-2 hover:bg-muted"
                  >
                    <div
                      className="flex cursor-pointer items-center gap-2"
                      onClick={() => handleMarkAsRead(notif._id)}
                    >
                      {!notif.isRead && (
                        <span className="mt-1 h-2 w-2 rounded-full bg-sky-500" />
                      )}
                      <div className="flex-1">
                        <p className="text-sm font-medium">{notif.message}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(notif.createdAt).toLocaleString()}
                        </p>
                      </div>
                    </div>

                    {/* Accept/Decline buttons for project invitations */}
                    {notif.type === "project_invitation" && (
                      <div className="flex flex-wrap justify-end gap-2 pt-2">
                        {notif.actions?.map((action) => (
                          <Button
                            key={action._id}
                            size="sm"
                            className={`${getButtonColorClass(action.label)} text-white`}
                            onClick={() =>
                              handleNotificationAction(action.url, action.label)
                            }
                          >
                            {action.label}
                          </Button>
                        ))}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>

            <DialogFooter className="pt-4">
              <Button
                onClick={() => markAllAsReadMutation.mutate()}
                className="w-full items-center rounded-sm bg-[#4CAF50]"
              >
                <Check size={14} /> Mark all as read
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
