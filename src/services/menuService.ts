
import { supabase } from "@/integrations/supabase/client";
import { SidebarMenuItem, MenuItemType } from "@/types/sidebarMenu";
import { StaticPage } from "@/types/staticPages";

/**
 * Fetches static pages that should appear in sidebar
 */
export const fetchSidebarPages = async (): Promise<StaticPage[]> => {
  console.log("Fetching sidebar pages from database");
  const { data, error } = await supabase
    .from('static_pages')
    .select('*')
    .eq('show_in_sidebar', true)
    .order('sidebar_position', { ascending: true });

  if (error) {
    console.error("Error fetching sidebar pages:", error);
    return [];
  }

  console.log("Fetched sidebar pages:", data);
  return data as StaticPage[];
};

/**
 * Updates the positions of static pages in the database
 */
export const updateStaticPagesPositions = async (
  items: SidebarMenuItem[]
): Promise<{ success: boolean; errors: any[] }> => {
  console.log("Updating database with new positions:", items);
  
  // Create a batch of promises for all static page updates
  const updatePromises = [];
  
  // Only update DB for static pages
  for (const item of items) {
    if (item.type === MenuItemType.STATIC_PAGE && item.originalId) {
      console.log(`Updating position for ${item.title} (ID: ${item.originalId}) to ${item.position}`);
      
      const updatePromise = supabase
        .from('static_pages')
        .update({ sidebar_position: item.position })
        .eq('id', item.originalId);
        
      updatePromises.push(updatePromise);
    }
  }
  
  // No updates to make
  if (updatePromises.length === 0) {
    return { success: true, errors: [] };
  }
  
  // Wait for all updates to complete
  const results = await Promise.all(updatePromises);
  
  // Check for errors
  const errors = results.filter(result => result.error);
  
  return {
    success: errors.length === 0,
    errors: errors.map(result => result.error)
  };
};
