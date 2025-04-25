"use client";

// React Imports
import { useState, useEffect } from "react";

// Theme Type
export type Theme = "dark" | "light";

/**
 * Hook to get the current theme.
 * @returns The current theme.
 */
export const useTheme = () => {
  // Get the current theme from the dom class list
  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof window === "undefined") return "light";
    return document.documentElement.classList.contains("dark")
      ? "dark"
      : "light";
  });

  // Update the theme when the dom class list changes
  useEffect(() => {
    const observer = new MutationObserver(() => {
      setTheme(
        document.documentElement.classList.contains("dark") ? "dark" : "light",
      );
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    return () => observer.disconnect();
  }, []);

  return theme;
};
