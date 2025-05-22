
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Union, cityCoordinates } from "../types";

/**
 * Custom hook to fetch unions data from Supabase
 */
export const useUnionsData = () => {
  return useQuery({
    queryKey: ['unions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('unions')
        .select('*')
        .order('name');
      
      if (error) throw error;
      
      // Add coordinates based on city
      const unionsWithCoordinates = data.map(union => {
        // If the union has a city field and we have coordinates for that city
        const coordinates = union.city && cityCoordinates[union.city] 
          ? cityCoordinates[union.city] 
          : null; // Don't use default to avoid clustering non-located unions
        
        return {
          ...union,
          coordinates
        };
      });
      
      return unionsWithCoordinates as Union[];
    },
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    refetchOnWindowFocus: false
  });
};
