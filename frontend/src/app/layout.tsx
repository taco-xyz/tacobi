"use client";

// React Imports
import { FC, PropsWithChildren } from "react";

// Global CSS Imports
import "@/app/globals.css";

// Font Imports
import { Geist, Geist_Mono } from "next/font/google";

// TacoBI Imports
import { TacoBIProvider } from "@/tacobi/context";
import { state } from "./tacobi-config";

// Utils Imports
import clsx from "clsx";

// Context Imports
import { SidebarProvider } from "@/context/SidebarContext";

// Component Imports
import { ExpandableSidebar } from "@/components/ExpandableSidebar";
import { RetractableLayout } from "@/components/RetractableLayout";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const RootLayout: FC<PropsWithChildren> = ({ children }) => {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              document.documentElement.classList.toggle(
                "dark",
                localStorage.theme === "dark" ||
                (!("theme" in localStorage) &&
                  window.matchMedia("(prefers-color-scheme: dark)").matches)
              );
            `,
          }}
        />
      </head>
      <body
        className={clsx(
          geistSans.variable,
          geistMono.variable,
          "font-geist-sans flex min-h-screen w-full flex-row overflow-x-hidden bg-white dark:bg-gray-950 antialiased",
        )}
        style={{
          transition:
            "background-color 0.2s ease-in-out",
        }}
      >
        <SidebarProvider>
          {/* Sidebar */}
          <ExpandableSidebar />

          {/* Main Content */}
          <RetractableLayout>
            <TacoBIProvider state={state}>{children}</TacoBIProvider>
          </RetractableLayout>
        </SidebarProvider>
      </body>
    </html>
  );
};

export default RootLayout;
