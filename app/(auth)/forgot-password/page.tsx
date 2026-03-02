import AuthForm from "@/components/AuthForm";
import React from "react";
import loginImg from "@/public/images/forgot-password.jpg";

export default function ForgotPassword() {
  return (
    <AuthForm
      type="forgot-password"
      picture={loginImg}
      title="Forgot Password."
      text="Enter your e-mail, we will send a code to your email to reset your password."
    />
  );
}
