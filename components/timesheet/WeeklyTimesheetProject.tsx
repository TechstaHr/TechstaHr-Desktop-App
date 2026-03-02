// components/WeeklyTimesheetProject.tsx
"use client";

import React, { useState } from "react";
import { Clock, ChevronDown, ChevronRight } from "lucide-react";
import TimeLogEntry from "./TimeLogEntry";
import { TimesheetProjectEntry } from "@/types";

interface WeeklyTimesheetProjectProps {
  projectId: string;
  projectData: TimesheetProjectEntry;
  selectedTimeLogIds: string[];
  onTimeLogSelection: (logId: string) => void;
}

const WeeklyTimesheetProject: React.FC<WeeklyTimesheetProjectProps> = ({
  projectId,
  projectData,
  selectedTimeLogIds,
  onTimeLogSelection,
}) => {
  const [expandedDays, setExpandedDays] = useState<Record<string, boolean>>({});

  const toggleDay = (day: string) =>
    setExpandedDays((prev) => ({ ...prev, [day]: !prev[day] }));

  const getDayName = (day: string) => {
    const dayMap: { [key: string]: string } = {
      Mon: "Monday",
      Tue: "Tuesday",
      Wed: "Wednesday",
      Thu: "Thursday",
      Fri: "Friday",
      Sat: "Saturday",
      Sun: "Sunday",
    };
    return dayMap[day] || day;
  };

  return (
    <div className="rounded-lg border p-4">
      <h4 className="mb-4 text-lg font-medium text-blue-700">
        {projectData.projectName}
      </h4>

      {Object.entries(projectData.logsByDay).map(
        ([day, logs]: [string, any[]]) => {
          const isExpanded = expandedDays[day] ?? true;
          return (
            <div key={day} className="mb-4">
              <button
                type="button"
                onClick={() => toggleDay(day)}
                className="mb-2 flex w-full items-center justify-between rounded-md bg-gray-50 px-3 py-2"
              >
                <span className="flex items-center gap-2 font-medium text-gray-700">
                  {isExpanded ? (
                    <ChevronDown className="h-4 w-4" />
                  ) : (
                    <ChevronRight className="h-4 w-4" />
                  )}
                  <Clock className="h-4 w-4" />
                  {getDayName(day)}
                </span>
              </button>
              {isExpanded && (
                <div className="space-y-2">
                  {logs.map((log: any) => (
                    <TimeLogEntry
                      key={log.logId}
                      log={log}
                      isSelected={selectedTimeLogIds.includes(log.logId)}
                      onSelection={onTimeLogSelection}
                    />
                  ))}
                </div>
              )}
            </div>
          );
        },
      )}
    </div>
  );
};

export default WeeklyTimesheetProject;
