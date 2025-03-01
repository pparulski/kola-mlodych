
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

// Simple slugify function for client-side slug generation
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]+/g, '')
    .replace(/--+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');
}
