
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { NewsArticle } from "@/types/news";
import { NewsEditorSection } from "@/components/news/NewsEditorSection";
import { NewsListSection } from "@/components/news/NewsListSection";
import { SEO } from "@/components/seo/SEO";

export function ManageNews() {
  const [editingNews, setEditingNews] = useState<NewsArticle | null>(null);

  const { data: news, isLoading } = useQuery({
    queryKey: ['news'],
    queryFn: async () => {
      console.log('Fetching all news articles');
      const { data, error } = await supabase
        .from('news')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as NewsArticle[];
    },
  });

  if (isLoading) {
    return (
      <div className="page-container component-spacing">
        <div className="text-lg">Wczytywanie...</div>
      </div>
    );
  }

  return (
    <div className="page-container section-spacing mt-4">
      <SEO
        title="Zarządzaj aktualnościami"
        description="Panel administracyjny do zarządzania aktualnościami"
      />

      <h1 className="text-3xl font-bold">Zarządzaj aktualnościami</h1>
      
      <NewsEditorSection 
        editingNews={editingNews}
        onSuccess={() => setEditingNews(null)}
      />

      <NewsListSection 
        news={news || []}
        onEdit={setEditingNews}
      />
    </div>
  );
}
