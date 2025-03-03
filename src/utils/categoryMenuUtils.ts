
import { supabase } from "@/integrations/supabase/client";

/**
 * Creates a menu item for a category
 */
export const createCategoryMenuItem = async (name: string, slug: string, categoryId: string) => {
  try {
    console.log("Creating menu item for category:", name, slug, categoryId);
    
    // Get highest position for menu items
    const { data: menuItems } = await supabase
      .from("menu_items")
      .select("position")
      .order("position", { ascending: false })
      .limit(1);
    
    const newPosition = menuItems && menuItems.length > 0 ? menuItems[0].position + 1 : 1;
    
    // Create new menu item
    const result = await supabase
      .from("menu_items")
      .insert({
        title: name,
        path: `/category/${slug}`,
        type: "category_feed",
        icon: "BookOpen",
        position: newPosition,
        resource_id: categoryId,
        category_slug: slug
      });
    
    if (result.error) {
      console.error("Error creating menu item:", result.error);
      throw result.error;
    }
    
    console.log("Created menu item successfully");
    
    // After inserting the menu item, add an entry to menu_positions table
    const menuPositionResult = await supabase
      .from("menu_positions")
      .insert({
        id: `category-${categoryId}`,
        type: "category_feed",
        position: newPosition,
        resource_id: categoryId
      });
    
    if (menuPositionResult.error) {
      console.error("Error creating menu position:", menuPositionResult.error);
      throw menuPositionResult.error;
    }
    
    console.log("Created menu position successfully");
    
  } catch (error) {
    console.error("Error creating category menu item:", error);
    throw error;
  }
};

/**
 * Deletes a menu item for a category
 */
export const deleteCategoryMenuItem = async (categoryId: string) => {
  try {
    console.log("Deleting menu item for category ID:", categoryId);
    
    // Delete from menu_items
    const result = await supabase
      .from("menu_items")
      .delete()
      .eq("type", "category_feed")
      .eq("resource_id", categoryId);
    
    if (result.error) {
      console.error("Error deleting menu item:", result.error);
      throw result.error;
    }
    
    console.log("Deleted menu item successfully");
    
    // Also delete from menu_positions
    const positionResult = await supabase
      .from("menu_positions")
      .delete()
      .eq("type", "category_feed")
      .eq("resource_id", categoryId);
    
    if (positionResult.error) {
      console.error("Error deleting menu position:", positionResult.error);
      throw positionResult.error;
    }
    
    console.log("Deleted menu position successfully");
    
  } catch (error) {
    console.error("Error deleting category menu item:", error);
    throw error;
  }
};
