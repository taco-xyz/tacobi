// React Imports
import { FC } from "react";

// Card Imports
import { CardInternalProps } from "@/components/card";

// Components Imports
import { CardMenu } from "./card-menu/CardMenu";

// Context Imports
import { useCardMenu } from "./card-menu/CardMenuContext";

// Tailwind Imports
import clsx from "clsx";

export const FullCard: FC<CardInternalProps> = ({
  title,
  description,
  children,
  // sources,
  // lastUpdated,
  // loadingState,
}) => {
  // Extract the Card Menu Context
  const { isOpen, open, close, buttonContainerRef } = useCardMenu();

  return (
    <div
      className="flex w-full flex-col gap-y-6 overflow-hidden rounded-lg bg-white shadow ring ring-gray-200 dark:bg-gray-950/50 dark:ring-gray-900"
      style={{
        transition:
          "box-shadow 0.2s ease-in-out, background-color 0.2s ease-in-out",
      }}
    >
      {/* Title */}
      <div
        className="flex w-full flex-row items-center justify-between gap-x-10 border-b border-gray-200 bg-gray-50 p-6 dark:border-gray-900 dark:bg-gray-950/50"
        style={{
          transition:
            "border-color 0.2s ease-in-out, background-color 0.2s ease-in-out",
        }}
      >
        <div className="flex w-full flex-col gap-y-2">
          <h1
            className="font-geist-mono w-full text-start text-xs font-semibold tracking-wide text-gray-900 uppercase dark:text-gray-300"
            style={{
              transition: "color 0.2s ease-in-out",
            }}
          >
            {title}
          </h1>
          <p className="text-sm text-gray-500">{description}</p>
        </div>

        {/*Menu Button*/}
        <div className="relative">
          <div
            ref={buttonContainerRef}
            onClick={isOpen ? close : open}
            className="group flex flex-shrink-0 cursor-pointer flex-col items-center gap-y-1 p-3"
          >
            <div
              className={clsx(
                "group-hover:animate-up-down-1 size-1 rounded-full group-hover:bg-gray-500 group-hover:dark:bg-gray-400",
                isOpen ? "bg-gray-500 dark:bg-gray-400" : "bg-gray-400 dark:bg-gray-500",
              )}
              style={{
                transition: "background-color 0.3s ease-in-out",
              }}
            />
            <div
              className={clsx(
                "group-hover:animate-up-down-2 size-1 rounded-full group-hover:bg-gray-500 group-hover:dark:bg-gray-400",
                isOpen ? "bg-gray-500 dark:bg-gray-400" : "bg-gray-400 dark:bg-gray-500",
              )}
              style={{
                transition: "background-color 0.3s ease-in-out",
              }}
            />
            <div
              className={clsx(
                "group-hover:animate-up-down-3 size-1 rounded-full group-hover:bg-gray-500 group-hover:dark:bg-gray-400",
                isOpen ? "bg-gray-500 dark:bg-gray-400" : "bg-gray-400 dark:bg-gray-500",
              )}
              style={{
                transition: "background-color 0.3s ease-in-out",
              }}
            />
          </div>
          <CardMenu />
        </div>
      </div>

      {/* Content */}
      {children}
    </div>
  );
};
