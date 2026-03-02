// components/PendingApprovals.tsx
"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import Image from "next/image";
import userIcon from "@/public/images/user-avatar.png";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { approveTimesheets } from "@/lib/actions/timesheet.actions";
import toast from "react-hot-toast";

interface PendingApprovalsProps {
  submittedTimesheets: any[];
  isLoading: boolean;
  isError: boolean;
  projectId: string;
}

const PendingApprovals: React.FC<PendingApprovalsProps> = ({
  submittedTimesheets,
  isLoading,
  isError,
  projectId,
}) => {
  const queryClient = useQueryClient();

  const approvalMutation = useMutation({
    mutationFn: ({ userId, projectId }: { userId: string; projectId: string }) =>
      approveTimesheets(userId, projectId),
    onSuccess: (data) => {
      toast.success(data?.message || "Timesheets approved successfully");
      queryClient.invalidateQueries({ queryKey: ["submitted-timesheets-by-project"] });
      queryClient.invalidateQueries({ queryKey: ["weekly-timesheet"] });
    },
    onError: (error: any) => {
      toast.error(error?.message || "Failed to approve timesheets");
    },
  });

  const groupedByUser = React.useMemo(() => {
    const groups: Record<
      string,
      { user: any; totalHours: number; overtimeHours: number; entries: any[] }
    > = {};
    (submittedTimesheets || []).forEach((entry: any) => {
      const userId = entry.user?._id || entry.user;
      if (!userId) return;
      if (!groups[userId]) {
        groups[userId] = {
          user: entry.user,
          totalHours: 0,
          overtimeHours: 0,
          entries: [],
        };
      }
      groups[userId].totalHours += entry.totalHours || 0;
      groups[userId].overtimeHours += entry.overtimeHours || 0;
      groups[userId].entries.push(entry);
    });
    return Object.values(groups);
  }, [submittedTimesheets]);

  return (
    <div className="space-y-4 rounded-sm border bg-white p-2 shadow-sm lg:p-6">
      <h3 className="text-base font-medium">Pending Approvals</h3>

      {isLoading ? (
        <p className="text-muted-foreground">Loading pending submissions...</p>
      ) : isError ? (
        <p className="text-red-500">Failed to load pending submissions.</p>
      ) : groupedByUser.length === 0 ? (
        <p className="text-muted-foreground">No pending submissions found.</p>
      ) : (
        groupedByUser.map((group: any) => {
          const { user, totalHours, overtimeHours } = group;
          const userId = user?._id || user;

          return (
            <div
              key={userId}
              className="flex flex-col justify-between gap-4 rounded-sm border p-3 md:flex-row md:items-center"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full">
                  <Image
                    src={user?.avatar || userIcon}
                    alt="user image"
                    className="w-full h-full object-cover"
                    width={40}
                    height={40}
                  />
                </div>
                <div>
                  <p className="text-sm font-medium md:text-base">
                    {user?.full_name || user?.email || "Unknown User"}
                  </p>
                  <p className="text-xs text-muted-foreground md:text-sm">
                    Total: {totalHours.toFixed(1)}h | Overtime:{" "}
                    {overtimeHours.toFixed(1)}h
                  </p>
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  className="bg-[#059669] text-white hover:bg-green-700"
                  onClick={() =>
                    approvalMutation.mutate({ userId, projectId })
                  }
                  disabled={approvalMutation.isPending}
                >
                  {approvalMutation.isPending && (
                    <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  )}
                  <Check className="mr-1 h-4 w-4" /> Approve
                </Button>
              </div>
            </div>
          );
        })
      )}
    </div>
  );
};

export default PendingApprovals;
