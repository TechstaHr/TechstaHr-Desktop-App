"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Drawer, DrawerContent, DrawerTrigger } from "@/components/ui/drawer";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ChevronDown } from "lucide-react";
import { useMediaQuery } from "@/hooks/use-mobile";

// Assignee type
type Assignee = {
  value: string;
  label: string;
};

const defaultAssignees: Assignee[] = [
    { value: "me", label: "Current User" },
  { value: "unassigned", label: "Unassigned" },
  // You can dynamically append API users later
];

export function AssigneeBox() {
  const [open, setOpen] = React.useState(false);
  const isDesktop = useMediaQuery("(min-width: 768px)");
  const [selectedAssignee, setSelectedAssignee] =
    React.useState<Assignee | null>(null);

  if (isDesktop) {
    return (
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className="w-fit justify-start rounded-sm md:h-9"
          >
            {selectedAssignee ? <>{selectedAssignee.label}</> : <>Assignee</>}
            <ChevronDown size={16} className="ml-2" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[200px] p-0" align="start">
          <AssigneeList
            setOpen={setOpen}
            setSelectedAssignee={setSelectedAssignee}
          />
        </PopoverContent>
      </Popover>
    );
  }

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>
        <Button variant="outline" className="w-fit justify-start">
          {selectedAssignee ? <>{selectedAssignee.label}</> : <>Assignee</>}
          <ChevronDown size={16} className="ml-2" />
        </Button>
      </DrawerTrigger>
      <DrawerContent>
        <div className="mt-4 border-t">
          <AssigneeList
            setOpen={setOpen}
            setSelectedAssignee={setSelectedAssignee}
          />
        </div>
      </DrawerContent>
    </Drawer>
  );
}

function AssigneeList({
  setOpen,
  setSelectedAssignee,
}: {
  setOpen: (open: boolean) => void;
  setSelectedAssignee: (assignee: Assignee | null) => void;
}) {
  const assignees = defaultAssignees; // Later: append backend users dynamically

  return (
    <Command>
      <CommandInput placeholder="Search assignee..." />
      <CommandList>
        <CommandEmpty>No assignees found.</CommandEmpty>
        <CommandGroup>
          {assignees.map((assignee) => (
            <CommandItem
              key={assignee.value}
              value={assignee.value}
              onSelect={(value) => {
                setSelectedAssignee(
                  assignees.find((a) => a.value === value) || null,
                );
                setOpen(false);
              }}
            >
              {assignee.label}
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </Command>
  );
}
