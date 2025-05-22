
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { NewsArticle } from "@/types/news";
import { NewsEditorSection } from "@/components/news/NewsEditorSection";
import { NewsListSection } from "@/components/news/NewsListSection";
import { SlugUpdaterButton } from "@/components/news/admin/SlugUpdaterButton";

export function ManageNews() {
  const [editingNews, setEditingNews] = useState<NewsArticle | null>(null);

  const { data: news, isLoading, refetch } = useQuery({
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

  const handleSlugsUpdated = () => {
    // Refetch news data to update the list with new slugs
    refetch();
  };

  if (isLoading) {
    return <div>Wczytywanie...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Zarządzaj aktualnościami</h1>
        <SlugUpdaterButton onComplete={handleSlugsUpdated} />
      </div>
      
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
