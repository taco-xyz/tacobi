"use client";

// React Imports
import { FC, PropsWithChildren } from "react";

// Utils Imports
import clsx from "clsx";

// Context Imports
import { useSidebar } from "@/context/SidebarContext";

export const RetractableLayout: FC<PropsWithChildren> = ({ children }) => {
  // Extract the sidebar context
  const { isOpen } = useSidebar();

  return (
    <div
      className={clsx(
        isOpen ? "lg:ml-[16rem]" : "lg:ml-[7rem]",
        "relative flex h-screen w-full flex-col items-center p-8",
        "transition-[margin-left] duration-200 ease-in-out",
      )}
    >
      <div className="flex h-full w-full max-w-screen-2xl flex-col items-center">
        {children}
      </div>
    </div>
  );
};
