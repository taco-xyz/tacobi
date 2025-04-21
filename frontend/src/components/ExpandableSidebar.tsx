"use client";

// React Imports
import { FC } from "react";

// Next Imports
import Image from "next/image";

// Lucide Icons
import { ChevronsRight } from "lucide-react";

// Utils Imports
import clsx from "clsx";

// Context Imports
import { useSidebar } from "@/context/SidebarContext";

/**
 * @function ExpandableSidebar
 *
 * @description A component that displays a sidebar that can be expanded or collapsed.
 * @returns {JSX.Element} The ExpandableSidebar component.
 */
export const ExpandableSidebar: FC = () => {
  // Extract the sidebar context
  const { isOpen, setIsOpen } = useSidebar();

  return (
    <div
      className={clsx(
        isOpen ? "w-full lg:w-[16rem]" : "w-0 lg:w-[7rem]",
        "fixed top-0 right-0 bottom-0 left-0 z-40 flex h-screen flex-col items-center justify-between border-r border-gray-200 bg-white p-8 dark:border-gray-800 dark:bg-gray-950",
      )}
      style={{
        transition:
          "width 0.2s ease-in-out, color 0.2s ease-in-out, background-color 0.2s ease-in-out, border-color 0.2s ease-in-out, box-shadow 0.2s ease-in-out",
      }}
    >
      <div className="flex h-full w-full flex-shrink-0 flex-col items-center justify-between">
        {/* Logo */}
        <div className="flex w-full flex-shrink-0 flex-row items-center justify-center border-b border-gray-200 pb-8 transition-colors duration-200 ease-in-out dark:border-gray-800">
          <Image
            src="/morpho-logo-light-mode.svg"
            alt="logo"
            width={74}
            height={69}
            className="size-10 flex-shrink-0"
          />
        </div>

        {/* Toggle Button */}
        <div className="flex w-full flex-row items-center justify-center">
          <button
            className="flex cursor-pointer flex-row items-center gap-x-2 text-gray-500 transition-colors duration-200 ease-in-out hover:text-gray-600 dark:text-white/70 dark:hover:text-white/90"
            onClick={() => setIsOpen(!isOpen)}
          >
            <ChevronsRight
              className={clsx("size-9", isOpen ? "rotate-180" : "rotate-0")}
              strokeWidth={1}
            />
          </button>
        </div>
      </div>
    </div>
  );
};
