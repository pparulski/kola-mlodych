
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
        let coordinates = null;
        
        if (union.city && cityCoordinates[union.city]) {
          coordinates = cityCoordinates[union.city];
        } else if (union.city) {
          // If we don't have coordinates for this specific city, use default Poland coordinates
          coordinates = cityCoordinates["default"];
          console.warn(`Missing coordinates for city: ${union.city}, using default`);
        }
        
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
