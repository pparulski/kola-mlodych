
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function useCategories() {
  return useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      console.log("Fetching categories");
      try {
        const { data, error } = await supabase
          .from('categories')
          .select('*')
          .order('name');

        if (error) {
          console.error("Error fetching categories:", error);
          throw error;
        }
        
        console.log(`Successfully fetched ${data?.length || 0} categories`);
        return data;
      } catch (error) {
        console.error("Exception in categories fetch:", error);
        throw error;
      }
    },
    retry: 2,
  });
}
