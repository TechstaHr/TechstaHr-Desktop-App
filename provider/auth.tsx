"use client";

import { ReactNode, useEffect } from "react";
import { getUserProfile } from "@/lib/actions/user.actions";
import { useUserStore } from "@/store/userStore";
import { useQuery } from "@tanstack/react-query";


interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const setUser = useUserStore((state) => state.setUser);

  const { data, isError } = useQuery({
    queryKey: ["user-profile"],
    queryFn: getUserProfile,
  });

  useEffect(() => {
    if (data) {
      setUser(data);
      // Store in localStorage for Electron compatibility
      if (typeof window !== "undefined") {
        localStorage.setItem("userId", data._id);
      }
    }
  }, [data, setUser]);

  // Optionally, handle auth-related redirects or error handling
  useEffect(() => {
    if (isError) {
      console.error("User not authenticated or fetch failed.");
    }
  }, [isError]);

  return <>{children}</>;
};
