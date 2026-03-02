// components/TimeLogEntry.tsx
"use client";

import React from "react";
import { ClockIcon, Camera } from "lucide-react";
import { formatTime, calculateDuration, formatISOString } from "@/lib/utils";

interface TimeLogEntryProps {
  log: any;
  isSelected: boolean;
  onSelection: (logId: string) => void;
}

const TimeLogEntry: React.FC<TimeLogEntryProps> = ({
  log,
  isSelected,
  onSelection,
}) => {
  return (
    <div className="flex items-center rounded-lg bg-gray-50 p-3 transition-colors hover:bg-gray-100">
      <div className="flex items-center gap-3 w-full">
        <input
          type="checkbox"
          checked={isSelected}
          onChange={() => onSelection(log.logId)}
          className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
        />
        <div className="flex flex-1 flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
          <div className="flex items-center gap-2 text-sm">
            <ClockIcon className="h-4 w-4 text-green-600" />
            <span className="font-medium">
              {formatISOString(log.start)} - {formatISOString(log.end)}
            </span>
          </div>
          <div className="text-sm font-medium text-blue-600">
            Duration: {calculateDuration(log.start, log.end)}
          </div>
          {log.screenshots.length > 0 && (
            <div className="flex items-center gap-1 text-sm text-gray-600">
              <Camera className="h-4 w-4" />
              <span>
                {log.screenshots.length} screenshot
                {log.screenshots.length > 1 ? "s" : ""}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TimeLogEntry;
