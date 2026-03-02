"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateScreenshotSettings } from "@/lib/actions/screenshot.actions";
import { toast } from "sonner";

interface SettingsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId: string;
  initialSettings: {
    enabled: boolean;
    intervalMinutes: number;
  };
}

const SettingsModal: React.FC<SettingsModalProps> = ({
  open,
  onOpenChange,
  projectId,
  initialSettings,
}) => {
  const [enabled, setEnabled] = useState(initialSettings.enabled);
  const [interval, setInterval] = useState(initialSettings.intervalMinutes);
  const queryClient = useQueryClient();

  const { mutate, isPending } = useMutation({
    mutationFn: updateScreenshotSettings,
    onSuccess: () => {
      toast.success("Settings updated successfully");
      queryClient.invalidateQueries({ queryKey: ["screenshots", projectId] });
      onOpenChange(false);
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to update settings");
    },
  });

  const handleSave = () => {
    mutate({
      taskId: projectId,
      enableScreenshot: enabled,
      screenshotIntervalMinutes: interval,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Screenshot Settings</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="screenshot-enabled">Enable Screenshots</Label>
            <Switch
              id="screenshot-enabled"
              checked={enabled}
              onCheckedChange={setEnabled}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="screenshot-interval">Interval (minutes)</Label>
            <Input
              id="screenshot-interval"
              type="number"
              value={interval}
              onChange={(e) => setInterval(Number(e.target.value))}
              min={1}
              disabled={!enabled}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button variant="outline" onClick={handleSave} disabled={isPending}>
            {isPending ? "Saving..." : "Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default SettingsModal;