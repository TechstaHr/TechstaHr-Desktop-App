"use client";

import React, { useState } from "react";
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
} from "@hello-pangea/dnd";
import { Columns, ColumnType } from "../types";
import { Ellipsis, Camera, Play, Square, Eye } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

import { deleteTask, updateTask } from "@/lib/actions/tasks.actions";
import {
  getAllScreenshots,
  stopScreenshotCapture,
} from "@/lib/actions/screenshot.actions";
import toast from "react-hot-toast";
import ScreenshotSettingsDialog from "./screenshots/ScreenSettingsDialog";
import ScreenshotGallery from "./screenshots/ScreenshotGallery";
import { useQueryClient } from "@tanstack/react-query";

interface KanbanBoardProps {
  columns: Columns;
  setColumns: React.Dispatch<React.SetStateAction<Columns>>;
}

const KanbanBoard: React.FC<KanbanBoardProps> = ({ columns, setColumns }) => {
  const [screenshotDialogOpen, setScreenshotDialogOpen] = useState<
    string | null
  >(null);
  const [galleryState, setGalleryState] = useState<{
    isOpen: boolean;
    screenshots: any[];
    taskTitle: string;
  }>({
    isOpen: false,
    screenshots: [],
    taskTitle: "",
  });  

  const queryClient = useQueryClient();

  const onDragEnd = async (result: DropResult) => {
    const { source, destination } = result;
    if (!destination) return;

    const sourceCol = source.droppableId as ColumnType;
    const destCol = destination.droppableId as ColumnType;

    const sourceTasks = [...columns[sourceCol]];
    const [movedTask] = sourceTasks.splice(source.index, 1);

    if (sourceCol === destCol) {
      sourceTasks.splice(destination.index, 0, movedTask);
      setColumns({
        ...columns,
        [sourceCol]: sourceTasks,
      });
    } else {
      const destTasks = [...columns[destCol]];
      destTasks.splice(destination.index, 0, movedTask);

      setColumns({
        ...columns,
        [sourceCol]: sourceTasks,
        [destCol]: destTasks,
      });

      // Call API to update the task's status
      try {
        const response = await updateTask(movedTask.id, {
          status: destCol.toLowerCase(),
        });
        toast.success(response?.message || "Task status updated successfully.");
      } catch (err: any) {
        console.error("Failed to update task status:", err);
        toast.error(err?.message || "Failed to update task status.");
      }
    }
  };

  const handleViewScreenshots = async (taskId: string, taskTitle: string) => {
    try {
      const response = await getAllScreenshots(taskId);
      if (response?.history && response.history.length > 0) {
        setGalleryState({
          isOpen: true,
          screenshots: response.history,
          taskTitle: taskTitle,
        });
        toast.success(
          `Found ${response.history.length} screenshots for ${taskTitle}`,
        );
      } else {
        toast.error("No screenshots found for this task");
      }
    } catch (error: any) {
      toast.error(error?.message || "Failed to fetch screenshots");
    }
  };

  const handleStopScreenshots = async (taskId: string, taskTitle: string) => {
    try {
      const response = await stopScreenshotCapture(taskId);
      toast.success(
        response?.message || `Screenshot capture stopped for ${taskTitle}`,
      );
      queryClient.invalidateQueries({ queryKey: ["project"] });
    } catch (error: any) {
      toast.error(error?.message || "Failed to stop screenshot capture");
    }
  };

  const closeGallery = () => {
    setGalleryState({
      isOpen: false,
      screenshots: [],
      taskTitle: "",
    });
  };

  return (
    <>
      <DragDropContext onDragEnd={onDragEnd}>
        <div className="mb-10 grid grid-cols-1 items-start gap-6 lg:grid-cols-3">
          {Object.entries(columns).map(([columnId, tasks]) => (
            <div key={columnId} className="rounded-md bg-white p-4">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-xl font-semibold">
                  {columnId === "to_do"
                    ? "To Do"
                    : columnId === "in_progress"
                      ? "In Progress"
                      : "Done"}
                </h2>
                <p className="rounded-sm bg-[#F3F4F6] px-2 py-1 text-sm font-semibold text-gray-500">
                  {tasks.length}
                </p>
              </div>

              <Droppable droppableId={columnId}>
                {(provided) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className="min-h-[100px] space-y-4"
                  >
                    {tasks.map((task, index) => (
                      <Draggable
                        key={task.id}
                        draggableId={task.id}
                        index={index}
                      >
                        {(provided) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className={`rounded-sm bg-white p-4 shadow ${
                              task.blocked
                                ? "border border-red-300 bg-red-50"
                                : ""
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <div>
                                <span
                                  className={`rounded bg-${task.tagColor}-100 px-2 py-1 text-xs font-medium capitalize text-${task.tagColor}-700`}
                                >
                                  {task.tag}
                                </span>
                                {task.blocked && (
                                  <span className="ml-2 rounded bg-red-200 px-2 py-1 text-xs font-medium text-red-800">
                                    Blocked
                                  </span>
                                )}
                              </div>

                              <div className="relative">
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Ellipsis
                                      size={16}
                                      className="cursor-pointer"
                                    />
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent className="w-56">
                                    <DropdownMenuLabel>
                                      Task Actions
                                    </DropdownMenuLabel>

                                   

                                    {/* Status Change Section */}
                                    <DropdownMenuLabel className="text-xs font-normal text-gray-500">
                                      Change Status
                                    </DropdownMenuLabel>

                                    {Object.keys(columns)
                                      .filter((col) => col !== columnId)
                                      .map((col) => (
                                        <DropdownMenuItem
                                          key={col}
                                          onClick={async () => {
                                            const sourceCol =
                                              columnId as ColumnType;
                                            const destCol = col as ColumnType;

                                            const sourceTasks = [
                                              ...columns[sourceCol],
                                            ];
                                            const [movedTask] =
                                              sourceTasks.splice(index, 1);
                                            const destTasks = [
                                              ...columns[destCol],
                                            ];
                                            destTasks.unshift(movedTask);

                                            setColumns({
                                              ...columns,
                                              [sourceCol]: sourceTasks,
                                              [destCol]: destTasks,
                                            });

                                            try {
                                              await updateTask(movedTask.id, {
                                                status: destCol.toLowerCase(),
                                              });
                                            } catch (err: any) {
                                              console.error(
                                                "Error updating task via dropdown:",
                                                err,
                                              );
                                              toast.error(
                                                err?.message ||
                                                  "Failed to update task status.",
                                              );
                                            }
                                          }}
                                        >
                                          Move to{" "}
                                          {col === "to_do"
                                            ? "To Do"
                                            : col === "in_progress"
                                              ? "In Progress"
                                              : "Done"}
                                        </DropdownMenuItem>
                                      ))}

                                    <DropdownMenuSeparator />

                                    <DropdownMenuItem
                                      className="text-red-600 focus:bg-red-100"
                                      onClick={async () => {
                                        const sourceCol =
                                          columnId as ColumnType;
                                        const sourceTasks = [
                                          ...columns[sourceCol],
                                        ];
                                        const [deletedTask] =
                                          sourceTasks.splice(index, 1);

                                        setColumns({
                                          ...columns,
                                          [sourceCol]: sourceTasks,
                                        });

                                        try {
                                          const res = await deleteTask(
                                            deletedTask.id,
                                          );
                                          toast.success(res?.message);
                                        } catch (err: any) {
                                          toast.error(
                                            err?.message ||
                                              "Failed to delete task.",
                                          );
                                          console.error(
                                            "Failed to delete task:",
                                            err,
                                          );
                                        }
                                      }}
                                    >
                                      Delete Task
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </div>
                            </div>
                            <h3 className="my-2 font-semibold">{task.title}</h3>
                            <p className="text-sm text-gray-600">
                              {task.description}
                            </p>
                            <div className="mt-2 flex items-center justify-between">
                              <div className="mt-2 flex items-center gap-1">
                                <p className="text-xs">{task.owner}</p>
                                {/* <Image src={UserAvatar} alt="user avatar" /> */}
                                <p className="text-xs text-[#6B7280]">
                                  {`Due ${task.due}`}
                                </p>
                              </div>
                            </div>
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </div>
          ))}
        </div>

        {/* Screenshot Settings Dialog */}
        {screenshotDialogOpen && (
          <ScreenshotSettingsDialog
            taskId={screenshotDialogOpen}
            taskTitle={
              Object.values(columns)
                .flat()
                .find((task) => task.id === screenshotDialogOpen)?.title || ""
            }
            isOpen={!!screenshotDialogOpen}
            onClose={() => setScreenshotDialogOpen(null)}
            enableScreenshotDefault={
              Object.values(columns)
                .flat()
                .find((task) => task.id === screenshotDialogOpen)?.enableScreenshot ?? false
            }
            screenshotIntervalMinutes={
              Object.values(columns)
                .flat()
                .find((task) => task.id === screenshotDialogOpen)?.screenshotIntervalMinutes ?? 5
            }
          />
        )}
      </DragDropContext>

      {/* Screenshot Gallery Modal */}
      <ScreenshotGallery
        screenshots={galleryState.screenshots}
        taskTitle={galleryState.taskTitle}
        isOpen={galleryState.isOpen}
        onClose={closeGallery}
      />
    </>
  );
};

export default KanbanBoard;
