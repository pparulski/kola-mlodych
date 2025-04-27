
import { useLocation, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { getPageTitle } from "@/utils/pageUtils";

export function usePageTitle() {
  const location = useLocation();
  const params = useParams();
  
  const isCategoryPage = location.pathname.startsWith('/category/');
  const isManagementPage = location.pathname.includes('/manage/');
  const categorySlug = isCategoryPage ? params.slug : null;

  const { data: categoryData } = useQuery({
    queryKey: ['category-title', categorySlug],
    queryFn: async () => {
      if (!categorySlug) return null;
      
      const { data, error } = await supabase
        .from('categories')
        .select('name')
        .eq('slug', categorySlug)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!categorySlug,
  });

  const { data: staticPage } = useQuery({
    queryKey: ['static-page-title', location.pathname],
    queryFn: async () => {
      const slug = location.pathname.substring(1);
      const { data, error } = await supabase
        .from('static_pages')
        .select('title')
        .eq('slug', slug)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
    enabled: !Object.keys(getPageTitle('', '')).includes(location.pathname) && !isManagementPage && !isCategoryPage
  });

  let pageTitle: string | null = null;
  
  if (isManagementPage) {
    pageTitle = null;
  } else if (isCategoryPage && categoryData) {
    pageTitle = `Artykuły w kategorii: ${categoryData.name}`;
  } else {
    pageTitle = getPageTitle(location.pathname, staticPage?.title);
  }

  return { pageTitle };
}
