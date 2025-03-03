
import { Control } from "react-hook-form";
import { FormField, FormItem, FormLabel, FormControl, FormDescription, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { CategoryFormValues, generateSlugFromName } from "./CategoryFormSchema";
import { Switch } from "@/components/ui/switch";
import { Category } from "@/types/categories";

export interface CategoryFormFieldsProps {
  form: {
    control: Control<CategoryFormValues>;
  };
  editingCategory?: Category;
}

export function CategoryFormFields({ form, editingCategory }: CategoryFormFieldsProps) {
  return (
    <div className="space-y-4">
      <FormField
        control={form.control}
        name="name"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Nazwa kategorii</FormLabel>
            <FormControl>
              <Input {...field} placeholder="np. Wydarzenia" />
            </FormControl>
            <FormDescription>
              Nazwa kategorii widoczna na stronie
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
      
      <FormField
        control={form.control}
        name="description"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Opis (opcjonalny)</FormLabel>
            <FormControl>
              <Input {...field} placeholder="Krótki opis kategorii" />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      
      <FormField
        control={form.control}
        name="color"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Kolor</FormLabel>
            <FormControl>
              <div className="flex items-center gap-2">
                <Input 
                  type="color" 
                  {...field} 
                  className="w-12 h-10 p-1" 
                  defaultValue="#3B82F6"
                />
                <Input 
                  type="text" 
                  value={field.value} 
                  onChange={field.onChange}
                  className="flex-1" 
                />
              </div>
            </FormControl>
            <FormDescription>
              Kolor używany do oznaczenia kategorii
            </FormDescription>
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
              <FormLabel className="text-base">Pokaż w menu</FormLabel>
              <FormDescription>
                Czy kategoria powinna być widoczna w menu głównym?
              </FormDescription>
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
    </div>
  );
}
