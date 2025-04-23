"use client";

// React Imports
import { FC, useMemo } from "react";

// Next Imports
import { usePathname } from "next/navigation";
import Link from "next/link";

// Lucide Icons
import {
  ChevronsLeftIcon,
  ScanSearchIcon,
  WaypointsIcon,
  Landmark,
  Coins,
  Globe,
} from "lucide-react";

// Utils Imports
import clsx from "clsx";

// Context Imports
import { useSidebar } from "@/context/SidebarContext";

// Components Imports
import { ThemeToggle } from "./ThemeToggle";
import { Logo } from "../Logo";

interface NavigationItem {
  name: string;
  icon: React.ReactNode;
  href: string;
}

interface NavigationGroup {
  name: string;
  items: NavigationItem[];
}

interface NavigationGroupComponentProps {
  group: NavigationGroup;
  isOpen: boolean;
  pathname: string;
}

const NavigationGroupComponent: FC<NavigationGroupComponentProps> = ({
  group,
  isOpen,
  pathname,
}) => {
  const currentNavigationItem = useMemo(
    () => group.items.find((item) => pathname.includes(item.href)),
    [pathname, group.items],
  );

  return (
    <div className="flex w-full flex-col items-start justify-center gap-y-1">
      <h1
        className={clsx(
          "text-xs font-medium text-nowrap text-gray-500 capitalize transition-opacity duration-200 ease-in-out",
          isOpen ? "opacity-100" : "opacity-0",
        )}
      >
        {group.name}
      </h1>
      <div className="flex h-full w-full flex-col items-center gap-y-2 py-2">
        {group.items.map((item) => (
          <Link
            key={item.name}
            href={item.href}
            target="_blank"
            className={clsx(
              currentNavigationItem?.href === item.href &&
                "bg-gray-100 dark:bg-gray-900",
              "group mr-auto flex w-full flex-shrink-0 flex-row items-center justify-start gap-x-3 rounded-lg px-2 py-2 text-base leading-7 hover:bg-gray-100 dark:hover:bg-gray-900",
            )}
            style={{
              transition: "background-color 0.2s ease-in-out",
            }}
          >
            {/* Icon */}
            <div
              className={clsx(
                currentNavigationItem?.href === item.href
                  ? "text-blue-600 dark:text-blue-400"
                  : isOpen
                    ? "text-gray-500 lg:text-gray-400 dark:lg:text-gray-600"
                    : "text-gray-500",
                "ml-1.5 group-hover:text-blue-600 dark:group-hover:text-blue-400",
              )}
              style={{
                transition: "color 0.2s ease-in-out",
              }}
            >
              {item.icon}
            </div>

            {/* Name */}
            <div
              className={clsx(
                isOpen ? "w-full lg:opacity-100" : "w-0 lg:opacity-0",
                currentNavigationItem?.href === item.href
                  ? "text-blue-600 dark:text-blue-400"
                  : "text-gray-900 dark:text-white",
                "text-sm font-medium whitespace-nowrap opacity-100",
              )}
              style={{
                transition:
                  "opacity 0.2s ease-in-out, color 0.2s ease-in-out, width 0.2s ease-in-out",
              }}
            >
              {item.name}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

const navigationGroups: NavigationGroup[] = [
  {
    name: "PROTOCOL",
    items: [
      {
        name: "Global",
        icon: <Globe className="size-5" strokeWidth={1.5} />,
        href: "/",
      },
      {
        name: "Network Effects",
        icon: <WaypointsIcon className="size-5" strokeWidth={1.5} />,
        href: "#",
      },
    ],
  },
  {
    name: "ECOSYSTEM",
    items: [
      {
        name: "Curators",
        icon: <ScanSearchIcon className="size-5" strokeWidth={1.5} />,
        href: "#",
      },
      {
        name: "Vaults",
        icon: <Landmark className="size-5" strokeWidth={1.5} />,
        href: "#",
      },
      {
        name: "Markets",
        icon: <Coins className="size-5" strokeWidth={1.5} />,
        href: "#",
      },
    ],
  },
];

/**
 * @function ExpandableSidebar
 *
 * @description A component that displays a sidebar that can be expanded or collapsed.
 * @returns {JSX.Element} The ExpandableSidebar component.
 */
export const ExpandableSidebar: FC = () => {
  // Extract the sidebar context
  const { isOpen, setIsOpen } = useSidebar();

  // Get the current pathname
  const pathname = usePathname();

  return (
    <div
      className={clsx(
        isOpen
          ? "w-full opacity-100 lg:w-[16rem]"
          : "w-0 opacity-0 lg:w-[6rem]",
        "fixed top-0 right-0 bottom-0 left-0 z-40 flex h-screen flex-col items-center justify-between overflow-hidden border-gray-200 bg-white lg:border-r lg:opacity-100 dark:border-gray-800 dark:bg-gray-950",
      )}
      style={{
        transition:
          "width 0.2s ease-in-out, color 0.2s ease-in-out, background-color 0.2s ease-in-out, border-color 0.2s ease-in-out, opacity 0.2s ease-in-out",
      }}
    >
      <div className="flex h-full w-full flex-col items-center justify-between px-6 py-4 lg:py-6">
        {/* Logo */}
        <div className="flex w-full flex-shrink-0 flex-row items-center justify-center border-b border-gray-200 pb-6 transition-colors duration-200 ease-in-out dark:border-gray-800">
          <Logo />
        </div>

        {/* Navigation Items */}
        <div className="mt-4 mb-auto flex w-full flex-col items-start justify-center gap-y-1">
          {navigationGroups.map((group) => (
            <NavigationGroupComponent
              key={group.name}
              group={group}
              isOpen={isOpen}
              pathname={pathname}
            />
          ))}
        </div>

        {/* Bottom Buttons */}
        <div className="flex w-full flex-col items-start justify-center gap-y-4 lg:pl-[4px]">
          {/* Theme Toggle Button (visible when sidebar is closed and mobile) */}
          <div
            className={clsx(
              isOpen ? "lg:opacity-0" : "lg:opacity-100",
              "opacity-100",
            )}
            style={{
              transition: "opacity 0.2s ease-in-out",
            }}
          >
            <ThemeToggle />
          </div>

          {/*Desktop Buttons*/}
          <div className="hidden w-full flex-row items-start justify-start gap-x-4 lg:flex">
            {/* Open/Close Sidebar Button */}
            <button
              className="cursor-pointer items-center justify-center rounded-lg p-1 text-gray-500 hover:bg-gray-100 hover:text-blue-600 dark:hover:bg-gray-900 dark:hover:text-blue-400"
              onClick={() => setIsOpen(!isOpen)}
              style={{
                transition:
                  "background-color 0.2s ease-in-out, color 0.2s ease-in-out",
              }}
            >
              <ChevronsLeftIcon
                strokeWidth={1.5}
                className={clsx(
                  "size-8 flex-shrink-0",
                  isOpen ? "rotate-0" : "rotate-180",
                )}
                style={{
                  transition: "transform 0.2s ease-in-out",
                }}
              />
            </button>

            {/* Theme Toggle Button (visible when sidebar is open) */}
            <div
              className={clsx(!isOpen ? "w-0 opacity-0" : "w-fit opacity-100")}
              style={{
                transition: "opacity 0.2s ease-in-out, width 0.2s ease-in-out",
              }}
            >
              <ThemeToggle />
            </div>
          </div>
        </div>

        {/*Desktop Watermark*/}
        <div
          className="relative mx-auto mt-4 hidden h-[60px] w-full items-center justify-center overflow-hidden rounded-lg text-center text-sm font-medium whitespace-nowrap text-gray-400 ring-1 ring-gray-200 ring-inset lg:flex dark:text-gray-600 dark:ring-gray-800"
          style={{
            transition: "color 0.2s ease-in-out, box-shadow 0.2s ease-in-out",
          }}
        >
          {/*Open State*/}
          <span
            className={clsx(
              isOpen ? "opacity-100" : "opacity-0",
              "absolute left-10",
            )}
            style={{
              transition: "opacity 0.2s ease-in-out",
            }}
          >
            Powered by <span className="font-bold text-gray-500">deltaY</span>
          </span>

          {/*Closed State*/}
          <span
            className={clsx(
              isOpen ? "opacity-0" : "opacity-100",
              "absolute left-[20px]",
            )}
            style={{
              transition: "opacity 0.2s ease-in-out",
            }}
          >
            Y
          </span>
        </div>

        {/*Mobile Watermark*/}
        <div
          className={clsx(
            "mt-4 flex h-[60px] w-full items-center justify-center overflow-hidden rounded-lg text-sm font-medium whitespace-nowrap text-gray-400 ring-1 ring-gray-200 ring-inset lg:hidden dark:text-gray-600 dark:ring-gray-800",
            isOpen ? "opacity-100" : "opacity-0",
          )}
          style={{
            transition:
              "color 0.2s ease-in-out, box-shadow 0.2s ease-in-out, opacity 0.15s ease-in-out",
          }}
        >
          <p>
            Powered by <span className="font-bold text-gray-500">deltaY</span>
          </p>
        </div>
      </div>
    </div>
  );
};
