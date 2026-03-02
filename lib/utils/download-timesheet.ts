// Utility function to download timesheet as CSV

export interface TimesheetEntry {
  user?: string | { email?: string; _id?: string };
  project?: string | { name?: string; _id?: string; id?: string };
  date?: string;
  start?: string;
  startTime?: string;
  end?: string;
  endTime?: string;
  totalHours?: number;
  logId?: string;
  _id?: string;
  screenshots?: any[];
  link?: string;
}

/**
 * Convert timesheet data to CSV format
 */
export const convertTimesheetToCSV = (timesheetData: any[]): string => {
  if (!Array.isArray(timesheetData) || timesheetData.length === 0) {
    return "No data available";
  }

  // CSV Headers
  const headers = [
    "Date",
    "User Email",
    "Project Name",
    "Start Time",
    "End Time",
    "Total Hours",
    "Link",
  ];

  // Convert data to CSV rows
  const rows = timesheetData.map((entry: TimesheetEntry) => {
    const date = entry.date || entry.start || entry.startTime || "";
    const userEmail =
      typeof entry.user === "string"
        ? entry.user
        : entry.user?.email || "Unknown";
    const projectName =
      typeof entry.project === "string"
        ? entry.project
        : entry.project?.name || "Unknown Project";
    const startTime = entry.start || entry.startTime || "";
    const endTime = entry.end || entry.endTime || "";
    const totalHours = entry.totalHours?.toFixed(2) || "0.00";
    const link = entry.link || "";

    return [
      formatDateForCSV(date),
      escapeCSV(userEmail),
      escapeCSV(projectName),
      formatTimeForCSV(startTime),
      formatTimeForCSV(endTime),
      totalHours,
      escapeCSV(link),
    ];
  });

  // Combine headers and rows
  const csvContent = [headers, ...rows]
    .map((row) => row.join(","))
    .join("\n");

  return csvContent;
};

/**
 * Format date for CSV (YYYY-MM-DD)
 */
const formatDateForCSV = (dateString: string): string => {
  if (!dateString) return "";
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    return date.toISOString().split("T")[0];
  } catch {
    return dateString;
  }
};

/**
 * Format time for CSV (HH:MM:SS)
 */
const formatTimeForCSV = (timeString: string): string => {
  if (!timeString) return "";
  try {
    const date = new Date(timeString);
    if (isNaN(date.getTime())) return timeString;
    return date.toTimeString().split(" ")[0];
  } catch {
    return timeString;
  }
};

/**
 * Escape CSV field (handle commas, quotes, newlines)
 */
const escapeCSV = (field: string): string => {
  if (!field) return "";
  // If field contains comma, quote, or newline, wrap in quotes and escape quotes
  if (field.includes(",") || field.includes('"') || field.includes("\n")) {
    return `"${field.replace(/"/g, '""')}"`;
  }
  return field;
};

/**
 * Download timesheet as CSV file
 */
export const downloadTimesheetAsCSV = (
  timesheetData: any[],
  filename?: string,
): void => {
  const csvContent = convertTimesheetToCSV(timesheetData);
  
  // Create blob
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  
  // Create download link
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);
  
  link.setAttribute("href", url);
  link.setAttribute(
    "download",
    filename || `timesheet-${new Date().toISOString().split("T")[0]}.csv`,
  );
  link.style.visibility = "hidden";
  
  // Trigger download
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  // Clean up
  URL.revokeObjectURL(url);
};

