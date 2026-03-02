import { _user } from "@/types";
import axios from "axios";
import { getToken, getUserId } from "@/lib/auth";
import { handleError } from "../utils";

const url = "https://techstahr-backend.onrender.com/api/v1";

export const getAllProductivities = async () => {
  const token = getToken();

  if (!token) {
    throw new Error("Authentication token not found.");
  }
  try {
    const response = await axios.get(`${url}/productivity/all`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error: any) {
    handleError("Get all productivities", error);
  }
};

export const getUserProductivity = async () => {
  const token = getToken();
  const userId = getUserId();

  if (!token || !userId) {
    throw new Error("Authentication credentials not found.");
  }
  try {
    const response = await axios.get(`${url}/productivity/user/${userId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error: any) {
    handleError("Get user productivity", error);
  }
};
