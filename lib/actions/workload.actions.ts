import axios from "axios";
import { getToken } from "@/lib/auth";
import { handleError } from "../utils";

const url = "https://techstahr-backend.onrender.com/api/v1";

export const getWorkloads = async () => {
  const token = getToken();
  if (!token) throw new Error("Authentication token not found.");
  try {
    const response = await axios.get(`${url}/task/workload`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error: any) {
    handleError("Get workloads", error);
  }
};

export const assignWorkload = async (data: {
  userId: string;
  taskId: string;
  workloadPoints?: number;
  status?: string;
}) => {
  const token = getToken();
  if (!token) throw new Error("Authentication token not found.");
  try {
    const response = await axios.post(`${url}/task/workload/assign`, data, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error: any) {
    handleError("Assign workload", error);
  }
};

export const updateWorkload = async (
  id: string,
  data: { userId?: string; taskId?: string; status?: string; workloadPoints?: number },
) => {
  const token = getToken();
  if (!token) throw new Error("Authentication token not found.");
  try {
    const response = await axios.put(`${url}/task/workload/${id}`, data, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error: any) {
    handleError("Update workload", error);
  }
};

export const deleteWorkload = async (id: string) => {
  const token = getToken();
  if (!token) throw new Error("Authentication token not found.");
  try {
    const response = await axios.delete(`${url}/task/workload/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error: any) {
    handleError("Delete workload", error);
  }
};

export const getUserWorkloadLimit = async (userId: string) => {
  const token = getToken();
  if (!token) throw new Error("Authentication token not found.");
  try {
    const response = await axios.get(`${url}/task/workload/limit/${userId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error: any) {
    handleError("Get workload limit", error);
  }
};

export const updateUserWorkloadLimit = async (
  userId: string,
  maxTasksPerUser: number,
) => {
  const token = getToken();
  if (!token) throw new Error("Authentication token not found.");
  try {
    const response = await axios.put(
      `${url}/task/workload/limit/${userId}`,
      { maxTasksPerUser },
      { headers: { Authorization: `Bearer ${token}` } },
    );
    return response.data;
  } catch (error: any) {
    handleError("Update workload limit", error);
  }
};

