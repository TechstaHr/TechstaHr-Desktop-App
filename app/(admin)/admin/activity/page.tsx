"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getAllScreenshots } from "@/lib/actions/screenshot.actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getUserEmailById } from "@/lib/actions/user.actions";
import { Download, RefreshCw, Settings } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import SettingsModal from "@/components/modals/SettingsModal";

const AdminActivity = () => {
  const [projectId, setProjectId] = useState<string | null>(null);
  const [emailFilter, setEmailFilter] = useState("");
  const [isSettingsModalOpen, setSettingsModalOpen] = useState(false);
  const [emailByUserId, setEmailByUserId] = useState<Record<string, string>>({});
  const [emailsLoading, setEmailsLoading] = useState(false);

  useEffect(() => {
    try {
      const storedProjectId =
        typeof window !== "undefined"
          ? localStorage.getItem("currentProjectId")
          : null;
      if (storedProjectId) setProjectId(storedProjectId);
    } catch (e) {
      // Ignore localStorage errors and keep projectId null
    }
  }, []);

  interface ScreenshotItem {
    url: string;
    takenAt: string;
    takenBy: string;
    _id: string;
    id: string;
  }

  interface ScreenshotsResponse {
    projectName: string;
    settings: {
      enabled: boolean;
      intervalMinutes: number;
    };
    screenshots: ScreenshotItem[];
  }

  const queryClient = useQueryClient();

  const { data, isLoading, isError } = useQuery<ScreenshotsResponse>({
    queryKey: ["screenshots", projectId],
    queryFn: () => getAllScreenshots(projectId!),
    enabled: !!projectId,
    staleTime: 60 * 1000,
  });

  const handleRefresh = () => {
    queryClient.invalidateQueries({ queryKey: ["screenshots", projectId] });
  };

  const sanitizeUrl = (url?: string) =>
    (url || "").replace(/`/g, "").trim();

  const formattedScreenshots = useMemo(() => {
    const list = data?.screenshots || [];
    return list.map((s) => ({
      ...s,
      url: sanitizeUrl(s.url),
    }));
  }, [data]);

  const filteredScreenshots = useMemo(() => {
    if (!emailFilter) return formattedScreenshots;
    return formattedScreenshots.filter((s) => {
      const email = emailByUserId[s.takenBy];
      return email && email.toLowerCase().includes(emailFilter.toLowerCase());
    });
  }, [formattedScreenshots, emailFilter, emailByUserId]);

  const screenshotsByEmail = useMemo(() => {
    return filteredScreenshots.reduce(
      (acc, shot) => {
        const email = emailByUserId[shot.takenBy] ?? "Unknown";
        if (!acc[email]) {
          acc[email] = [];
        }
        acc[email].push(shot);
        return acc;
      },
      {} as Record<string, typeof filteredScreenshots>,
    );
  }, [filteredScreenshots, emailByUserId]);

  const [openAccordionItems, setOpenAccordionItems] = useState<string[]>([]);

  useEffect(() => {
    setOpenAccordionItems(Object.keys(screenshotsByEmail));
  }, [screenshotsByEmail]);

  useEffect(() => {
    const loadEmails = async () => {
      const ids = Array.from(
        new Set((data?.screenshots || []).map((s) => s.takenBy).filter(Boolean)),
      );
      if (ids.length === 0) return;
      setEmailsLoading(true);
      try {
        const results = await Promise.all(
          ids.map(async (id) => {
            const email = await getUserEmailById(id);
            return [id, email] as const;
          }),
        );
        const map: Record<string, string> = {};
        results.forEach(([id, email]) => {
          if (email) map[id] = email;
        });
        setEmailByUserId((prev) => ({ ...prev, ...map }));
      } finally {
        setEmailsLoading(false);
      }
    };
    loadEmails();
  }, [data?.screenshots]);

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

  if (!projectId) {
    return (
      <div className="px-4 py-6">
        <h1 className="mb-2 text-xl font-semibold">Screenshots</h1>
        <p className="text-sm text-muted-foreground">
          Select a project to view screenshots.
        </p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="px-4 py-6">
        <h1 className="mb-2 text-xl font-semibold">Screenshots</h1>
        <p className="text-sm text-muted-foreground">Loading screenshots…</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="px-4 py-6">
        <h1 className="mb-2 text-xl font-semibold">Screenshots</h1>
        <p className="text-sm text-red-600">Failed to load screenshots.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 px-4 py-6">
      <div className="flex items-center gap-3">
        <h1 className="text-xl font-semibold">Screenshots</h1>
        {data?.settings && (
          <Badge variant="outline" className="text-xs">
            {data.settings.enabled ? "Enabled" : "Disabled"} • Every{" "}
            {data.settings.intervalMinutes}m
          </Badge>
        )}
        <Button
          variant="outline"
          size="sm"
          onClick={handleRefresh}
          disabled={isLoading}
        >
          <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setSettingsModalOpen(true)}
        >
          <Settings className="h-4 w-4" />
        </Button>
      </div>

      <div className="flex items-center gap-2">
        <Input
          placeholder="Filter by email..."
          value={emailFilter}
          onChange={(e) => setEmailFilter(e.target.value)}
          className="max-w-xs"
        />
        {emailFilter && (
          <Button variant="outline" onClick={() => setEmailFilter("")}>
            Clear
          </Button>
        )}
      </div>

      {data?.projectName && (
        <p className="text-sm text-muted-foreground">
          Project: <span className="font-medium text-foreground">{data.projectName}</span>
        </p>
      )}

      {filteredScreenshots.length > 0 ? (
        <>
          <p className="text-sm text-muted-foreground">
            Found {filteredScreenshots.length} screenshots
          </p>
          <Accordion
            type="multiple"
            value={openAccordionItems}
            onValueChange={setOpenAccordionItems}
            className="w-full"
          >
            {Object.entries(screenshotsByEmail).map(([email, shots]) => (
              <AccordionItem value={email} key={email}>
                <AccordionTrigger>{email} ({shots.length})</AccordionTrigger>
                <AccordionContent>
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
                    {shots.map((shot) => {
                      const takenAt = new Date(shot.takenAt).toLocaleString();
                      const filename = `screenshot_${shot.id}.png`;
                      return (
                        <div
                          key={shot.id}
                          className="overflow-hidden rounded-sm border bg-white"
                        >
                          {/* Use img to avoid remote domain restrictions */}
                          <img
                            src={shot.url}
                            alt={`Screenshot ${shot.id}`}
                            className="h-48 w-full object-cover"
                            loading="lazy"
                          />
                          <div className="flex items-center justify-between gap-2 p-3">
                            <div>
                              <p className="text-sm font-medium">{takenAt}</p>
                              <p className="text-xs text-muted-foreground">
                                by {emailByUserId[shot.takenBy] ?? shot.takenBy}
                              </p>
                            </div>
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() =>
                                  window.open(
                                    shot.url,
                                    "_blank",
                                    "noopener,noreferrer",
                                  )
                                }
                              >
                                Open
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() =>
                                  downloadScreenshot(shot.url, filename)
                                }
                              >
                                <Download className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </>
      ) : (
        <div className="rounded border bg-white p-4">
          <p className="font-medium">No screenshots</p>
          <p className="text-sm text-muted-foreground">
            We didn’t get any screenshots for this project.
          </p>
        </div>
      )}
      {data?.settings && projectId && (
        <SettingsModal
          open={isSettingsModalOpen}
          onOpenChange={setSettingsModalOpen}
          projectId={projectId}
          initialSettings={data.settings}
        />
      )}
    </div>
  );
};

export default AdminActivity;
