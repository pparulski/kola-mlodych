
import { z } from "zod";

// Form schema validation
export const categoryFormSchema = z.object({
  name: z.string().min(2, "Nazwa musi mieć co najmniej 2 znaki"),
  slug: z.string().min(2, "Slug musi mieć co najmniej 2 znaki").regex(/^[a-z0-9-]+$/, "Slug może zawierać tylko małe litery, cyfry i myślniki"),
  show_in_menu: z.boolean().optional().default(false),
});

// Form data type based on the schema
export type CategoryFormData = z.infer<typeof categoryFormSchema>;
// For backward compatibility - alias for CategoryFormData
export type CategoryFormValues = CategoryFormData;
// For backward compatibility - alias for schema
export const CategoryFormSchema = categoryFormSchema;

/**
 * Generates a slug from a name
 */
export const generateSlugFromName = (name: string): string => {
  return name
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-+/g, '-');
};
