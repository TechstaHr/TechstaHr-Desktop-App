"use client";

import React, { useState, useEffect } from "react";
import CalendarNav from "@/components/CalendarNav";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { submitTimesheet } from "@/lib/actions/timesheet.actions";
import { ProjectProps } from "@/types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getTimeSheet,
  startProjectTimer,
  stopProjectTimer,
} from "@/lib/actions/timer.actions";
import { getScreenshotSettings } from "@/lib/actions/screenshot.actions";
import toast from "react-hot-toast";
import { useTimerStore } from "@/store/timerStore";
import { formatTime } from "@/lib/utils";
import { getUserProjects } from "@/lib/actions/project.actions";
import { startOfWeek, format, isSameWeek } from "date-fns";
import { useTrackingSession } from "@/hooks/use-tracking-session";
import { clearTrackingSession, saveTrackingSession, addClockedInProject, removeClockedInProject } from "@/lib/utils/tracking-session";


type TimesheetEntry = {
  _id: string;
  user: string;
  project: { _id: string; name: string; id: string };
  date: string;
  startTime: string;
  endTime: string;
  totalHours: number;
  [key: string]: any;
};

const TimeTracking = () => {
  const { isActive: hasActiveTracking } = useTrackingSession();

  const {
    data: userProject,
    isLoading: projectsLoading,
    error: projectsError,
  } = useQuery({
    queryKey: ["user-projects"],
    queryFn: getUserProjects,
  });

  const projects = userProject?.projects || [];

  const { data, isLoading, error } = useQuery({
    queryKey: ["timeSheet"],
    queryFn: getTimeSheet,
  });

  const {
    isRunning,
    elapsed,
    start,
    stop,
    setProjectId,
    reset,
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
  const [showSubmitDialog, setShowSubmitDialog] = useState(false);
  const [stoppedEntryId, setStoppedEntryId] = useState<string | null>(null);

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

  const { mutate: submitTimesheetEntry, isPending: isSubmitting } = useMutation({
    mutationFn: submitTimesheet,
    onSuccess: (data) => {
      toast.success("Timesheet submitted successfully");
      setShowSubmitDialog(false);
      setStoppedEntryId(null);
      queryClient.invalidateQueries({ queryKey: ["timeSheet"] });
    },
    onError: (error: any) => {
      toast.error(error?.message || "Failed to submit timesheet");
    },
  });

  const { mutate: stopTimerMutate, isPending: isStopping } = useMutation({
    mutationFn: stopProjectTimer,
    onSuccess: (data, variables) => {
      toast.success(data?.message);
      queryClient.invalidateQueries({ queryKey: ["timeSheet"] });
      setStoppedEntryId(variables);
      setShowSubmitDialog(true);
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
        startTimerMutate(localProject._id, {
          onSuccess: (data) => {
            // Session is saved in startProjectTimer action
            // But we can also save project name here
            saveTrackingSession({
              projectId: localProject._id,
              projectName: localProject.name,
              startTime: new Date().toISOString(),
              entryId: data?.entry?._id,
              type: "timer",
            });
            // Update clockedInProjects in localStorage
            addClockedInProject(localProject._id);
          },
        });
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
        startTimerMutate(localProject._id, {
          onSuccess: (data) => {
            // Session is saved in startProjectTimer action
            // But we can also save project name here
            saveTrackingSession({
              projectId: localProject._id,
              projectName: localProject.name,
              startTime: new Date().toISOString(),
              entryId: data?.entry?._id,
              type: "timer",
            });
            // Update clockedInProjects in localStorage
            addClockedInProject(localProject._id);
          },
        });
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
    reset();

    // Clear tracking session and local project clock status
    clearTrackingSession();
    if (projectId) {
      removeClockedInProject(projectId);
    } else if (localProject) {
      removeClockedInProject(localProject._id);
    }

    if ((window as any).electronAPI) {
      (window as any).electronAPI.stopAutoScreenshot();
      toast.success("Auto screenshot stopped.");
    } else {
      alert("Electron API not available — are you running in desktop mode?");
    }
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

  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  // Determine if there is any timesheet data to render.
  // Supports both aggregated object shape (data.timesheet) and array shape.
  const hasTimesheetRows = Array.isArray(data)
    ? data.length > 0
    : !!(data && data.timesheet && Object.keys(data.timesheet).length > 0);

  useEffect(() => {
    if (isRunning && startTime) {
      const interval = setInterval(() => {
        const currentElapsed = Math.floor((Date.now() - startTime) / 1000);
        useTimerStore.setState({ elapsed: currentElapsed });
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [isRunning, startTime]);

  return (
    <div className="space-y-8 px-4">
      <h2 className="font-inter text-2xl font-medium">Time Tracking</h2>
      <CalendarNav />

      <div className="w-full rounded-sm border p-5 lg:p-8">
        <div className="space-y-8">
          <div className="w-full md:w-1/2">
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
                  {projects?.length > 0 &&
                    projects?.map((item) => (
                      <SelectItem key={item._id} value={item._id}>
                        {item.name}
                      </SelectItem>
                    ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
          <div className="w-full rounded-sm px-2 md:w-1/2">
            <span className="font-semibold">Description:</span>{" "}
            {description || "Select a project to see description."}
          </div>

          <div className="flex items-center justify-start gap-4">
            {!hasActiveTracking && (
              <Button
                className="rounded-sm bg-[#4CAF50] lg:w-[160px]"
                onClick={handleStart}
                disabled={isRunning}
              >
                {isStarting ? "Starting..." : "Start"}
              </Button>
            )}
            <Button
              className="rounded-sm bg-[#F00000] lg:w-[160px]"
              onClick={handleStop}
              disabled={!isRunning}
            >
              {isStopping ? "Stopping" : "Stop"}
            </Button>

            <p className="text-lg font-semibold">{formatTime(elapsed)}</p>
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
        </div>

        <hr className="my-8 h-0.5 w-full" />

        <div className="space-y-4 overflow-x-auto">
          <h2 className="text-xl font-medium">Timesheet View</h2>

          <div className="hide-scrollbar w-full overflow-x-auto">
            <table className="w-full min-w-[600px] table-auto border text-sm">
              <thead className="bg-gray-100">
                <tr>
                  <th className="border px-4 py-2">Project</th>
                  {days.map((day) => (
                    <th key={day} className="border px-4 py-2">
                      {day}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {isLoading && <tr>Loading Timesheet...</tr>}
                {error && <tr>Failed to load timesheet</tr>}

                {data && !hasTimesheetRows && (
                  <tr>
                    <td
                      className="border px-4 py-6 text-center text-[#AAAAAA]"
                      colSpan={days.length + 1}
                    >
                      No timesheet data yet
                    </td>
                  </tr>
                )}

                {Array.isArray(data) && data.length > 0 && (
                  <>
                    {Object.entries(
                      // Group entries by week start date
                      (data as TimesheetEntry[]).reduce((acc, entry) => {
                        const weekStart = format(
                          startOfWeek(new Date(entry.date), { weekStartsOn: 1 }),
                          "yyyy-MM-dd"
                        );
                        if (!acc[weekStart]) acc[weekStart] = [];
                        acc[weekStart].push(entry);
                        return acc;
                      }, {} as Record<string, TimesheetEntry[]>)
                    ).map(([weekStart, weekEntries], wIndex) => (
                      <React.Fragment key={weekStart}>
                        {/* Week header row */}
                        <tr>
                          <td className="bg-green-100"></td>
                          <td className="bg-green-100"></td>
                          <td className="bg-green-100"></td>
                          <td colSpan={days.length + 1} className="bg-green-100 px-4 py-2 font-semibold text-xs">
                            Week of {format(new Date(weekStart), "MMM d, yyyy")}
                          </td>
                        </tr>



                        {/* Timesheet rows for this week */}
                        <tr key={wIndex}>
                          <td className="border px-4 py-2 align-top">
                            <p className="text-lg font-semibold">
                              {weekEntries[0]?.project?.name || "Unnamed Project"}
                            </p>
                          </td>

                          {days.map((day) => {
                            const entriesForDay = weekEntries.filter((entry) => {
                              const entryDate = new Date(entry.date);
                              const entryDay = entryDate.toLocaleDateString("en-US", {
                                weekday: "short",
                              });
                              return (
                                entryDay === day &&
                                isSameWeek(entryDate, new Date(weekStart), { weekStartsOn: 1 })
                              );
                            });

                            return (
                              <td key={day} className="border px-4 py-2 align-top">
                                {entriesForDay.length > 0 ? (
                                  entriesForDay.map((log, i) => {
                                    const start = new Date(log.startTime).toLocaleTimeString([], {
                                      hour: "2-digit",
                                      minute: "2-digit",
                                    });
                                    const end = new Date(log.endTime).toLocaleTimeString([], {
                                      hour: "2-digit",
                                      minute: "2-digit",
                                    });
                                    const total = log.totalHours?.toFixed(2);

                                    return (
                                      <div key={i} className="mb-1 p-1 rounded bg-gray-50">
                                        <p className="text-xs text-[#AAAAAA]">
                                          Start: <span className="text-black">{start}</span>
                                        </p>
                                        <p className="text-xs text-[#AAAAAA]">
                                          Stop: <span className="text-black">{end}</span>
                                        </p>
                                        <p className="text-xs text-[#AAAAAA]">
                                          Total: <span className="text-black">{total}h</span>
                                        </p>
                                        {log.status !== 'submitted' && log.endTime && (
                                          <Button
                                            size="sm"
                                            variant="ghost"
                                            className="h-6 mt-1 px-2 text-xs text-blue-600 hover:text-blue-800 hover:bg-blue-50 w-full justify-start"
                                            onClick={() => submitTimesheetEntry(log._id)}
                                            disabled={isSubmitting}
                                          >
                                            Submit
                                          </Button>
                                        )}
                                        <hr className="my-1" />
                                      </div>
                                    );
                                  })
                                ) : (
                                  <>
                                    <p className="text-xs text-[#AAAAAA]">Start: ---</p>
                                    <p className="text-xs text-[#AAAAAA]">Stop: ---</p>
                                  </>
                                )}
                              </td>
                            );
                          })}
                        </tr>
                      </React.Fragment>
                    ))}
                  </>
                )}

              </tbody>
            </table>
          </div>
        </div>
      </div>

      <Dialog open={showSubmitDialog} onOpenChange={setShowSubmitDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Submit Timesheet?</DialogTitle>
            <DialogDescription>
              You have clocked out. Would you like to submit this timesheet entry for approval?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSubmitDialog(false)}>
              Later
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                if (stoppedEntryId) submitTimesheetEntry(stoppedEntryId);
              }}
              disabled={isSubmitting}
            >
              {isSubmitting ? "Submitting..." : "Submit"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div >
  );
};

export default TimeTracking;
