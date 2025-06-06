
import { supabase } from "@/integrations/supabase/client";

/**
 * Updates the icon for a menu item in both menu_positions and menu_items tables
 */
export async function updateMenuItemIcon(itemId: string, newIcon: string): Promise<{ success: boolean; error?: any }> {
  console.log(`menuService: Updating icon for item ${itemId} to ${newIcon}`);
  
  try {
    // Check if the ID starts with page- or category-
    if (itemId.startsWith('page-') || itemId.startsWith('category-')) {
      // For static pages and categories, update in menu_positions (which uses string IDs)
      const { error } = await supabase
        .from("menu_positions")
        .update({ icon: newIcon })
        .eq("id", itemId);

      if (error) {
        console.error("Error updating menu position icon:", error);
        throw error;
      }
      
      console.log(`menuService: Successfully updated icon in menu_positions for item ${itemId}`);
    } else if (itemId.startsWith('home') || 
               itemId.startsWith('struktury') || 
               itemId.startsWith('downloads') || 
               itemId.startsWith('ebooks') || 
               itemId.startsWith('about')) {
      // For default menu items like 'home', 'about', etc., only update in menu_positions
      const { error } = await supabase
        .from("menu_positions")
        .update({ icon: newIcon })
        .eq("id", itemId);

      if (error) {
        console.error("Error updating menu position icon for default item:", error);
        throw error;
      }
      
      console.log(`menuService: Successfully updated icon for default item ${itemId}`);
    } else {
      // For regular menu items with UUID, update in menu_items table
      const { error } = await supabase
        .from("menu_items")
        .update({ icon: newIcon })
        .eq("id", itemId);

      if (error) {
        console.error("Error updating menu item icon:", error);
        throw error;
      }

      // Also update in menu_positions to maintain consistency
      const { error: posError } = await supabase
        .from("menu_positions")
        .update({ icon: newIcon })
        .eq("id", itemId);

      if (posError) {
        console.error("Error updating menu position icon:", posError);
        // Don't throw here as the main update succeeded
      }
      
      console.log(`menuService: Successfully updated icon for item ${itemId}`);
    }
    
    return { success: true };
  } catch (error) {
    console.error("Exception updating menu item icon:", error);
    return { success: false, error };
  }
}
