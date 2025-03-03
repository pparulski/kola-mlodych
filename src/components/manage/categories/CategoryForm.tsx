
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Category } from "@/types/categories";
import { CategoryFormSchema, CategoryFormValues } from "./CategoryFormSchema";
import { CategoryFormFields } from "./CategoryFormFields";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { createCategoryMenuItem, deleteCategoryMenuItem } from "@/utils/categoryMenuUtils";

interface CategoryFormProps {
  editingCategory: Category | null;
  onSuccess: () => void;
}

export function CategoryForm({ editingCategory, onSuccess }: CategoryFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const queryClient = useQueryClient();

  const form = useForm<CategoryFormValues>({
    resolver: zodResolver(CategoryFormSchema),
    defaultValues: {
      name: editingCategory?.name || "",
      slug: editingCategory?.slug || "",
      show_in_menu: editingCategory?.show_in_menu || false
    }
  });

  const handleSubmit = async (values: CategoryFormValues) => {
    setIsSubmitting(true);
    try {
      if (editingCategory) {
        await handleUpdate(editingCategory.id, values);
      } else {
        await handleCreate(values);
      }
      
      // This will refresh all relevant components
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      queryClient.invalidateQueries({ queryKey: ["menu-items"] });
      queryClient.invalidateQueries({ queryKey: ["menu-positions"] });
      queryClient.invalidateQueries({ queryKey: ["static-pages-sidebar"] });
      queryClient.invalidateQueries({ queryKey: ["news-preview-categories"] });
      queryClient.invalidateQueries({ queryKey: ["category-articles"] });
      
      toast.success(editingCategory ? "Kategoria zaktualizowana" : "Kategoria dodana");
      
      form.reset({
        name: "",
        slug: "",
        show_in_menu: false
      });
      
      onSuccess();
    } catch (error) {
      console.error("Error submitting category:", error);
      toast.error("Wystąpił błąd podczas zapisywania kategorii");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreate = async (values: CategoryFormValues) => {
    // Insert category into the database
    const { data, error } = await supabase
      .from("categories")
      .insert({
        name: values.name,
        slug: values.slug,
        show_in_menu: values.show_in_menu
      })
      .select();

    if (error) throw error;
    
    // If category should be shown in menu, create a menu item for it
    if (values.show_in_menu && data && data[0]) {
      try {
        await createCategoryMenuItem(values.name, values.slug, data[0].id);
      } catch (menuError) {
        console.error("Error creating menu item:", menuError);
        // Continue anyway, the category was created successfully
      }
    }

    return data;
  };

  const handleUpdate = async (id: string, values: CategoryFormValues) => {
    // Update the category in the database
    const { error } = await supabase
      .from("categories")
      .update({
        name: values.name,
        slug: values.slug,
        show_in_menu: values.show_in_menu
      })
      .eq("id", id);

    if (error) throw error;

    // Handle menu item creation/deletion based on show_in_menu status
    if (values.show_in_menu !== editingCategory?.show_in_menu) {
      if (values.show_in_menu) {
        // Category should now be in menu, but wasn't before
        try {
          await createCategoryMenuItem(values.name, values.slug, id);
        } catch (menuError) {
          console.error("Error creating menu item:", menuError);
        }
      } else {
        // Category was in menu, but now shouldn't be
        try {
          await deleteCategoryMenuItem(id);
        } catch (menuError) {
          console.error("Error deleting menu item:", menuError);
        }
      }
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <div className="space-y-4">
          <CategoryFormFields form={form} editingCategory={editingCategory} />
        </div>
        
        <Button
          type="submit"
          className="w-full"
          disabled={isSubmitting}
        >
          {isSubmitting
            ? "Zapisywanie..."
            : editingCategory
              ? "Aktualizuj kategorię"
              : "Dodaj kategorię"}
        </Button>
      </form>
    </Form>
  );
}
