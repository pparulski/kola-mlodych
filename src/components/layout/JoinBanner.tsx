
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { StaticPage } from "@/types/staticPages";

export const JoinBanner = () => {
  const { data: joinPage, isLoading } = useQuery({
    queryKey: ['static-page', 'dolacz-do-nas'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('static_pages')
        .select('*')
        .eq('slug', 'dolacz-do-nas')
        .maybeSingle();
        
      if (error) {
        console.error("Error fetching join page:", error);
        return null;
      }
      
      return data as StaticPage;
    },
    staleTime: 300000, // Cache for 5 minutes
  });

  // Default text if page is loading or not found
  const bannerText = joinPage?.title || "Dołącz do nas!";

  return (
    <Link 
      to="/dolacz-do-nas"
      className="bg-primary p-2 text-primary-foreground text-center font-bold shadow-lg sticky top-0 z-10 hover:bg-accent transition-colors"
    >
      <span>{bannerText}</span>
    </Link>
  );
};
