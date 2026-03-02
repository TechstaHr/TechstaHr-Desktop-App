"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "react-hot-toast";
import {
  getAllProjects,
  assignTeamMembers,
  removeTeamMember,
} from "@/lib/actions/project.actions";
import { getAllUsers } from "@/lib/actions/user.actions";
import { _user, SelectOption } from "@/types";
import { Label } from "@/components/ui/label";
import Select from "react-select";

const ProjectModification = () => {
  const [selectedProject, setSelectedProject] = useState<any>(null);
  const [selectedMembers, setSelectedMembers] = useState<SelectOption[]>([]);

  const queryClient = useQueryClient();

  // All projects
  const {
    data: projects,
    isLoading: isLoadingProjects,
    isError: isErrorProjects,
  } = useQuery({ queryKey: ["all-projects"], queryFn: getAllProjects });

  const { data, isLoading, isError } = useQuery({
    queryKey: ["allUsers"],
    queryFn: getAllUsers,
  });

  const teamOptions =
    data?.users
      .filter((user: _user) => user.role === "team")
      .map((user: _user) => ({
        ...user,
        label:
          user.full_name ||
          `${user.first_name ?? ""} ${user.last_name ?? ""}`.trim() ||
          user.email,
        value: user._id,
      })) || [];

  // Assign member to selected project
  const assignMutation = useMutation({
    mutationFn: ({
      projectId,
      memberId,
    }: {
      projectId: string;
      memberId: string[];
    }) => assignTeamMembers(projectId, memberId),
    onSuccess: () => {
      toast.success("Member assigned!");
      queryClient.invalidateQueries({ queryKey: ["all-projects"] });
    },
    onError: () => toast.error("Failed to assign member."),
  });

  // Remove member from selected project
  const removeMutation = useMutation({
    mutationFn: ({
      projectId,
      memberId,
    }: {
      projectId: string;
      memberId: string;
    }) => removeTeamMember(projectId, memberId),
    onSuccess: () => {
      toast.success("Member removed!");
      queryClient.invalidateQueries({ queryKey: ["all-projects"] });
    },
    onError: () => toast.error("Failed to remove member."),
  });

  return (
    <div className="space-y-6">
      {/* ==================== SECTION 2: Project Modifications ==================== */}
      <Card>
        <CardHeader>
          <CardTitle>Project Team Management</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {isLoadingProjects ? (
            <p className="text-muted-foreground">Loading projects...</p>
          ) : isErrorProjects ? (
            <p className="text-red-500">Failed to load projects.</p>
          ) : projects?.length === 0 ? (
            <p className="text-muted-foreground">No projects available.</p>
          ) : (
            <div className="grid grid-cols-1 space-y-2 gap-2 md:grid-cols-2 lg:grid-cols-3">
              {projects.map((project: any) => (
                <div
                  key={project._id}
                  onClick={() => setSelectedProject(project)}
                  className={`cursor-pointer rounded border p-3 ${
                    selectedProject?._id === project._id
                      ? "bg-gray-100"
                      : "hover:bg-gray-50"
                  }`}
                >
                  <p className="font-medium">{project.name}</p>
                  <p className="text-xs text-gray-500">
                    Deadline:{" "}
                    {project.deadline
                      ? new Date(project.deadline).toLocaleDateString()
                      : "N/A"}
                  </p>
                </div>
              ))}
            </div>
          )}

          {selectedProject && (
            <div className="space-y-3 rounded border-t pt-4">
              <p className="font-semibold">Assigned Team Members:</p>
              <div className="grid grid-cols-1 gap-2 md:grid-cols-2 lg:grid-cols-3">
                {selectedProject?.teamMembers?.length > 0 ? (
                  selectedProject?.teamMembers.map((member: any) => (
                    <div
                      key={member._id}
                      className="flex items-center justify-between rounded border p-2"
                    >
                      <span className="text-sm">{member?.user}</span>
                      <Button
                        size="sm"
                        variant="destructive"
                        disabled={removeMutation.status === "pending"}
                        onClick={() =>
                          removeMutation.mutate({
                            projectId: selectedProject._id,
                            memberId: member._id,
                          })
                        }
                      >
                        Remove
                      </Button>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">
                    No team members assigned.
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label>Team Members</Label>
                <Select
                  isMulti
                  options={teamOptions}
                  value={selectedMembers}
                  onChange={(selected) =>
                    setSelectedMembers(selected as SelectOption[])
                  }
                  getOptionLabel={(option) => option.label}
                  getOptionValue={(option) => option._id}
                  className="my-1"
                  classNamePrefix="select"
                  placeholder="Select team members (admins cannot be selected)"
                  isLoading={isLoading}
                />
                {isError && (
                  <p className="text-sm text-red-500">
                    Error getting team members
                  </p>
                )}
                <Button
                  size="sm"
                  variant={"outline"}
                  className="rounded-sm"
                  disabled={
                    assignMutation.status === "pending" ||
                    selectedMembers.length === 0
                  }
                  onClick={() => {
                    const memberIds = selectedMembers.map((m) => m._id);
                    assignMutation.mutate({
                      projectId: selectedProject._id,
                      memberId: memberIds,
                    });
                    setSelectedMembers([]);
                  }}
                >
                  Add Selected Members
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ProjectModification;
