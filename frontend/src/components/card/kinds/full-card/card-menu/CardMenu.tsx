"use client";

// React Imports
import { FC } from "react";

// Tailwind Imports
import clsx from "clsx";

// Context Imports
import { useCardMenu } from "./CardMenuContext";

// Icons Imports
import { Share2Icon, FileDownIcon, FullscreenIcon } from "lucide-react";

export const CardMenu: FC = () => {
  // Extract the Mobile Sidebar Modal Context
  const { isOpen, containerRef } = useCardMenu();

  return (
    <div
      ref={containerRef}
      className={clsx(
        "absolute top-full right-0 z-10 mt-1 origin-top-right gap-y-1 rounded-lg bg-white shadow ring ring-gray-200 backdrop-blur-xl dark:bg-gray-950/50 dark:ring-gray-800/70",
        isOpen
          ? "pointer-events-auto scale-100 opacity-100"
          : "pointer-events-none scale-95 opacity-0",
      )}
      style={{
        transition:
          "opacity 0.1s ease-in-out, translate 0.1s ease-in-out, scale 0.1s ease-in-out, background-color 0.1s ease-in-out, box-shadow 0.1s ease-in-out",
      }}
    >
      <div className="flex w-full flex-col gap-y-1 p-1">
        <div
          className="group flex w-full flex-shrink-0 cursor-pointer flex-row items-center gap-x-3 rounded-[6px] px-3 py-2 text-base leading-7 hover:bg-gray-100 dark:hover:bg-gray-800/50"
          style={{
            transition: "background-color 0.1s ease-in-out",
          }}
        >
          <Share2Icon
            strokeWidth={1.5}
            className="size-4 text-gray-500 group-hover:text-blue-600 dark:group-hover:text-blue-400"
            style={{
              transition: "color 0.1s ease-in-out",
            }}
          />
          <p
            style={{
              transition: "color 0.1s ease-in-out",
            }}
            className="text-xs font-medium whitespace-nowrap text-gray-900 dark:text-white"
          >
            Share
          </p>
        </div>
        <div
          className="group flex w-full flex-shrink-0 cursor-pointer flex-row items-center gap-x-3 rounded-[6px] px-3 py-2 text-base leading-7 hover:bg-gray-100 dark:hover:bg-gray-800/50"
          style={{
            transition: "background-color 0.1s ease-in-out",
          }}
        >
          <FileDownIcon
            strokeWidth={1.5}
            className="size-4 text-gray-500 group-hover:text-blue-600 dark:group-hover:text-blue-400"
            style={{
              transition: "color 0.1s ease-in-out",
            }}
          />
          <p
            style={{
              transition: "color 0.1s ease-in-out",
            }}
            className="text-xs font-medium whitespace-nowrap text-gray-900 dark:text-white"
          >
            Download
          </p>
        </div>
      </div>

      <div className="h-px w-full bg-gray-200 dark:bg-gray-800" />

      <div className="flex w-full flex-col gap-y-1 p-1">
        <div
          className="group flex w-full flex-shrink-0 cursor-pointer flex-row items-center gap-x-3 rounded-[6px] px-3 py-2 text-base leading-7 hover:bg-gray-100 dark:hover:bg-gray-800/50"
          style={{
            transition: "background-color 0.1s ease-in-out",
          }}
        >
          <FullscreenIcon
            strokeWidth={1.5}
            className="size-4 text-gray-500 group-hover:text-blue-600 dark:group-hover:text-blue-400"
            style={{
              transition: "color 0.1s ease-in-out",
            }}
          />
          <p
            style={{
              transition: "color 0.1s ease-in-out",
            }}
            className="text-xs font-medium whitespace-nowrap text-gray-900 dark:text-white"
          >
            Focus
          </p>
        </div>
      </div>
    </div>
  );
};
