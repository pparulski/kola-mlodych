
import React, { createContext, useContext, useState, useEffect } from "react";
import { AlignLeft, X } from "lucide-react";

interface SidebarContextProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  openMobile: boolean;
  isMobile: boolean;
  state: "open" | "closed" | "collapsed";
  toggleSidebar: () => void;
}

const SidebarContext = createContext<SidebarContextProps>({
  isOpen: false,
  setIsOpen: () => {},
  openMobile: false,
  isMobile: false,
  state: "open",
  toggleSidebar: () => {}
});

export const SidebarProvider = ({ children }: { children: React.ReactNode }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const state = isOpen ? "open" : "closed";
  const openMobile = isOpen && isMobile;

  useEffect(() => {
    // Check if screen is mobile size
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile(); // Check on initial render
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Effect to manage body scroll when sidebar is open on mobile
  useEffect(() => {
    if (openMobile) {
      // Block scrolling on body when sidebar is open on mobile
      document.body.style.overflow = 'hidden';
    } else {
      // Re-enable scrolling when sidebar is closed
      document.body.style.overflow = '';
    }
    
    // Cleanup function to ensure scroll is re-enabled if component unmounts
    return () => {
      document.body.style.overflow = '';
    };
  }, [openMobile]);

  const toggleSidebar = () => setIsOpen(!isOpen);

  return (
    <SidebarContext.Provider value={{ 
      isOpen, 
      setIsOpen, 
      openMobile, 
      isMobile, 
      state, 
      toggleSidebar 
    }}>
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
