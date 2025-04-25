
import { supabase } from "@/integrations/supabase/client";
import { MenuPosition } from "@/types/menu";
import { MenuItemType, SidebarMenuItem } from "@/types/sidebarMenu";

/**
 * Fetches positions for regular menu items
 */
export const fetchMenuPositions = async (): Promise<MenuPosition[]> => {
  console.log("Fetching menu positions from database");
  try {
    // Add a cache buster to avoid Supabase response caching
    const cacheBuster = new Date().getTime();
    
    const { data, error } = await supabase
      .from('menu_positions')
      .select('*')
      .order('position', { ascending: true })
      .eq('dummy', `${cacheBuster}`.substring(0, 0)); // Dummy query param that doesn't affect results

    if (error) {
      console.error("Error fetching menu positions:", error);
      return [];
    }

    console.log("Fetched menu positions:", data?.length || 0);
    return data as MenuPosition[];
  }
  catch (error) {
    console.error("Exception fetching menu positions:", error);
    return [];
  }
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
  
  // Then, prepare items for menu_positions table
  // This includes both regular menu items and categories
  const positionItems = items.filter(item => 
    item.type === MenuItemType.REGULAR || item.type === MenuItemType.CATEGORY
  );
  
  if (positionItems.length > 0) {
    // Prepare data for upsert
    const positionsData = positionItems.map(item => ({
      id: item.id,
      type: item.type,
      position: item.position,
      resource_id: item.type === MenuItemType.CATEGORY ? item.originalId : null,
      // Convert LucideIcon components to string icon names
      icon: typeof item.icon === 'string' ? item.icon : null
    }));
    
    console.log("Upserting menu positions for items:", positionsData);
    
    // Upsert menu positions
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

/**
 * Updates the positions of all menu items in the database
 */
const updateStaticPagesPositions = async (
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
