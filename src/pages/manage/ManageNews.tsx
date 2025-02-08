
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { NewsArticle } from "@/types/news";
import { NewsEditorSection } from "@/components/news/NewsEditorSection";
import { NewsListSection } from "@/components/news/NewsListSection";

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
    return <div>Loading...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-8">
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
