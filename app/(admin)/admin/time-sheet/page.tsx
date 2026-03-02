// Main TimeSheet Component
"use client";

import React from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getAllProjects,
  getPendingInvitations,
} from "@/lib/actions/project.actions";
import { getTimesheets, getWeeklyTimeSheet, getSubmittedTimesheetsByProject } from "@/lib/actions/timesheet.actions";
import { getAssignedTeamMembersToProject } from "@/lib/actions/project.actions";
import TimeTrackingHeader from "@/components/timesheet/TimeTrackingHeader";
import ManualTimeEntry from "@/components/timesheet/ManualTimeEntry";
import WeeklyTimesheet from "@/components/timesheet/WeeklyTimesheet";
import SubmittedTimesheets from "@/components/timesheet/SubmittedTimesheets";
import ProjectSummaries from "@/components/timesheet/ProjectSummaries";
import PendingApprovals from "@/components/timesheet/PendingApprovals";

const TimeSheet = () => {
  const userId = "68648d3c0906dad02243d2e3";
  const projectId = "6862e6a9455ab459e34ed64f";
  const [selectedTimeLogIds, setSelectedTimeLogIds] = React.useState<string[]>(
    [],
  );

  const queryClient = useQueryClient();

  // Queries
  const { data: projects } = useQuery({
    queryKey: ["all-projects"],
    queryFn: () => getAllProjects(),
  });

  const {
    data: pendingInvitesResponse,
    isLoading: isLoadingPending,
    isError: isErrorPending,
  } = useQuery({
    queryKey: ["pending-invitations"],
  });

  const {
    data: weeklyTimesheet,
    isLoading: isLoadingWeekly,
    isError: isErrorWeekly,
  } = useQuery({
    queryKey: ["weekly-timesheet"],
    queryFn: getWeeklyTimeSheet,
  });

  const [currentProjectId, setCurrentProjectId] = React.useState<string | null>(null);

  const {
    data: submittedTimesheetsByProject,
    isLoading: isLoadingSubmittedByProject,
    isError: isErrorSubmittedByProject,
  } = useQuery({
    queryKey: ["submitted-timesheets-by-project", currentProjectId],
    queryFn: () => getSubmittedTimesheetsByProject(currentProjectId!),
    enabled: !!currentProjectId,
  });
  React.useEffect(() => {
    try {
      const pid = localStorage.getItem("currentProjectId");
      if (pid) setCurrentProjectId(pid);
    } catch { }
  }, []);

  const { data: assignedTeamMembers } = useQuery({
    queryKey: ["assignedTeamMembers", currentProjectId],
    queryFn: () => getAssignedTeamMembersToProject(currentProjectId!),
    enabled: !!currentProjectId,
  });

  const teamUserIds = React.useMemo(() => {
    const members = assignedTeamMembers?.teamMembers || [];
    const ids = new Set<string>();
    members.forEach((m: any) => {
      const uid = typeof m === "string" ? m : m?.user?._id;
      if (uid) ids.add(uid);
    });
    return ids;
  }, [assignedTeamMembers]);

  const filteredWeekly = React.useMemo(() => {
    if (!currentProjectId) return [];

    const entries: any[] = Array.isArray((weeklyTimesheet as any)?.entries)
      ? ((weeklyTimesheet as any).entries as any[])
      : Array.isArray(weeklyTimesheet)
        ? ((weeklyTimesheet as any) as any[])
        : [];

    const byProject = entries.filter((e) => (e?.project?._id || e?.project?.id || e?.project) === currentProjectId);

    if (!teamUserIds || teamUserIds.size === 0) return [];
    return byProject.filter((e) => {
      const uid = typeof e.user === "string" ? e.user : e.user?._id;
      return uid ? teamUserIds.has(uid) : false;
    });
  }, [weeklyTimesheet, currentProjectId, teamUserIds]);

  const {
    data: submittedTimesheets,
    isLoading: isLoadingSubmitted,
    isError: isErrorSubmitted,
  } = useQuery({
    queryKey: ["submitted-timesheets"],
    queryFn: getWeeklyTimeSheet,
  });

  const handleTimeLogSelection = (logId: string) => {
    setSelectedTimeLogIds((prev) =>
      prev.includes(logId)
        ? prev.filter((id) => id !== logId)
        : [...prev, logId],
    );
  };

  return (
    <div className="space-y-4 p-4">
      {/* <TimeTrackingHeader userId={userId} projectId={projectId} /> */}

      {/* <ManualTimeEntry /> */}

      <WeeklyTimesheet
        weeklyTimesheet={filteredWeekly}
        isLoading={isLoadingWeekly}
        isError={isErrorWeekly}
        selectedTimeLogIds={selectedTimeLogIds}
        onTimeLogSelection={handleTimeLogSelection}
      />

      <SubmittedTimesheets
        submittedTimesheets={submittedTimesheets}
        isLoading={isLoadingSubmitted}
        isError={isErrorSubmitted}
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <ProjectSummaries projects={projects} />

        <PendingApprovals
          submittedTimesheets={submittedTimesheetsByProject}
          isLoading={isLoadingSubmittedByProject}
          isError={isErrorSubmittedByProject}
          projectId={currentProjectId || ""}
        />
      </div>
    </div>
  );
};

export default TimeSheet;
