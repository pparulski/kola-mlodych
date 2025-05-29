
import { supabase } from "@/integrations/supabase/client";
import type { PageContextServer } from "vike/types";

export type Data = {
  article: any | null;
  categories: any[];
};

export default async function data(pageContext: PageContextServer): Promise<Data> {
  const { slug } = pageContext.routeParams;
  
  try {
    // Fetch specific news article
    const { data: article } = await supabase
      .from('news')
      .select('*')
      .eq('slug', slug)
      .eq('published', true)
      .maybeSingle();

    // Fetch categories
    const { data: categories } = await supabase
      .from('categories')
      .select('*')
      .order('name');

    return {
      article,
      categories: categories || []
    };
  } catch (error) {
    console.error('Error fetching news article:', error);
    return {
      article: null,
      categories: []
    };
  }
}

// Pre-render all news articles
export async function prerender() {
  try {
    const { data: articles } = await supabase
      .from('news')
      .select('slug')
      .eq('published', true);

    return (articles || []).map(article => `/news/${article.slug}`);
  } catch (error) {
    console.error('Error pre-rendering news articles:', error);
    return [];
  }
}
