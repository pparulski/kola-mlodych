
import { supabase } from "@/integrations/supabase/client";

/**
 * Polish to Latin character mapping for URL-friendly slugs
 */
const polishToLatinMap: Record<string, string> = {
  'ą': 'a', 'ć': 'c', 'ę': 'e', 'ł': 'l', 'ń': 'n', 'ó': 'o', 'ś': 's', 'ż': 'z', 'ź': 'z',
  'Ą': 'A', 'Ć': 'C', 'Ę': 'E', 'Ł': 'L', 'Ń': 'N', 'Ó': 'O', 'Ś': 'S', 'Ż': 'Z', 'Ź': 'Z'
};

/**
 * Replaces Polish characters with their Latin equivalents
 */
const replacePolishChars = (text: string): string => {
  return text.replace(/[ąćęłńóśżźĄĆĘŁŃÓŚŻŹ]/g, (match) => polishToLatinMap[match] || match);
};

export async function generateSlug(title: string): Promise<string> {
  try {
    // First, replace Polish characters with Latin equivalents
    const latinizedTitle = replacePolishChars(title);
    
    const { data: slugData, error: slugError } = await supabase.rpc('generate_unique_slug', {
      title: latinizedTitle,
    });

    if (slugError) throw slugError;
    return slugData;
  } catch (error) {
    console.error("Error generating slug:", error);
    // Fallback to basic slug generation with Polish character replacement
    return slugify(title);
  }
}

/**
 * Creates a URL-friendly slug from a string
 */
export function slugify(text: string): string {
  // First replace Polish characters with Latin equivalents
  const latinized = replacePolishChars(text);
  
  return latinized
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')        // Replace spaces with -
    .replace(/[^\w-]+/g, '')    // Remove all non-word chars
    .replace(/--+/g, '-')      // Replace multiple - with single -
    .replace(/^-+/, '')          // Trim - from start of text
    .replace(/-+$/, '');         // Trim - from end of text
}

/**
 * Updates slugs for all existing articles to ensure Polish characters are properly converted
 * Returns the number of articles updated
 */
export async function updateAllNewsArticleSlugs(): Promise<number> {
  try {
    // 1. Get all news articles
    const { data: articles, error: fetchError } = await supabase
      .from('news')
      .select('id, title, slug');
    
    if (fetchError) throw fetchError;
    if (!articles || articles.length === 0) return 0;
    
    // 2. Process each article to generate new slug
    let updateCount = 0;
    
    for (const article of articles) {
      // Generate new slug based on title
      const latinizedTitle = replacePolishChars(article.title);
      const newSlug = slugify(latinizedTitle);
      
      // Only update if the new slug is different from the existing one
      if (newSlug !== article.slug) {
        const { error: updateError } = await supabase
          .from('news')
          .update({ slug: newSlug })
          .eq('id', article.id);
        
        if (!updateError) {
          updateCount++;
          console.log(`Updated article slug: "${article.title}" from "${article.slug}" to "${newSlug}"`);
        } else {
          console.error(`Error updating slug for article "${article.title}":`, updateError);
        }
      }
    }
    
    return updateCount;
  } catch (error) {
    console.error("Error updating all news article slugs:", error);
    throw error;
  }
}
