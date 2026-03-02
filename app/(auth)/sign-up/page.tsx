import React from "react";
import AuthForm from "@/components/AuthForm";
import loginImg from "@/public/images/sign-up-img.jpg";

export default function RegsiterPage() {
  return (
    <AuthForm
      type="sign-up"
      picture={loginImg}
      title="Sign Up."
      text="Enter your information and sign up to start managing your team progress."
    />
  );
}
