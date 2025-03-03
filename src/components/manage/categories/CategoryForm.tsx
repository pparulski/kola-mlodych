
import { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Category } from "@/types/categories";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { Loader2 } from "lucide-react";
import { categoryFormSchema, CategoryFormData } from "./CategoryFormSchema";
import { CategoryFormFields } from "./CategoryFormFields";
import { createCategoryMenuItem, deleteCategoryMenuItem } from "@/utils/categoryMenuUtils";

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

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">
        {editingCategory ? "Edytuj kategorię" : "Dodaj nową kategorię"}
      </h2>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <CategoryFormFields 
            form={form}
            editingCategory={editingCategory}
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
