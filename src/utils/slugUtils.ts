
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
    return slugify(title);
  }
}

/**
 * Updates all existing news article slugs in the database using the improved slug generation
 */
export async function updateAllNewsArticleSlugs(): Promise<number> {
  try {
    const { data, error } = await supabase.rpc('update_all_news_slugs');
    
    if (error) throw error;
    return data as number;
  } catch (error) {
    console.error("Error updating all news slugs:", error);
    return 0;
  }
}

/**
 * Creates a URL-friendly slug from a string, replacing Polish characters with Latin equivalents
 */
export function slugify(text: string): string {
  // Define Polish characters mapping
  const polishChars: Record<string, string> = {
    'ą': 'a', 'ć': 'c', 'ę': 'e', 'ł': 'l', 'ń': 'n', 
    'ó': 'o', 'ś': 's', 'ź': 'z', 'ż': 'z',
    'Ą': 'A', 'Ć': 'C', 'Ę': 'E', 'Ł': 'L', 'Ń': 'N',
    'Ó': 'O', 'Ś': 'S', 'Ź': 'Z', 'Ż': 'Z'
  };
  
  // Replace Polish characters with Latin equivalents
  let latinText = text.toString();
  for (const [polish, latin] of Object.entries(polishChars)) {
    latinText = latinText.replace(new RegExp(polish, 'g'), latin);
  }
  
  return latinText
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')        // Replace spaces with -
    .replace(/[^\w-]+/g, '')    // Remove all non-word chars
    .replace(/--+/g, '-')      // Replace multiple - with single -
    .replace(/^-+/, '')          // Trim - from start of text
    .replace(/-+$/, '');         // Trim - from end of text
}
