"use client";

import { TrendingUp } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid } from "recharts";

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { useQuery } from "@tanstack/react-query";
import { getWeeklyTimeSheet } from "@/lib/actions/timesheet.actions";
import { getUserEmailById } from "@/lib/actions/user.actions";
import { getAssignedTeamMembersToProject } from "@/lib/actions/project.actions";
import React from "react";

const data = [
  { name: "Mon", uv: 400, pv: 240 },
  { name: "Tue", uv: 300, pv: 139 },
  { name: "Wed", uv: 200, pv: 980 },
  { name: "Thu", uv: 278, pv: 390 },
  { name: "Fri", uv: 189, pv: 480 },
];

const chartConfig = {
  uv: {
    label: "Unique Visitors",
    color: "var(--chart-1)",
  },
  pv: {
    label: "Page Views",
    color: "var(--chart-2)",
  },
};

export default function PerformanceChart() {
  const {
    data,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["weekly-timesheet-all"],
    queryFn: getWeeklyTimeSheet,
  });

  const entries: any[] = Array.isArray((data as any)?.entries)
    ? (data as any).entries
    : Array.isArray(data)
      ? (data as any[])
      : [];

  const [projectId, setProjectId] = React.useState<string | null>(null);
  React.useEffect(() => {
    try {
      const id = localStorage.getItem("currentProjectId");
      if (id) setProjectId(id);
    } catch { }
  }, []);

  const { data: assignedTeamMembers } = useQuery({
    queryKey: ["assignedTeamMembers", projectId],
    queryFn: () => getAssignedTeamMembersToProject(projectId!),
    enabled: !!projectId,
  });

  const teamUserIds = React.useMemo(() => {
    const members = assignedTeamMembers?.teamMembers || [];
    const ids = new Set<string>();
    members.forEach((m: any) => {
      const uid = typeof m === "string" ? m : m?.user?._id;
      if (uid) ids.add(uid);
    });
    return ids;
  }, [assignedTeamMembers]);

  const filteredEntries = React.useMemo(() => {
    if (!projectId) return [];

    const byProject = entries.filter((e) => (e?.project?._id || e?.project?.id) === projectId);

    if (!teamUserIds || teamUserIds.size === 0) return byProject;
    return byProject.filter((e) => {
      const uid = typeof e.user === "string" ? e.user : e.user?._id;
      return uid ? teamUserIds.has(uid) : false;
    });
  }, [entries, projectId, teamUserIds]);

  const [emailByUserId, setEmailByUserId] = React.useState<Record<string, string>>({});
  React.useEffect(() => {
    const ids = Array.from(
      new Set(filteredEntries.map((e) => (typeof e.user === "string" ? e.user : e.user?._id)).filter(Boolean)),
    );
    if (!ids.length) return;
    (async () => {
      const results = await Promise.all(ids.map(async (id) => [id!, await getUserEmailById(id!)] as const));
      const map: Record<string, string> = {};
      results.forEach(([id, email]) => { if (email) map[id] = email; });
      setEmailByUserId((prev) => ({ ...prev, ...map }));
    })();
  }, [filteredEntries]);

  const weekday = (d: string) => {
    const dt = new Date(d);
    return dt.toLocaleDateString(undefined, { weekday: "short" });
  };

  const users: string[] = Array.from(
    new Set(filteredEntries.map((e) => (typeof e.user === "string" ? e.user : e.user?._id)).filter(Boolean)),
  );

  const days: string[] = ["Mon", "Tue", "Wed", "Thu", "Fri"];
  const chartData = days.map((day) => {
    const row: any = { name: day };
    users.forEach((uid) => {
      const label = emailByUserId[uid] || uid;
      const hours = filteredEntries
        .filter((e) => (weekday(e.date) || weekday(e.startTime)) === day)
        .filter((e) => {
          const id = typeof e.user === "string" ? e.user : e.user?._id;
          return id === uid;
        })
        .reduce((sum, e) => sum + (e.totalHours || 0), 0);
      row[label] = +hours.toFixed(2);
    });
    return row;
  });

  const palette = [
    "var(--chart-1)",
    "var(--chart-2)",
    "var(--chart-3)",
    "var(--chart-4)",
    "var(--chart-5)",
    "var(--chart-6)",
  ];
  const chartConfig = users.reduce((acc: any, uid, idx) => {
    const label = emailByUserId[uid] || uid;
    acc[label] = { label, color: palette[idx % palette.length] };
    return acc;
  }, {} as Record<string, { label: string; color: string }>);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Performance Overview</CardTitle>
        <CardDescription>
          Productivity stats per user for the week
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading && <p>Loading chart...</p>}
        {isError && <p>Error loading data</p>}
        {!isLoading && !isError && (
          <ChartContainer config={chartConfig}>
            <LineChart
              accessibilityLayer
              data={chartData}
              margin={{ left: -20, right: 12 }}
              width={600}
              height={300}
            >
              <CartesianGrid vertical={false} strokeDasharray="3 3" />
              <XAxis
                dataKey="name"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
              />
              <YAxis tickLine={false} axisLine={false} tickMargin={8} />
              <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
              {Object.entries(chartConfig).map(([key, config]: any) => (
                <Line
                  key={key}
                  type="monotone"
                  dataKey={key}
                  stroke={config.color}
                  strokeWidth={2}
                />
              ))}
            </LineChart>
          </ChartContainer>
        )}
      </CardContent>
      <CardFooter>
        <div className="flex w-full items-start gap-2 text-sm">
          <div className="grid gap-2">
            <div className="flex items-center gap-2 font-medium leading-none">
              Productivity overview <TrendingUp className="h-4 w-4" />
            </div>
            <div className="flex items-center gap-2 leading-none text-muted-foreground">
              Monday - Friday
            </div>
          </div>
        </div>
      </CardFooter>
    </Card>
  );
}
