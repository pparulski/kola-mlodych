
import { z } from "zod";

export const categoryFormSchema = z.object({
  name: z.string().min(2, "Nazwa musi mieć co najmniej 2 znaki"),
  description: z.string().optional(),
  color: z.string().optional(),
  show_in_menu: z.boolean().default(false),
});

export type CategoryFormValues = z.infer<typeof categoryFormSchema>;

export interface CategoryFormData {
  name: string;
  description: string;
  color: string;
  show_in_menu: boolean;
}

export function generateSlugFromName(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}
