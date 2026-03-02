"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useQuery } from "@tanstack/react-query";
import { getProjectDailySummary } from "@/lib/actions/project.actions";

const DashboardDailySummaries = ({ projectId }: { projectId: string }) => {
  const today = new Date().toISOString().split("T")[0];

  const {
    data: summaries,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["dailySummary", projectId, today],
    queryFn: () => getProjectDailySummary(projectId, today),
  });

  if (isLoading) return <p>Loading daily summaries...</p>;
  if (isError) return <p className="text-red-500">Failed to load summaries.</p>;

  // If no summaries, create a fallback summary item
  const displaySummaries =
    summaries && summaries.length > 0
      ? summaries
      : [
          {
            user: "No summaries yet",
            email: "N/A",
            projectName: summaries?.[0]?.projectName ?? "Unnamed Project",
            hours: { total: "0h 0m", regular: "0h 0m", overtime: "0h 0m" },
          },
        ];

  return (
    <Accordion type="single" collapsible className="w-full rounded-sm border bg-white p-2 shadow-sm">
      <AccordionItem value={`project-${projectId}`}>
        <AccordionTrigger className="text-left font-medium">
          📁 Project: {displaySummaries[0].projectName || "Unnamed Project"}
        </AccordionTrigger>
        <AccordionContent className="space-y-4 p-4">
          {displaySummaries.map((summary: any, idx: number) => (
            <div key={idx} className="space-y-2 rounded border p-3">
              <div className="flex items-center justify-between text-sm">
                <span className="font-semibold">{summary.user}</span>
                <span className="text-muted-foreground">{summary.email}</span>
              </div>
              <div className="flex justify-between rounded-sm bg-[#F9FAFB] p-2 text-sm">
                <span className="flex items-center gap-2 text-blue-600">
                  🕒 Regular Hours
                </span>
                <span className="font-medium">{summary.hours.regular}</span>
              </div>
              <div className="flex justify-between rounded-sm bg-[#F9FAFB] p-2 text-sm">
                <span className="flex items-center gap-2 text-orange-500">
                  ⬆ Overtime
                </span>
                <span className="font-medium">{summary.hours.overtime}</span>
              </div>
              <div className="flex justify-between rounded-sm bg-[#F9FAFB] p-2 text-sm">
                <span className="flex items-center gap-2 text-green-600">
                  📅 Total
                </span>
                <span className="font-medium">{summary.hours.total}</span>
              </div>
            </div>
          ))}
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
};

export default DashboardDailySummaries;
