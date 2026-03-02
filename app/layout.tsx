import React from "react";

import type { Metadata } from "next";
import { Inter as BodyFont, Sora as HeadingFont } from "next/font/google";

import "./globals.css";
import GlobalProvider from "@/provider/global";
import { _siteConfig } from "@/config/site";
import { Toaster } from "react-hot-toast";

const inter = BodyFont({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
});

const heading = HeadingFont({
  variable: "--font-heading",
  subsets: ["latin"],
  weight: ["600", "700", "800"],
});

export const metadata: Metadata = {
  title: _siteConfig.name,
  description: _siteConfig.desc,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${heading.variable} hide-scrollbar antialiased`}
      // suppressHydrationWarning
    >
      <body className={`${inter.className} hide-scrollbar antialiased`}>
        <GlobalProvider>{children}</GlobalProvider>
        <Toaster />
      </body>
    </html>
  );
}
