import { ProjectPayload } from "@/types";
import axios from "axios";
import { getToken } from "@/lib/auth";
import { handleError } from "../utils";

const url = "https://techstahr-backend.onrender.com/api/v1";

// Create a new project
export const createProject = async (data: ProjectPayload) => {
  const token = getToken();

  if (!token) {
    throw new Error("Authentication token not found.");
  }

  try {
    const response = await axios.post(`${url}/project`, data, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data;
  } catch (error: any) {
    handleError("Create project", error);
  }
};

// Get all projects
export const getAllProjects = async () => {
  const token = getToken();

  if (!token) {
    throw new Error("Authentication token not found.");
  }

  try {
    const response = await axios.get(`${url}/project`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data;
  } catch (error: any) {
    handleError("Get projects", error);
  }
};

// Get a single project by ID
export const getProjectById = async (projectId: string) => {
  const token = getToken();

  if (!token) {
    throw new Error("Authentication token not found.");
  }

  try {
    const response = await axios.get(`${url}/project/${projectId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data;
  } catch (error: any) {
    handleError("Get single project", error);
  }
};

// Get my project by user
export const getUserProjects = async () => {
  const token = getToken();

  if (!token) {
    throw new Error("Authentication token not found.");
  }

  try {
    const response = await axios.get(`${url}/project/my-projects`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data;
  } catch (error: any) {
    handleError("Get user projects", error);
  }
};

// PUT: Update project status
export const updateProjectStatus = async (
  projectId: string,
  status: string,
) => {
  const token = getToken();

  if (!token) throw new Error("Authentication token not found.");

  try {
    const response = await axios.put(
      `${url}/project/status/${projectId}`,
      { status },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      },
    );

    return response.data;
  } catch (error: any) {
    handleError("Update project status", error);
  }
};

// PUT: Update project progress
export const updateProjectProgress = async (
  projectId: string,
  progress: number,
) => {
  const token = getToken();

  if (!token) throw new Error("Authentication token not found.");

  try {
    const response = await axios.put(
      `${url}/project/progress/${projectId}`,
      { progress },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      },
    );

    return response.data;
  } catch (error: any) {
    handleError("Update project progress", error);
  }
};

// GET: Get all project progress values
export const getAllProjectProgress = async () => {
  const token = getToken();

  if (!token) throw new Error("Authentication token not found.");

  try {
    const response = await axios.get(`${url}/project/progress/all`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data;
  } catch (error: any) {
    handleError("Get all project progress", error);
  }
};

// GET: Get all project stats
export const getProjectStats = async () => {
  const token = getToken();

  if (!token) throw new Error("Authentication token not found.");

  try {
    const response = await axios.get(`${url}/project/project-stats`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data;
  } catch (error: any) {
    handleError("Get project stats", error);
  }
};

// GET: Get assigned team members
export const getAssignedTeamMembers = async () => {
  const token = getToken();

  if (!token) throw new Error("Authentication token not found.");

  try {
    const response = await axios.get(`${url}/project/assigned/team-members`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data;
  } catch (error: any) {
    handleError("Get assigned team members", error);
  }
};

// GET: Get assigned team members to a project
export const getAssignedTeamMembersToProject = async (projectId: string) => {
  const token = getToken();

  if (!token) throw new Error("Authentication token not found.");

  try {
    const response = await axios.get(
      `${url}/project/assigned/members/${projectId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );

    return response.data;
  } catch (error: any) {
    handleError("Get assigned team members", error);
  }
};

// DELETE: Delete project
export const deleteProject = async (projectId: string) => {
  const token = getToken();

  if (!token) throw new Error("Authentication token not found.");

  try {
    const response = await axios.delete(`${url}/project/${projectId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data;
  } catch (error: any) {
    handleError("Get assigned team members", error);
  }
};

export const getInvitations = async () => {
  const token = getToken();

  if (!token) throw new Error("Authentication token not found.");

  try {
    const response = await axios.get(`${url}/project/invitations`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data;
  } catch (error: any) {
    handleError("Get assigned team members", error);
  }
};

export const acceptInvitation = async (inviteId: string) => {
  const token = getToken();
  if (!token) throw new Error("Authentication token not found.");

  try {
    const response = await axios.post(
      `${url}/project/accept-invite/${inviteId}`,
      {},
      { headers: { Authorization: `Bearer ${token}` } },
    );
    return response.data;
  } catch (error: any) {
    handleError(`Accept invite ${inviteId}`, error);
  }
};

export const rejectInvitation = async (inviteId: string) => {
  const token = getToken();
  if (!token) throw new Error("Authentication token not found.");

  try {
    const response = await axios.post(
      `${url}/project/reject-invite/${inviteId}`,
      {},
      { headers: { Authorization: `Bearer ${token}` } },
    );
    return response.data;
  } catch (error: any) {
    handleError(`Reject invite ${inviteId}`, error);
  }
};

export const assignTeamMembers = async (
  projectId: string,
  teamMembers: string[],
) => {
  const token = getToken();
  if (!token) throw new Error("Authentication token not found.");

  try {
    const response = await axios.post(
      `${url}/project/${projectId}/assign-members`,
      { teamMembers },
      { headers: { Authorization: `Bearer ${token}` } },
    );
    return response.data;
  } catch (error: any) {
    handleError(`Assign members to project ${projectId}`, error);
  }
};

export const removeTeamMember = async (
  projectId: string,
  teamMemberId: string,
) => {
  const token = getToken();
  if (!token) throw new Error("Authentication token not found.");

  try {
    const response = await axios.delete(
      `${url}/project/${projectId}/remove-member`,
      {
        headers: { Authorization: `Bearer ${token}` },
        data: { teamMemberId },
      },
    );
    return response.data;
  } catch (error: any) {
    handleError(
      `Remove member ${teamMemberId} from project ${projectId}`,
      error,
    );
  }
};

export const getPendingInvitations = async () => {
  const token = getToken();
  if (!token) throw new Error("Authentication token not found.");

  try {
    const response = await axios.get(
      `${url}/project/team/pending-invitations`,
      {
        headers: { Authorization: `Bearer ${token}` },
      },
    );
    return response.data;
  } catch (error: any) {
    handleError("Get pending invitations", error);
  }
};

export const getProjectDailySummary = async (
  projectId: string,
  date: string,
) => {
  const token = getToken();
  if (!token) throw new Error("Authentication token not found.");

  try {
    const response = await axios.get(
      `${url}/project/daily-summary/${projectId}/${date}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      },
    );
    return response.data;
  } catch (error: any) {
    handleError("Get project summary", error);
  }
};
