// store/timerStore.ts
import { ProjectProps } from "@/types";
import { create } from "zustand";
import { persist } from "zustand/middleware";

interface TimerStore {
  isRunning: boolean;
  startTime: number | null;
  stopTime: number | null;
  elapsed: number;
  projectId: string | null;
  selectedProject: ProjectProps | null; // Add this
  start: () => void;
  stop: () => void;
  reset: () => void;
  setProjectId: (id: string) => void;
  setSelectedProject: (project: ProjectProps | null) => void; // Add this
}

export const useTimerStore = create<TimerStore>()(
  persist(
    (set, get) => {
      let interval: NodeJS.Timeout;

      const start = () => {
        const now = Date.now();
        set({ isRunning: true, startTime: now, stopTime: null, elapsed: 0 });

        interval = setInterval(() => {
          const currentElapsed = Math.floor((Date.now() - now) / 1000);
          set({ elapsed: currentElapsed });
        }, 1000);
      };

      const stop = () => {
        if (get().startTime) {
          clearInterval(interval);
          const now = Date.now();
          set({
            isRunning: false,
            stopTime: now,
            elapsed: Math.floor((now - get().startTime!) / 1000),
          });
        }
      };

      const reset = () => {
        clearInterval(interval);
        set({
          isRunning: false,
          startTime: null,
          stopTime: null,
          elapsed: 0,
          projectId: null,
          selectedProject: null, // Reset selected project too
        });
      };

      return {
        isRunning: false,
        startTime: null,
        stopTime: null,
        elapsed: 0,
        projectId: null,
        selectedProject: null, // Add this
        start,
        stop,
        reset,
        setProjectId: (id) => set({ projectId: id }),
        setSelectedProject: (project) => set({ selectedProject: project }),
      };
    },
    {
      name: "timer-store",
      partialize: (state) => ({
        isRunning: state.isRunning,
        startTime: state.startTime,
        stopTime: state.stopTime,
        elapsed: state.elapsed,
        projectId: state.projectId,
        selectedProject: state.selectedProject,
      }),
    },
  ),
);
