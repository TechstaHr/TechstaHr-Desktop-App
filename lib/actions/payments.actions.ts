// Payment Queries
import axios from "axios";
import { getToken } from "@/lib/auth";
import { handleError } from "../utils";

const url = "https://techstahr-backend.onrender.com/api/v1";

/**
 * Initializes a payment session for a user.
 * @param email - The user's email
 * @param amount - The amount to be paid
 */
export const initializePayment = async ({
  email,
  amount,
  frontend_callback_url,
}: {
  email: string;
  amount: number;
  frontend_callback_url: string;
}) => {
  const token = getToken();

  if (!token) throw new Error("Authentication token not found.");

  try {
    const response = await axios.post(
      `${url}/payment/initialize`,
      { email, amount, frontend_callback_url },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );

    return response.data;
  } catch (error: any) {
    handleError("Initialize payment", error);
  }
};

/**
 * Verifies a payment using its reference string.
 * @param reference - The unique payment reference from the gateway
 */
export const verifyPayment = async (reference: string) => {
  const token = getToken();

  if (!token) throw new Error("Authentication token not found.");

  try {
    const response = await axios.get(`${url}/payment/verify/${reference}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data;
  } catch (error: any) {
    handleError("Verify payment", error);
  }
};
