
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Category } from "@/types/categories";
import { useLocation } from "react-router-dom";

export function useCategories() {
  const location = useLocation();
  const isHomePage = location.pathname === '/';

  return useQuery({
    queryKey: ['layout-categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name');

      if (error) throw error;
      return data as Category[];
    },
    enabled: isHomePage,
  });
}
