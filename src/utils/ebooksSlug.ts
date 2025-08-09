import { supabase } from "@/integrations/supabase/client";
import { slugify } from "@/utils/slugUtils";

// Generate a unique, stable slug for ebooks by checking existing slugs in the ebooks table
export async function generateUniqueEbookSlug(title: string): Promise<string> {
  const base = slugify(title);
  // Fetch existing slugs that start with base or base-<number>
  const { data, error } = await supabase
    .from("ebooks")
    .select("slug")
    .ilike("slug", `${base}%`);

  if (error) {
    // Fallback: just return base if query fails
    console.error("Error checking existing ebook slugs:", error);
    return base;
  }

  const existing = new Set((data || []).map((row: { slug?: string }) => row.slug).filter(Boolean) as string[]);

  if (!existing.has(base)) return base;

  // Find next available numeric suffix
  let i = 2;
  while (existing.has(`${base}-${i}`)) {
    i++;
  }
  return `${base}-${i}`;
}
