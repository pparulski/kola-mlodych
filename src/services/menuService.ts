import { supabase } from "@/integrations/supabase/client";
import { SidebarMenuItem, MenuItemType } from "@/types/sidebarMenu";
import { StaticPage } from "@/types/staticPages";
import { MenuPosition } from "@/types/menu";
import { Category } from "@/types/categories";

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

/**
 * Fetches positions for regular menu items
 */
export const fetchMenuPositions = async (): Promise<MenuPosition[]> => {
  console.log("Fetching menu positions from database");
  try {
    // Use the correct table name here
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
  } catch (error) {
    console.error("Exception fetching menu positions:", error);
    return [];
  }
};

/**
 * Fetches categories marked to show in menu
 */
export const fetchCategoryMenuItems = async (): Promise<Category[]> => {
  console.log("Fetching category menu items from database");
  try {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('show_in_menu', true)
      .order('name', { ascending: true });

    if (error) {
      console.error("Error fetching category menu items:", error);
      return [];
    }

    console.log("Fetched category menu items:", data?.length || 0);
    return data as Category[];
  } catch (error) {
    console.error("Exception fetching category menu items:", error);
    return [];
  }
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
      resource_id: item.type === MenuItemType.CATEGORY ? item.originalId : null
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

// Add function to update menu item icon
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
        .update({ icon: newIcon })
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
