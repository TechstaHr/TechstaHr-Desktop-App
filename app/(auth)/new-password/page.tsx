import React from "react";
import AuthForm from "@/components/AuthForm";
import loginImg from "@/public/images/new-password.jpg";

export default function NewPassword() {
  return (
    <AuthForm
      type="new-password"
      picture={loginImg}
      title="New password."
      text="Enter your new password."
    />
  );
}
