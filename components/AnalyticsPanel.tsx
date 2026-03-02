import { getPerformance } from "@/lib/actions/people.actions";
import { getWeeklyTimeSheet } from "@/lib/actions/timesheet.actions";
import { useQuery } from "@tanstack/react-query";
import { useState, useEffect, useMemo } from "react";

export const AnalyticsPanel = () => {
  const [currentProjectId, setCurrentProjectId] = useState<string | null>(null);
  const [timeFilter, setTimeFilter] = useState<"today" | "week" | "month">("today");

  // Get current project ID from localStorage and listen for changes
  useEffect(() => {
    const getProjectId = () => {
      try {
        const pid = localStorage.getItem("currentProjectId");
        setCurrentProjectId(pid);
      } catch {}
    };

    // Get initial value
    getProjectId();

    // Listen for storage changes (cross-tab sync)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "currentProjectId") {
        getProjectId();
      }
    };

    window.addEventListener("storage", handleStorageChange);

    // Also check periodically (in case localStorage is modified directly)
    const interval = setInterval(getProjectId, 1000);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      clearInterval(interval);
    };
  }, []);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["analytics"],
    queryFn: getPerformance,
  });

  const {
    data: weekly,
    isLoading: weeklyLoading,
    isError: weeklyError,
  } = useQuery({
    queryKey: ["weekly-timesheet-all"],
    queryFn: getWeeklyTimeSheet,
  });

  // Filter entries by project ID and time period
  const filteredEntries = useMemo(() => {
    const entries = Array.isArray((weekly as any)?.entries)
      ? ((weekly as any).entries as any[])
      : Array.isArray(weekly)
        ? ((weekly as any) as any[])
        : [];

    // Filter by project ID if available
    let projectFiltered = entries;
    if (currentProjectId) {
      projectFiltered = entries.filter((e) => {
        const projectId = e?.project?._id || e?.project?.id || e?.project;
        return projectId === currentProjectId;
      });
    }

    // Filter by time period
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekAgo = new Date(today);
    weekAgo.setDate(weekAgo.getDate() - 7);
    const monthAgo = new Date(today);
    monthAgo.setMonth(monthAgo.getMonth() - 1);

    return projectFiltered.filter((e) => {
      const entryDate = new Date(e?.date || e?.start || e?.startTime);
      if (isNaN(entryDate.getTime())) return false;

      switch (timeFilter) {
        case "today":
          return entryDate >= today;
        case "week":
          return entryDate >= weekAgo;
        case "month":
          return entryDate >= monthAgo;
        default:
          return true;
      }
    });
  }, [weekly, currentProjectId, timeFilter]);

  const totalMinutes = useMemo(() => {
    const totalHours = filteredEntries.reduce(
      (sum, e) => sum + (e?.totalHours || 0),
      0,
    );
    return Math.round(totalHours * 60);
  }, [filteredEntries]);

  const hoursTracked = (totalMinutes / 60).toFixed(1);

  if (isError) {
    return (
      <div className="rounded-xl border p-6 text-center text-red-600">
        <p className="text-lg font-medium">Failed to load analytics data.</p>
        <p className="mt-1 text-sm text-gray-500">
          Please try refreshing the page.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
      {/* Tasks Completed */}
      <div className="rounded-xl border p-4">
        <div className="mb-4 flex justify-between">
          <h4 className="font-medium">Tasks Completed</h4>
          <select className="bg-transparent text-sm outline-none">
            <option>This Week</option>
          </select>
        </div>

        {isLoading ? (
          <SkeletonBlock />
        ) : (
          <div className="flex items-center justify-between rounded-md border p-4">
            <div>
              <p className="text-sm text-gray-500">Tasks Completed</p>
              <p className="text-3xl font-bold">{data?.tasksCompleted || 0}</p>
              <p className="text-sm text-gray-400">from this week</p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100">
              <svg
                className="h-5 w-5 text-green-600"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
          </div>
        )}
      </div>

      {/* Productivity Score */}
      <div className="rounded-xl border p-4">
        <div className="mb-4 flex justify-between">
          <h4 className="font-medium">Productivity Score</h4>
          <select className="bg-transparent text-sm outline-none">
            <option>Last 7 Days</option>
          </select>
        </div>

        {isLoading ? (
          <SkeletonList count={3} />
        ) : (
          <div className="space-y-2">
            {(data?.productivityScore.length > 0 &&
              data?.productivityScore?.map((item) => (
                <div
                  key={item._id}
                  className="flex items-center justify-between rounded-md bg-gray-50 p-3"
                >
                  <div className="flex items-center gap-2">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-green-100">
                      <svg
                        className="h-4 w-4 text-green-600"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    </span>
                    <p className="text-sm">
                      {item.taskCount}{" "}
                      {item.taskCount === 1 ? "Project" : "Projects"} Completed
                    </p>
                  </div>
                </div>
              ))) || (
              <p className="text-sm text-gray-500">
                No productivity data available.
              </p>
            )}
          </div>
        )}
      </div>

      {/* Time Tracking */}
      <div className="rounded-xl border p-4">
        <div className="mb-4 flex justify-between">
          <h4 className="font-medium">Time Tracking</h4>
          <select
            className="bg-transparent text-sm outline-none cursor-pointer"
            value={timeFilter}
            onChange={(e) => setTimeFilter(e.target.value as "today" | "week" | "month")}
          >
            <option value="today">Today</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
          </select>
        </div>

        {weeklyLoading ? (
          <SkeletonBlock />
        ) : weeklyError ? (
          <SkeletonBlock />
        ) : (
          <div className="flex items-center justify-between rounded-md border p-4">
            <div>
              <p className="text-sm text-gray-500">Hours Tracked</p>
              <p className="text-3xl font-bold">{hoursTracked}h</p>
              <p className="text-sm text-gray-400">
                {timeFilter === "today"
                  ? "today"
                  : timeFilter === "week"
                    ? "this week"
                    : "this month"}
                {currentProjectId && " (filtered by project)"}
              </p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-100">
              <svg
                className="h-5 w-5 text-purple-600"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 6v6l4 2"
                />
                <circle cx="12" cy="12" r="10" />
              </svg>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

/**
 * Simple block skeleton loader
 */
const SkeletonBlock = () => (
  <div className="animate-pulse space-y-2 rounded-md border p-4">
    <div className="h-6 w-1/3 rounded bg-gray-200"></div>
    <div className="h-10 w-1/2 rounded bg-gray-200"></div>
    <div className="h-4 w-1/4 rounded bg-gray-200"></div>
  </div>
);

/**
 * Skeleton loader for a list of items
 */
const SkeletonList = ({ count = 3 }) => (
  <div className="space-y-2">
    {Array.from({ length: count }).map((_, idx) => (
      <div
        key={idx}
        className="flex animate-pulse items-center justify-between rounded-md bg-gray-100 p-3"
      >
        <div className="flex items-center gap-2">
          <div className="h-6 w-6 rounded-full bg-gray-300"></div>
          <div className="h-4 w-32 rounded bg-gray-300"></div>
        </div>
      </div>
    ))}
  </div>
);
