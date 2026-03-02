"use client";

import React from "react";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "../ui/button";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  deleteCurrentUser,
  getZones,
  updateRegion,
} from "@/lib/actions/user.actions";
import toast from "react-hot-toast";
import { useUserStore } from "@/store/userStore";

const AccountPreferences = () => {
  const queryClient = useQueryClient();

  const user = useUserStore((state) => state.user);

  const [region, setRegion] = React.useState("");
  const [showDeleteConfirmation, setShowDeleteConfirmation] =
    React.useState(false);

  const {
    data: zoneData,
    isLoading: zoneLoading,
    isError: zoneError,
  } = useQuery({
    queryKey: ["regions"],
    queryFn: getZones,
    retry: 3,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Initialize region from user data
  React.useEffect(() => {
    if (user?.region) {
      setRegion(user.region);
    }
  }, [user]);

  const regionMutation = useMutation({
    mutationFn: updateRegion,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["user-profile"] });
      queryClient.invalidateQueries({ queryKey: ["regions"] });
      toast.success(data?.message || "Region updated successfully.");
    },
    onError: (error: any) => {
      console.error("Region update error:", error);
      toast.error(error?.message || "Failed to update region.");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteCurrentUser,
    onSuccess: (data) => {
      toast.success(data?.message || "Account deleted successfully.");
      // Clear user store and redirect logic would go here
      queryClient.clear();
      // window.location.href = '/'; // or use router.push('/')
    },
    onError: (error: any) => {
      console.error("Delete account error:", error);
      toast.error(error?.message || "Failed to delete account.");
    },
  });

  const handleRegionUpdate = async () => {
    if (!region) {
      toast.error("Please select a region first.");
      return;
    }

    if (region === user?.region) {
      toast.success("This region is already selected.");
      return;
    }

    regionMutation.mutate(region);
  };

  const handleDelete = async () => {
    if (!showDeleteConfirmation) {
      setShowDeleteConfirmation(true);
      return;
    }

    deleteMutation.mutate();
  };

  const cancelDelete = () => {
    setShowDeleteConfirmation(false);
  };

  // Get current time zone display
  const getCurrentTimeZone = () => {
    if (user?.local_time) {
      return user.local_time;
    }

    try {
      const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      const currentTime = new Date().toLocaleString("en-US", {
        timeZone: timeZone,
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        timeZoneName: "short",
      });
      return `${currentTime} (${timeZone})`;
    } catch (error) {
      return "Unable to determine current time zone";
    }
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center p-8">
        <p className="text-[#AAAAAA]">Loading user data...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="space-y-3">
        <p className="text-xl font-medium text-[#333333]">
          Account preferences
        </p>
        <p className="text-[#AAAAAA]">
          Control settings related to your account.
        </p>
      </div>

      {/* Region Selection Section */}
      <div className="space-y-4">
        <p className="text-xl font-medium text-[#333333]">Region</p>

        <div className="space-y-3">
          {zoneLoading ? (
            <div className="flex items-center space-x-2">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-[#4CAF50] border-t-transparent"></div>
              <p className="text-[#AAAAAA]">Loading zones...</p>
            </div>
          ) : zoneError ? (
            <div className="space-y-2">
              <p className="text-red-500">
                Error loading zones. Please try again.
              </p>
              <Button
                onClick={() =>
                  queryClient.invalidateQueries({ queryKey: ["regions"] })
                }
                variant="outline"
                size="sm"
                className="rounded-sm"
              >
                Retry
              </Button>
            </div>
          ) : (
            <Select value={region} onValueChange={setRegion}>
              <SelectTrigger className="w-full rounded-sm lg:w-1/2">
                <SelectValue placeholder="Select your time zone" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Time Zones</SelectLabel>
                  {zoneData?.map((zone: any) => {
                    const zoneValue = zone?.id || zone?.name || zone;
                    const zoneDisplay = zone?.displayName || zone?.name || zone;

                    return (
                      <SelectItem key={zoneValue} value={zoneValue}>
                        {zoneDisplay}
                      </SelectItem>
                    );
                  })}
                </SelectGroup>
              </SelectContent>
            </Select>
          )}

          <div className="flex items-center space-x-3">
            <Button
              className="rounded-sm bg-[#4CAF50] text-white hover:bg-[#45a049]"
              onClick={handleRegionUpdate}
              disabled={
                regionMutation.status === "pending" || !region || zoneLoading
              }
              type="button"
            >
              {regionMutation.status === "pending" ? (
                <div className="flex items-center space-x-2">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                  <span>Updating...</span>
                </div>
              ) : (
                "Update Region"
              )}
            </Button>

            {user?.region && (
              <p className="text-sm text-[#AAAAAA]">Current: {user.region}</p>
            )}
          </div>

          <p className="text-sm text-[#AAAAAA]">
            Changes to your region and timezone will be reflected across all
            TechstaHR services.
          </p>
        </div>
      </div>

      {/* Current Time Zone Display */}
      <div className="space-y-3">
        <p className="text-xl font-medium text-[#333333]">Current Time Zone</p>
        <div className="rounded-sm border border-gray-200 bg-gray-50 p-4">
          <p className="font-mono text-sm text-[#333333]">
            {getCurrentTimeZone()}
          </p>
        </div>
      </div>

      {/* Account Deletion Section */}
      <div className="space-y-4 border-t pt-8">
        <div className="space-y-3">
          <p className="text-xl font-medium text-red-600">
            Delete your account
          </p>
          <div className="rounded-sm border border-red-200 bg-red-50 p-4">
            <p className="mb-2 font-medium text-red-800">
              ⚠️ This action cannot be undone
            </p>
            <p className="text-red-700">
              When you delete your account, you lose access to all TechstaHR
              account services, and we permanently delete your personal data.
              This includes:
            </p>
            <ul className="ml-4 mt-2 space-y-1 text-sm text-red-700">
              <li>• Your profile and personal information</li>
              <li>• All your data and settings</li>
              <li>• Access to all connected services</li>
              <li>• Any ongoing subscriptions or services</li>
            </ul>
          </div>
        </div>

        {!showDeleteConfirmation ? (
          <Button
            onClick={handleDelete}
            className="rounded-sm bg-red-600 text-white hover:bg-red-700"
            disabled={deleteMutation.status === "pending"}
          >
            Delete Account
          </Button>
        ) : (
          <div className="space-y-4 rounded-sm border border-red-200 bg-red-50 p-4">
            <p className="font-medium text-red-800">
              Are you absolutely sure you want to delete your account?
            </p>
            <p className="text-sm text-red-700">
              This action is permanent and cannot be reversed. Type your email
              address to confirm:
            </p>

            <div className="flex flex-col space-y-3 sm:flex-row sm:space-x-3 sm:space-y-0">
              <input
                type="email"
                placeholder={user.email}
                className="flex-1 rounded-sm border border-red-300 px-3 py-2 text-sm focus:border-red-500 focus:ring-red-500"
                onKeyDown={(e) => {
                  if (
                    e.key === "Enter" &&
                    e.currentTarget.value === user.email
                  ) {
                    handleDelete();
                  }
                }}
              />
            </div>

            <div className="flex space-x-3">
              <Button
                onClick={handleDelete}
                className="rounded-sm bg-red-600 text-white hover:bg-red-700"
                disabled={deleteMutation.status === "pending"}
              >
                {deleteMutation.status === "pending" ? (
                  <div className="flex items-center space-x-2">
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                    <span>Deleting...</span>
                  </div>
                ) : (
                  "Yes, Delete My Account"
                )}
              </Button>

              <Button
                onClick={cancelDelete}
                variant="outline"
                className="rounded-sm border-gray-300"
                disabled={deleteMutation.status === "pending"}
              >
                Cancel
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AccountPreferences;
