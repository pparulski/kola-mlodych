
import { useEffect } from "react";
import { UseFormReturn } from "react-hook-form";
import { CategoryFormData } from "./CategoryFormSchema";
import { generateSlugFromName } from "./CategoryFormSchema";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { 
  FormField, 
  FormItem, 
  FormLabel, 
  FormControl, 
  FormMessage 
} from "@/components/ui/form";
import { Category } from "@/types/categories";

interface CategoryFormFieldsProps {
  form: UseFormReturn<CategoryFormData>;
  editingCategory: Category | null;
}

export function CategoryFormFields({ form, editingCategory }: CategoryFormFieldsProps) {
  return (
    <>
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
                    const slug = generateSlugFromName(e.target.value);
                    form.setValue("slug", slug);
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
    </>
  );
}
