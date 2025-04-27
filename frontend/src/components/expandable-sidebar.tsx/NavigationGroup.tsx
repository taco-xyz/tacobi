"use client";

// React Imports
import { FC, useMemo } from "react";

// Next Imports
import Link from "next/link";

// Utils Imports
import clsx from "clsx";

export interface NavigationItem {
  name: string;
  icon: React.ReactNode;
  href: string;
}

export interface NavigationGroup {
  name: string;
  items: NavigationItem[];
}

interface NavigationGroupProps {
  group: NavigationGroup;
  isOpen: boolean;
  pathname: string;
}

/**
 * @constant NavigationGroup
 * @description A component that displays a navigation group.
 * @param {NavigationGroupProps} props - The props for the NavigationGroup component.
 * @returns {ReactNode} The NavigationGroup component.
 */
export const NavigationGroup: FC<NavigationGroupProps> = ({
  group,
  isOpen,
  pathname,
}) => {
  // Memoize the current navigation item
  const currentNavigationItem = useMemo(
    () => group.items.find((item) => pathname.includes(item.href)),
    [pathname, group.items],
  );

  return (
    <div className="flex w-full flex-col items-start justify-center">
      {/* Group Name */}
      <h1
        className={clsx(
          "font-geist-mono h-5.5 text-xs font-medium tracking-wide text-nowrap text-gray-500 uppercase",
          isOpen ? "lg:h-5.5 lg:opacity-100" : "lg:h-0 lg:opacity-0",
        )}
        style={{
          transition: "opacity 0.2s ease-in-out, height 0.2s ease-in-out",
        }}
      >
        {group.name}
      </h1>

      {/* Group Items */}
      <div className="flex h-full w-full flex-col items-center gap-y-2 py-2">
        {group.items.map((item) => (
          <Link
            key={item.name}
            href={item.href}
            target="_blank"
            className={clsx(
              currentNavigationItem?.href === item.href &&
                "bg-gray-100 dark:bg-gray-900",
              "group mr-auto flex w-full flex-shrink-0 flex-row items-center justify-start gap-x-3 rounded-lg px-[7.5px] py-2 text-base leading-7 hover:bg-gray-100 dark:hover:bg-gray-900",
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
