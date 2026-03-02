import { ReactNode } from "react";
import { ThemeProvider } from "./theme";
import { AuthProvider } from "./auth";
import { TanstackProvider } from "@/components/providers/tanstack-provider";

interface GlobalProviderProps {
  children: ReactNode;
}

const GlobalProvider = ({ children }: GlobalProviderProps) => {
  return (
    <TanstackProvider>
      <ThemeProvider attribute="class" defaultTheme="system">
        <AuthProvider>{children}</AuthProvider>
      </ThemeProvider>
    </TanstackProvider>
  );
};

export default GlobalProvider;
