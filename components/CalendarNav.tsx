"use client";

import { CalendarIcon } from "lucide-react";
import React, { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { addDays, format } from "date-fns";
import { cn } from "@/lib/utils";
import SearchBar from "./Searchbar";
import { StatusBox } from "./StatusBox";
import { AssigneeBox } from "./AssigneeBox";

const CalendarNav = () => {
  const [date, setDate] = useState<Date>();

  return (
    <div className="flex flex-wrap gap-3 items-center justify-between">
      <div className="flex items-center gap-3">
        <SearchBar />
        <AssigneeBox />
        {/* Status */}
        <StatusBox />
      </div>

      <div className="flex items-center gap-3">
        <div className="flex w-fit items-center justify-center rounded-sm border p-2 text-sm">
          <span>Today</span>
        </div>

        {/* date picker */}
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant={"outline"}
              className={cn(
                "w-fit justify-start rounded-sm text-left text-sm font-normal",
                !date && "text-muted-foreground",
              )}
            >
              <CalendarIcon />
              {date ? format(date, "MMMM d") : <span>Pick a date</span>}
            </Button>
          </PopoverTrigger>
          <PopoverContent
            align="start"
            className="flex w-auto flex-col space-y-2 p-2"
          >
            <Select
              onValueChange={(value) =>
                setDate(addDays(new Date(), parseInt(value)))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select" />
              </SelectTrigger>
              <SelectContent position="popper">
                <SelectItem value="0">Today</SelectItem>
                <SelectItem value="1">Tomorrow</SelectItem>
                <SelectItem value="3">In 3 days</SelectItem>
                <SelectItem value="7">In a week</SelectItem>
              </SelectContent>
            </Select>
            <div className="rounded-md border">
              <Calendar mode="single" selected={date} onSelect={setDate} />
            </div>
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
};

export default CalendarNav;
