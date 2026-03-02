// lib/actions/billing.actions.ts

import axios from "axios";
import { getToken } from "@/lib/auth";
import { handleError } from "../utils";
import { BillingInfo } from "@/types";

const url = "https://techstahr-backend.onrender.com/api/v1/billing";

// Create Billing Info (POST)
export const createBillingInfo = async (data: BillingInfo) => {
  const token = getToken();
  if (!token) throw new Error("Authentication token not found.");

  try {
    const response = await axios.post(url, data, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error: any) {
    handleError("Create Billing Info", error);
  }
};

// Get Billing Info (GET)
export const getBillingInfo = async () => {
  const token = getToken();
  if (!token) throw new Error("Authentication token not found.");

  try {
    const response = await axios.get(url, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error: any) {
    handleError("Get Billing Info", error);
  }
};

// Update Billing Info (PUT)
export const updateBillingInfo = async (data: BillingInfo) => {
  const token = getToken();
  if (!token) throw new Error("Authentication token not found.");

  try {
    const response = await axios.put(url, data, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error: any) {
    handleError("Update Billing Info", error);
  }
};

export const createBank = async (data: Record<string, any>) => {
  const token = getToken();
  if (!token) throw new Error("Authentication token not found.");
  try {
    const response = await axios.post(`${url}/banks/add`, data, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error: any) {
    handleError("Create Bank", error);
  }
};

export const getBankById = async (id: string) => {
  const token = getToken();
  if (!token) throw new Error("Authentication token not found.");
  try {
    const response = await axios.get(`${url}/banks/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error: any) {
    handleError("Get Bank By Id", error);
  }
};

export const updateBank = async (id: string, data: Record<string, any>) => {
  const token = getToken();
  if (!token) throw new Error("Authentication token not found.");
  try {
    const response = await axios.patch(`${url}/banks/update/${id}`, data, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error: any) {
    handleError("Update Bank", error);
  }
};

export const deleteBank = async (id: string) => {
  const token = getToken();
  if (!token) throw new Error("Authentication token not found.");
  try {
    const response = await axios.delete(`${url}/banks/delete/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error: any) {
    handleError("Delete Bank", error);
  }
};

export const listBanks = async () => {
  try {
    const response = await axios.get(`${url}/banks`);
    return response.data.banks;
  } catch (error: any) {
    handleError("List Banks", error);
  }
};

export const createPayroll = async (data: Record<string, any>) => {
  const token = getToken();
  if (!token) throw new Error("Authentication token not found.");
  try {
    const response = await axios.post(`${url}/payroll`, data, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error: any) {
    handleError("Create Payroll", error);
  }
};

export const getPayrollById = async (id: string) => {
  const token = getToken();
  if (!token) throw new Error("Authentication token not found.");
  try {
    const response = await axios.get(`${url}/payroll/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error: any) {
    handleError("Get Payroll By Id", error);
  }
};

export const updatePayrollById = async (id: string, data: Record<string, any>) => {
  const token = getToken();
  if (!token) throw new Error("Authentication token not found.");
  try {
    const response = await axios.post(`${url}/payroll/update/${id}`, data, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error: any) {
    handleError("Update Payroll", error);
  }
};

export const listPayrolls = async () => {
  const token = getToken();
  if (!token) throw new Error("Authentication token not found.");
  try {
    const response = await axios.get(`${url}/payrolls`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error: any) {
    handleError("List Payrolls", error);
  }
};

// Create Team Billing Info (POST) - includes bankDetail and payRate
export const createTeamBillingInfo = async (data: BillingInfo) => {
  const token = getToken();
  if (!token) throw new Error("Authentication token not found.");

  try {
    const response = await axios.post(url, data, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error: any) {
    handleError("Create Team Billing Info", error);
  }
};

// Create Charge (POST) - for paying employees
export interface CreateChargePayload {
  amount: number;
  currency: string;
  reference: string;
  customer_id: string;
  payment_method_id: string;
  redirect_url: string;
  recurring?: boolean;
  order_id?: string;
  meta?: Record<string, any>;
  authorization?: {
    otp?: Record<string, any>;
    type: string;
  };
}

export interface CreateChargeResponse {
  next_action?: {
    type: string;
    redirect_url?: {
      url: string;
    };
  };
  [key: string]: any;
}

export const createCharge = async (data: CreateChargePayload): Promise<CreateChargeResponse> => {
  const token = getToken();
  if (!token) throw new Error("Authentication token not found.");

  try {
    const response = await axios.post(`${url}/charges`, data, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error: any) {
    handleError("Create Charge", error);
    throw error;
  }
};

// Trigger Payment (POST) - triggers payment disbursement to employee
export interface TriggerPaymentResponse {
  status: string;
  message: string;
}

export const triggerPayment = async (payrollId: string): Promise<TriggerPaymentResponse> => {
  const token = getToken();
  if (!token) throw new Error("Authentication token not found.");

  try {
    const baseUrl = "https://techstahr-backend.onrender.com/api/v1";
    const response = await axios.post(`${baseUrl}/payment/trigger/${payrollId}`, {}, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error: any) {
    handleError("Trigger Payment", error);
    throw error;
  }
};

export const setHourlyRate = async (data: {
  userId: string;
  hourlyRate: number;
  currency: string;
  projectId: string;
  rateType: string;
  effectiveFrom: string;
  notes?: string;
}) => {
  const token = getToken();
  if (!token) throw new Error("Authentication token not found.");

  try {
    const response = await axios.post(`${url}/rate`, data, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error: any) {
    handleError("Set Hourly Rate", error);
    throw error;
  }
};

export const addPaymentMethod = async (data: any) => {
  const token = getToken();
  if (!token) throw new Error("Authentication token not found.");

  try {
    const response = await axios.post(`${url}/payment-methods`, data, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error: any) {
    handleError("Add Payment Method", error);
    throw error;
  }
};

export const listPaymentMethods = async () => {
  const token = getToken();
  if (!token) throw new Error("Authentication token not found.");

  try {
    const response = await axios.get(`${url}/payment-methods`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error: any) {
    handleError("List Payment Methods", error);
    throw error;
  }
};
