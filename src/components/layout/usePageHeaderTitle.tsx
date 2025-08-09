
import { useLocation, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { getPageTitle } from "@/utils/pageUtils";

export const usePageHeaderTitle = (pageTitle?: string, title?: string) => {
  const location = useLocation();
  const { slug } = useParams();
  
  const { data: dynamicPageData } = useQuery({
    queryKey: ['page-title', location.pathname, slug],
    queryFn: async () => {
      if (location.pathname.includes('/news/')) {
        return "Aktualności";
      }
      if (slug && !location.pathname.includes('/news/') && !location.pathname.includes('/category/')) {
        const { data } = await supabase
          .from('static_pages')
          .select('title')
          .eq('slug', slug)
          .maybeSingle();
        return data?.title || null;
      }
      if (location.pathname.includes('/category/') && slug) {
        const { data } = await supabase
          .from('categories')
          .select('name')
          .eq('slug', slug)
          .maybeSingle();
        return data?.name || null;
      }
      return null;
    },
    enabled: !!location.pathname,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
  
  const displayTitle = dynamicPageData || pageTitle || title || getPageTitle(location.pathname);
  
  const isHomePage = location.pathname === '/';
  const shouldShowBackButton = location.pathname.includes('/news/') || 
                              location.pathname.includes('/article/') ||
                              location.pathname.includes('/ebooks/');

  return { 
    displayTitle, 
    isHomePage, 
    shouldShowBackButton,
    location
  };
};
