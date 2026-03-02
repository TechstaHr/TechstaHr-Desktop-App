"use client";

// app/dashboard/AdminDashboard.tsx
import React, { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import PerformanceChart from "@/components/charts/PerformanceChart";
import { useQuery } from "@tanstack/react-query";
import {
  getAllProjects,
  getAssignedTeamMembers,
} from "@/lib/actions/project.actions";
import { ProjectProps, TeamMemberProps } from "@/types";
import { useRouter } from "next/navigation";
import { getWorkloads } from "@/lib/actions/workload.actions";
import Link from "next/link";

const AdminDashboard = () => {
  const navigate = useRouter();

  const {
    data: projects,
    isLoading,
    isError,
  } = useQuery<ProjectProps[]>({
    queryKey: ["all-projects"],
    queryFn: getAllProjects, // Use getUserProjects to fetch projects for the logged-in user
  });

  const {
    data: teamMember,
    isLoading: isTeamLoading,
    isError: isTeamError,
  } = useQuery<TeamMemberProps>({
    queryKey: ["assigned-team-members"],
    queryFn: getAssignedTeamMembers,
  });

  const teamMembers = teamMember?.teamMembers || [];

  const activeCount =
    projects?.filter((p) => p.status === "active").length ?? 0;
  const pendingCount =
    projects?.filter((p) => p.status === "pending").length ?? 0;
  const completedCount =
    projects?.filter((p) => p.status === "completed").length ?? 0;

  const handleRowClick = (id: string) => {
    // Save project ID to localStorage and navigate to details page
    localStorage.setItem('currentProjectId', id);
    navigate.push(`/admin/project-management/details`);
  };

  const { data: workloadData } = useQuery({
    queryKey: ["workloads"],
    queryFn: getWorkloads,
  });

  const overloaded = useMemo(() => {
    const summary = workloadData?.summary || {};
    const entries = Object.entries(summary).map(([userId, s]: any) => ({
      userId,
      totalPoints: s.totalPoints || 0,
      tasks: s.tasks || 0,
    }));
    return entries.sort((a, b) => b.totalPoints - a.totalPoints).slice(0, 5);
  }, [workloadData]);

  return (
    <div className="grid items-start gap-6 px-4 py-6 md:grid-cols-3">
      {/* Project Table */}
      <Card className="md:col-span-2">
        <CardHeader className="m-0 p-0">
          <CardTitle></CardTitle>
        </CardHeader>
        <CardContent className="m-0 p-0">
          <table className="w-full table-fixed text-sm">
            <thead>
              <tr>
                <th className="border-b border-dashed border-gray-300 px-4 py-5 text-left">
                  Project
                </th>
                <th className="border-b border-l border-r border-dashed border-gray-300 px-4 py-5 text-left">
                  Assigned Team
                </th>
                <th className="border-b border-dashed border-gray-300 px-4 py-5">
                  Issues
                </th>
              </tr>
            </thead>

            <tbody>
              {isLoading && (
                <tr>
                  <td colSpan={3} className="p-4 text-center">
                    Loading...
                  </td>
                </tr>
              )}

              {isError && (
                <tr>
                  <td colSpan={3} className="p-4 text-center text-red-500">
                    Failed to load projects.
                  </td>
                </tr>
              )}

              {!isLoading &&
                !isError &&
                (!projects || projects.length === 0) && (
                  <tr>
                    <td colSpan={3} className="p-4 text-center text-gray-500">
                      No projects found. Create a new project to get started.
                    </td>
                  </tr>
                )}

              {!isLoading &&
                !isError &&
                projects &&
                projects?.length > 0 &&
                projects?.map((project) => (
                  <tr
                    key={project._id}
                    onClick={() => handleRowClick(project._id)}
                    className="cursor-pointer"
                  >
                    <td className="border-t border-dashed border-gray-300 p-4">
                      <p className="text-sm font-semibold text-gray-800">
                        {project.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {project.description}
                      </p>
                    </td>

                    <td className="border-l border-r border-t border-dashed border-gray-300 p-4">
                      <div className="flex items-center justify-between gap-2 rounded-full bg-green-200 pr-0.5">
                        <div className="flex items-center rounded-full bg-green-600">
                          <div className="flex -space-x-2">
                            {project?.teamMembers.length ? (
                              project?.teamMembers.map((member) => (
                                <Avatar
                                  key={member._id}
                                  className="h-8 w-8 capitalize"
                                >
                                  <AvatarImage
                                    src={
                                      member?.user?.avatar ||
                                      "/images/default-avatar.png"
                                    }
                                  />
                                  <AvatarFallback>
                                    {member?.user?.email
                                      ?.split(" ")
                                      .map((n) => n[0])
                                      .join("")}
                                  </AvatarFallback>
                                </Avatar>
                              ))
                            ) : (
                              <span className="px-2 text-xs text-white">
                                No Team
                              </span>
                            )}
                          </div>
                          <Badge variant="secondary" className="bg-transparent">
                            {new Date(project.deadline).toLocaleDateString()}
                          </Badge>
                        </div>
                        <Badge
                          variant="outline"
                          className="flex h-6 w-8 items-center justify-center rounded-full bg-white text-[10px]"
                        >
                          {project.progress}%
                        </Badge>
                      </div>
                    </td>

                    <td className="border-t border-dashed border-gray-300 p-4 text-center">
                      {project.issues.length > 0
                        ? `${project.issues.length} issue(s)`
                        : "None"}
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </CardContent>
      </Card>

      {/* Project Status */}
      <Card>
        <CardHeader>
          <CardTitle>Project Status</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex justify-between font-semibold text-[#333333]">
            <span>Active</span>
            <span>{activeCount}</span>
          </div>
          <div className="flex justify-between font-semibold text-[#333333]">
            <span>In Progress</span>
            <span>{pendingCount}</span>
          </div>
          <div className="flex justify-between font-semibold text-[#333333]">
            <span>On Hold</span>
            <span>{pendingCount}</span>
          </div>
          <div className="flex justify-between font-semibold text-[#333333]">
            <span>Completed</span>
            <span>{completedCount}</span>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-6 md:col-span-2">
        {/* Performance Graph */}
        <PerformanceChart />

        {/* Milestones & Deadlines */}
        <Card className="md:col-span-3">
          <CardHeader>
            <CardTitle>Milestones & Deadlines</CardTitle>
          </CardHeader>
          <CardContent>
            <Progress value={60} className="h-4" />
          </CardContent>
        </Card>
      </div>

      {/* Team Members */}
      <Card>
        <CardHeader className="mb-2">
          <CardTitle>Assigned Team Members</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {isTeamLoading ? (
            <p className="text-sm text-muted-foreground">
              Loading team members...
            </p>
          ) : isTeamError ? (
            <p className="text-sm text-red-500">Failed to load team members.</p>
          ) : !teamMembers || teamMembers.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No team members assigned yet.
            </p>
          ) : (
            teamMembers.map((member) => (
              <div key={member._id} className="flex items-center gap-3">
                <Avatar>
                  <AvatarImage
                    src={member?.avatar || "/images/default-avatar.png"}
                  />
                  <AvatarFallback>
                    {member?.email
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium leading-none">
                    {member?.full_name || member?.email}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Role: {member.role}
                  </p>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="mb-2">
          <CardTitle>Top Workloads</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {overloaded.length === 0 ? (
            <p className="text-sm text-muted-foreground">No workload data</p>
          ) : (
            overloaded.map((o) => (
              <div key={o.userId} className="flex items-center justify-between">
                <span className="text-sm">{o.userId}</span>
                <span className="text-sm text-muted-foreground">{o.tasks} tasks • {o.totalPoints} pts</span>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="mb-2">
          <CardTitle>Payroll</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Link href="/admin/reporting-payroll" className="text-sm text-green-600">
            Go to Reporting & Payroll
          </Link>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminDashboard;
