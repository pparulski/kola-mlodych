import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { NewsEditor } from "@/components/NewsEditor";
import { NewsAdminControls } from "@/components/news/NewsAdminControls";

export function ManageNews() {
  const [editingNews, setEditingNews] = useState<any>(null);

  const { data: news, isLoading } = useQuery({
    queryKey: ['news'],
    queryFn: async () => {
      console.log('Fetching all news articles');
      const { data, error } = await supabase
        .from('news')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-8">
      <h1 className="text-3xl font-bold">Manage News</h1>
      
      {editingNews ? (
        <div>
          <h2 className="text-xl mb-4">Edit Article</h2>
          <NewsEditor 
            existingNews={editingNews} 
            onSuccess={() => setEditingNews(null)} 
          />
        </div>
      ) : (
        <div>
          <h2 className="text-xl mb-4">Add New Article</h2>
          <NewsEditor onSuccess={() => setEditingNews(null)} />
        </div>
      )}

      <div className="space-y-4">
        <h2 className="text-xl">All Articles</h2>
        {news?.map((article: any) => (
          <div key={article.id} className="border p-4 rounded-lg">
            <h3 className="text-lg font-semibold">{article.title}</h3>
            <NewsAdminControls 
              news={article}
              onEdit={() => setEditingNews(article)}
            />
          </div>
        ))}
      </div>
    </div>
  );
}