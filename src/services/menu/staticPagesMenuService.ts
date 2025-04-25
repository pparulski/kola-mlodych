
import { supabase } from "@/integrations/supabase/client";
import { StaticPage } from "@/types/staticPages";

/**
 * Fetches all static pages regardless of sidebar status
 * We'll use menu_positions to determine which ones appear in the sidebar
 */
export const fetchSidebarPages = async (): Promise<StaticPage[]> => {
  console.log("Fetching all static pages from database");
  try {
    const { data, error } = await supabase
      .from('static_pages')
      .select('*');

    if (error) {
      console.error("Error fetching static pages:", error);
      return [];
    }

    console.log("Fetched static pages:", data?.length || 0);
    
    return data as StaticPage[];
  } catch (error) {
    console.error("Exception fetching static pages:", error);
    return [];
  }
};
