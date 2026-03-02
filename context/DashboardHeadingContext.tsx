// components/context/DashboardHeadingContext.tsx
"use client";

import { createContext, useContext, useState, ReactNode } from "react";

type HeadingContextType = {
  heading: string;
  setHeading: (heading: string) => void;
};

const DashboardHeadingContext = createContext<HeadingContextType | undefined>(undefined);

export const useDashboardHeading = () => {
  const context = useContext(DashboardHeadingContext);
  if (!context) {
    throw new Error("useDashboardHeading must be used within DashboardHeadingProvider");
  }
  return context;
};

export const DashboardHeadingProvider = ({ children }: { children: ReactNode }) => {
  const [heading, setHeading] = useState("Dashboard");

  return (
    <DashboardHeadingContext.Provider value={{ heading, setHeading }}>
      {children}
    </DashboardHeadingContext.Provider>
  );
};
