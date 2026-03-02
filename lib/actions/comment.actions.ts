import { _user } from "@/types";
import axios from "axios";
import { getToken } from "@/lib/auth";
import { handleError } from "../utils";

const url = "https://techstahr-backend.onrender.com/api/v1";

export const getComments = async (projectId: string) => {
  const token = getToken();

  if (!token) throw new Error("Authentication token not found.");

  try {
    const response = await axios.get(`${url}/project/comments/${projectId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error: any) {
    handleError("Get comments", error);
  }
};

export const addComment = async (projectId: string, text: string) => {
  const token = getToken();
  if (!token) throw new Error("Authentication token not found.");

  try {
    const response = await axios.post(
      `${url}/project/add-comment/${projectId}`,
      { text },
      {
        headers: { Authorization: `Bearer ${token}` },
      },
    );
    return response.data;
  } catch (error: any) {
    handleError("Add comment", error);
  }
};

export const replyComment = async (
  projectId: string,
  commentId: string,
  text: string,
) => {
  const token = getToken();
  if (!token) throw new Error("Authentication token not found.");

  try {
    const response = await axios.post(
      `${url}/project/reply/${projectId}/${commentId}`,
      { text },
      {
        headers: { Authorization: `Bearer ${token}` },
      },
    );
    return response.data;
  } catch (error: any) {
    handleError("Reply comment", error);
  }
};
