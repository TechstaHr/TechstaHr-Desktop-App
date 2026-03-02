// components/SubmittedTimesheets.tsx
"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Check, Filter, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { getAllScreenshots } from "@/lib/actions/screenshot.actions";
import { getUserEmailById } from "@/lib/actions/user.actions";
import { getAssignedTeamMembersToProject } from "@/lib/actions/project.actions";
import SubmittedTimesheetEntry from "./SubmittedTimesheetEntry";

interface SubmittedTimesheetsProps {
  submittedTimesheets: any;
  isLoading: boolean;
  isError: boolean;
}

interface ScreenshotItem {
  url: string;
  takenAt: string;
  takenBy: string;
  _id: string;
  id: string;
}

const SubmittedTimesheets: React.FC<SubmittedTimesheetsProps> = ({
  submittedTimesheets,
  isLoading,
  isError,
}) => {
  const [projectId, setProjectId] = useState<string | null>(null);
  const [teamMemberFilter, setTeamMemberFilter] = useState("");
  const [startDateFilter, setStartDateFilter] = useState("");
  const [endDateFilter, setEndDateFilter] = useState("");
  const [showNoTimesheetDays, setShowNoTimesheetDays] = useState(false);
  const [emailByUserId, setEmailByUserId] = useState<Record<string, string>>({});
  const [openAccordionItems, setOpenAccordionItems] = useState<string[]>([]);

  useEffect(() => {
    try {
      const storedProjectId =
        typeof window !== "undefined"
          ? localStorage.getItem("currentProjectId")
          : null;
      if (storedProjectId) setProjectId(storedProjectId);
    } catch (e) {
      // Ignore localStorage errors
    }
  }, []);

  // Fetch screenshots for the current project
  const { data: screenshotsData } = useQuery({
    queryKey: ["screenshots", projectId],
    queryFn: () => getAllScreenshots(projectId!),
    enabled: !!projectId,
    staleTime: 60 * 1000,
  });

  const screenshots = useMemo(() => {
    return (screenshotsData?.screenshots || []) as ScreenshotItem[];
  }, [screenshotsData]);

  // Load user emails
  useEffect(() => {
    const loadEmails = async () => {
      // Handle same data structure as weekly timesheet (array or object with entries)
      const entries: any[] = Array.isArray(submittedTimesheets)
        ? submittedTimesheets
        : Array.isArray((submittedTimesheets as any)?.entries)
          ? (submittedTimesheets as any).entries
          : [];

      const userIds = Array.from(
        new Set(
          entries
            .map((log: any) => log?.user?._id || log?.user)
            .filter(Boolean)
        )
      ) as string[];
      if (userIds.length === 0) return;

      try {
        const results = await Promise.all(
          userIds.map(async (id: string) => {
            const email = await getUserEmailById(id);
            return [id, email] as const;
          })
        );
        const map: Record<string, string> = {};
        results.forEach(([id, email]) => {
          if (email) map[id] = email;
        });
        setEmailByUserId((prev) => ({ ...prev, ...map }));
      } catch (error) {
        console.error("Failed to load emails:", error);
      }
    };
    loadEmails();
  }, [submittedTimesheets]);

  // Fetch assigned team members for the current project
  const { data: assignedTeamMembers } = useQuery({
    queryKey: ["assignedTeamMembers", projectId],
    queryFn: () => getAssignedTeamMembersToProject(projectId!),
    enabled: !!projectId,
  });

  // Extract team member user IDs
  const teamUserIds = useMemo(() => {
    const members = assignedTeamMembers?.teamMembers || [];
    const ids = new Set<string>();
    members.forEach((m: any) => {
      const uid = typeof m === "string" ? m : m?.user?._id;
      if (uid) ids.add(uid);
    });
    return ids;
  }, [assignedTeamMembers]);

  // Filter by project and team members first (like weekly timesheet)
  const projectAndTeamFiltered = useMemo(() => {
    const entries: any[] = Array.isArray(submittedTimesheets)
      ? submittedTimesheets
      : Array.isArray((submittedTimesheets as any)?.entries)
        ? (submittedTimesheets as any).entries
        : [];

    // Filter by project ID
    const byProject = projectId
      ? entries.filter((e) => (e?.project?._id || e?.project?.id || e?.project) === projectId)
      : entries;

    // Filter by team members
    if (!teamUserIds || teamUserIds.size === 0) return byProject;
    return byProject.filter((e) => {
      const uid = typeof e.user === "string" ? e.user : e.user?._id;
      return uid ? teamUserIds.has(uid) : false;
    });
  }, [submittedTimesheets, projectId, teamUserIds]);

  // Filter submitted logs (apply user filters on top of project/team filters)
  const filteredLogs = useMemo(() => {
    let logs: any[] = projectAndTeamFiltered;

    // Team member filter
    if (teamMemberFilter) {
      logs = logs.filter((log: any) => {
        const email = log?.user?.email || emailByUserId[log?.user?._id] || "";
        const fullName = log?.user?.full_name || "";
        const searchTerm = teamMemberFilter.toLowerCase();
        return (
          email.toLowerCase().includes(searchTerm) ||
          fullName.toLowerCase().includes(searchTerm)
        );
      });
    }

    // Date range filter
    if (startDateFilter) {
      const startDate = new Date(startDateFilter);
      logs = logs.filter((log: any) => {
        const logDate = new Date(log.start || log.date || log.startTime);
        return logDate >= startDate;
      });
    }

    if (endDateFilter) {
      const endDate = new Date(endDateFilter);
      endDate.setHours(23, 59, 59, 999); // Include the entire end day
      logs = logs.filter((log: any) => {
        const logDate = new Date(log.end || log.date || log.endTime);
        return logDate <= endDate;
      });
    }

    return logs;
  }, [projectAndTeamFiltered, teamMemberFilter, startDateFilter, endDateFilter, emailByUserId]);

  // Group logs by user email
  const logsByEmail: Record<string, any[]> = useMemo(() => {
    return filteredLogs.reduce(
      (acc: Record<string, any[]>, log: any) => {
        const userId = log?.user?._id || log?.user;
        const email = log?.user?.email || emailByUserId[userId] || "Unknown";
        if (!acc[email]) {
          acc[email] = [];
        }
        acc[email].push(log);
        return acc;
      },
      {} as Record<string, any[]>
    );
  }, [filteredLogs, emailByUserId]);

  // Match screenshots to logs
  const getScreenshotsForLog = (log: any): ScreenshotItem[] => {
    const userId = log?.user?._id || log?.user;
    const logStart = new Date(log.start || log.startTime || log.date).getTime();
    const logEnd = new Date(log.end || log.endTime || log.date).getTime();

    return screenshots.filter((screenshot) => {
      const screenshotTime = new Date(screenshot.takenAt).getTime();
      return (
        screenshot.takenBy === userId &&
        screenshotTime >= logStart &&
        screenshotTime <= logEnd
      );
    });
  };

  // Auto-expand all accordion items
  useEffect(() => {
    setOpenAccordionItems(Object.keys(logsByEmail));
  }, [logsByEmail]);

  const clearFilters = () => {
    setTeamMemberFilter("");
    setStartDateFilter("");
    setEndDateFilter("");
    setShowNoTimesheetDays(false);
  };

  const hasActiveFilters =
    teamMemberFilter || startDateFilter || endDateFilter || showNoTimesheetDays;

  return (
    <div className="space-y-4 rounded-lg border bg-white p-3 shadow-sm md:p-6">
      <div className="flex items-center justify-between">
        <h3 className="flex items-center gap-2 text-lg font-semibold">
          <Check className="h-5 w-5 text-green-600" />
          Submitted Timesheets
        </h3>
        {hasActiveFilters && (
          <Button variant="outline" size="sm" onClick={clearFilters}>
            <X className="mr-1 h-4 w-4" />
            Clear Filters
          </Button>
        )}
      </div>

      {/* Filter Controls */}
      <div className="space-y-3 rounded-md border bg-gray-50 p-4">
        <div className="flex items-center gap-2 text-sm font-medium">
          <Filter className="h-4 w-4" />
          Filters
        </div>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-700">
              Team Member
            </label>
            <Input
              placeholder="Filter by name or email..."
              value={teamMemberFilter}
              onChange={(e) => setTeamMemberFilter(e.target.value)}
              className="h-9"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-700">
              Start Date
            </label>
            <Input
              type="date"
              value={startDateFilter}
              onChange={(e) => setStartDateFilter(e.target.value)}
              className="h-9"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-700">
              End Date
            </label>
            <Input
              type="date"
              value={endDateFilter}
              onChange={(e) => setEndDateFilter(e.target.value)}
              className="h-9"
            />
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="py-8 text-center">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-b-2 border-green-600"></div>
          <p className="mt-2 text-muted-foreground">
            Loading submitted timesheets...
          </p>
        </div>
      ) : isError ? (
        <p className="py-4 text-center text-red-500">
          Failed to load submitted timesheets.
        </p>
      ) : filteredLogs.length === 0 ? (
        <p className="py-4 text-center text-muted-foreground">
          {hasActiveFilters
            ? "No submitted timesheets match your filters."
            : "No submitted timesheets found."}
        </p>
      ) : (
        <>
          <p className="text-sm text-muted-foreground">
            Found {filteredLogs.length} submitted timesheet{filteredLogs.length !== 1 ? "s" : ""}
          </p>
          <Accordion
            type="multiple"
            value={openAccordionItems}
            onValueChange={setOpenAccordionItems}
            className="w-full"
          >
            {Object.entries(logsByEmail).map(([email, logs]: [string, any[]]) => (
              <AccordionItem value={email} key={email}>
                <AccordionTrigger>
                  {email} ({logs.length})
                </AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-3">
                    {logs.map((log: any, index: number) => (
                      <SubmittedTimesheetEntry
                        key={log.logId || log._id || log.id || `${log.user?._id}-${log.start}-${index}`}
                        log={log}
                        screenshots={getScreenshotsForLog(log)}
                      />
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </>
      )}
    </div>
  );
};

export default SubmittedTimesheets;
