"use client";

import React, { useEffect, useState } from "react";
import PaymentNav from "../PaymentNav";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { formatTime } from "@/lib/utils";
import { useTimerStore } from "@/store/timerStore";
import { ProjectProps } from "@/types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  startProjectTimer,
  stopProjectTimer,
} from "@/lib/actions/timer.actions";
import { getScreenshotSettings } from "@/lib/actions/screenshot.actions";
import toast from "react-hot-toast";
import { getUserProjects } from "@/lib/actions/project.actions";


const WidgetsComponent = () => {
  const {
    data: userProject,
    isLoading: projectsLoading,
    error: projectsError,
  } = useQuery({
    queryKey: ["user-projects"],
    queryFn: getUserProjects,
  });

  const projects = userProject?.projects || [];

  const {
    isRunning,
    elapsed,
    start,
    stop,
    reset,
    setProjectId,
    projectId,
    startTime,
    stopTime,
    selectedProject,
    setSelectedProject,
  } = useTimerStore();

  // Use selectedProject from store, fallback to local state
  const [localProject, setLocalProject] = useState<ProjectProps | null>(
    selectedProject,
  );
  const [description, setDescription] = useState(
    selectedProject?.description || "",
  );

  const queryClient = useQueryClient();

  // Sync with store when selectedProject changes
  useEffect(() => {
    if (selectedProject) {
      setLocalProject(selectedProject);
      setDescription(
        selectedProject.description || "No description for this project",
      );
    }
  }, [selectedProject]);

  // Recalculate elapsed time after hydration
  useEffect(() => {
    if (isRunning && startTime) {
      const interval = setInterval(() => {
        const currentElapsed = Math.floor((Date.now() - startTime) / 1000);
        useTimerStore.setState({ elapsed: currentElapsed });
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [isRunning, startTime]);

  const { mutate: startTimerMutate, isPending: isStarting } = useMutation({
    mutationFn: startProjectTimer,
    onSuccess: (data) => {
      toast.success(data?.message);
      localStorage.setItem('entryId', data?.entry._id || '');
      queryClient.invalidateQueries({ queryKey: ["timeSheet"] });
    },
    onError: (error) => {
      console.error("Start timer error:", error);
    },
  });

  const { mutate: stopTimerMutate, isPending: isStopping } = useMutation({
    mutationFn: stopProjectTimer,
    onSuccess: (data) => {
      toast.success(data?.message);
      queryClient.invalidateQueries({ queryKey: ["timeSheet"] });
    },
    onError: (error) => {
      console.error("Stop timer error:", error);
    },
  });

  const handleStart = async () => {
    if (!localProject) return toast.error("Please select a project first.");

    try {
      const settings = await getScreenshotSettings({ projectId: localProject._id });

      if (settings?.settings.enabled) {
        setProjectId(localProject._id);
        setSelectedProject(localProject);
        start();
        startTimerMutate(localProject._id);
        const token = localStorage.getItem("token");
        if ((window as any).electronAPI) {
          (window as any).electronAPI.startAutoScreenshot(settings.settings.intervalMinutes * 60 * 1000, token, localProject._id);
          toast.success("Auto screenshot started.");
        } else {
          alert("Electron API not available — are you running in desktop mode?");
        }
      } else {
        setProjectId(localProject._id);
        setSelectedProject(localProject);
        start();
        startTimerMutate(localProject._id);
        toast.success("Timer started without screenshots.");
      }
    } catch (error) {
      console.error("Failed to get screenshot settings:", error);
      toast.error("Failed to start timer. Could not get screenshot settings.");
    }
  };

  const handleStop = () => {
    if (!projectId) return toast.error("No project running.");
    stop();
    const entryId = localStorage.getItem('entryId');
    if (entryId) {
      stopTimerMutate(entryId);
    } else {
      toast.error("No entry ID found. Please start the timer first.");
    }
    if ((window as any).electronAPI) {
      (window as any).electronAPI.stopAutoScreenshot();
      toast.success("Auto screenshot stopped.");
    } else {
      alert("Electron API not available — are you running in desktop mode?");
    }
    reset();
  };

  const handleProjectChange = (value: string) => {
    const selectedProj = projects.find((p) => p._id === value);
    if (selectedProj) {
      setLocalProject(selectedProj);
      setSelectedProject(selectedProj);
      setDescription(
        selectedProj.description || "No description for this project",
      );
    }
  };

  return (
    <div className="px-5 py-5 lg:px-8">
      <PaymentNav />

      <Card className="my-10 pt-5 md:w-[460px]">
        <CardContent>
          <div className="grid w-full items-center gap-4">
            <div className="w-full">
              <Label>Project Name</Label>
              {projectsError && <p>Couldn&apos;t get projects</p>}
              <Select
                value={localProject?._id || ""}
                onValueChange={handleProjectChange}
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
                    {projects.map((item) => (
                      <SelectItem key={item._id} value={item._id}>
                        {item.name}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
            <div className="w-full rounded-sm px-2">
              <span className="font-semibold">Description:</span>{" "}
              {description || "Select a project to see description."}
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button
            variant="outline"
            className="bg-[#4CAF50] text-white"
            onClick={handleStart}
            disabled={isRunning || isStarting}
          >
            Start
          </Button>
          <Button
            className="bg-[#F00000] text-white"
            onClick={handleStop}
            disabled={!isRunning || isStopping}
          >
            Stop
          </Button>
        </CardFooter>
        <div className="flex w-full flex-col items-center justify-center pb-5">
          <p className="text-3xl font-semibold text-[#333333]">
            {formatTime(elapsed)}
          </p>
          {startTime && (
            <p className="text-sm text-gray-500">
              Started at: {new Date(startTime).toLocaleTimeString()}
            </p>
          )}
          {stopTime && (
            <p className="text-sm text-gray-500">
              Stopped at: {new Date(stopTime).toLocaleTimeString()}
            </p>
          )}
        </div>
      </Card>
    </div>
  );
};

export default WidgetsComponent;
