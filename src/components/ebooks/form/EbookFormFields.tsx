
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  FormField,
  FormItem,
  FormControl,
  FormLabel,
  FormMessage
} from "@/components/ui/form";
import { useFormContext } from "react-hook-form";
import { EbookFormValues } from "./ebookFormSchema";

export function EbookFormFields() {
  const form = useFormContext<EbookFormValues>();
  const currentYear = new Date().getFullYear();

  return (
    <>
      <FormField
        control={form.control}
        name="title"
        render={({ field }) => (
          <FormItem className="space-y-2">
            <FormLabel>Tytuł publikacji</FormLabel>
            <FormControl>
              <Input
                {...field}
                placeholder="Wprowadź tytuł publikacji"
                className="transition-all duration-200 focus:ring-2 focus:ring-primary/25"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="publicationYear"
          render={({ field }) => (
            <FormItem className="space-y-2">
              <FormLabel>Rok publikacji</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  type="number"
                  min="1900"
                  max={currentYear}
                  onChange={e => field.onChange(parseInt(e.target.value) || currentYear)}
                  className="transition-all duration-200 focus:ring-2 focus:ring-primary/25"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="pageCount"
          render={({ field }) => (
            <FormItem className="space-y-2">
              <FormLabel>Liczba stron</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  type="number"
                  min="1"
                  value={field.value || ''}
                  onChange={e => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                  placeholder="Wprowadź liczbę stron"
                  className="transition-all duration-200 focus:ring-2 focus:ring-primary/25"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
      
      <FormField
        control={form.control}
        name="description"
        render={({ field }) => (
          <FormItem className="space-y-2">
            <FormLabel>Opis publikacji</FormLabel>
            <FormControl>
              <Textarea
                {...field}
                placeholder="Wprowadź krótki opis publikacji..."
                rows={4}
                className="transition-all duration-200 focus:ring-2 focus:ring-primary/25"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </>
  );
}
