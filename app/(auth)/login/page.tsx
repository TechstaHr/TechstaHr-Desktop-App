import React from "react";
import AuthForm from "@/components/AuthForm";
import loginImg from "@/public/images/login-img.jpg";

export default function LoginPage() {
  return (
    <AuthForm
      type="sign-in"
      picture={loginImg}
      title="Log in."
      text="Login and continue managing your team progress."
    />
  );
}
