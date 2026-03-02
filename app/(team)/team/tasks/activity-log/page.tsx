"use client";

import CalendarNav from "@/components/CalendarNav";
import React, { useState, useEffect, useMemo } from "react";
import { ProductivityCard } from "@/components/ProductivityCard";
import { useQuery } from "@tanstack/react-query";
import { getTimeSheet } from "@/lib/actions/timer.actions";
import { getUserId } from "@/lib/auth";
import { format } from "date-fns";
import { downloadTimesheetAsCSV } from "@/lib/utils/download-timesheet";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import toast from "react-hot-toast";

const ActivityLog = () => {
  const [currentProjectId, setCurrentProjectId] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  // Get current project ID from localStorage
  useEffect(() => {
    try {
      const pid = localStorage.getItem("currentProjectId");
      if (pid) setCurrentProjectId(pid);
    } catch {}
  }, []);

  // Listen for project changes
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "currentProjectId") {
        setCurrentProjectId(e.newValue);
      }
    };

    window.addEventListener("storage", handleStorageChange);
    const interval = setInterval(() => {
      try {
        const pid = localStorage.getItem("currentProjectId");
        if (pid !== currentProjectId) {
          setCurrentProjectId(pid);
        }
      } catch {}
    }, 1000);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      clearInterval(interval);
    };
  }, [currentProjectId]);

  const userId = getUserId();

  // Fetch timesheet data
  const {
    data: timesheetData,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["activity-timesheet", currentProjectId],
    queryFn: getTimeSheet,
    staleTime: 60 * 1000,
  });

  // Filter timesheet entries by project and user
  const filteredEntries = useMemo(() => {
    if (!timesheetData || !Array.isArray(timesheetData)) return [];

    let entries = timesheetData;

    // Filter by current user
    if (userId) {
      entries = entries.filter((entry: any) => {
        const entryUserId =
          typeof entry.user === "string"
            ? entry.user
            : entry.user?._id || entry.user?.id;
        return entryUserId === userId;
      });
    }

    // Filter by current project
    if (currentProjectId) {
      entries = entries.filter((entry: any) => {
        const projectId =
          entry?.project?._id || entry?.project?.id || entry?.project;
        return projectId === currentProjectId;
      });
    }

    // Filter by selected date if any
    if (selectedDate) {
      const selectedDateStr = format(selectedDate, "yyyy-MM-dd");
      entries = entries.filter((entry: any) => {
        const entryDate = new Date(entry?.date || entry?.start || entry?.startTime);
        const entryDateStr = format(entryDate, "yyyy-MM-dd");
        return entryDateStr === selectedDateStr;
      });
    }

    // Sort by date (newest first)
    return entries.sort((a: any, b: any) => {
      const dateA = new Date(a?.date || a?.start || a?.startTime || 0);
      const dateB = new Date(b?.date || b?.start || b?.startTime || 0);
      return dateB.getTime() - dateA.getTime();
    });
  }, [timesheetData, userId, currentProjectId, selectedDate]);

  const handleExport = () => {
    if (filteredEntries.length === 0) {
      toast.error("No timesheet data available to export");
      return;
    }

    const filename = selectedDate
      ? `activity-log-${format(selectedDate, "yyyy-MM-dd")}.csv`
      : `activity-log-${format(new Date(), "yyyy-MM-dd")}.csv`;

    downloadTimesheetAsCSV(filteredEntries, filename);
    toast.success(`Exported ${filteredEntries.length} activity log entries`);
  };

  const formatTime = (timeString: string) => {
    try {
      const date = new Date(timeString);
      return format(date, "HH:mm:ss");
    } catch {
      return timeString;
    }
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return format(date, "MMM d, yyyy");
    } catch {
      return dateString;
    }
  };

  return (
    <div className="space-y-8 px-4">
      <div className="flex items-center justify-between">
        <h2 className="font-inter text-2xl font-medium">Activity Log</h2>
        {filteredEntries.length > 0 && (
          <Button
            onClick={handleExport}
            className="bg-green-600 hover:bg-green-700"
          >
            <Download className="mr-2 h-4 w-4" />
            Export Activity Log
          </Button>
        )}
      </div>

      <CalendarNav />

      <ProductivityCard />

      {/* Activity Log Table */}
      <div className="rounded-lg border bg-white p-4">
        <h3 className="mb-4 text-lg font-semibold">Timesheet Activity Log</h3>

        {isLoading ? (
          <div className="py-8 text-center">
            <div className="mx-auto h-8 w-8 animate-spin rounded-full border-b-2 border-green-600"></div>
            <p className="mt-2 text-sm text-muted-foreground">
              Loading activity logs...
            </p>
          </div>
        ) : isError ? (
          <p className="py-4 text-center text-red-500">
            Failed to load activity logs.
          </p>
        ) : filteredEntries.length === 0 ? (
          <p className="py-4 text-center text-muted-foreground">
            {currentProjectId
              ? "No activity logs found for this project."
              : "No activity logs found. Please select a project."}
          </p>
        ) : (
          <div className="hide-scrollbar w-full overflow-x-auto">
            <table className="min-w-[600px] table-auto text-sm lg:w-full">
              <thead>
                <tr className="border-b text-left text-muted-foreground">
                  <th className="py-2 font-medium">Date</th>
                  <th className="py-2 font-medium">Start Time</th>
                  <th className="py-2 font-medium">End Time</th>
                  <th className="py-2 font-medium">Total Hours</th>
                  <th className="py-2 font-medium">Project</th>
                </tr>
              </thead>
              <tbody>
                {filteredEntries.map((entry: any, index: number) => {
                  const startTime = entry?.start || entry?.startTime || "";
                  const endTime = entry?.end || entry?.endTime || "";
                  const totalHours = entry?.totalHours?.toFixed(2) || "0.00";
                  const projectName =
                    typeof entry.project === "string"
                      ? entry.project
                      : entry.project?.name || "Unknown Project";
                  const date = entry?.date || entry?.start || entry?.startTime;

                  return (
                    <tr key={entry._id || entry.logId || index} className="border-b">
                      <td className="py-3">{formatDate(date)}</td>
                      <td className="py-3">{formatTime(startTime)}</td>
                      <td className="py-3">{formatTime(endTime)}</td>
                      <td className="py-3 font-medium">{totalHours}h</td>
                      <td className="py-3">{projectName}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {filteredEntries.length > 0 && (
          <div className="mt-4 text-sm text-muted-foreground">
            Total entries: {filteredEntries.length} | Total hours:{" "}
            {filteredEntries
              .reduce((sum, e: any) => sum + (e?.totalHours || 0), 0)
              .toFixed(2)}
            h
          </div>
        )}
      </div>
    </div>
  );
};

export default ActivityLog;
