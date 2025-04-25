"use client";

// React Imports
import { createContext, useContext, useState, ReactNode } from "react";

/**
 * @typedef {Object} SidebarContextType
 *
 * @description Context type for the sidebar.
 * @property {boolean} isOpen - Whether the sidebar is open.
 * @property {function} setIsOpen - Function to set the sidebar open state.
 */
interface SidebarContextType {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

// Create the context
const SidebarContext = createContext<SidebarContextType>({
  isOpen: false,
  setIsOpen: () => {},
});

/**
 * @function SidebarProvider
 * @description Provider for the sidebar context.
 * @param {ReactNode} children - The children of the provider.
 * @returns {ReactNode} The provider.
 */
export function SidebarProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <SidebarContext.Provider value={{ isOpen, setIsOpen }}>
      {children}
    </SidebarContext.Provider>
  );
}

/**
 * @function useSidebar
 * @description Hook to use the sidebar context.
 * @returns {SidebarContextType} The sidebar context.
 */
export function useSidebar() {
  const context = useContext(SidebarContext);
  if (context === undefined) {
    throw new Error("useSidebar must be used within a SidebarProvider");
  }
  return context;
}
