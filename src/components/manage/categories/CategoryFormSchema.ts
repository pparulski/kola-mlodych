
import { z } from "zod";

export const categoryFormSchema = z.object({
  name: z.string().min(2, "Nazwa musi mieć przynajmniej 2 znaki").max(50, "Nazwa może mieć maksymalnie 50 znaków"),
  description: z.string().optional(),
  color: z.string().optional(),
  show_in_menu: z.boolean().default(false),
});

export type CategoryFormValues = z.infer<typeof categoryFormSchema>;

// Helper function to generate slug from name
export const generateSlugFromName = (name: string): string => {
  return name
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');
};
