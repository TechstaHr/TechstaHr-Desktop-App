import { createIssueProps } from "@/types";
import axios from "axios";
import { getToken } from "@/lib/auth";
import { handleError } from "../utils";

const url = "https://techstahr-backend.onrender.com/api/v1";

export const createIssue = async ({
  projectId,
  data,
}: {
  projectId: string;
  data: createIssueProps;
}) => {
  const token = getToken();

  if (!token) throw new Error("Authentication token not found.");

  try {
    const response = await axios.post(
      `${url}/project/${projectId}/issues`,
      data,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      },
    );

    return response.data;
  } catch (error: any) {
    handleError("Create issue", error);
  }
};

// GET: Get all issues
export const getAllIssues = async () => {
  const token = getToken();

  if (!token) throw new Error("Authentication token not found.");

  try {
    const response = await axios.get(`${url}/project/issues`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data;
  } catch (error: any) {
    handleError("Get all issues", error);
  }
};

// GET: Get only current user's issues
export const getMyIssues = async () => {
  const token = getToken();

  if (!token) throw new Error("Authentication token not found.");

  try {
    const response = await axios.get(`${url}/project/my-issues`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data;
  } catch (error: any) {
    handleError("Get my issues", error);
  }
};

// PUT: UPDATE only current user's issues
export const updateIssues = async (projectId: string, issueId: string, resolved: boolean) => {
  const token = getToken();

  if (!token) throw new Error("Authentication token not found.");

  try {
    const response = await axios.put(
      `${url}/project/${projectId}/issues/${issueId}`,
      { resolved },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );

    return response.data;
  } catch (error: any) {
    handleError("Update issue", error);
  }
};

export const updateIssueDetails = async (
  projectId: string,
  issueId: string,
  data: Partial<{ title: string; description: string; priority: string; message: string; resolved: boolean }>,
) => {
  const token = getToken();
  if (!token) throw new Error("Authentication token not found.");
  try {
    const response = await axios.put(
      `${url}/project/${projectId}/issues/${issueId}`,
      data,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );
    return response.data;
  } catch (error: any) {
    handleError("Update issue details", error);
  }
};

export const deleteIssue = async (projectId: string, issueId: string) => {
  const token = getToken();
  if (!token) throw new Error("Authentication token not found.");
  try {
    const response = await axios.delete(`${url}/project/${projectId}/issues/${issueId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error: any) {
    handleError("Delete issue", error);
  }
};
