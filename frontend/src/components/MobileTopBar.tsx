// React Imports
import { FC } from "react";

// Logo Imports
import { Logo } from "./Logo";

// Icons Imports
import { MenuIcon, XIcon } from "lucide-react";

// Context Imports
import { useSidebar } from "@/context/SidebarContext";

// Utils Imports
import clsx from "clsx";

export const MobileTopBar: FC = () => {
  // Extract the sidebar context
  const { isOpen, setIsOpen } = useSidebar();

  return (
    <div className="fixed top-0 right-0 left-0 z-50 px-6 lg:hidden">
      <div
        className="flex w-full flex-row items-center justify-between border-b border-gray-200 bg-white py-4 dark:border-gray-800 dark:bg-gray-950"
        style={{
          transition:
            "background-color 0.2s ease-in-out, border-color 0.2s ease-in-out",
        }}
      >
        {/* Logo */}
        <Logo />

        {/* Open/Close Sidebar Button */}
        <button
          className="relative size-10 cursor-pointer flex items-center justify-center rounded-lg p-1 text-gray-500 hover:bg-gray-100 hover:text-blue-600 dark:hover:bg-gray-900 dark:hover:text-blue-400"
          onClick={() => setIsOpen(!isOpen)}
          style={{
            transition:
              "background-color 0.2s ease-in-out, color 0.2s ease-in-out",
          }}
        >
          <MenuIcon
            className={clsx(
              isOpen ? "opacity-0" : "opacity-100",
              "absolute size-7",
            )}
            strokeWidth={1.5}
            style={{
              transition: "opacity 0.2s ease-in-out",
            }}
          />
          <XIcon
            className={clsx(
              isOpen ? "opacity-100" : "opacity-0",
              "absolute size-7",
            )}
            strokeWidth={1.5}
            style={{
              transition: "opacity 0.2s ease-in-out",
            }}
          />
        </button>
      </div>
    </div>
  );
};
