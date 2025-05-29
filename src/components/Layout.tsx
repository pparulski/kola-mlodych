
import { SidebarProvider } from "@/components/ui/sidebar";
import { LayoutContent } from "./layout/LayoutContent";
import { ThemeProvider } from "@/components/ui/theme-provider";
import { useState, useEffect } from "react";
import { PasswordOverlay } from "./home/PasswordOverlay";
import { config } from "@/config";

export function Layout({ children }: { children: React.ReactNode }) {
  const [showPasswordOverlay, setShowPasswordOverlay] = useState(
    config.security.passwordProtectionEnabled
  );
  
  useEffect(() => {
    // Check if the password has been entered in this session
    const passwordEntered = sessionStorage.getItem('sitePasswordEntered');
    if (passwordEntered === 'true') {
      setShowPasswordOverlay(false);
    }
  }, []);
  
  const handlePasswordCorrect = () => {
    setShowPasswordOverlay(false);
  };

  return (
    <ThemeProvider defaultTheme="system" storageKey="theme-preference">
      <SidebarProvider>
        {showPasswordOverlay && (
          <PasswordOverlay 
            correctPassword={config.security.password} 
            onPasswordCorrect={handlePasswordCorrect} 
          />
        )}
        <div className="flex w-full">
          <LayoutContent>
            {children}
          </LayoutContent>
        </div>
      </SidebarProvider>
    </ThemeProvider>
  );
}
