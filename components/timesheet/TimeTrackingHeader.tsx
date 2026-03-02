// components/TimeTrackingHeader.tsx
"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { adminClockOut } from "@/lib/actions/user.actions";
import toast from "react-hot-toast";

interface TimeTrackingHeaderProps {
  userId: string;
  projectId: string;
}

const TimeTrackingHeader: React.FC<TimeTrackingHeaderProps> = ({
  userId,
  projectId,
}) => {
  const [isAdminClockingOut, setIsAdminClockingOut] = React.useState(false);

  const handleAdminClockOut = async () => {
    setIsAdminClockingOut(true);
    try {
      const res = await adminClockOut(userId, projectId);
      toast.success(res.message || "Admin clock out successful");
      console.log("Clock out result:", res);
    } catch (error: any) {
      console.error(error);
      toast.error(error?.message || "Failed to admin clock out");
    } finally {
      setIsAdminClockingOut(false);
    }
  };

  return (
    <div className="space-y-6 rounded-lg border bg-white p-3 shadow-sm md:p-6">
      <div className="flex flex-col justify-between lg:flex-row lg:items-center">
        <div>
          <h2 className="text-lg font-semibold">Time Tracking</h2>
          <p className="text-sm text-muted-foreground">
            Tuesday, April 22, 2025
          </p>
        </div>
        <div className="text-2xl font-bold text-green-600">03:32:54 PM</div>
      </div>
      <div className="flex flex-col gap-4 lg:flex-row">
        <Button className="w-full rounded-sm bg-[#059669] hover:bg-green-700">
          ▶ Clock In
        </Button>
        <Button
          onClick={handleAdminClockOut}
          disabled={isAdminClockingOut}
          className="z-30 w-full rounded-sm bg-[#DC2626] hover:bg-red-700"
        >
          {isAdminClockingOut ? "Clocking Out..." : "⏹ Clock Out"}
        </Button>
      </div>
    </div>
  );
};

export default TimeTrackingHeader;
