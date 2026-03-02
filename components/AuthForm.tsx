"use client";

import React, { useEffect, useState } from "react";
import Image, { StaticImageData } from "next/image";
import logo from "@/public/images/techstahr-logo.svg";
import { Button } from "./ui/button";
import CustomInput from "./CustomInput";
import Link from "next/link";
import googleIcon from "@/public/images/google.svg";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Form } from "@/components/ui/form";
import { authFormSchema } from "@/lib/utils";
import { ArrowLeft, Loader2 } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import Loader from "./Loader";
import {
  forgotPassword,
  resetPassword,
  sendOtp,
  signIn,
  signUp,
  verifyOtp,
  setPassword as registerPassword,
} from "@/lib/auth";

import { toast } from "react-hot-toast";
import PasswordStrengthBar from "./PasswordStrengthBar";

interface AuthFormProps {
  type:
  | "sign-in"
  | "sign-up"
  | "forgot-password"
  | "reset-password"
  | "register"
  | "new-password";
  title: string;
  text: string;
  picture: StaticImageData;
}

export default function AuthForm({
  picture,
  type,
  title,
  text,
}: AuthFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const inviteToken = searchParams.get("invite");
  const [isLoading, setIsLoading] = useState(false);
  const [password, setPassword] = useState("");
  const [strength, setStrength] = useState(0);
  const [keepMeLoggedIn, setKeepMeLoggedIn] = useState(false);

  // Evaluate password strength
  useEffect(() => {
    const evaluatePasswordStrength = (pwd: string) => {
      let score = 0;
      if (pwd.length >= 8) score++;
      if (/[a-z]/.test(pwd)) score++;
      if (/[A-Z]/.test(pwd)) score++;
      if (/[0-9]/.test(pwd)) score++;
      if (/[^A-Za-z0-9]/.test(pwd)) score++;
      return score;
    };

    setStrength(evaluatePasswordStrength(password));
  }, [password]);

  const formSchema = authFormSchema(type);

  // 1. Define your form.
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
      terms: false,
    },
  });

  // 2. Define a submit handler.
  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    try {
      setIsLoading(true);

      if (type === "sign-up") {
        const response = await signUp({ ...data });
        if (response.token) {
          toast.success(response?.message);
          router.push("/login");
        }
      }

      if (type === "sign-in") {
        const response = await signIn({ ...data, keepMeLoggedIn });

        // Store tokens in localStorage for consistent session management
        localStorage.setItem("token", response?.token);
        localStorage.setItem("role", response?.role);

        toast.success(response?.message);
        if (response?.role === "team") {
          window.location.href = "/team/dashboard";
        } else {
          window.location.href = "/admin/dashboard";
        }
      }

      if (type === "register") {
        const response = await registerPassword({
          password: data.password!,
          token: inviteToken!,
        });
        toast.success(response?.message);
        router.push("/login");
      }

      if (type === "forgot-password") {
        const response = await forgotPassword({ email: data.email });
        localStorage.setItem("user_mail", data.email!);
        toast.success(response?.message);
        router.push("/reset-password");
      }

      if (type === "reset-password") {
        const userMail = localStorage.getItem("user_mail");
        localStorage.setItem("user_otp", data.code!);

        const response = await verifyOtp({
          email: userMail!,
          otp: data.code,
        });
        toast.success(response?.message);
        router.push("/new-password");
      }

      if (type === "new-password") {
        const userMail = localStorage.getItem("user_mail");
        const userOtp = localStorage.getItem("user_otp");
        const response = await resetPassword({
          email: userMail!,
          otp: userOtp!,
          newPassword: data.password,
        });
        toast.success(response?.message);
        router.push("/login");
      }
    } catch (error: any) {
      console.error(error);

      toast.error(
        error?.message ||
        error?.error ||
        "Something went wrong. Please try again.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const resendOtp = async () => {
    const userMail = localStorage.getItem("user_mail");
    setIsLoading(true);
    try {
      const response = await sendOtp({ email: userMail! });
      toast.success(response?.message);
    } catch (error: unknown) {
      console.error(error);

      if (error instanceof Error) {
        toast.error(error.message);
      } else if (typeof error === "string") {
        toast.error(error);
      } else {
        toast.error("Something went wrong. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {isLoading && <Loader />}
      <main className="grid h-screen bg-white md:grid-cols-2">
        <div className="col-span-1 mx-auto min-h-screen w-full overflow-y-auto bg-white p-8">
          <div className="mx-auto max-w-[360px] md:w-full">
            <Image src={logo} alt="logo" className="w-20 md:w-24" />

            <div className="my-8 space-y-4">
              <h2 className="text-2xl font-bold text-[#17171D] md:text-4xl">
                {title}
              </h2>
              <p className="text-xs font-normal text-[#9090A1]">{text}</p>
            </div>

            <div className="space-y-3">
              {(type === "sign-in" || type === "sign-up") && (
                <Button className="flex h-11 w-full items-center justify-center gap-2.5 rounded-sm border border-black bg-white p-2.5 text-sm font-medium text-[#333333]">
                  <Image src={googleIcon} alt="google icon" /> Continue with
                  Google
                </Button>
              )}

              <>
                <Form {...form}>
                  <form
                    onSubmit={form.handleSubmit(onSubmit)}
                    className="space-y-4"
                  >
                    {type === "sign-up" && (
                      <CustomInput
                        control={form.control}
                        name="team_name"
                        label="Company/Team Name"
                        placeholder="Enter your company/team name"
                      />
                    )}
                    {(type === "sign-in" || type === "sign-up") && (
                      <>
                        <CustomInput
                          control={form.control}
                          name="email"
                          label="Email"
                          placeholder="Type your email"
                        />

                        <CustomInput
                          control={form.control}
                          name="password"
                          label="Password"
                          placeholder="at least 8 characters"
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                            setPassword(e.target.value)
                          }
                        />

                        {type === "sign-up" && (
                          <div className="flex items-center gap-1">
                            <input
                              type="checkbox"
                              className="w-3 bg-transparent"
                              {...form.register("terms")}
                            />
                            <label className="text-xs font-normal text-[#AAAAAA]">
                              By creating an account you agree to the{" "}
                              <a href="#" className="text-[#4CAF50] underline">
                                terms of use
                              </a>{" "}
                              and our{" "}
                              <a href="#" className="text-[#4CAF50] underline">
                                privacy policy
                              </a>
                            </label>
                          </div>
                        )}

                        {type === "sign-in" && (
                          <div className="flex items-center gap-1">
                            <input
                              type="checkbox"
                              checked={keepMeLoggedIn}
                              onChange={(e) =>
                                setKeepMeLoggedIn(e.target.checked)
                              }
                              className="w-3 bg-transparent"
                            />
                            <p className="text-xs font-normal text-[#AAAAAA]">
                              Keep me logged in
                            </p>
                          </div>
                        )}
                      </>
                    )}

                    {type === "forgot-password" && (
                      <CustomInput
                        control={form.control}
                        name="email"
                        label="Your e-mail"
                        placeholder="Enter your e-mail"
                      />
                    )}

                    {type === "reset-password" && (
                      <CustomInput
                        control={form.control}
                        name="code"
                        label="Enter Code"
                        placeholder="Enter code"
                      />
                    )}

                    {type === "register" && (
                      <CustomInput
                        control={form.control}
                        name="password"
                        label="Create a Password"
                        placeholder="at least 8 characters"
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                          setPassword(e.target.value)
                        }
                      />
                    )}

                    {type === "new-password" && (
                      <>
                        <CustomInput
                          control={form.control}
                          name="password"
                          label="Password"
                          placeholder="at least 8 characters"
                        />
                        <CustomInput
                          control={form.control}
                          name="confirmPassword"
                          label="Confirm password"
                          placeholder="at least 8 characters"
                        />
                      </>
                    )}

                    {["sign-up", "register", "new-password"].includes(type) && (
                      <PasswordStrengthBar strength={strength} />
                    )}

                    <div className="flex flex-col gap-4">
                      <Button
                        type="submit"
                        disabled={isLoading}
                        className="focus:shadow-outline h-11 rounded-sm bg-[#4CAF50] px-4 py-2 font-bold text-white hover:bg-[#45A049] focus:outline-none"
                      >
                        {isLoading ? (
                          <>
                            <Loader2 size={20} className="animate-spin" />{" "}
                            &nbsp; Loading
                          </>
                        ) : type === "sign-in" ? (
                          "Log In"
                        ) : type === "sign-up" ? (
                          "Create account"
                        ) : type === "forgot-password" ? (
                          "Send Code"
                        ) : type === "reset-password" ? (
                          "Continue"
                        ) : (
                          "Confirm"
                        )}
                      </Button>
                    </div>
                  </form>
                </Form>

                {(type == "sign-in" ||
                  type === "reset-password" ||
                  type === "sign-up") && (
                    <footer className="flex items-center justify-center gap-1 text-sm">
                      <p className="text-14 font-normal text-gray-600">
                        {type === "sign-in"
                          ? "Don't have an account?"
                          : type === "reset-password"
                            ? "Didin't receive code?"
                            : "Already have an account?"}
                      </p>
                      <Link
                        href={type === "sign-in" ? "/sign-up" : "/login"}
                        className="text-[#4CAF50]"
                      >
                        {type === "sign-in"
                          ? "Sign up"
                          : type === "sign-up" && "Log in"}
                      </Link>
                      <Button
                        type="button"
                        onClick={resendOtp}
                        disabled={isLoading}
                        className="bg-transparent p-0 text-[#4CAF50] underline shadow-none"
                      >
                        {type === "reset-password" && "Click to resend"}
                      </Button>
                    </footer>
                  )}

                {(type === "forgot-password" ||
                  type === "new-password" ||
                  type === "reset-password") && (
                    <div className="flex items-center justify-center gap-1 text-sm">
                      <ArrowLeft size={14} />
                      <Link href="/login">Back to log in</Link>
                    </div>
                  )}
                <div className="flex w-full items-center justify-center font-medium">
                  {type === "sign-in" && (
                    <Link
                      href="/forgot-password"
                      className="text-sm text-[#4CAF50]"
                    >
                      Forgot Password?
                    </Link>
                  )}
                </div>
              </>
            </div>
          </div>
        </div>

        {/* Image on desktop */}
        <div className="col-span-1 hidden bg-black md:flex md:h-screen">
          <Image
            src={picture}
            alt="Auth picture"
            className="flex items-center justify-center object-cover"
          />
        </div>
      </main>
    </>
  );
}
