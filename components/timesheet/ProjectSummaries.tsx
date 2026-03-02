// components/ProjectSummaries.tsx
"use client";

import React from "react";
import DashboardDailySummaries from "@/components/DashboardDailySummaries";

interface ProjectSummariesProps {
  projects: any;
}

const ProjectSummaries: React.FC<ProjectSummariesProps> = ({ projects }) => {
  return (
    <>
      {projects?.map((project: any) => (
        <DashboardDailySummaries key={project.id} projectId={project.id} />
      ))}
    </>
  );
};

export default ProjectSummaries;
