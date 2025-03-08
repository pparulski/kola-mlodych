
import { z } from "zod";

export const categoryFormSchema = z.object({
  name: z.string().min(1, "Nazwa jest wymagana"),
  show_in_menu: z.boolean().default(false),
});

export type CategoryFormValues = z.infer<typeof categoryFormSchema>;

export function generateSlugFromName(name: string): string {
  return name
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}
