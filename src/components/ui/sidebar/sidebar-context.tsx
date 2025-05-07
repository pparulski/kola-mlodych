
import React, { createContext, useContext, useState, useEffect, useCallback, memo } from "react";
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
  state: "closed",
  toggleSidebar: () => {}
});

export const SidebarProvider = ({ children }: { children: React.ReactNode }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  // Ensure state is typed correctly as "open" | "closed" | "collapsed"
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

  // Memoize toggleSidebar to prevent unnecessary re-renders
  const toggleSidebar = useCallback(() => setIsOpen(!isOpen), [isOpen]);

  const contextValue = React.useMemo(() => ({
    isOpen, 
    setIsOpen, 
    openMobile, 
    isMobile, 
    state, 
    toggleSidebar
  }), [isOpen, openMobile, isMobile, state, toggleSidebar]);

  return (
    <SidebarContext.Provider value={contextValue}>
      <div className="relative min-h-screen flex w-full">
        {children}
      </div>
    </SidebarContext.Provider>
  );
};

// Memoize the SidebarTrigger component to prevent unnecessary re-renders
export const SidebarTrigger = memo(function SidebarTrigger() {
  const { isOpen, setIsOpen } = useSidebar();
  
  const handleToggle = useCallback(() => {
    setIsOpen(!isOpen);
  }, [isOpen, setIsOpen]);
  
  return (
    <button
      className={`
        fixed top-4 left-4 z-50 p-2 rounded-md
        transition-all duration-200
        text-foreground border border-border/50
        hover:border-primary hover:text-primary
        focus:outline-none focus:ring-2 focus:ring-ring
        ${isOpen ? "translate-x-0" : "translate-x-0"}
      `}
      onClick={handleToggle}
    >
      {isOpen ? (
        <X size={24} />
      ) : (
        <AlignLeft size={24} />
      )}
    </button>
  );
});

export const useSidebar = () => {
  return useContext(SidebarContext);
};
