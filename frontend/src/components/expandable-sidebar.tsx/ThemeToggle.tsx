"use client";

// React Imports
import { useCallback, FC } from "react";

// Lucide Icons
import { MoonStarIcon, SunIcon } from "lucide-react";

/**
 * @constant ThemeToggle
 * @description A component that toggles the theme between light and dark modes.
 */
export const ThemeToggle: FC = () => {
  const toggleTheme = useCallback(() => {
    if (document.documentElement.classList.contains("dark")) {
      localStorage.setItem("theme", "light");
      document.documentElement.classList.remove("dark");
    } else {
      localStorage.setItem("theme", "dark");
      document.documentElement.classList.add("dark");
    }
  }, []);

  return (
    <button
      className="flex flex-shrink-0 cursor-pointer flex-row items-center justify-center rounded-lg p-1.5 text-gray-500 hover:bg-gray-100 hover:text-blue-600 dark:hover:bg-gray-900 dark:hover:text-blue-400"
      style={{
        transition: "background-color 0.2s ease-in-out, color 0.2s ease-in-out",
      }}
      onClick={toggleTheme}
    >
      <SunIcon strokeWidth={1.5} className="size-7 dark:hidden" />
      <MoonStarIcon strokeWidth={1.5} className="hidden size-7 dark:block" />
    </button>
  );
};
