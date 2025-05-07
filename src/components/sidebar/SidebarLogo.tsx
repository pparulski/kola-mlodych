
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
    ? "/lovable-uploads/a69e03ab-2d39-4e2c-acef-8b773e96bc91.png"
    : "/lovable-uploads/f47783a4-9b20-4e2a-ad2c-ee83934d60cc.png";
  
  return (
    <div className="p-6 flex justify-center">
      <Link to="/">
        <img 
          src={logoSrc}
          alt="Logo Koła Młodych" 
          className={`w-40 h-40 object-contain transition-transform hover:scale-105 ${
            isLoaded ? 'transition-opacity duration-300 opacity-100' : 'opacity-0'
          }`}
          loading="eager" // Explicitly disable lazy loading for the logo
          onLoad={() => setIsLoaded(true)}
        />
      </Link>
    </div>
  );
}
