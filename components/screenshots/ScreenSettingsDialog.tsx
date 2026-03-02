"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useEffect, useState } from "react";
import { updateScreenshotSettings } from "@/lib/actions/screenshot.actions";
import toast from "react-hot-toast";

interface ScreenshotSettingsDialogProps {
  taskId: string;
  taskTitle: string;
  isOpen: boolean;
  onClose: () => void;
  enableScreenshotDefault: boolean;
  screenshotIntervalMinutes: number;
}

const ScreenshotSettingsDialog: React.FC<ScreenshotSettingsDialogProps> = ({
  taskId,
  taskTitle,
  isOpen,
  onClose,
  enableScreenshotDefault,
  screenshotIntervalMinutes,
}) => {
  const [enableScreenshot, setEnableScreenshot] = useState(
    enableScreenshotDefault,
  );

  const [intervalMinutes, setIntervalMinutes] = useState(
    screenshotIntervalMinutes,
  );
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setEnableScreenshot(enableScreenshotDefault);
    setIntervalMinutes(screenshotIntervalMinutes);
  }, [enableScreenshotDefault]);

  const handleSaveSettings = async () => {
    setIsLoading(true);
    try {
      const response = await updateScreenshotSettings({
        taskId,
        enableScreenshot,
        screenshotIntervalMinutes: intervalMinutes,
      });
      toast.success(
        response?.message || "Screenshot settings updated successfully",
      );
      onClose();
    } catch (error: any) {
      toast.error(error?.message || "Failed to update screenshot settings");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Screenshot Settings</DialogTitle>
          <p className="text-sm text-gray-600">{taskTitle}</p>
        </DialogHeader>
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <Switch
              id="enable-screenshot"
              checked={enableScreenshot}
              onCheckedChange={setEnableScreenshot}
            />
            <Label htmlFor="enable-screenshot">Enable Screenshot Capture</Label>
          </div>

          {enableScreenshot && (
            <div className="space-y-2">
              <Label htmlFor="interval">Capture Interval (minutes)</Label>
              <Input
                id="interval"
                type="number"
                min="1"
                max="60"
                value={intervalMinutes}
                onChange={(e) => setIntervalMinutes(Number(e.target.value))}
                placeholder="Enter interval in minutes"
              />
            </div>
          )}

          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button
              onClick={handleSaveSettings}
              className="bg-[#4CAF50]"
              disabled={isLoading}
            >
              {isLoading ? "Saving..." : "Save Settings"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ScreenshotSettingsDialog;
