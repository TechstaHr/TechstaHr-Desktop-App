"use client";

import {
  assignTeamMembers,
  deleteProject,
  getAssignedTeamMembersToProject,
  getProjectById,
  removeTeamMember,
  updateProjectProgress,
} from "@/lib/actions/project.actions";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { _user, Columns, ColumnType, TaskProps } from "@/types";
import KanbanBoard from "@/components/KanbanBoard";
import toast from "react-hot-toast";
import { getAllUsers } from "@/lib/actions/user.actions";
import { getComments } from "@/lib/actions/comment.actions";
import { ProjectHeader } from "@/components/project/ProjectHeader";
import { IssuesSection } from "@/components/project/IssuesSection";
import { TeamMembersSection } from "@/components/project/TeamMembersSection";
import { ProgressDialog } from "@/components/project/ProgressDialog";
import { CommentsSection } from "@/components/project/CommentsSection";

const ProjectDetail = () => {
  const router = useRouter();
  const [projectId, setProjectId] = useState<string | null>(null);
  const queryClient = useQueryClient();

  // Get project ID from localStorage on component mount
  useEffect(() => {
    const storedProjectId = localStorage.getItem('currentProjectId');
    if (!storedProjectId) {
      // Redirect to project management page if no ID is stored
      router.push('/admin/project-management');
      return;
    }
    setProjectId(storedProjectId);
  }, [router]);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["project", projectId],
    queryFn: () => getProjectById(projectId!),
    enabled: !!projectId, // Only run query when projectId is available
  });

  const { data: allUsers } = useQuery({
    queryKey: ["allUsers"],
    queryFn: getAllUsers,
  });

  const { data: assignedTeamMembers } = useQuery({
    queryKey: ["assignedTeamMembers", projectId],
    queryFn: () => getAssignedTeamMembersToProject(projectId!),
    enabled: !!projectId,
  });

  const { data: projectComments } = useQuery({
    queryKey: ["projectComments", projectId],
    queryFn: () => getComments(projectId!),
    enabled: !!projectId,
  });

  const [columns, setColumns] = useState<Columns>({
    to_do: [],
    in_progress: [],
    done: [],
  });
  const [showProgressDialog, setShowProgressDialog] = useState(false);
  const [isAssigning, setIsAssigning] = useState(false);
  const [progress, setProgress] = useState<number>(0);
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);

  // Filter users
  const assignedIds = assignedTeamMembers?.teamMembers?.map((m) => m._id) || [];
  const availableUsers = allUsers?.users?.filter(
    (user) => !assignedIds.includes(user._id),
  );

  const handleAssign = async () => {
    if (!projectId) return;
    
    try {
      setIsAssigning(true);
      const res = await assignTeamMembers(projectId, selectedMembers);
      toast.success(res?.message);
      setSelectedMembers([]);
      queryClient.invalidateQueries({ queryKey: ["assignedTeamMembers"] });
    } catch (error: any) {
      toast.error(error?.message || "Failed to assign team members");
    } finally {
      setIsAssigning(false);
    }
  };

  const handleRemove = async () => {
    if (!projectId) return;
    
    try {
      setIsAssigning(true);
      const res = await removeTeamMember(projectId, selectedMembers[0]);
      toast.success(res?.message);
      setSelectedMembers([]);
      queryClient.invalidateQueries({ queryKey: ["assignedTeamMembers"] });
    } catch (error: any) {
      toast.error(error?.message || "Failed to assign team members");
    } finally {
      setIsAssigning(false);
    }
  };

  const updateProgress = async () => {
    if (!projectId) return;
    
    try {
      const res = await updateProjectProgress(projectId, progress);
      setShowProgressDialog(false);
      toast.success(res?.message);
      queryClient.invalidateQueries({ queryKey: ["project"] });
    } catch (error) {
      console.log(error);
      toast.error("Failed to update progress");
    }
  };

  const handleDeleteProject = async () => {
    if (!projectId) return;
    
    const confirm = window.confirm(
      "Are you sure you want to delete this project?",
    );
    if (!confirm) return;

    try {
      const res = await deleteProject(projectId);
      toast.success(res?.message);
      queryClient.invalidateQueries({ queryKey: ["all-projects"] });
      // Clear the stored project ID and redirect
      localStorage.removeItem('currentProjectId');
      router.push('/admin/project-management');
    } catch (error: any) {
      console.error(error);
      toast.error(error?.message || "Failed to delete project");
    }
  };

  // Update progress when data is loaded
  useEffect(() => {
    if (data?.progress !== undefined) {
      setProgress(data.progress);
    }
  }, [data?.progress]);

  useEffect(() => {
    if (!data?.tasks) return;

    const transformed: Columns = {
      to_do: [],
      in_progress: [],
      done: [],
    };

    data.tasks.forEach((task: TaskProps) => {
      // Normalize the status to match your ColumnType
      let status: ColumnType;

      // Handle different possible status formats
      const normalizedStatus = task.status.toLowerCase().replace(/\s+/g, "_");

      if (normalizedStatus === "to_do" || normalizedStatus === "todo") {
        status = "to_do";
      } else if (
        normalizedStatus === "in_progress" ||
        normalizedStatus === "inprogress"
      ) {
        status = "in_progress";
      } else if (normalizedStatus === "done") {
        status = "done";
      } else {
        console.warn(
          `Unknown task status: ${task.status} - defaulting to 'to_do'`,
        );
        status = "to_do";
      }

      transformed[status].push({
        id: task._id,
        title: task.title,
        description: task.description,
        tag: task.priority_tag,
        due: new Date(task.deadline).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        }),
        owner: task.owner?.full_name,
        tagColor:
          task.priority_tag === "high"
            ? "red"
            : task.priority_tag === "medium"
              ? "yellow"
              : "green",
        blocked: false,
        enableScreenshot: task.enableScreenshot || false,
        screenshotIntervalMinutes: task.screenshotIntervalMinutes || 0,
      });
    });

    setColumns(transformed);
  }, [data]);

  // Show loading while getting project ID from localStorage
  if (!projectId) {
    return <div className="mx-auto w-full p-4">Loading...</div>;
  }

  if (isLoading)
    return <div className="mx-auto w-full p-4">Loading project details...</div>;
  if (isError) return <div>Failed to load project details.</div>;

  return (
    <div className="px-4 py-6">
      <h1 className="mb-6 text-2xl font-bold">Project Management</h1>
      <ProjectHeader
        project={data}
        onUpdateProgress={() => setShowProgressDialog(true)}
        onDeleteProject={handleDeleteProject}
      />

      <KanbanBoard columns={columns} setColumns={setColumns} />

      {/* Blockers */}
      <IssuesSection issues={data?.issues || []} />

      {/* Add Team members */}
      <TeamMembersSection
        title="Add more team members to project"
        users={availableUsers || []}
        selectedMembers={selectedMembers}
        onSelect={(userId) =>
          setSelectedMembers((prev) =>
            prev.includes(userId)
              ? prev.filter((id) => id !== userId)
              : [...prev, userId],
          )
        }
        buttonText={isAssigning ? "Assigning..." : "Assign"}
        onButtonClick={handleAssign}
        disabled={isAssigning || selectedMembers.length === 0}
      />

      {/* Currently assigned Team members */}
      <TeamMembersSection
        title="Currently assigned team members"
        users={assignedTeamMembers?.teamMembers || []}
        selectedMembers={selectedMembers}
        onSelect={(userId) => setSelectedMembers([userId])}
        buttonText={isAssigning ? "Removing..." : "Remove"}
        onButtonClick={handleRemove}
        disabled={isAssigning || selectedMembers.length === 0}
      />

      {/* Comments on this project */}
      <CommentsSection
        projectId={projectId}
        comments={projectComments?.comments || []}
        selectedMembers={selectedMembers}
        onSelect={(userId) => setSelectedMembers([userId])}
        onRemove={handleRemove}
        isAssigning={isAssigning}
      />

      {showProgressDialog && (
        <ProgressDialog
          progress={progress}
          setProgress={setProgress}
          onSave={updateProgress}
          onCancel={() => setShowProgressDialog(false)}
        />
      )}
    </div>
  );
};

export default ProjectDetail;