// components/CreateModal.tsx

"use client";

import React, {
  forwardRef,
  useImperativeHandle,
  useState,
  useEffect,
} from "react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "../ui/textarea";
import { Label } from "../ui/label";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { addDays, format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { createTask, updateTask } from "@/lib/actions/tasks.actions";
import toast from "react-hot-toast";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getUserProjects } from "@/lib/actions/project.actions";

export interface CreateModalRef {
  open: (task?: any) => void;
  close: () => void;
}

interface CreateModalProps {
  projectId?: string; // Optional project ID prop
}

const CreateModal = forwardRef<CreateModalRef, CreateModalProps>(
  ({ projectId }, ref) => {
    const queryClient = useQueryClient();
    const [open, setOpen] = useState(false);
    const [mode, setMode] = useState<"create" | "edit">("create");
    const [taskId, setTaskId] = useState<string>("");
    const [date, setDate] = useState<Date>();
    const [priority, setPriority] = useState("");
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [projectLink, setProjectLink] = useState("");
    const [status, setStatus] = useState("to_do");
    const [selectedProjectId, setSelectedProjectId] = useState("");
    const [loading, setLoading] = useState(false);

    // Set the project ID when provided via props
    useEffect(() => {
      if (projectId) {
        setSelectedProjectId(projectId);
      }
    }, [projectId]);

    useImperativeHandle(ref, () => ({
      open: (task?: any) => {
        if (task) {
          // Edit mode
          setMode("edit");
          setTaskId(task._id);
          setTitle(task.title);
          setDescription(task.description);
          setProjectLink(task.task_link);
          setPriority(task.priority_tag);
          setStatus(task.status);
          setSelectedProjectId(task.project?._id || projectId || "");
          setDate(new Date(task.deadline));
        } else {
          // Create mode
          setMode("create");
          resetForm();
        }
        setOpen(true);
      },
      close: () => setOpen(false),
    }));

    const resetForm = () => {
      setTaskId("");
      setTitle("");
      setDescription("");
      setProjectLink("");
      setPriority("");
      setStatus("to_do");
      // Keep projectId if provided via props, otherwise reset
      setSelectedProjectId(projectId || "");
      setDate(undefined);
    };

    // Only fetch projects if no projectId is provided
    const {
      data: userProject,
      isLoading: projectsLoading,
      error: projectsError,
    } = useQuery({
      queryKey: ["user-projects"],
      queryFn: getUserProjects,
      enabled: !projectId, // Only fetch if projectId is not provided
    });

    const projects = userProject?.projects || [];

    const handleSubmit = async () => {
      if (
        !title ||
        !description ||
        !projectLink ||
        !priority ||
        !date ||
        !status ||
        !selectedProjectId
      ) {
        toast.error("Please fill in all fields before submitting.");
        return;
      }

      setLoading(true);

      try {
        const taskData = {
          title,
          description,
          deadline: date.toISOString(),
          priority_tag: priority,
          task_link: projectLink,
          status,
          project: selectedProjectId,
        };

        if (mode === "edit") {
          const response = await updateTask(taskId, taskData);
          toast.success(response?.message || "Task updated successfully.");
          queryClient.invalidateQueries({ queryKey: ["all-tasks"] });
          // Invalidate project-specific queries if we have a projectId
          if (projectId) {
            queryClient.invalidateQueries({ queryKey: ["project", projectId] });
          }
        } else {
          const response = await createTask(taskData);
          toast.success(response?.message || "Task created successfully.");
          queryClient.invalidateQueries({ queryKey: ["all-tasks"] });
          // Invalidate project-specific queries if we have a projectId
          if (projectId) {
            queryClient.invalidateQueries({ queryKey: ["project", projectId] });
          }
        }

        setOpen(false);
        resetForm();
      } catch (error: any) {
        console.error("Failed to save task:", error);
        toast.error(
          error.message || `Failed to ${mode} task. Please try again.`,
        );
      } finally {
        setLoading(false);
      }
    };

    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-screen overflow-y-auto lg:min-w-[600px]">
          <DialogHeader>
            <DialogTitle>
              {mode === "edit" ? "Edit Task" : "Create Task"}
              {projectId && (
                <span className="ml-2 text-sm font-normal text-muted-foreground">
                  for this project
                </span>
              )}
            </DialogTitle>
          </DialogHeader>

          <div>
            <Label>To Do</Label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter your To Do"
              className="rounded-sm"
            />
          </div>

          {/* Only show project selection if no projectId is provided */}
          {!projectId && (
            <div>
              <Label>What project is the task for?</Label>
              {projectsError && <p>Couldn&apos;t get projects</p>}
              <Select
                onValueChange={setSelectedProjectId}
                value={selectedProjectId}
              >
                <SelectTrigger className="rounded-sm">
                  <SelectValue
                    placeholder={
                      projectsLoading ? "Loading..." : "--Select Project--"
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  {projects?.length > 0 &&
                    projects.map((item) => (
                      <SelectItem key={item._id} value={item._id}>
                        {item.name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div>
            <Label>Status</Label>
            <Select onValueChange={setStatus} value={status}>
              <SelectTrigger className="rounded-sm">
                <SelectValue placeholder="--Status--" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value="to_do">To do</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="done">Done</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Description</Label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the task"
            />
          </div>

          <div className="flex flex-col justify-between gap-2 md:flex-row">
            <div className="w-full md:w-1/4">
              <Label>Deadline</Label>
              <Popover modal={true}>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-full justify-start overflow-hidden rounded-sm text-left text-sm font-normal",
                      !date && "text-sm text-muted-foreground",
                    )}
                  >
                    <CalendarIcon className="h-4 w-2" />
                    {date ? (
                      format(date, "MMMM d")
                    ) : (
                      <span className="text-sm">Pick date</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent align="start" className="w-auto p-2" style={{ zIndex: 9999 }} sideOffset={5}>
                  <div className="space-y-2">
                    <Select
                      onValueChange={(value) =>
                        setDate(addDays(new Date(), parseInt(value)))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Quick select" />
                      </SelectTrigger>
                      <SelectContent position="popper" style={{ zIndex: 10000 }} sideOffset={5}>
                        <SelectItem value="0">Today</SelectItem>
                        <SelectItem value="1">Tomorrow</SelectItem>
                        <SelectItem value="3">In 3 days</SelectItem>
                        <SelectItem value="7">In a week</SelectItem>
                      </SelectContent>
                    </Select>
                    <Calendar mode="single" selected={date} onSelect={setDate} />
                  </div>
                </PopoverContent>
              </Popover>
            </div>

            <div className="w-full md:w-1/4">
              <Label>Priority Tag</Label>
              <Select onValueChange={setPriority} value={priority}>
                <SelectTrigger className="rounded-sm">
                  <SelectValue placeholder="--Priority--" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
            <div className="w-full md:w-1/2">
              <Label>Task Link</Label>
              <Input
                value={projectLink}
                onChange={(e) => setProjectLink(e.target.value)}
                placeholder="https://"
                className="rounded-sm"
              />
            </div>
          </div>

          <DialogFooter className="pt-4 sm:justify-start">
            <Button
              onClick={handleSubmit}
              disabled={loading}
              className="rounded-sm bg-[#4CAF50] text-white"
            >
              {loading
                ? mode === "edit"
                  ? "Updating..."
                  : "Creating..."
                : mode === "edit"
                  ? "Update Task"
                  : "Add Task"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  },
);

CreateModal.displayName = "CreateModal";
export default CreateModal;
