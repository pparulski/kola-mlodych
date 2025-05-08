
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  FormField,
  FormItem,
  FormControl,
  FormLabel,
  FormMessage,
  FormDescription
} from "@/components/ui/form";
import { useFormContext } from "react-hook-form";
import { EbookFormValues } from "./ebookFormSchema";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function EbookFormFields() {
  const form = useFormContext<EbookFormValues>();
  
  // Get character count for description
  const description = form.watch("description") || "";
  const characterCount = description.length;
  const maxCharacters = 1300;

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
          name="ebookType"
          render={({ field }) => (
            <FormItem className="space-y-2">
              <FormLabel>Typ publikacji</FormLabel>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value}
                value={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Wybierz typ publikacji" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="Książka">Książka</SelectItem>
                  <SelectItem value="Raport">Raport</SelectItem>
                  <SelectItem value="Alarm">Alarm</SelectItem>
                  <SelectItem value="Biuletyn">Biuletyn</SelectItem>
                </SelectContent>
              </Select>
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
                maxLength={maxCharacters}
                className="transition-all duration-200 focus:ring-2 focus:ring-primary/25"
              />
            </FormControl>
            <FormDescription>
              Możesz używać enterów do tworzenia akapitów - zostaną one zachowane na stronie publikacji.
            </FormDescription>
            <div className="text-xs text-right text-muted-foreground">
              {characterCount}/{maxCharacters} znaków
            </div>
            <FormMessage />
          </FormItem>
        )}
      />
    </>
  );
}
