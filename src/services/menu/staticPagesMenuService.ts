
import { supabase } from "@/integrations/supabase/client";
import { StaticPage } from "@/types/staticPages";

/**
 * Fetches static pages that should appear in sidebar
 */
export const fetchSidebarPages = async (): Promise<StaticPage[]> => {
  console.log("Fetching sidebar pages from database");
  try {
    const { data, error } = await supabase
      .from('static_pages')
      .select('*')
      .eq('show_in_sidebar', true)
      .order('sidebar_position', { ascending: true, nullsFirst: false });

    if (error) {
      console.error("Error fetching sidebar pages:", error);
      return [];
    }

    console.log("Fetched sidebar pages:", data?.length || 0);
    if (data && data.length > 0) {
      console.log("First sidebar page:", data[0]);
    } else {
      console.log("No sidebar pages found");
    }
    
    return data as StaticPage[];
  } catch (error) {
    console.error("Exception fetching sidebar pages:", error);
    return [];
  }
};

