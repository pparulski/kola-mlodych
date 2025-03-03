
import { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Category } from "@/types/categories";
import { toast } from "sonner";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Check, Loader2 } from "lucide-react";
import { Switch } from "@/components/ui/switch";

// Form schema validation
const categoryFormSchema = z.object({
  name: z.string().min(2, "Nazwa musi mieć co najmniej 2 znaki"),
  slug: z.string().min(2, "Slug musi mieć co najmniej 2 znaki").regex(/^[a-z0-9-]+$/, "Slug może zawierać tylko małe litery, cyfry i myślniki"),
  show_in_menu: z.boolean().optional().default(false),
});

// Form data type based on the schema
type CategoryFormData = z.infer<typeof categoryFormSchema>;

interface CategoryFormProps {
  editingCategory: Category | null;
  onSuccess: () => void;
}

export function CategoryForm({ editingCategory, onSuccess }: CategoryFormProps) {
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Initialize form with react-hook-form
  const form = useForm<CategoryFormData>({
    resolver: zodResolver(categoryFormSchema),
    defaultValues: {
      name: "",
      slug: "",
      show_in_menu: false,
    },
  });
  
  // Update form values when editing category changes
  useEffect(() => {
    if (editingCategory) {
      form.reset({
        name: editingCategory.name,
        slug: editingCategory.slug,
        show_in_menu: editingCategory.show_in_menu || false,
      });
    } else {
      form.reset({
        name: "",
        slug: "",
        show_in_menu: false,
      });
    }
  }, [editingCategory, form]);
  
  // Handle form submission
  const onSubmit = async (data: CategoryFormData) => {
    setIsSubmitting(true);
    
    try {
      console.log("Submitting category:", data);
      
      let result;
      let categoryId = editingCategory?.id;
      
      if (editingCategory) {
        // Update existing category
        result = await supabase
          .from("categories")
          .update({
            name: data.name,
            slug: data.slug,
            show_in_menu: data.show_in_menu,
          })
          .eq("id", editingCategory.id);
      } else {
        // Insert new category
        result = await supabase
          .from("categories")
          .insert({
            name: data.name,
            slug: data.slug,
            show_in_menu: data.show_in_menu,
          })
          .select();
          
        if (result.data && result.data.length > 0) {
          categoryId = result.data[0].id;
        }
      }
      
      if (result.error) throw result.error;
      
      // Handle menu item creation or deletion based on show_in_menu status
      if (categoryId) {
        const isStatusChanged = editingCategory ? editingCategory.show_in_menu !== data.show_in_menu : data.show_in_menu;
        
        if (isStatusChanged) {
          if (data.show_in_menu) {
            // Create menu item for this category
            await createCategoryMenuItem(data.name, data.slug, categoryId);
          } else if (editingCategory) {
            // Delete menu item for this category
            await deleteCategoryMenuItem(categoryId);
          }
        }
      }
      
      toast.success(
        editingCategory 
          ? "Kategoria została zaktualizowana" 
          : "Kategoria została utworzona"
      );
      
      // Reset form and update UI
      form.reset();
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      queryClient.invalidateQueries({ queryKey: ["menu-items"] });
      queryClient.invalidateQueries({ queryKey: ["menu-positions"] });
      queryClient.invalidateQueries({ queryKey: ["static-pages-sidebar"] });
      onSuccess();
    } catch (error) {
      console.error("Error saving category:", error);
      toast.error("Wystąpił błąd podczas zapisywania kategorii");
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Function to create a menu item for the category
  const createCategoryMenuItem = async (name: string, slug: string, categoryId: string) => {
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
  
  // Function to delete a menu item for the category
  const deleteCategoryMenuItem = async (categoryId: string) => {
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
  
  // Generate slug from name
  const generateSlug = (name: string) => {
    const slug = name
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '')
      .replace(/-+/g, '-');
    
    form.setValue("slug", slug);
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">
        {editingCategory ? "Edytuj kategorię" : "Dodaj nową kategorię"}
      </h2>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nazwa</FormLabel>
                <FormControl>
                  <Input 
                    {...field} 
                    placeholder="Nazwa kategorii"
                    onChange={(e) => {
                      field.onChange(e);
                      // Only auto-generate slug if it's a new category or slug is empty
                      if (!editingCategory || !form.getValues("slug")) {
                        generateSlug(e.target.value);
                      }
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="slug"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Slug</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="slug-kategorii" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="show_in_menu"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <FormLabel className="text-base">Dodaj do menu</FormLabel>
                  <div className="text-sm text-muted-foreground">
                    Dodaj link do artykułów z tej kategorii w menu bocznym
                  </div>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
              </FormItem>
            )}
          />
          
          <div className="flex justify-end pt-4">
            {!editingCategory && (
              <Button 
                type="button" 
                variant="outline" 
                className="mr-2"
                onClick={() => form.reset()}
              >
                Wyczyść
              </Button>
            )}
            
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {editingCategory ? "Zapisz zmiany" : "Dodaj kategorię"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
