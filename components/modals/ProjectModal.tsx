// components/ProjectModal.tsx

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
import Select from "react-select";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import toast from "react-hot-toast";
import { createProject } from "@/lib/actions/project.actions";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getAllUsers } from "@/lib/actions/user.actions";
import { _user, SelectOption } from "@/types";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { addDays, format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Select as ShadSelect,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export interface ProjectModalRef {
  open: () => void;
  close: () => void;
}

const ProjectModal = forwardRef<ProjectModalRef>((_, ref) => {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [selectedMembers, setSelectedMembers] = useState<SelectOption[]>([]);
  const [date, setDate] = useState<Date>();

  const queryClient = useQueryClient();

  const { data, isLoading, isError } = useQuery({
    queryKey: ["allUsers"],
    queryFn: getAllUsers,
  });

  useImperativeHandle(ref, () => ({
    open: () => setOpen(true),
    close: () => setOpen(false),
  }));

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

  const { mutate, isPending } = useMutation({
    mutationFn: createProject,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["all-projects"] });
      toast.success("Project created successfully.");
      setTitle("");
      setDescription("");
      setDate(undefined);
      setSelectedMembers([]);
      setOpen(false);
    },
    onError: (error: any) => {
      console.error("Failed to create project:", error);
      toast.error(error.message || "Failed to create project.");
    },
  });

  const handleSubmit = () => {
    if (!title || !description || selectedMembers.length === 0 || !date) {
      toast.error("Please fill in all fields.");
      return;
    }

    mutate({
      name: title,
      description,
      deadline: date.toISOString(),
      teamMembers: selectedMembers.map((member) => member._id),
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-h-screen overflow-y-auto lg:min-w-[600px]">
        <DialogHeader>
          <DialogTitle>Create a Project</DialogTitle>
        </DialogHeader>

        <div>
          <Label>Project Name</Label>
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter your project name"
            className="rounded-sm bg-white"
          />
        </div>

        <div>
          <Label>Description</Label>
          <Textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe the project"
            className="rounded-sm bg-white"
          />
        </div>

        <div>
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
            placeholder="Select team members(admins can not be selected)"
            isLoading={isLoading}
          />
          {isError && (
            <p className="text-sm text-red-500">Error getting team members</p>
          )}
        </div>

        <div className="w-full">
          <Label>Deadline</Label>
          <Popover modal={true}>
            <PopoverTrigger asChild>
              <Button
                variant={"outline"}
                className={cn(
                  "w-full justify-start overflow-hidden rounded-sm bg-white text-left text-sm font-normal",
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
            <PopoverContent 
              align="start" 
              className="w-auto p-2" 
              style={{ zIndex: 9999 }}
              sideOffset={5}
            >
              <div className="space-y-2">
                <ShadSelect
                  onValueChange={(value) =>
                    setDate(addDays(new Date(), parseInt(value)))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Quick select" />
                  </SelectTrigger>
                  <SelectContent 
                    style={{ zIndex: 10000 }}
                    position="popper"
                    sideOffset={5}
                  >
                    <SelectItem value="0">Today</SelectItem>
                    <SelectItem value="1">Tomorrow</SelectItem>
                    <SelectItem value="3">In 3 days</SelectItem>
                    <SelectItem value="7">In a week</SelectItem>
                  </SelectContent>
                </ShadSelect>
                <Calendar mode="single" selected={date} onSelect={setDate} />
              </div>
            </PopoverContent>
          </Popover>
        </div>

        <DialogFooter className="pt-4 sm:justify-start">
          <Button
            onClick={handleSubmit}
            disabled={isPending}
            className="rounded-sm bg-[#4CAF50] text-white"
          >
            {isPending ? "Saving..." : "Add Project"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
});

ProjectModal.displayName = "ProjectModal";
export default ProjectModal;
