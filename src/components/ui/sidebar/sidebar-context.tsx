
import React, { createContext, useContext, useState } from "react";
import { AlignLeft, X } from "lucide-react";

interface SidebarContextProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

const SidebarContext = createContext<SidebarContextProps>({
  isOpen: false,
  setIsOpen: () => {}
});

export const SidebarProvider = ({ children }: { children: React.ReactNode }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <SidebarContext.Provider value={{ isOpen, setIsOpen }}>
      <div className="relative min-h-screen flex w-full">
        {children}
      </div>
    </SidebarContext.Provider>
  );
};

export function SidebarTrigger() {
  const { isOpen, setIsOpen } = useSidebar();
  
  return (
    <button
      data-component-name="SidebarTrigger"
      className={`
        fixed top-4 left-4 z-50 p-2 rounded-md
        transition-all duration-200
        text-foreground 
        focus:outline-none focus:ring-2 focus:ring-ring
        ${isOpen ? "translate-x-0" : "translate-x-0"}
      `}
      onClick={() => setIsOpen(!isOpen)}
    >
      {isOpen ? (
        <X size={24} />
      ) : (
        <AlignLeft size={24} />
      )}
    </button>
  );
}

export const useSidebar = () => {
  return useContext(SidebarContext);
};
