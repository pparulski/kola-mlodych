
import { useTheme } from "@/components/ui/theme-provider";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";

export function SidebarLogo() {
  const { resolvedTheme } = useTheme();
  const [isLoaded, setIsLoaded] = useState(false);
  
  // Mark the component as loaded after initial render
  useEffect(() => {
    setIsLoaded(true);
  }, []);
  
  // Determine the logo source based on the resolved theme
  const logoSrc = resolvedTheme === 'dark' 
    ? "/lovable-uploads/8bc5ecba-6aff-442e-81b0-0c51f2cc9cc7.png"
    : "/lovable-uploads/9b7922d9-f1dc-431e-a55d-1f5b63ebd5bf.png";
  
  return (
    <div className="p-6 flex justify-center items-center h-40">
      <Link to="/" className="w-full h-full flex justify-center items-center">
        <img 
          src={logoSrc}
          alt="Logo Koła Młodych" 
          className={`max-w-full max-h-full w-auto h-auto object-contain transition-transform hover:scale-105 ${
            isLoaded ? 'transition-opacity duration-300 opacity-100' : 'opacity-0'
          }`}
          loading="eager" // Explicitly disable lazy loading for the logo
          onLoad={() => setIsLoaded(true)}
        />
      </Link>
    </div>
  );
}
