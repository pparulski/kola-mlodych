
import { supabase } from "@/integrations/supabase/client";
import { MenuPosition } from "@/types/menu";
import { MenuItemType, SidebarMenuItem } from "@/types/sidebarMenu";

/**
 * Fetches positions for regular menu items
 */
export const fetchMenuPositions = async (): Promise<MenuPosition[]> => {
  console.log("Fetching menu positions from database");
  try {
    const { data, error } = await supabase
      .from('menu_positions')
      .select('*')
      .order('position', { ascending: true });

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
  
  // Clean up existing positions before inserting new ones
  // This prevents position duplicates and orphaned items
  await cleanExistingPositions();
  
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
 * Removes any potential duplicate entries before saving new positions
 * This helps prevent the duplicate position issues
 */
const cleanExistingPositions = async (): Promise<void> => {
  try {
    // We'll do a simple fetch and delete of all menu positions
    // This ensures we start with a clean slate and all items get properly reordered
    // Not doing this for static pages since they're managed differently
    
    const { data, error } = await supabase
      .from('menu_positions')
      .select('id')
      .not('type', 'eq', 'static_page');
    
    if (error) {
      console.error("Error fetching positions for cleanup:", error);
      return;
    }
    
    // Update rather than delete to avoid foreign key violations
    // Just reset positions to large values temporarily
    if (data && data.length > 0) {
      // Just getting the IDs to update positions for
      const idsToUpdate = data.map(item => item.id);
      
      if (idsToUpdate.length > 0) {
        console.log(`Setting temporary positions for ${idsToUpdate.length} items`);
        // Rather than deleting, we'll update with temporary positions
        // This avoids issues with deleted rows
        const { error: updateError } = await supabase
          .from('menu_positions')
          .update({ position: 9999 })
          .in('id', idsToUpdate);
          
        if (updateError) {
          console.error("Error resetting positions during cleanup:", updateError);
        }
      }
    }
  } catch (error) {
    console.error("Exception during position cleanup:", error);
  }
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
