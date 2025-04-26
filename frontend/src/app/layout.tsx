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
import { ExpandableSidebar } from "@/components/expandable-sidebar.tsx/ExpandableSidebar";
import { RetractableLayout } from "@/components/RetractableLayout";
import { MobileTopBar } from "@/components/MobileTopBar";

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
          "font-geist-sans flex min-h-screen w-full flex-row overflow-x-hidden bg-white antialiased dark:bg-gray-950",
        )}
        style={{
          transition: "background-color 0.2s ease-in-out",
        }}
      >
        <div
          aria-hidden="true"
          className="fixed inset-x-0 top-1/2 -z-10 hidden -translate-y-1/2 transform-gpu overflow-hidden opacity-30 blur-3xl xl:blur-[100px] 2xl:blur-[160px] dark:block dark:opacity-20"
        >
          <div
            style={{
              clipPath:
                "polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)",
            }}
            className="ml-[max(50%,38rem)] aspect-1313/771 w-[82.0625rem] bg-linear-to-tr from-blue-500 to-blue-900"
          />
        </div>
        <div
          aria-hidden="true"
          className="fixed inset-x-0 top-0 -z-10 hidden transform-gpu overflow-hidden pt-32 opacity-30 blur-3xl sm:pt-40 xl:justify-end xl:blur-[100px] 2xl:blur-[160px] dark:flex dark:opacity-20"
        >
          <div
            style={{
              clipPath:
                "polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)",
            }}
            className="ml-[-22rem] aspect-1313/771 w-[82.0625rem] flex-none origin-top-right rotate-[30deg] bg-linear-to-tr from-blue-500 to-blue-900 xl:mr-[calc(50%-12rem)] xl:ml-0"
          />
        </div>

        <SidebarProvider>
          {/* Sidebar */}
          <ExpandableSidebar />

          {/* Top Bar */}
          <MobileTopBar />

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
