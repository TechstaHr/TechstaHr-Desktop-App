// components/SubmittedTimesheetEntry.tsx
"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { ClockIcon, Camera, Download, Eye, User, ChevronDown, ChevronUp } from "lucide-react";
import { calculateDuration } from "@/lib/utils";

interface ScreenshotItem {
  url: string;
  takenAt: string;
  takenBy: string;
  _id: string;
  id: string;
}

interface SubmittedTimesheetEntryProps {
  log: any;
  screenshots?: ScreenshotItem[];
}

export const formatTime = (dateString: string) => {
  return new Date(dateString).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
};

const SubmittedTimesheetEntry: React.FC<SubmittedTimesheetEntryProps> = ({
  log,
  screenshots = [],
}) => {
  const [showScreenshots, setShowScreenshots] = useState(false);

  const downloadScreenshot = async (url: string, filename: string) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);
    } catch (error) {
      console.error("Failed to download screenshot:", error);
    }
  };

  const sanitizeUrl = (url?: string) =>
    (url || "").replace(/`/g, "").trim();

  return (
    <div className="flex flex-col gap-3 rounded-lg border border-green-200 bg-green-50 p-4">
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div className="flex flex-1 items-start gap-3">
          <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full border bg-white">
            <User className="h-5 w-5 text-gray-600" />
          </div>
          <div className="flex-1">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
              <p className="font-medium text-gray-900">{log?.user?.full_name}</p>
              <p className="text-sm text-gray-600">{log?.project?.name}</p>
            </div>
            <div className="mt-1 flex flex-col gap-2 text-sm text-gray-600 sm:flex-row sm:items-center sm:gap-4">
              <div className="flex items-center gap-1">
                <ClockIcon className="h-4 w-4" />
                <span>
                  {formatTime(log.start || log.startTime)} - {formatTime(log.end || log.endTime)}
                </span>
              </div>
              <div className="font-medium text-blue-600">
                {calculateDuration(log.start || log.startTime, log.end || log.endTime)}
              </div>
              {screenshots.length > 0 && (
                <div className="flex items-center gap-1">
                  <Camera className="h-4 w-4" />
                  <span>
                    {screenshots.length} screenshot
                    {screenshots.length > 1 ? "s" : ""}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
        {screenshots.length > 0 && (
          <Button
            size="sm"
            variant="outline"
            onClick={() => setShowScreenshots(!showScreenshots)}
            className="hover:bg-blue-50"
          >
            {showScreenshots ? (
              <>
                <ChevronUp className="mr-1 h-4 w-4" />
                Hide Screenshots
              </>
            ) : (
              <>
                <ChevronDown className="mr-1 h-4 w-4" />
                View Screenshots
              </>
            )}
          </Button>
        )}
      </div>

      {/* Screenshots Grid */}
      {showScreenshots && screenshots.length > 0 && (
        <div className="mt-2 border-t border-green-300 pt-3">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
            {screenshots.map((shot) => {
              const takenAt = new Date(shot.takenAt).toLocaleString();
              const filename = `screenshot_${shot.id || shot._id}.png`;
              return (
                <div
                  key={shot.id || shot._id}
                  className="overflow-hidden rounded-sm border bg-white"
                >
                  <img
                    src={sanitizeUrl(shot.url)}
                    alt={`Screenshot ${shot.id || shot._id}`}
                    className="h-48 w-full object-cover"
                    loading="lazy"
                  />
                  <div className="flex items-center justify-between gap-2 p-3">
                    <div>
                      <p className="text-xs font-medium">{takenAt}</p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() =>
                          window.open(
                            sanitizeUrl(shot.url),
                            "_blank",
                            "noopener,noreferrer"
                          )
                        }
                      >
                        <Eye className="h-3 w-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() =>
                          downloadScreenshot(sanitizeUrl(shot.url), filename)
                        }
                      >
                        <Download className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default SubmittedTimesheetEntry;
