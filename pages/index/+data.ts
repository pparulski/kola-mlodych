
import { supabase } from "@/integrations/supabase/client";

export type Data = {
  categories: any[];
  latestNews: any[];
};

export default async function data(): Promise<Data> {
  try {
    // Fetch categories
    const { data: categories } = await supabase
      .from('categories')
      .select('*')
      .order('name');

    // Fetch latest news
    const { data: latestNews } = await supabase
      .from('news')
      .select('*')
      .eq('published', true)
      .order('created_at', { ascending: false })
      .limit(10);

    return {
      categories: categories || [],
      latestNews: latestNews || []
    };
  } catch (error) {
    console.error('Error fetching homepage data:', error);
    return {
      categories: [],
      latestNews: []
    };
  }
}
