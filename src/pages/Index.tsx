import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { NewsEditor } from "@/components/NewsEditor";
import { NewsAdminControls } from "@/components/news/NewsAdminControls";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { toast } from "sonner";

export default function Index({ adminMode = false }: IndexProps) {
  const [editingNews, setEditingNews] = useState<any>(null);
  const [showEditor, setShowEditor] = useState(false);

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
      const { error } = await supabase
        .from('news')
        .delete()
        .eq('id', id);

      if (error) throw error;
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
    <div className="max-w-4xl mx-auto">
      {adminMode && (
        <div className="mb-6">
          <Button onClick={() => {
            setEditingNews(null);
            setShowEditor(!showEditor);
          }}>
            <PlusCircle className="mr-2 h-4 w-4" />
            {showEditor ? "Anuluj" : "Dodaj artykuł"}
          </Button>
        </div>
      )}
      
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
