// components/ManualTimeEntry.tsx
"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CalendarIcon, ClockIcon } from "lucide-react";

const ManualTimeEntry: React.FC = () => {
  return (
    <div className="space-y-4 rounded-lg border bg-white p-3 shadow-sm md:p-6">
      <h3 className="text-base font-medium">Manual Time Entry</h3>
      <div className="grid gap-4 lg:grid-cols-3">
        <div>
          <Label>Date</Label>
          <div className="relative">
            <Input type="date" />
            <CalendarIcon className="absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2 transform text-muted-foreground" />
          </div>
        </div>
        <div>
          <Label>Start Time</Label>
          <div className="relative">
            <Input type="time" />
            <ClockIcon className="absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2 transform text-muted-foreground" />
          </div>
        </div>
        <div>
          <Label>End Time</Label>
          <div className="relative">
            <Input type="time" />
            <ClockIcon className="absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2 transform text-muted-foreground" />
          </div>
        </div>
      </div>
      <Button className="bg-green-600 hover:bg-green-700">Submit Entry</Button>
    </div>
  );
};

export default ManualTimeEntry;
