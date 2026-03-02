"use client";

import React, { useEffect, useState } from "react";
import AuthForm from "@/components/AuthForm";
import loginImg from "@/public/images/password-reset.jpg";

export default function ResetPassword() {
  const [userMail, setUserMail] = useState<string | null>(null);

  useEffect(() => {
    setUserMail(localStorage.getItem("user_mail"));
  }, []);

  return (
    <AuthForm
      type="reset-password"
      picture={loginImg}
      title="Password Reset."
      text={`Input the code we sent to your e-mail ${userMail || ""}.`}
    />
  );
}
