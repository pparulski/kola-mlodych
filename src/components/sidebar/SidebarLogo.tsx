
import { useTheme } from "@/components/ui/theme-provider";
import { Link } from "react-router-dom";

export function SidebarLogo() {
  const { theme } = useTheme();
  
  return (
    <div className="p-6 flex justify-center">
      <Link to="/">
        <img 
          src={theme === 'dark' 
            ? "/lovable-uploads/a69e03ab-2d39-4e2c-acef-8b773e96bc91.png"
            : "/lovable-uploads/f47783a4-9b20-4e2a-ad2c-ee83934d60cc.png"
          } 
          alt="Logo Koła Młodych" 
          className="w-40 h-40 object-contain transition-transform hover:scale-105"
        />
      </Link>
    </div>
  );
}
