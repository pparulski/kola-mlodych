
import { z } from "zod";
import { slugify } from "@/utils/slugUtils";

export const categoryFormSchema = z.object({
  name: z.string().min(1, "Nazwa jest wymagana"),
  show_in_menu: z.boolean().default(false),
});

export type CategoryFormValues = z.infer<typeof categoryFormSchema>;

export function generateSlugFromName(name: string): string { // Polish letters -> ASCII-friendly slugs
  // Use shared slugify that maps Polish diacritics to ASCII (ś->s, ń->n, etc.)
  return slugify(name);
}
