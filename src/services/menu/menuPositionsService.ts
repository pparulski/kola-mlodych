import { supabase } from "@/integrations/supabase/client";
import { MenuPosition } from "@/types/menu";
import { SidebarMenuItem } from "@/types/sidebarMenu";

/**
 * Fetches positions for all menu items (regular items, categories, and static pages)
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
 * Updates positions for all menu items in a single operation
 */
export const updateAllMenuPositions = async (
  items: SidebarMenuItem[]
): Promise<{ success: boolean; errors: any[] }> => {
  console.log("Updating all menu positions:", items);
  
  // Clean up existing positions before inserting new ones
  // This prevents position duplicates and orphaned items
  await cleanExistingPositions();
  
  // Prepare data for upsert - all types of menu items
  const positionsData = items.map(item => ({
    id: item.id,
    type: item.type,
    position: item.position,
    resource_id: item.originalId || null,
    // Convert LucideIcon components to string icon names
    icon: typeof item.icon === 'string' ? item.icon : null
  }));
  
  console.log("Upserting menu positions for items:", positionsData);
  
  try {
    // Batch upsert all menu positions
    const { error } = await supabase
      .from('menu_positions')
      .upsert(positionsData, { 
        onConflict: 'id',
        ignoreDuplicates: false
      });
    
    if (error) {
      console.error("Error updating menu positions:", error);
      return { success: false, errors: [error] };
    }
    
    return { success: true, errors: [] };
  } catch (error) {
    console.error("Exception updating menu positions:", error);
    return { success: false, errors: [error] };
  }
};

/**
 * Removes any potential duplicate entries before saving new positions
 * This helps prevent the duplicate position issues
 */
const cleanExistingPositions = async (): Promise<void> => {
  try {
    // We'll do a simple delete of all menu positions and re-insert them
    // This ensures we start with a clean slate and all items get properly reordered
    const { error } = await supabase
      .from('menu_positions')
      .delete()
      .neq('id', 'placeholder_that_doesnt_exist'); // Delete all rows
    
    if (error) {
      console.error("Error cleaning existing positions:", error);
    }
  } catch (error) {
    console.error("Exception during position cleanup:", error);
  }
};
