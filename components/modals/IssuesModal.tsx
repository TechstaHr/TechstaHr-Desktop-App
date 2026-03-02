// components/IssuesModal.tsx

"use client";

import React, { forwardRef, useImperativeHandle, useState } from "react";
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
import toast from "react-hot-toast";
import { getUserProjects } from "@/lib/actions/project.actions";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useUserStore } from "@/store/userStore";
import { ProjectProps } from "@/types";
import { createIssue } from "@/lib/actions/issues.actions";

export interface IssuesModalRef {
  open: () => void;
  close: () => void;
}

const IssuesModal = forwardRef<IssuesModalRef>((_, ref) => {
  const user = useUserStore((state) => state.user);
  const {
    data: userProject,
    isLoading: projectsLoading,
    error: projectsError,
  } = useQuery({
    queryKey: ["user-projects"],
    queryFn: getUserProjects,
  });

  const projects = userProject?.projects || [];

  const [open, setOpen] = useState(false);
  const [date, setDate] = useState<Date>();
  const [priority, setPriority] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [projectLink, setProjectLink] = useState<ProjectProps | null>(null);
  const [status, setStatus] = useState("");

  useImperativeHandle(ref, () => ({
    open: () => setOpen(true),
    close: () => setOpen(false),
  }));

  const { mutate: createIssueMutate, isPending } = useMutation({
    mutationFn: createIssue,
    onSuccess: () => {
      toast.success("Issue created successfully.");
      setDescription("");
      setProjectLink(null);
      setDate(undefined);
      setPriority("");
      setStatus("");
      setTitle("");
      setOpen(false);
    },
    onError: (error: any) => {
      toast.error(error?.message || "Failed to create issue.");
    },
  });

  const handleSubmit = () => {
    if (!description || !projectLink) {
      toast.error("Please fill in the description and project link.");
      return;
    }

    createIssueMutate({
      projectId: projectLink._id,
      data: {
        title,
        description,
        priority,
        message: status,
        raisedBy: user?._id!,
      },
    });
  };

  if (!user) return;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-h-screen overflow-y-auto lg:min-w-[600px]">
        <DialogHeader>
          <DialogTitle>Log New Issue</DialogTitle>
        </DialogHeader>

        <div>
          <Label>ISSUE TITLE</Label>
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter your ISSUE TITLE"
            className="rounded-sm"
          />
        </div>

        <div>
          <Label>Description</Label>
          <Textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe the issue"
            className="rounded-sm"
          />
        </div>

        <div>
          <Label>Issue Category</Label>
          <Select onValueChange={setStatus}>
            <SelectTrigger className="rounded-sm">
              <SelectValue placeholder="--Status--" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value="design">Design</SelectItem>
                <SelectItem value="development">Development</SelectItem>
                <SelectItem value="done">Done</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-col justify-between gap-2 md:flex-row">
          <div className="w-full sm:w-[48%] md:w-1/4">
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
                <Select
                  onValueChange={(value) =>
                    setDate(addDays(new Date(), parseInt(value)))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Quick select" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">Today</SelectItem>
                    <SelectItem value="1">Tomorrow</SelectItem>
                    <SelectItem value="3">In 3 days</SelectItem>
                    <SelectItem value="7">In a week</SelectItem>
                  </SelectContent>
                </Select>
                <Calendar mode="single" selected={date} onSelect={setDate} />
              </PopoverContent>
            </Popover>
          </div>

          <div className="w-full sm:w-[48%] md:w-1/4">
            <Label>Priority Tag</Label>
            <Select onValueChange={setPriority}>
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
            <Label>Project Name</Label>
            {projectsError && <p>Couldn&apos;t get projects</p>}
            <Select
              onValueChange={(value) => {
                const selectedProject = projects.find((p) => p._id === value);
                if (selectedProject) {
                  setProjectLink(selectedProject);
                }
              }}
            >
              <SelectTrigger className="rounded-sm">
                <SelectValue
                  placeholder={
                    projectsLoading ? "Loading..." : "--Select Project--"
                  }
                />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {projects.length > 0 &&
                    projects.map((item) => (
                      <SelectItem key={item._id} value={item._id}>
                        {item.name}
                      </SelectItem>
                    ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter className="pt-4 sm:justify-start">
          <Button
            onClick={handleSubmit}
            disabled={isPending}
            className="rounded-sm bg-[#4CAF50] text-white"
          >
            {isPending ? "Saving..." : "Create Issue"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
});

IssuesModal.displayName = "IssuesModal";
export default IssuesModal;
