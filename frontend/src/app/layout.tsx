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
      <TacoBIProvider state={state}>
        <body
          className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        >
          <div className="size-full flex flex-col items-center bg-white font-[family-name:var(--font-geist-sans)]">
            <div className="max-w-[var(--breakpoint-2xl)]">
              {children}
            </div>
          </div>
        </body>
      </TacoBIProvider>
    </html>
  );
}
