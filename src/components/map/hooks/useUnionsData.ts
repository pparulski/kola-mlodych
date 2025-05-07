
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
      const unionsWithCoordinates = data.map(union => ({
        ...union,
        coordinates: union.city && cityCoordinates[union.city] 
          ? cityCoordinates[union.city] 
          : cityCoordinates.default
      }));
      
      return unionsWithCoordinates as Union[];
    }
  });
};
