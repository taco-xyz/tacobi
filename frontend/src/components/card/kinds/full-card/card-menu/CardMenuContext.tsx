"use client";

// React Imports
import {
  FC,
  createContext,
  useContext,
  useCallback,
  useEffect,
  useState,
  RefObject,
  useRef,
  PropsWithChildren,
} from "react";

/**
 * Type for the CardMenuContext
 *
 * @property isOpen - Whether the menu is open
 * @property open - Function to open the menu
 * @property close - Function to close the menu
 * @property containerRef - Ref to the menu container element
 */
interface CardMenuContextType {
  isOpen: boolean;
  open: () => void;
  close: () => void;
  containerRef: RefObject<HTMLDivElement | null>;
  buttonContainerRef: RefObject<HTMLDivElement | null>;
}

/**
 * Context for the CardMenu
 */
const CardMenuContext = createContext<CardMenuContextType | undefined>(
  undefined,
);

/**
 * Provider for the CardMenuContext
 * @param children - The children of the provider
 * @returns The provider
 */
export const CardMenuProvider: FC<PropsWithChildren> = ({ children }) => {
  // State to track if the menu is open
  const [isOpen, setIsOpen] = useState(false);

  // Ref to the menu container element
  const containerRef = useRef<HTMLDivElement>(null);

  // Ref to the button container element
  const buttonContainerRef = useRef<HTMLDivElement>(null);

  // Function to open the menu
  const open = useCallback(() => setIsOpen(true), []);

  // Function to close the menu
  const close = useCallback(() => setIsOpen(false), []);

  // Close the menu when clicking outside of it or the button container
  const handleClickOutside = useCallback(
    (e: MouseEvent) => {
      if (
        !containerRef.current ||
        !buttonContainerRef.current ||
        containerRef.current.contains(e.target as Node) ||
        buttonContainerRef.current.contains(e.target as Node)
      )
        return;

      close();
    },
    [close, containerRef],
  );

  // Listen for click events
  useEffect(() => {
    if (!isOpen) return;

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen, handleClickOutside]);

  return (
    <CardMenuContext.Provider
      value={{ isOpen, open, close, containerRef, buttonContainerRef }}
    >
      {children}
    </CardMenuContext.Provider>
  );
};

export function useCardMenu() {
  const context = useContext(CardMenuContext);
  if (!context)
    throw new Error("useCardMenu must be used within CardMenuProvider");
  return context;
}
