// components/PaystackForm.tsx

"use client";

import React, { useState } from "react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import Image from "next/image";
import {
  initializePayment,
  verifyPayment,
} from "@/lib/actions/payments.actions";
import toast from "react-hot-toast";

export default function PaystackForm() {
  const [email, setEmail] = useState("");
  const [amount, setAmount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [currentReference, setCurrentReference] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !amount || amount <= 0) {
      toast.error("Please provide valid email and amount");
      return;
    }

    setIsLoading(true);

    try {
      const response = await initializePayment({
        email,
        amount,
        frontend_callback_url: "http://localhost:3000/admin/billing-subscription",
      });

      if (response?.data?.authorization_url) {
        toast.success("Payment initialized successfully!");

        // Store the reference for verification
        setCurrentReference(response.data.reference);

        // Redirect to Paystack checkout
        window.location.href = response.data.authorization_url;
      } else {
        toast.error("Failed to initialize payment");
      }
    } catch (error: any) {
      console.error("Payment initialization error:", error);
      toast.error(error.message || "Failed to initialize payment");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-8 rounded-lg bg-white p-4 shadow-md">
      <h2 className="text-lg font-semibold">Payment Methods</h2>

      <div className="rounded-lg border p-6">
        <div className="mb-6 flex items-center gap-3">
          <Image
            src="/icons/paystack.svg"
            width={50}
            height={50}
            alt="Paystack logo"
            className="h-6 w-6"
          />
          <p className="text-lg font-medium">Paystack</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="mb-1 block font-medium text-gray-700">
              Email
            </label>
            <Input
              type="email"
              placeholder="Type your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={isLoading}
              className="w-full rounded-sm text-sm outline-none"
            />
          </div>

          <div>
            <label className="mb-1 block font-medium text-gray-700">
              Amount
            </label>
            <Input
              type="number"
              placeholder="Type in your amount"
              value={amount || ""}
              onChange={(e) => setAmount(Number(e.target.value))}
              required
              min="1"
              disabled={isLoading}
              className="w-full rounded-sm text-sm outline-none"
            />
          </div>

          <Button
            type="submit"
            disabled={isLoading}
            className="rounded bg-[#4CAF50] px-6 py-2 font-semibold text-white hover:bg-green-700 disabled:cursor-not-allowed disabled:bg-gray-400"
          >
            {isLoading ? "Processing..." : "Pay Now"}
          </Button>
        </form>
      </div>
    </div>
  );
}
