// Tasks Queries
import { TaskPayload, updateTaskPayload } from "@/types";
import axios from "axios";
import { getToken } from "@/lib/auth";
import { handleError } from "../utils";

const url = "https://techstahr-backend.onrender.com/api/v1";

export const createTask = async (data: TaskPayload) => {
  const token = getToken();

  if (!token) {
    throw new Error("Authentication token not found.");
  }

  try {
    const response = await axios.post(`${url}/task/create`, data, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data;
  } catch (error: any) {
    handleError("Create task", error);
  }
};

export const getAllTasks = async () => {
  const token = getToken();

  if (!token) {
    throw new Error("Authentication token not found.");
  }

  try {
    const response = await axios.get(`${url}/task/all`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data;
  } catch (error: any) {
    handleError("Get tasks", error);
  }
};

export const getTaskById = async (taskId: string) => {
  const token = getToken();

  if (!token) {
    throw new Error("Authentication token not found.");
  }

  try {
    const response = await axios.get(`${url}/task/${taskId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data;
  } catch (error: any) {
    handleError("Get task by ID", error);
  }
};

export const updateTask = async (taskId: string, data: updateTaskPayload) => {
  const token = getToken();

  if (!token) {
    throw new Error("Authentication token not found.");
  }

  try {
    const response = await axios.put(`${url}/task/${taskId}`, data, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data;
  } catch (error: any) {
    handleError("Update task", error);
  }
};

export const deleteTask = async (taskId: string) => {
  const token = getToken();

  if (!token) {
    throw new Error("Authentication token not found.");
  }

  try {
    const response = await axios.delete(`${url}/task/${taskId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data;
  } catch (error: any) {
    handleError("Delete task", error);
  }
};
