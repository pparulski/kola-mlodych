
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Category } from "@/types/categories";
import { categoryFormSchema, CategoryFormValues, generateSlugFromName } from "./CategoryFormSchema";
import { CategoryFormFields } from "./CategoryFormFields";

interface CategoryFormProps {
  editingCategory?: Category;
  onSuccess: () => void;
  onCancel: () => void;
}

export function CategoryForm({ editingCategory, onSuccess, onCancel }: CategoryFormProps) {
  const form = useForm<CategoryFormValues>({
    resolver: zodResolver(categoryFormSchema),
    defaultValues: {
      name: editingCategory?.name || "",
      description: editingCategory?.description || "",
      color: editingCategory?.color || "#3B82F6",
      show_in_menu: editingCategory?.show_in_menu || false,
    },
  });

  const onSubmit = async (data: CategoryFormValues) => {
    try {
      const slug = editingCategory?.slug || generateSlugFromName(data.name);
      
      const updates = {
        name: data.name,
        slug: slug,
        description: data.description,
        color: data.color,
        show_in_menu: data.show_in_menu,
      };

      let response;

      if (editingCategory) {
        response = await supabase
          .from('categories')
          .update(updates)
          .eq('id', editingCategory.id);
      } else {
        response = await supabase
          .from('categories')
          .insert(updates);
      }

      if (response.error) {
        toast.error(`Błąd: ${response.error.message}`);
      } else {
        toast.success(`Kategoria ${editingCategory ? 'zaktualizowana' : 'dodana'} pomyślnie!`);
        onSuccess();
      }
    } catch (error: any) {
      toast.error(`Wystąpił błąd: ${error.message}`);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <CategoryFormFields 
          form={form} 
          editingCategory={editingCategory}
        />
        
        <div className="flex justify-end gap-4">
          <Button type="button" variant="ghost" onClick={onCancel}>
            Anuluj
          </Button>
          <Button type="submit" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting ? 'Zapisywanie...' : 'Zapisz'}
          </Button>
        </div>
      </form>
    </Form>
  );
}
