
import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { NewsEditor } from "@/components/NewsEditor";
import { NewsAdminControls } from "@/components/news/NewsAdminControls";
import { toast } from "sonner";
import { NewsArticle } from "@/types/news";

export function ManageNews() {
  const [editingNews, setEditingNews] = useState<NewsArticle | null>(null);
  const queryClient = useQueryClient();

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

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from('news')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      await queryClient.invalidateQueries({ queryKey: ['news'] });
      toast.success("Artykuł został usunięty");
    } catch (error) {
      console.error("Error deleting article:", error);
      toast.error("Nie udało się usunąć artykułu");
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  const handleEditorSuccess = () => {
    setEditingNews(null);
    queryClient.invalidateQueries({ queryKey: ['news'] });
  };

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-8">
      <h1 className="text-3xl font-bold">Zarządzaj aktualnościami</h1>
      
      {editingNews ? (
        <div>
          <h2 className="text-xl mb-4">Edytuj artykuł</h2>
          <NewsEditor 
            existingNews={editingNews} 
            onSuccess={handleEditorSuccess}
            key={editingNews.id} // Add key to force re-render when editing different articles
          />
        </div>
      ) : (
        <div>
          <h2 className="text-xl mb-4">Dodaj nowy artykuł</h2>
          <NewsEditor 
            onSuccess={() => {
              queryClient.invalidateQueries({ queryKey: ['news'] });
            }}
            key="new" // Add key to force re-render when switching back to new article form
          />
        </div>
      )}

      <div className="space-y-4">
        <h2 className="text-xl">Wszystkie artykuły</h2>
        {news?.map((article: NewsArticle) => (
          <div key={article.id} className="relative border p-4 rounded-lg">
            <h3 className="text-lg font-semibold">{article.title}</h3>
            <NewsAdminControls 
              onEdit={() => setEditingNews(article)}
              onDelete={() => handleDelete(article.id)}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
