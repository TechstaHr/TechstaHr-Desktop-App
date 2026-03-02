import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ProjectProps } from "@/types";
import CreateModal, { CreateModalRef } from "@/components/modals/CreateModal";
import { useRef, useState } from "react";
import {
  Calendar,
  Users,
  Target,
  MoreVertical,
  Plus,
  Edit3,
  Trash2,
  AlertCircle,
  CheckCircle,
  Clock,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { updateProjectStatus } from "@/lib/actions/project.actions";
import toast from "react-hot-toast";
import { useQueryClient } from "@tanstack/react-query";

export const ProjectHeader = ({
  project,
  onUpdateProgress,
  onDeleteProject,
  onProjectStatusUpdate,
}: {
  project: ProjectProps;
  onUpdateProgress: () => void;
  onDeleteProject: () => void;
  onProjectStatusUpdate?: (updatedProject: ProjectProps) => void;
}) => {
  const modalRef = useRef<CreateModalRef>(null);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const queryClient = useQueryClient();

  const getStatusColor = (progress: number) => {
    if (progress >= 80) return "bg-green-500";
    if (progress >= 50) return "bg-blue-500";
    if (progress >= 25) return "bg-yellow-500";
    return "bg-red-500";
  };

  const getStatusText = (progress: number) => {
    if (progress >= 100) return "Completed";
    if (progress >= 80) return "Near Completion";
    if (progress >= 50) return "In Progress";
    if (progress >= 25) return "Getting Started";
    return "Not Started";
  };

  const handleAddTask = () => {
    modalRef.current?.open();
  };

  const handleStatusUpdate = async (status: string) => {
    if (isUpdatingStatus) return;

    setIsUpdatingStatus(true);
    try {
      const response = await updateProjectStatus(project._id, status);

      if (response) {
        toast.success(
          response.message || `Project status updated to ${status}`,
        );

        // Update the project locally if callback is provided
        if (onProjectStatusUpdate) {
          const updatedProject = {
            ...project,
            status: status,
            progress: status === "completed" ? 100 : project.progress,
          };
          onProjectStatusUpdate(updatedProject);
        }

        queryClient.invalidateQueries({ queryKey: ["project"] });
      }
    } catch (error: any) {
      toast.error(error?.message || "Failed to update project status");
      console.error("Error updating project status:", error);
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const isCompleted = project.status === "completed" || project.progress >= 100;
  const isInProgress =
    project.status === "pending" ||
    (project.progress > 0 && project.progress < 100);

  return (
    <>
      <Card className="mb-5 w-full border-0 border-l-4 bg-white shadow-sm md:mb-10">
        <div className="p-6">
          {/* Header Section */}
          <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div className="min-w-0 flex-1">
              <div className="mb-2 flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <h1 className="truncate pr-4 text-lg font-bold text-gray-900">
                    {project.name}
                  </h1>
                  {isCompleted && (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  )}
                </div>

                {/* Mobile Actions Menu */}
                <div className="flex items-center gap-2 lg:hidden">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56">
                      <DropdownMenuItem onClick={handleAddTask}>
                        <Plus className="mr-2 h-4 w-4" />
                        Add Task
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={onUpdateProgress}>
                        <Edit3 className="mr-2 h-4 w-4" />
                        Update Progress
                      </DropdownMenuItem>

                      <DropdownMenuSeparator />
                      <DropdownMenuLabel className="text-xs font-normal text-gray-500">
                        Project Status
                      </DropdownMenuLabel>

                      {!isCompleted && (
                        <DropdownMenuItem
                          onClick={() => handleStatusUpdate("completed")}
                          disabled={isUpdatingStatus}
                          className="text-green-600 focus:text-green-600"
                        >
                          <CheckCircle className="mr-2 h-4 w-4" />
                          {isUpdatingStatus
                            ? "Updating..."
                            : "Mark as Completed"}
                        </DropdownMenuItem>
                      )}

                      {!isInProgress && !isCompleted && (
                        <DropdownMenuItem
                          onClick={() => handleStatusUpdate("pending")}
                          disabled={isUpdatingStatus}
                          className="text-blue-600 focus:text-blue-600"
                        >
                          <Clock className="mr-2 h-4 w-4" />
                          {isUpdatingStatus
                            ? "Updating..."
                            : "Mark as In Progress"}
                        </DropdownMenuItem>
                      )}

                      {isCompleted && (
                        <DropdownMenuItem
                          onClick={() => handleStatusUpdate("pending")}
                          disabled={isUpdatingStatus}
                          className="text-blue-600 focus:text-blue-600"
                        >
                          <Clock className="mr-2 h-4 w-4" />
                          {isUpdatingStatus ? "Updating..." : "Reopen Project"}
                        </DropdownMenuItem>
                      )}

                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={onDeleteProject}
                        className="text-red-600 focus:text-red-600"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete Project
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>

              <p className="mb-4 line-clamp-2 text-sm leading-relaxed text-gray-600">
                {project.description}
              </p>

              {/* Project Meta Info */}
              <div className="mb-4 flex flex-wrap items-center gap-4 text-sm text-gray-500">
                {project.createdAt && (
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    <span>
                      Started {new Date(project.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                )}
                {project.teamMembers && (
                  <div className="flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    <span>{project.teamMembers.length} members</span>
                  </div>
                )}
                {project.deadline && (
                  <div className="flex items-center gap-1">
                    <Target className="h-4 w-4" />
                    <span>
                      Due {new Date(project.deadline).toLocaleDateString()}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Desktop Actions */}
            <div className="hidden flex-shrink-0 items-center gap-2 lg:flex">
              <Button
                variant="outline"
                size="sm"
                onClick={handleAddTask}
                className="flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Add Task
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={onUpdateProgress}
                className="flex items-center gap-2"
              >
                <Edit3 className="h-4 w-4" />
                Update Progress
              </Button>

              {/* Status Action Button */}
              {!isCompleted ? (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleStatusUpdate("completed")}
                  disabled={isUpdatingStatus}
                  className="flex items-center gap-2 border-green-200 text-green-600 hover:bg-green-50"
                >
                  <CheckCircle className="h-4 w-4" />
                  {isUpdatingStatus ? "Updating..." : "Complete"}
                </Button>
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleStatusUpdate("pending")}
                  disabled={isUpdatingStatus}
                  className="flex items-center gap-2 border-blue-200 text-blue-600 hover:bg-blue-50"
                >
                  <Clock className="h-4 w-4" />
                  {isUpdatingStatus ? "Updating..." : "Reopen"}
                </Button>
              )}

              <Button
                variant="destructive"
                size="sm"
                onClick={onDeleteProject}
                className="flex items-center gap-2"
              >
                <Trash2 className="h-4 w-4" />
                Delete
              </Button>
            </div>
          </div>

          {/* Progress Section */}
          <div className="space-y-3">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-gray-700">
                  Project Progress
                </span>
                <Badge
                  variant="secondary"
                  className={`${getStatusColor(project.progress)} px-2 py-1 text-xs text-white`}
                >
                  {getStatusText(project.progress)}
                </Badge>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold text-gray-900">
                  {project.progress}%
                </span>
                <span className="text-sm text-gray-500">complete</span>
              </div>
            </div>

            <div className="w-full">
              <Progress
                value={project.progress}
                className="h-2 w-full bg-gray-200"
              />
            </div>

            {/* Progress Indicator */}
            {project.progress < 100 && (
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <AlertCircle className="h-3 w-3" />
                <span>{100 - project.progress}% remaining to complete</span>
              </div>
            )}
          </div>

          {/* Mobile Actions - Bottom */}
          <div className="mt-6 flex gap-2 border-t border-gray-100 pt-4 lg:hidden">
            <Button
              variant="outline"
              size="sm"
              onClick={handleAddTask}
              className="flex flex-1 items-center justify-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Add Task
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={onUpdateProgress}
              className="flex flex-1 items-center justify-center gap-2"
            >
              <Edit3 className="h-4 w-4" />
              Update
            </Button>

            {/* Mobile Status Button */}
            {!isCompleted ? (
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleStatusUpdate("completed")}
                disabled={isUpdatingStatus}
                className="flex flex-1 items-center justify-center gap-2 border-green-200 text-green-600"
              >
                <CheckCircle className="h-4 w-4" />
                {isUpdatingStatus ? "Updating..." : "Complete"}
              </Button>
            ) : (
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleStatusUpdate("pending")}
                disabled={isUpdatingStatus}
                className="flex flex-1 items-center justify-center gap-2 border-blue-200 text-blue-600"
              >
                <Clock className="h-4 w-4" />
                {isUpdatingStatus ? "Updating..." : "Reopen"}
              </Button>
            )}
          </div>
        </div>
      </Card>

      <CreateModal ref={modalRef} projectId={project._id} />
    </>
  );
};
