"use client";

// React Imports
import { FC, PropsWithChildren } from "react";

// Utils Imports
import clsx from "clsx";

// Context Imports
import { useSidebar } from "@/context/SidebarContext";

/**
 * @constant RetractableLayout
 * @description A component that retracts the sidebar when the user is not hovering over it.
 */
export const RetractableLayout: FC<PropsWithChildren> = ({ children }) => {
  // Extract the sidebar context
  const { isOpen } = useSidebar();

  return (
    <div
      className={clsx(
        isOpen ? "lg:ml-[16rem]" : "lg:ml-[6rem]",
        "relative flex h-screen w-full flex-col items-center px-6 py-4 lg:py-6",
      )}
      style={{
        transition: "margin-left 0.2s ease-in-out",
      }}
    >
      <div className="mt-[57px] flex h-full w-full max-w-screen-2xl flex-col items-center lg:mt-0">
        {children}
      </div>
    </div>
  );
};
