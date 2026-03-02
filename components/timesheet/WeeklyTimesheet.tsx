// components/WeeklyTimesheet.tsx
"use client";

import React, { useMemo, useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import { TimesheetProjectEntry } from "@/types";
import { Button } from "@/components/ui/button";
import { Calendar, Download } from "lucide-react";
import { downloadTimesheetAsCSV } from "@/lib/utils/download-timesheet";
import toast from "react-hot-toast";
import WeeklyTimesheetProject from "./WeeklyTimesheetProject";

export const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
};

interface WeeklyTimesheetProps {
  weeklyTimesheet: any;
  isLoading: boolean;
  isError: boolean;
  selectedTimeLogIds: string[];
  onTimeLogSelection: (logId: string) => void;
}

const WeeklyTimesheet: React.FC<WeeklyTimesheetProps> = ({
  weeklyTimesheet,
  isLoading,
  isError,
  selectedTimeLogIds,
  onTimeLogSelection,
}) => {
  const handleDownloadTimesheet = () => {
    try {
      // Get all timesheet entries
      let entries: any[] = [];
      
      if (Array.isArray(weeklyTimesheet)) {
        entries = weeklyTimesheet;
      } else if (weeklyTimesheet?.entries && Array.isArray(weeklyTimesheet.entries)) {
        entries = weeklyTimesheet.entries;
      } else if (weeklyTimesheet?.timesheet) {
        // Convert timesheet object to array format
        Object.values(weeklyTimesheet.timesheet).forEach((projectData: any) => {
          Object.values(projectData.logsByDay || {}).forEach((dayLogs: any) => {
            if (Array.isArray(dayLogs)) {
              dayLogs.forEach((log: any) => {
                entries.push({
                  ...log,
                  project: projectData.projectName,
                });
              });
            }
          });
        });
      }

      if (entries.length === 0) {
        toast.error("No timesheet data available to download");
        return;
      }

      // Filter by selected entries if any are selected
      const dataToDownload = selectedTimeLogIds.length > 0
        ? entries.filter((entry) => 
            selectedTimeLogIds.includes(entry.logId || entry._id)
          )
        : entries;

      if (dataToDownload.length === 0) {
        toast.error("No selected timesheet entries to download");
        return;
      }

      // Generate filename with date range
      const dates = dataToDownload
        .map((e) => new Date(e.date || e.start || e.startTime))
        .filter((d) => !isNaN(d.getTime()));
      
      const filename = dates.length > 0
        ? `timesheet-${formatDate(dates[0].toISOString())}-${formatDate(dates[dates.length - 1].toISOString())}.csv`
        : `timesheet-${new Date().toISOString().split("T")[0]}.csv`;

      downloadTimesheetAsCSV(dataToDownload, filename);
      toast.success(`Downloaded ${dataToDownload.length} timesheet entries`);
    } catch (error) {
      console.error("Error downloading timesheet:", error);
      toast.error("Failed to download timesheet");
    }
  };

  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  const getDayLabel = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      weekday: "short",
    });
  };

  // When weeklyTimesheet comes as an array of log entries, group by user email, then by project and day.
  type GroupedProjects = Record<string, TimesheetProjectEntry>;
  type GroupedByEmail = Record<string, GroupedProjects>;

  const groupedByEmail = useMemo<GroupedByEmail | null>(() => {
    if (!Array.isArray(weeklyTimesheet)) return null;

    return (weeklyTimesheet as any[]).reduce((acc: GroupedByEmail, entry: any) => {
      const email: string = entry?.user?.email || entry?.user || "Unknown";
      const projectId: string = entry?.project?._id || entry?.project?.id || entry?.project || "unknown-project";
      const projectName: string = entry?.project?.name || "Unnamed Project";
      const start: string = String(entry?.start || entry?.startTime || "");
      const end: string = String(entry?.end || entry?.endTime || "");
      const logId: string = String(entry?.logId || entry?._id || `${projectId}-${start}-${end}`);
      const screenshots: any[] = entry?.screenshots || [];
      const link: string = entry?.link || "#";
      const dayLabel: string = getDayLabel(entry?.date || entry?.start || new Date());

      if (!acc[email]) acc[email] = {} as GroupedProjects;
      if (!acc[email][projectId]) {
        acc[email][projectId] = {
          projectName,
          logsByDay: {},
        } as TimesheetProjectEntry;
      }

      const proj = acc[email][projectId];
      if (!proj.logsByDay[dayLabel]) {
        proj.logsByDay[dayLabel] = [];
      }

      proj.logsByDay[dayLabel].push({
        logId,
        start,
        end,
        screenshots,
        link,
      });

      return acc;
    }, {} as GroupedByEmail);
  }, [weeklyTimesheet]);

  const hasArrayData = Array.isArray(weeklyTimesheet) && weeklyTimesheet.length > 0;
  const hasObjectData = !!(
    weeklyTimesheet && weeklyTimesheet.timesheet && Object.keys(weeklyTimesheet.timesheet).length > 0
  );

  // Collapsible state for grouped email sections
  const [expandedEmails, setExpandedEmails] = useState<Record<string, boolean>>({});
  const toggleEmail = (email: string) =>
    setExpandedEmails((prev) => ({ ...prev, [email]: !prev[email] }));

  const weekRangeText = useMemo(() => {
    if (hasObjectData) {
      const start = weeklyTimesheet?.weekStart;
      const end = weeklyTimesheet?.weekEnd;
      if (start && end) return `${formatDate(start)} - ${formatDate(end)}`;
      return undefined;
    }
    if (hasArrayData) {
      const dates: Date[] = (weeklyTimesheet as any[])
        .map((e) => new Date(e?.date || e?.start || e?.startTime))
        .filter((d) => !isNaN(d.getTime()));
      if (dates.length === 0) return undefined;
      const min = new Date(Math.min(...dates.map((d) => d.getTime())));
      const max = new Date(Math.max(...dates.map((d) => d.getTime())));
      return `${formatDate(min.toISOString())} - ${formatDate(max.toISOString())}`;
    }
    return undefined;
  }, [hasObjectData, hasArrayData, weeklyTimesheet]);

  return (
    <div className="space-y-4 rounded-lg border bg-white p-3 shadow-sm md:p-6">
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h3 className="flex items-center gap-2 text-lg font-semibold">
            <Calendar className="h-5 w-5" />
            Weekly Timesheet
          </h3>
          {weekRangeText && (
            <p className="text-sm text-muted-foreground">{weekRangeText}</p>
          )}
        </div>
        <Button
          onClick={handleDownloadTimesheet}
          className="bg-green-600 hover:bg-green-700"
        >
          <Download className="mr-2 h-4 w-4" />
          {selectedTimeLogIds.length > 0
            ? `Download Selected (${selectedTimeLogIds.length})`
            : "Download Timesheet"}
        </Button>
      </div>

      {isLoading ? (
        <div className="py-8 text-center">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-b-2 border-green-600"></div>
          <p className="mt-2 text-muted-foreground">
            Loading weekly timesheet...
          </p>
        </div>
      ) : isError ? (
        <p className="py-4 text-center text-red-500">
          Failed to load weekly timesheet.
        </p>
      ) : (!hasArrayData && !hasObjectData) ? (
        <p className="py-4 text-center text-muted-foreground">
          No timesheet data available.
        </p>
      ) : (
        <div className="space-y-6">
          {hasObjectData &&
            Object.entries(weeklyTimesheet.timesheet).map(
              ([projectId, projectData]: [string, any]) => (
                <WeeklyTimesheetProject
                  key={projectId}
                  projectId={projectId}
                  projectData={projectData}
                  selectedTimeLogIds={selectedTimeLogIds}
                  onTimeLogSelection={onTimeLogSelection}
                />
              ),
            )}

          {hasArrayData && groupedByEmail &&
            Object.entries(groupedByEmail as GroupedByEmail).map(([email, projects]) => {
              const isExpanded = expandedEmails[email] ?? true;
              return (
                <div key={email} className="space-y-3">
                  <button
                    type="button"
                    onClick={() => toggleEmail(email)}
                    className="flex w-full items-center justify-between rounded-md bg-green-50 px-3 py-2"
                  >
                    <span className="flex items-center gap-2 font-semibold text-green-800">
                      {isExpanded ? (
                        <ChevronDown className="h-4 w-4" />
                      ) : (
                        <ChevronRight className="h-4 w-4" />
                      )}
                      Team member: {email}
                    </span>
                  </button>

                  {isExpanded && (
                    <div className="space-y-4">
                      {Object.entries(projects as GroupedProjects).map(([projectId, projectData]) => (
                        <WeeklyTimesheetProject
                          key={`${email}-${projectId}`}
                          projectId={projectId}
                          projectData={projectData}
                          selectedTimeLogIds={selectedTimeLogIds}
                          onTimeLogSelection={onTimeLogSelection}
                        />
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
        </div>
      )}
    </div>
  );
};

export default WeeklyTimesheet;
