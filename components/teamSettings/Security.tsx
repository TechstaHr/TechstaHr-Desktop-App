"use client";

import React, { useState } from "react";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { toast } from "react-hot-toast";
import { updatePassword } from "@/lib/auth";

const Security = () => {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Basic validation
    if (!currentPassword || !newPassword) {
      toast.error("Both fields are required.");
      return;
    }

    if (currentPassword === newPassword) {
      toast.error("New password must be different from current password.");
      return;
    }

    setLoading(true);

    try {
      await updatePassword({ currentPassword, newPassword });

      toast.success("Your password has been successfully changed.");

      setCurrentPassword("");
      setNewPassword("");
    } catch (error: any) {
      console.error(error);

      toast.error(
        error?.message || "An error occurred while updating the password.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <p className="text-xl font-medium text-[#333333]">Security</p>

      <div className="space-y-3">
        <p className="text-xl font-medium text-[#333333]">
          Change your password
        </p>
        <p className="text-[#AAAAAA]">
          When you change your password, we keep you logged in to this device
          but may log you out from your other devices.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-3">
          <p className="font-medium text-[#71717A]">
            Current Password <span className="text-red-500">*</span>
          </p>
          <Input
            type="text"
            placeholder="Enter your current password"
            className="rounded-sm py-5 lg:w-1/2 lg:max-w-[300px]"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
          />
        </div>

        <div className="space-y-3">
          <p className="font-medium text-[#71717A]">
            New password <span className="text-red-500">*</span>
          </p>
          <Input
            type="text"
            placeholder="Enter your new password"
            className="rounded-sm py-5 lg:w-1/2 lg:max-w-[300px]"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />
        </div>

        <Button
          type="submit"
          disabled={loading}
          className="rounded-sm bg-[#4CAF50] py-5"
        >
          {loading ? "Saving..." : "Save changes"}
        </Button>
      </form>
    </div>
  );
};

export default Security;
