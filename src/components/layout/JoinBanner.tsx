
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { StaticPage } from "@/types/staticPages";

export const JoinBanner = () => {
  const { data: joinPage } = useQuery({
    queryKey: ['static-page-title', 'dolacz-do-nas'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('static_pages')
        .select('title')
        .eq('slug', 'dolacz-do-nas')
        .maybeSingle();
        
      if (error) {
        console.error("Error fetching join page:", error);
        return null;
      }
      
      return data as StaticPage;
    },
    staleTime: Infinity, // Cache forever to prevent repeated queries
    gcTime: Infinity, // Keep in cache indefinitely
    refetchOnWindowFocus: false, // Don't refetch on window focus
    refetchOnReconnect: false, // Don't refetch on reconnect
    refetchOnMount: false, // Don't refetch on component mount after initial load
  });

  // Always render immediately with fallback text - no loading state
  const bannerText = joinPage?.title || "Dołącz do nas!";

  return (
    <Link
      id="join-banner"
      to="/dolacz-do-nas"
      className="bg-primary p-2 text-primary-foreground text-center font-bold shadow-lg sticky top-0 z-10 hover:bg-accent transition-colors block"
      style={{
        // Prevent layout shifts by setting minimum height
        minHeight: '40px',
        // Ensure immediate visibility
        visibility: 'visible',
        display: 'block'
      }}
    >
      <span>{bannerText}</span>
    </Link>
  );
};
