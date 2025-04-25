
import { supabase } from "@/integrations/supabase/client";
import { Category } from "@/types/categories";

/**
 * Fetches categories marked to show in menu
 */
export const fetchCategoryMenuItems = async (): Promise<Category[]> => {
  console.log("Fetching category menu items from database");
  try {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('show_in_menu', true)
      .order('name', { ascending: true });

    if (error) {
      console.error("Error fetching category menu items:", error);
      return [];
    }

    console.log("Fetched category menu items:", data?.length || 0);
    return data as Category[];
  } catch (error) {
    console.error("Exception fetching category menu items:", error);
    return [];
  }
};

