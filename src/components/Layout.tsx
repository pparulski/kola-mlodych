import { SidebarProvider } from "@/components/ui/sidebar";
import { LayoutContent } from "./layout/LayoutContent";
import { ThemeProvider } from "@/components/ui/theme-provider";
import { useState, useEffect } from "react";
import { PasswordOverlay } from "./home/PasswordOverlay";
import { config } from "@/config";
import { Helmet } from 'react-helmet-async';

export function Layout() {
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
        <Helmet>
          {/* DNS prefetch for external resources */}
          <link rel="dns-prefetch" href="//fonts.googleapis.com" />
          
          {/* Preconnect to critical origins */}
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
          
          {/* Preload critical resources */}
          <link rel="preload" href="/assets/fonts/main.woff2" as="font" type="font/woff2" crossOrigin="anonymous" />
        </Helmet>
        
        {showPasswordOverlay && (
          <PasswordOverlay 
            correctPassword={config.security.password} 
            onPasswordCorrect={handlePasswordCorrect} 
          />
        )}
        <div className="flex w-full">
          <LayoutContent />
        </div>
      </SidebarProvider>
    </ThemeProvider>
  );
}
