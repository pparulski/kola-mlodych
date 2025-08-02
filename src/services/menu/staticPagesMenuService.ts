import { supabase } from "@/integrations/supabase/client";
import { StaticPage } from "@/types/staticPages";

/**
 * Fetches only the fields needed for sidebar menu generation
 * Excludes heavy content field to improve performance
 */
export const fetchSidebarPages = async (): Promise<Partial<StaticPage>[]> => {
  console.log("Fetching sidebar pages metadata from database");
  try {
    const { data, error } = await supabase
      .from('static_pages')
      .select(`
        id,
        title,
        slug,
        show_in_sidebar,
        sidebar_position,
        position_type,
        created_at,
        updated_at
      `)
      .eq('show_in_sidebar', true) // Only fetch pages that should be in sidebar
      .order('sidebar_position', { ascending: true, nullsFirst: false });

    if (error) {
      console.error("Error fetching sidebar pages:", error);
      return [];
    }

    console.log("Fetched sidebar pages:", data?.length || 0);
    
    return data;
  } catch (error) {
    console.error("Exception fetching sidebar pages:", error);
    return [];
  }
};

/**
 * Fetches a single static page with full content for display
 */
export const fetchStaticPageBySlug = async (slug: string): Promise<StaticPage | null> => {
  console.log("Fetching static page by slug:", slug);
  try {
    const { data, error } = await supabase
      .from('static_pages')
      .select('*') // Full content only when needed for display
      .eq('slug', slug)
      .single();

    if (error) {
      console.error("Error fetching static page:", error);
      return null;
    }

    return data as StaticPage;
  } catch (error) {
    console.error("Exception fetching static page:", error);
    return null;
  }
};
