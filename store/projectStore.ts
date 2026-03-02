// stores/projectStore.ts
import { create } from "zustand";
import { ProjectProps, ProjectPayload } from "@/types";
import {
  createProject,
  getAllProjects,
  getProjectById,
  updateProjectProgress,
  getAllProjectProgress,
} from "@/lib/actions/project.actions";

interface ProjectStore {
  project: ProjectProps | null;
  projects: ProjectProps[];
  loading: boolean;
  error: string | null;
  setProject: (project: ProjectProps) => void;
  fetchAllProjects: () => Promise<void>;
  fetchProjectById: (id: string) => Promise<void>;
  createNewProject: (data: ProjectPayload) => Promise<void>;
  updateProgress: (projectId: string, progress: number) => Promise<void>;
}

export const useProjectStore = create<ProjectStore>((set) => ({
  project: null,
  projects: [],
  loading: false,
  error: null,

  setProject: (project) => set({ project }),

  fetchAllProjects: async () => {
    set({ loading: true, error: null });
    try {
      const projects = await getAllProjects();
      set({ projects });
    } catch (error: any) {
      set({ error: error?.message || "Failed to fetch projects" });
    } finally {
      set({ loading: false });
    }
  },

  fetchProjectById: async (id: string) => {
    set({ loading: true, error: null });
    try {
      const project = await getProjectById(id);
      set({ project });
    } catch (error: any) {
      set({ error: error?.message || "Failed to fetch project" });
    } finally {
      set({ loading: false });
    }
  },

  createNewProject: async (data: ProjectPayload) => {
    set({ loading: true, error: null });
    try {
      const newProject = await createProject(data);
      set((state) => ({ projects: [...state.projects, newProject] }));
    } catch (error: any) {
      set({ error: error?.message || "Failed to create project" });
    } finally {
      set({ loading: false });
    }
  },

  updateProgress: async (projectId, progress) => {
    set({ loading: true, error: null });
    try {
      const updatedProject = await updateProjectProgress(projectId, progress);
      set((state) => ({
        projects: state.projects.map((p) =>
          p._id === updatedProject._id ? updatedProject : p,
        ),
        project:
          state.project?._id === updatedProject._id
            ? updatedProject
            : state.project,
      }));
    } catch (error: any) {
      set({ error: error?.message || "Failed to update progress" });
    } finally {
      set({ loading: false });
    }
  },
}));
