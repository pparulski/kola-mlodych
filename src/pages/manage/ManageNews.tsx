import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { NewsEditor } from "@/components/NewsEditor";
import { NewsAdminControls } from "@/components/news/NewsAdminControls";
import { toast } from "sonner";

export function ManageNews() {
  const [editingNews, setEditingNews] = useState<any>(null);
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
      return data;
    },
  });

  const handleDelete = async (id: string) => {
    try {
      console.log('Deleting article with ID:', id);
      const { error } = await supabase
        .from('news')
        .delete()
        .eq('id', id);

      if (error) {
        console.error("Error deleting article:", error);
        throw error;
      }
      
      await queryClient.invalidateQueries({ queryKey: ['news'] });
      toast.success("Article deleted successfully");
    } catch (error) {
      console.error("Error deleting article:", error);
      toast.error("Failed to delete article");
    }
  };

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
            onSuccess={() => {
              setEditingNews(null);
              queryClient.invalidateQueries({ queryKey: ['news'] });
            }} 
          />
          <button
            onClick={() => setEditingNews(null)}
            className="mt-4 px-4 py-2 text-sm text-gray-600 hover:text-gray-800"
          >
            Cancel Editing
          </button>
        </div>
      ) : (
        <div>
          <h2 className="text-xl mb-4">Add New Article</h2>
          <NewsEditor onSuccess={() => queryClient.invalidateQueries({ queryKey: ['news'] })} />
        </div>
      )}

      <div className="space-y-4">
        <h2 className="text-xl">All Articles</h2>
        {news?.map((article: any) => (
          <div key={article.id} className="relative border p-4 rounded-lg">
            <h3 className="text-lg font-semibold">{article.title}</h3>
            <p className="text-sm text-gray-500">
              Created: {new Date(article.created_at).toLocaleDateString()}
            </p>
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