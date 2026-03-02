"use client";

import React, { forwardRef, useImperativeHandle, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import toast from "react-hot-toast";
import { inviteUser, resendInvite } from "@/lib/auth";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";

export interface InviteModalRef {
  open: () => void;
  close: () => void;
}

const InviteModal = forwardRef<InviteModalRef>((_, ref) => {
  const [open, setOpen] = useState(false);
  const [resendOpen, setResendOpen] = useState(false);

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("");
  const [roleTitle, setRoleTitle] = useState("");

  const [loading, setLoading] = useState(false);
  const [resendEmail, setResendEmail] = useState("");

  useImperativeHandle(ref, () => ({
    open: () => setOpen(true),
    close: () => setOpen(false),
  }));

  const handleSubmit = async () => {
    if (!fullName || !email || !role || !roleTitle) {
      toast.error("Please fill in all fields before submitting.");
      return;
    }

    setLoading(true);
    try {
      const res = await inviteUser({
        full_name: fullName,
        email,
        role,
        role_title: roleTitle,
        frontend_url: "http://usetechstarhr.vercel.app/register",
      });

      toast.success(res?.message || "User invited successfully");
      setOpen(false);
      setFullName("");
      setEmail("");
      setRole("");
      setRoleTitle("");
    } catch (error: any) {
      toast.error(error?.message || "Failed to invite user");
      if (error?.message === "User already exists in your team") {
        setResendEmail(email);
        setResendOpen(true);
        return;
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!resendEmail) return toast.error("No email provided.");

    setLoading(true);
    try {
      const res = await resendInvite(resendEmail);
      toast.success(res?.message || "Invite resent successfully");
      setResendOpen(false);
    } catch (error: any) {
      toast.error(error?.message || "Failed to resend invite");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-screen overflow-y-auto lg:min-w-[500px]">
          <DialogHeader>
            <DialogTitle>Invite a New User</DialogTitle>
          </DialogHeader>

          <div>
            <Label>Full Name</Label>
            <Input
              placeholder="Enter full name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
            />
          </div>

          <div>
            <Label>Email</Label>
            <Input
              placeholder="Enter email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div>
            <Label>Role in Team</Label>
            <Select onValueChange={(value) => setRole(value)}>
              <SelectTrigger className="rounded-sm">
                <SelectValue placeholder="--Select Role--" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="team">Team</SelectItem>
                  {/* <SelectItem value="user">User</SelectItem> */}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="mt-2">Role Title</Label>
            <Input
              value={roleTitle}
              placeholder="Enter the role title e.g Frontend Dev"
              className="rounded-sm"
              onChange={(e) => setRoleTitle(e.target.value)}
            />
          </div>

          <DialogFooter className="pt-4">
            <Button
              onClick={handleSubmit}
              className="rounded-sm bg-[#4CAF50]"
              disabled={loading}
            >
              {loading ? "Sending invite..." : "Invite User"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Resend Invite Sub-Modal */}
      <Dialog open={resendOpen} onOpenChange={setResendOpen}>
        <DialogContent className="lg:min-w-[400px]">
          <DialogHeader>
            <DialogTitle>User Already in Team</DialogTitle>
          </DialogHeader>

          <div>
            <Label>Email</Label>
            <Input
              type="email"
              placeholder="Enter email to resend invite"
              value={resendEmail}
              onChange={(e) => setResendEmail(e.target.value)}
            />
          </div>

          <DialogFooter className="pt-4">
            <Button
              onClick={handleResend}
              className="rounded-sm bg-[#4CAF50]"
              disabled={loading}
            >
              {loading ? "Resending..." : "Resend Invite"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
});

InviteModal.displayName = "InviteModal";
export default InviteModal;
