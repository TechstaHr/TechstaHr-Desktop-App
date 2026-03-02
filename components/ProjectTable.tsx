"use client";

import React, { useState, useEffect } from "react";
import { getUserProjects } from "@/lib/actions/project.actions";
import { getScreenshotSettings } from "@/lib/actions/screenshot.actions";
import { clockIn, clockOut } from "@/lib/actions/user.actions";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useTrackingSession } from "@/hooks/use-tracking-session";
import { clearTrackingSession, saveTrackingSession, getClockedInProjects, addClockedInProject, removeClockedInProject } from "@/lib/utils/tracking-session";

import toast from "react-hot-toast";

import CommentForm from "./CommentForm";
import CommentList from "./CommentList";

const statusStyles: Record<string, string> = {
  Completed: "bg-green-100 text-green-800 border border-green-200",
  pending: "bg-blue-100 text-blue-800 border border-blue-200",
  "On hold": "bg-amber-100 text-amber-800 border border-amber-200",
  "In progress": "bg-purple-100 text-purple-800 border border-purple-200",
};

interface Project {
  _id: string;
  name: string;
  status: string;
  team?: { name: string };
  createdBy?: { email: string };
  isClockedIn?: boolean; // Add this if it comes from server
  clockInTime?: string; // Add this if it comes from server
}

interface ProjectRow {
  id: number;
  project: string;
  projectId: string;
  client: string;
  status: string;
  manager: string;
  isClockedIn?: boolean;
  clockInTime?: string;
}

export default function ProjectTable() {
  const queryClient = useQueryClient();
  const { isActive: hasActiveTracking, projectId: activeTrackingProjectId } = useTrackingSession();

  const {
    data: userProjects,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["user-projects"],
    queryFn: getUserProjects,
    staleTime: 5 * 60 * 1000,
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });

  const [refreshComments, setRefreshComments] = useState(0);
  const [clockedInProjects, setClockedInProjects] = useState<Set<string>>(
    new Set(),
  );

  useEffect(() => {
    if (userProjects?.projects) {
      const clockedInFromServer = new Set<string>(
        userProjects.projects
          .filter((proj: Project) => proj.isClockedIn)
          .map((proj: Project) => proj._id)
      );
      setClockedInProjects(clockedInFromServer);
      // Also sync to localStorage
      clockedInFromServer.forEach((pid) => addClockedInProject(pid));
    }
  }, [userProjects]);


  // Load from localStorage on component mount
  useEffect(() => {
    const saved = getClockedInProjects();
    if (saved.length > 0) {
      setClockedInProjects(new Set<string>(saved));
    }
  }, []);



  // Clock In Mutation
  const clockInMutation = useMutation({
    mutationFn: ({
      projectId,
      startTime,
    }: {
      projectId: string;
      startTime: string;
    }) => clockIn(projectId, startTime),
    onSuccess: (data, variables) => {
      toast.success(data?.message || "Successfully clocked in!");
      setClockedInProjects((prev) => {
        const newSet = new Set(prev);
        newSet.add(variables.projectId);
        return newSet;
      });
      addClockedInProject(variables.projectId);
      queryClient.invalidateQueries({ queryKey: ["user-projects"] });
    },
    onError: (error: any, variables) => {
      console.error(
        `Clock in error for project ${variables.projectId}:`,
        error,
      );

      // Check if user is already clocked in
      if (
        error?.message?.toLowerCase().includes("already clocked in") ||
        error?.message?.toLowerCase().includes("already clock") ||
        error?.response?.data?.message?.toLowerCase().includes("already")
      ) {
        // Update local state to reflect server state
        setClockedInProjects((prev) => new Set(prev).add(variables.projectId));
        toast.error("You're already clocked in for this project!");
      } else {
        toast.error(error?.message || "Failed to clock in. Please try again.");
      }
    },
  });

  // Clock Out Mutation
  const clockOutMutation = useMutation({
    mutationFn: (projectId: string) => clockOut(projectId),
    onSuccess: (data, projectId) => {
      toast.success(data?.message || "Successfully clocked out!");
      setClockedInProjects((prev) => {
        const newSet = new Set(prev);
        newSet.delete(projectId);
        return newSet;
      });
      removeClockedInProject(projectId);
      queryClient.invalidateQueries({ queryKey: ["user-projects"] });
    },
    onError: (error: any, projectId) => {
      console.error(`Clock out error for project ${projectId}:`, error);

      // Check if user is not clocked in
      if (
        error?.message?.toLowerCase().includes("not clocked in") ||
        error?.message?.toLowerCase().includes("no active") ||
        error?.response?.data?.message?.toLowerCase().includes("not clocked")
      ) {
        // Update local state to reflect server state
        setClockedInProjects((prev) => {
          const newSet = new Set(prev);
          newSet.delete(projectId);
          return newSet;
        });
        toast.error("You're not currently clocked in for this project!");
      } else {
        toast.error(error?.message || "Failed to clock out. Please try again.");
      }
    },
  });

  const handleClockIn = async (projectId: string) => {
    try {
      const settings = await getScreenshotSettings({ projectId });
      const currentTime = new Date().toISOString();

      // Find project name for session
      const project = userProjects?.projects?.find((p: Project) => p._id === projectId);
      const projectName = project?.name;

      clockInMutation.mutate(
        { projectId, startTime: currentTime },
        {
          onSuccess: (data) => {
            // Save tracking session with project name
            saveTrackingSession({
              projectId,
              projectName,
              startTime: currentTime,
              entryId: data?.entry?._id,
              type: "clock-in",
            });

            if (settings?.settings.enabled) {
              const token = localStorage.getItem("token");
              if ((window as any).electronAPI) {
                (window as any).electronAPI.startAutoScreenshot(
                  settings.settings.intervalMinutes * 60 * 1000,
                  token,
                  projectId,
                );
                toast.success("Auto screenshot started.");
              } else {
                alert(
                  "Electron API not available — are you running in desktop mode?",
                );
              }
            }
          },
        },
      );
    } catch (error) {
      console.error("Failed to get screenshot settings:", error);
      toast.error("Failed to start timer. Could not get screenshot settings.");
    }
  };

  const handleClockOut = (projectId: string) => {
    clockOutMutation.mutate(projectId, {
      onSuccess: () => {
        // Clear tracking session
        clearTrackingSession();

        if ((window as any).electronAPI) {
          (window as any).electronAPI.stopAutoScreenshot();
          toast.success("Auto screenshot stopped.");
        } else {
          alert(
            "Electron API not available — are you running in desktop mode?",
          );
        }
      },
    });
  };

  const isProjectClockedIn = (projectId: string) => {
    return clockedInProjects.has(projectId);
  };

  const isClockActionLoading = (projectId: string) => {
    return (
      (clockInMutation.status === "pending" &&
        clockInMutation.variables?.projectId === projectId) ||
      (clockOutMutation.status === "pending" &&
        clockOutMutation.variables === projectId)
    );
  };

  const rows: ProjectRow[] =
    userProjects?.projects?.map((proj: Project, index: number) => ({
      id: index + 1,
      project: proj.name,
      projectId: proj._id,
      client: proj.team?.name || "N/A",
      status: proj.status || "In progress",
      manager: proj.createdBy?.email || "Unassigned",
      isClockedIn: proj.isClockedIn, // Include server clock status if available
      clockInTime: proj.clockInTime, // Include clock in time if available
    })) || [];

  // Loading State
  if (isLoading) {
    return (
      <div className="w-full py-8">
        <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
          <div className="p-8 text-center">
            <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600"></div>
            <p className="text-gray-600">Loading projects...</p>
          </div>
        </div>
      </div>
    );
  }

  // Error State
  if (isError) {
    return (
      <div className="w-full py-8">
        <div className="rounded-xl border border-red-200 bg-red-50 p-8 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
            <svg
              className="h-6 w-6 text-red-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
          </div>
          <h3 className="mb-2 text-lg font-semibold text-red-800">
            Failed to load projects
          </h3>
          <p className="text-red-600">
            {error instanceof Error
              ? error.message
              : "An unexpected error occurred"}
          </p>
        </div>
      </div>
    );
  }

  // Empty State
  if (!rows || rows.length === 0) {
    return (
      <div className="w-full py-8">
        <div className="rounded-xl border border-gray-200 bg-white p-12 text-center shadow-sm">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
            <svg
              className="h-8 w-8 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
              />
            </svg>
          </div>
          <h3 className="mb-2 text-lg font-semibold text-gray-900">
            No projects found
          </h3>
          <p className="text-gray-600">
            You don't have any projects assigned to you yet.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full py-8">
      <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
        {/* Header */}
        <div className="border-b border-gray-200 px-6 py-4">
          <h2 className="text-lg font-semibold text-gray-900">
            Project Overview
          </h2>
          <p className="mt-1 text-sm text-gray-600">
            Manage your assigned projects and track your time
          </p>
        </div>

        {/* Table Container with Fixed Widths */}
        <div className="hide-scrollbar w-full overflow-x-auto">
          <table className="w-full table-fixed border-collapse">
            <colgroup>
              <col className="w-48 min-w-[192px]" /> {/* Project Name */}
              <col className="w-40 min-w-[160px]" /> {/* Client/Team */}
              <col className="w-32 min-w-[128px]" /> {/* Status */}
              <col className="w-48 min-w-[192px]" /> {/* Manager */}
              <col className="w-36 min-w-[144px]" /> {/* Check In */}
              <col className="w-80 min-w-[320px]" /> {/* Comments */}
            </colgroup>
            <thead>
              <tr className="bg-gray-50">
                <th className="border-b border-gray-200 px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-700">
                  Project Name
                </th>
                <th className="border-b border-gray-200 px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-700">
                  Client / Team
                </th>
                <th className="border-b border-gray-200 px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-700">
                  Status
                </th>
                <th className="border-b border-gray-200 px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-700">
                  Manager
                </th>
                <th className="border-b border-gray-200 px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-700">
                  Time Tracking
                </th>
                <th className="border-b border-gray-200 px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-700">
                  Comments
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {rows.map((row, index) => (
                <tr
                  key={row.id}
                  className={`transition-colors hover:bg-gray-50 ${index % 2 === 0 ? "bg-white" : "bg-gray-50/30"}`}
                >
                  {/* Project Name */}
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100">
                          <svg
                            className="h-4 w-4 text-blue-600"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                            />
                          </svg>
                        </div>
                      </div>
                      <div className="ml-3 min-w-0 flex-1">
                        <p
                          className="truncate text-sm font-medium text-gray-900"
                          title={row.project}
                        >
                          {row.project}
                        </p>
                      </div>
                    </div>
                  </td>

                  {/* Client/Team */}
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-green-100">
                          <svg
                            className="h-3 w-3 text-green-600"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                            />
                          </svg>
                        </div>
                      </div>
                      <div className="ml-2 min-w-0 flex-1">
                        <p
                          className="truncate text-sm text-gray-900"
                          title={row.client}
                        >
                          {row.client}
                        </p>
                      </div>
                    </div>
                  </td>

                  {/* Status */}
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${statusStyles[row.status] ||
                        "border border-gray-200 bg-gray-100 text-gray-800"
                        }`}
                    >
                      {row.status}
                    </span>
                  </td>

                  {/* Manager */}
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gray-200">
                          <svg
                            className="h-3 w-3 text-gray-600"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                            />
                          </svg>
                        </div>
                      </div>
                      <div className="ml-2 min-w-0 flex-1">
                        <p
                          className="truncate text-sm text-gray-900"
                          title={row.manager}
                        >
                          {row.manager === "Unassigned" ? (
                            <span className="italic text-gray-500">
                              Unassigned
                            </span>
                          ) : (
                            row.manager
                          )}
                        </p>
                      </div>
                    </div>
                  </td>

                  {/* Time Tracking */}
                  <td className="px-6 py-4">
                    <div className="flex flex-col space-y-3">
                      {/* Clock Button */}
                      {/* Show Clock Out only for the project that is actively being tracked */}
                      {activeTrackingProjectId === row.projectId || isProjectClockedIn(row.projectId) ? (
                        <button
                          onClick={() => handleClockOut(row.projectId)}
                          disabled={isClockActionLoading(row.projectId)}
                          className="group flex items-center justify-center rounded-lg bg-red-600 px-3 py-2 text-xs font-medium text-white shadow-sm transition-all hover:bg-red-700 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-red-600"
                          aria-label={`Clock out from ${row.project}`}
                        >
                          {isClockActionLoading(row.projectId) ? (
                            <>
                              <div className="mr-2 h-3 w-3 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                              <span>Clocking...</span>
                            </>
                          ) : (
                            <>
                              <svg
                                className="mr-2 h-3 w-3"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                                />
                              </svg>
                              <span>Clock Out</span>
                            </>
                          )}
                        </button>
                      ) : (
                        <button
                          onClick={() => handleClockIn(row.projectId)}
                          disabled={isClockActionLoading(row.projectId) || hasActiveTracking}
                          className="group flex items-center justify-center rounded-lg bg-green-600 px-3 py-2 text-xs font-medium text-white shadow-sm transition-all hover:bg-green-700 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-green-600"
                          aria-label={`Clock in to ${row.project}`}
                        >
                          {isClockActionLoading(row.projectId) ? (
                            <>
                              <div className="mr-2 h-3 w-3 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                              <span>Clocking...</span>
                            </>
                          ) : (
                            <>
                              <svg
                                className="mr-2 h-3 w-3"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                                />
                              </svg>
                              <span>Clock In</span>
                            </>
                          )}
                        </button>
                      )}

                      {/* Status Indicator */}
                      <div className="flex items-center justify-center space-x-2">
                        {activeTrackingProjectId === row.projectId || isProjectClockedIn(row.projectId) ? (
                          <>
                            <div className="relative flex h-2 w-2">
                              <div className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75"></div>
                              <div className="relative inline-flex h-2 w-2 rounded-full bg-green-500"></div>
                            </div>
                            <span className="text-xs font-medium text-green-700">
                              Active
                            </span>
                          </>
                        ) : (
                          <>
                            <div className="h-2 w-2 rounded-full bg-gray-300"></div>
                            <span className="text-xs text-gray-500">
                              Inactive
                            </span>
                          </>
                        )}
                      </div>

                      {/* Show clock in time if available */}
                      {(activeTrackingProjectId === row.projectId || isProjectClockedIn(row.projectId)) && row.clockInTime && (
                        <div className="text-xs text-gray-500">
                          Since:{" "}
                          {new Date(row.clockInTime).toLocaleTimeString()}
                        </div>
                      )}
                    </div>
                  </td>

                  {/* Comments */}
                  <td className="px-6 py-4">
                    <div className="space-y-3">
                      <CommentList
                        projectId={row.projectId}
                        key={`${row.projectId}-${refreshComments}`}
                      />
                      <CommentForm
                        projectId={row.projectId}
                        rowId={row.id}
                        onCommentAdded={() =>
                          setRefreshComments((prev) => prev + 1)
                        }
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 bg-gray-50 px-6 py-3">
          <div className="flex items-center justify-between text-sm text-gray-700">
            <span>
              Showing {rows.length} project{rows.length !== 1 ? "s" : ""}
            </span>
            <span className="text-xs text-gray-500">
              Last updated: {new Date().toLocaleString()}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
