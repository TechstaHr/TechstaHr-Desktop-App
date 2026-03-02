import React from "react";
import AuthForm from "@/components/AuthForm";
import loginImg from "@/public/images/new-password.jpg";

export default function Register() {
  return (
    <AuthForm
      type="register"
      picture={loginImg}
      title="Set password."
      text="Enter a password."
    />
  );
}
