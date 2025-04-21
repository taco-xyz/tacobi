"use client";

import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { TacoBIProvider } from "@/tacobi";
import { state } from "./tacobi-config";
import clsx from "clsx";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={clsx(
          geistSans.variable,
          geistMono.variable,
          "font-geist-sans mx-auto flex min-h-screen w-full max-w-screen-2xl flex-col bg-white px-18 py-20 antialiased ring ring-inset dark:bg-gray-950",
        )}
      >
        <TacoBIProvider state={state}>{children}</TacoBIProvider>
      </body>
    </html>
  );
}
