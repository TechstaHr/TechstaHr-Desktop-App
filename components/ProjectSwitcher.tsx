"use client";

import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getAllProjects } from "@/lib/actions/project.actions";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { ProjectProps } from "@/types";

const ProjectSwitcher = () => {
  const { data: projects = [] } = useQuery<ProjectProps[]>({
    queryKey: ["all-projects"],
    queryFn: getAllProjects,
    staleTime: 5 * 60 * 1000,
  });

  const [selected, setSelected] = useState<string | undefined>(undefined);

  useEffect(() => {
    try {
      const id = typeof window !== "undefined" ? localStorage.getItem("currentProjectId") : null;
      if (id) setSelected(id);
    } catch {}
  }, []);

  useEffect(() => {
    try {
      const stored = typeof window !== "undefined" ? localStorage.getItem("currentProjectId") : null;
      if (!stored && !selected && projects.length > 0) {
        const firstId = projects[0]._id;
        setSelected(firstId);
        localStorage.setItem("currentProjectId", firstId);
      }
    } catch {}
  }, [projects, selected]);

  if (!projects || projects.length === 0) return null;

  return (
    <div className="w-[220px]">
      <Select
        value={selected}
        onValueChange={(val) => {
          setSelected(val);
          try {
            localStorage.setItem("currentProjectId", val);
          } catch {}
        }}
      >
        <SelectTrigger className="h-9">
          <SelectValue placeholder="Select project" />
        </SelectTrigger>
        <SelectContent>
          {projects.map((p) => (
            <SelectItem key={p._id} value={p._id}>
              {p.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default ProjectSwitcher;

