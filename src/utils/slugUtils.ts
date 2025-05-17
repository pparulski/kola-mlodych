import { supabase } from "@/integrations/supabase/client";

export async function generateSlug(title: string): Promise<string> {
  try {
    const { data: slugData, error: slugError } = await supabase.rpc('generate_unique_slug', {
      title: title,
    });

    if (slugError) throw slugError;
    return slugData;
  } catch (error) {
    console.error("Error generating slug:", error);
    // Fallback to basic slug generation
    return title
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^\w-]+/g, '')
      .replace(/--+/g, '-')
      .replace(/^-+/, '')
      .replace(/-+$/, '');
  }
}

/**
 * Creates a URL-friendly slug from a string
 */
export function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')        // Replace spaces with -
    .replace(/[^\w-]+/g, '')    // Remove all non-word chars
    .replace(/--+/g, '-')      // Replace multiple - with single -
    .replace(/^-+/, '')          // Trim - from start of text
    .replace(/-+$/, '');         // Trim - from end of text
}
