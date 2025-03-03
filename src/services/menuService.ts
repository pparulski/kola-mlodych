
import { supabase } from "@/integrations/supabase/client";
import { SidebarMenuItem, MenuItemType } from "@/types/sidebarMenu";
import { StaticPage } from "@/types/staticPages";
import { MenuPosition } from "@/types/menu";

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
 * Fetches positions for regular menu items
 */
export const fetchMenuPositions = async (): Promise<MenuPosition[]> => {
  console.log("Fetching menu positions from database");
  // Use the correct table name here
  const { data, error } = await supabase
    .from('menu_positions')
    .select('*')
    .order('position', { ascending: true });

  if (error) {
    console.error("Error fetching menu positions:", error);
    return [];
  }

  console.log("Fetched menu positions:", data);
  return data as MenuPosition[];
};

/**
 * Fetches category menu items 
 */
export const fetchCategoryMenuItems = async () => {
  console.log("Fetching category menu items from database");
  const { data, error } = await supabase
    .from('menu_items')
    .select('*')
    .eq('type', 'category_feed')
    .order('position', { ascending: true });

  if (error) {
    console.error("Error fetching category menu items:", error);
    return [];
  }

  console.log("Fetched category menu items:", data);
  return data;
};

/**
 * Updates the positions of all menu items in the database
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

/**
 * Updates positions for both static pages and regular menu items
 */
export const updateAllMenuPositions = async (
  items: SidebarMenuItem[]
): Promise<{ success: boolean; errors: any[] }> => {
  console.log("Updating all menu positions:", items);
  
  // First, update static pages
  const staticPagesResult = await updateStaticPagesPositions(items);
  
  // Then, upsert menu positions for regular menu items
  const regularItems = items.filter(item => item.type === MenuItemType.REGULAR);
  
  if (regularItems.length > 0) {
    // Prepare data for upsert
    const positionsData = regularItems.map(item => ({
      id: item.id,
      type: item.type,
      position: item.position
    }));
    
    console.log("Upserting menu positions for regular items:", positionsData);
    
    // Upsert menu positions - use the correct table name
    const { error } = await supabase
      .from('menu_positions')
      .upsert(positionsData, { 
        onConflict: 'id',
        ignoreDuplicates: false
      });
    
    if (error) {
      console.error("Error updating menu positions:", error);
      return { 
        success: false, 
        errors: [...(staticPagesResult.errors || []), error]
      };
    }
  }
  
  return staticPagesResult;
};
