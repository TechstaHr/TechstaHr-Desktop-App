"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import Loader from "./Loader";

interface ClientAuthWrapperProps {
  children: React.ReactNode;
  redirectTo?: string;
}

export default function ClientAuthWrapper({
  children,
  redirectTo = "/login"
}: ClientAuthWrapperProps) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const checkAuth = () => {
      try {
        const token = localStorage.getItem("token");

        if (!token) {
          setIsAuthenticated(false);
          router.push(redirectTo);
          return;
        }

        // Optional: Add token validation logic here
        // For now, we'll assume any token is valid
        setIsAuthenticated(true);
      } catch (error) {
        console.error("Auth check failed:", error);
        setIsAuthenticated(false);
        router.push(redirectTo);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [router, redirectTo]);

  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Loader />
      </div>
    );
  }

  // Don't render children if not authenticated
  if (!isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}