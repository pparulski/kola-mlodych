
import { supabase } from "@/integrations/supabase/client";

/**
 * Updates the icon for a menu item
 */
export async function updateMenuItemIcon(itemId: string, newIcon: string): Promise<{ success: boolean; error?: any }> {
  console.log(`menuService: Updating icon for item ${itemId} to ${newIcon}`);
  
  try {
    // Check if this is a regular menu item (not a static page or category)
    if (!itemId.startsWith('page-') && !itemId.startsWith('category-')) {
      // For regular menu items, we update directly in the menu_items table
      const { error } = await supabase
        .from("menu_items")
        .update({ icon: newIcon })
        .eq("id", itemId);

      if (error) {
        console.error("Error updating menu item icon:", error);
        throw error;
      }
      
      console.log(`menuService: Successfully updated icon in database for item ${itemId}`);
      return { success: true };
    } 
    // For special menu items (static pages, categories), 
    // update the position in menu_positions table
    else {
      const { error } = await supabase
        .from("menu_positions")
        .update({ 
          icon: newIcon,
          type: itemId.startsWith('page-') ? 'STATIC_PAGE' : 'CATEGORY'
        })
        .eq("id", itemId);

      if (error) {
        console.error("Error updating menu position icon:", error);
        throw error;
      }
      
      console.log(`menuService: Successfully updated icon in menu_positions for item ${itemId}`);
      return { success: true };
    }
  } catch (error) {
    console.error("Exception updating menu item icon:", error);
    return { success: false, error };
  }
}
