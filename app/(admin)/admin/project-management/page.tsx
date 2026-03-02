"use client";

import { Button } from "@/components/ui/button";
import { useRef } from "react";
import ProjectModal, {
  ProjectModalRef,
} from "@/components/modals/ProjectModal";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { deleteProject, getAllProjects } from "@/lib/actions/project.actions";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu"; // adjust import to your path
import { EllipsisVertical } from "lucide-react";
import toast from "react-hot-toast";

export default function ProjectManagement() {
  const modalRef = useRef<ProjectModalRef>(null);
  const naviagte = useRouter();
  const { data: projects, isLoading } = useQuery({
    queryKey: ["all-projects"],
    queryFn: getAllProjects,
    staleTime: 5 * 60 * 1000,
  });

  const queryClient = useQueryClient();

  const handleClick = (id: string) => {
    // Save project ID to localStorage and navigate to details page
    localStorage.setItem('currentProjectId', id);
    naviagte.push(`/admin/project-management/details`);
  };

  const onEdit = (projectId: string) => {
    // Replace with your edit logic
    console.log("Edit project:", projectId);
  };

  const onDelete = async (projectId: string) => {
    // Replace with your delete logic
    const res = await deleteProject(projectId);
    toast.success(res?.message);
    queryClient.invalidateQueries({ queryKey: ["all-projects"] });
  };

  if (isLoading) {
    return <p className="p-4">Loading projects...</p>;
  }

  if (!projects || projects.length === 0) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center space-y-4">
        <p className="text-lg text-gray-500">No projects found.</p>
        <Button
          className="bg-[#4CAF50] text-white"
          onClick={() => modalRef.current?.open()}
        >
          Create Your First Project
        </Button>

        <ProjectModal ref={modalRef} />
      </div>
    );
  }

  return (
    <div className="p-4">
      <h1 className="mb-4 text-2xl font-bold">All Projects</h1>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {projects.map((proj) => (
          <div
            key={proj._id}
            onClick={() => handleClick(proj._id)}
            className="relative cursor-pointer rounded bg-white p-4 shadow transition"
          >
            <div className="flex items-start justify-between gap-2">
              <h2 className="text-lg font-semibold">{proj.name}</h2>

              {/* Ellipsis button with dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    type="button"
                    onClick={(e) => e.stopPropagation()} // Prevents parent onClick
                    className="rounded p-1 text-gray-500 hover:bg-gray-100"
                  >
                    <EllipsisVertical className="h-5 w-5" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-32">
                  <DropdownMenuItem onClick={() => onEdit(proj._id)}>
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => onDelete(proj._id)}
                    className="text-red-600"
                  >
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            <p className="mt-2 text-sm text-gray-600">
              {proj.description || "No description provided."}
            </p>
            <Badge className="mt-2 capitalize">{proj.status}</Badge>
          </div>
        ))}
      </div>
    </div>
  );
}
