"use client";

import React, { useState } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin, { DateClickArg } from "@fullcalendar/interaction";
import { EventClickArg, EventDropArg } from "@fullcalendar/core/index.js";
import { Input } from "./ui/input";
import { useQuery } from "@tanstack/react-query";
import { getUserProjects } from "@/lib/actions/project.actions";
import { getAllTasks } from "@/lib/actions/tasks.actions";

type Task = {
  id: string;
  title: string;
  date: string;
};

export default function TaskCalendar() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [newTaskTitle, setNewTaskTitle] = useState("");

  const [selectedEvent, setSelectedEvent] = useState<{
    id: string;
    title: string;
    start: string;
    extendedProps?: any;
  } | null>(null);

  const { data: userProjects } = useQuery({
    queryKey: ["user-projects"],
    queryFn: getUserProjects,
    staleTime: 5 * 60 * 1000,
  });

  const { data: allTasks, isLoading } = useQuery({
    queryKey: ["all-tasks"],
    queryFn: getAllTasks,
  });

  const taskEvents =
    allTasks?.map((task) => ({
      id: task._id,
      title: task.title,
      start: task.deadline,
      color: "#38bdf8", // optional: blue for tasks
      extendedProps: {
        description: task.description,
        type: "Task",
      },
    })) || [];

  const projectEvents =
    userProjects?.projects.map((project) => ({
      id: project._id,
      title: project.name,
      start: project.deadline,
      color: "#f97316", // optional: orange for projects
      extendedProps: {
        description: project.description,
        type: "Project",
      },
    })) || [];

  const events = [...projectEvents, ...taskEvents];

  // Open modal on date click
  const handleDateClick = (arg: DateClickArg) => {
    setSelectedDate(arg.dateStr);
    setNewTaskTitle("");
    setIsModalOpen(true);
  };

  // Add new task
  const addTask = () => {
    if (newTaskTitle.trim() && selectedDate) {
      const newTask: Task = {
        id: String(Date.now()),
        title: newTaskTitle,
        date: selectedDate,
      };
      setTasks((prev) => [...prev, newTask]);
      setIsModalOpen(false);
    }
  };

  // Drag + drop task to another day
  const handleEventDrop = (arg: EventDropArg) => {
    const updatedTasks = tasks.map((task) =>
      task.id === arg.event.id ? { ...task, date: arg.event.startStr } : task,
    );
    setTasks(updatedTasks);
  };

  // Open delete modal on event click
  const handleEventClick = (arg: EventClickArg) => {
    setDeleteModalOpen(true);
    setSelectedEvent({
      id: arg.event.id,
      title: arg.event.title,
      start: arg.event.start?.toISOString() || "",
      extendedProps: arg.event.extendedProps,
    });
  };

  // Confirm deletion
  const confirmDelete = () => {
    if (selectedEvent) {
      setTasks((prev) => prev.filter((task) => task.id !== selectedEvent.id));
      setDeleteModalOpen(false);
      setSelectedEvent(null);
    }
  };

  return (
    <div className="relative p-4">
      <FullCalendar
        headerToolbar={{
          start: "title",
          center: "dayGridMonth,timeGridWeek,timeGridDay",
          end: "today prev,next",
        }}
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        editable={true}
        droppable={true}
        events={events}
        dateClick={handleDateClick}
        eventDrop={handleEventDrop}
        eventClick={handleEventClick}
        height="auto"
      />

      {/* Task Creation Modal */}
      {isModalOpen && (
        <div className="absolute left-1/2 top-10 z-10 w-96 -translate-x-1/2 rounded-md border bg-white p-4 shadow-lg">
          <h2 className="mb-2 text-lg font-semibold">Add Task</h2>
          <p className="mb-2 text-sm text-gray-600">For: {selectedDate}</p>
          <Input
            type="text"
            className="w-full rounded border bg-white px-2 py-1"
            placeholder="Task title"
            value={newTaskTitle}
            onChange={(e) => setNewTaskTitle(e.target.value)}
          />
          <div className="mt-4 flex justify-end gap-2">
            <button
              onClick={() => setIsModalOpen(false)}
              className="px-3 py-1 text-sm text-gray-600 hover:underline"
            >
              Cancel
            </button>
            <button
              onClick={addTask}
              className="rounded bg-blue-600 px-3 py-1 text-sm text-white hover:bg-blue-700"
            >
              Add Task
            </button>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteModalOpen && selectedEvent && (
        <div className="absolute left-1/2 top-20 z-20 w-96 -translate-x-1/2 rounded-md border bg-white p-4 shadow-lg">
          <h2 className="mb-2 text-lg font-semibold">{selectedEvent.title}</h2>

          <p className="mb-2 text-sm text-gray-600">
            <strong>Type:</strong> {selectedEvent.extendedProps?.type}
          </p>
          <p className="mb-2 text-sm text-gray-600">
            <strong>Description:</strong>{" "}
            {selectedEvent.extendedProps?.description || "No description"}
          </p>
          <div className="flex justify-end gap-2">
            <button
              onClick={() => {
                setDeleteModalOpen(false);
                setSelectedEvent(null);
              }}
              className="px-3 py-1 text-sm text-gray-600 hover:underline"
            >
              Cancel
            </button>
            <button
              onClick={confirmDelete}
              className="rounded bg-red-600 px-3 py-1 text-sm text-white hover:bg-red-700"
            >
              Delete
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
