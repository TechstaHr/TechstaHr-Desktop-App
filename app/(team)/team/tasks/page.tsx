"use client";

import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { Button } from "@/components/ui/button";
import { Ellipsis, Loader2 } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  deleteTask,
  getAllTasks,
  updateTask,
} from "@/lib/actions/tasks.actions";
import { Badge } from "@/components/ui/badge";
import toast from "react-hot-toast";
import CreateModal, { CreateModalRef } from "@/components/modals/CreateModal";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useRef, useState, useEffect } from "react";

const statuses = [
  { id: "to_do", title: "TO DO" },
  { id: "in_progress", title: "IN PROGRESS" },
  { id: "done", title: "DONE" },
];

const MyTasks = () => {
  const queryClient = useQueryClient();
  const modalRef = useRef<CreateModalRef>(null);
  const [localTasks, setLocalTasks] = useState<any[]>([]);

  const { data: tasks, isLoading } = useQuery({
    queryKey: ["all-tasks"],
    queryFn: getAllTasks,
  });

  // Update local tasks when query data changes
  useEffect(() => {
    if (tasks) {
      setLocalTasks(tasks);
    }
  }, [tasks]);

  const statusMutation = useMutation({
    mutationFn: (params: { taskId: string; newStatus: string }) =>
      updateTask(params.taskId, { status: params.newStatus }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["all-tasks"] });
      toast.success("Task status updated");
    },
    onError: (error: any) => {
      toast.error(error?.message || "Failed to update task status");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (taskId: string) => deleteTask(taskId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["all-tasks"] });
      toast.success("Task deleted");
    },
    onError: (error: any) => {
      toast.error(error?.message || "Failed to delete task");
    },
  });

  const onDragEnd = (result: any) => {
    const { destination, source, draggableId } = result;

    if (!destination) return;
    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    )
      return;

    // Update local state immediately
    const newTasks = [...localTasks];
    const taskIndex = newTasks.findIndex((task) => task._id === draggableId);
    if (taskIndex === -1) return;

    const taskToMove = newTasks[taskIndex];
    const updatedTask = { ...taskToMove, status: destination.droppableId };

    // Remove from old position
    newTasks.splice(taskIndex, 1);
    // Add to new position (we're not tracking exact position within status, just status)
    newTasks.push(updatedTask);

    setLocalTasks(newTasks);

    // Call API to update the task's status
    statusMutation.mutate({
      taskId: draggableId,
      newStatus: destination.droppableId,
    });
  };

  const getTasksByStatus = (status: string) => {
    return localTasks?.filter((task) => task.status === status) || [];
  };

  const handleStatusChange = (taskId: string, newStatus: string) => {
    // Update local state immediately
    const newTasks = localTasks.map((task) =>
      task._id === taskId ? { ...task, status: newStatus } : task,
    );
    setLocalTasks(newTasks);

    // Call API
    statusMutation.mutate({ taskId, newStatus });
  };

  const TaskCard = ({ task, index }: { task: any; index: number }) => (
    <div
      key={index}
      className="mb-2 flex flex-col rounded-sm bg-white p-3 shadow-md hover:bg-gray-50"
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h3 className="my-1 font-semibold">{task.title}</h3>
          <p className="text-sm text-gray-600">{task.description}</p>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8 p-0">
              <Ellipsis size={16} />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem
              onClick={() => modalRef.current?.open(task)}
              className="font-medium"
            >
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem
              className="font-medium text-red-500"
              onClick={() => deleteMutation.mutate(task._id)}
            >
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <Badge
        className={`mt-2 w-fit rounded-full ${
          task.priority_tag === "low"
            ? "bg-green-200 text-green-400"
            : task.priority_tag === "medium"
              ? "bg-[#E9B200]"
              : task.priority_tag === "high"
                ? "bg-red-200 text-red-500"
                : "bg-red-100"
        } capitalize`}
      >
        {task.priority_tag}
      </Badge>

      <div className="mt-3 flex items-center justify-between">
        <p className="text-xs text-[#6B7280]">
          Due{" "}
          {new Date(task.deadline).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
          })}
        </p>

        <div className="flex gap-1">
          {statuses
            .filter((s) => s.id !== task.status)
            .map((status) => (
              <Button
                key={status.id}
                variant="outline"
                size="sm"
                className="h-6 text-xs"
                onClick={() => handleStatusChange(task._id, status.id)}
              >
                {status.title}
              </Button>
            ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-8 px-5">
      <h2 className="text-2xl font-medium">My Tasks</h2>

      <DragDropContext onDragEnd={onDragEnd}>
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-3 xl:gap-10">
          {statuses.map((status) => (
            <Droppable key={status.id} droppableId={status.id}>
              {(provided) => (
                <div
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                  className="h-fit space-y-5 rounded-md border p-4"
                >
                  <div className="flex items-center justify-between">
                    <p className="font-medium">{status.title}</p>
                    {status.id === "to_do" && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => modalRef.current?.open()}
                      >
                        + Add Task
                      </Button>
                    )}
                  </div>

                  {isLoading ? (
                    <div className="flex items-center gap-2 text-sm text-gray-400">
                      <Loader2 className="animate-spin" size={16} /> Loading
                      tasks...
                    </div>
                  ) : getTasksByStatus(status.id).length > 0 ? (
                    getTasksByStatus(status.id).map((task, index) => (
                      <Draggable
                        key={task._id}
                        draggableId={task._id}
                        index={index}
                      >
                        {(provided) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                          >
                            <TaskCard task={task} index={index} />
                          </div>
                        )}
                      </Draggable>
                    ))
                  ) : (
                    <p className="text-sm text-gray-400">
                      No tasks in this category.
                    </p>
                  )}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          ))}
        </div>
      </DragDropContext>

      <CreateModal ref={modalRef} />
    </div>
  );
};

export default MyTasks;
