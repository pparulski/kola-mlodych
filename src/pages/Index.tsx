import { NewsCard } from "@/components/NewsCard";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { useState } from "react";
import { NewsEditor } from "@/components/NewsEditor";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { NewsAdminControls } from "@/components/news/NewsAdminControls";

interface IndexProps {
  adminMode?: boolean;
}

const Index = ({ adminMode = false }: IndexProps) => {
  const [showEditor, setShowEditor] = useState(false);
  const [editingNews, setEditingNews] = useState<any>(null);
  const queryClient = useQueryClient();

  const { data: newsItems, isLoading } = useQuery({
    queryKey: ['news'],
    queryFn: async () => {
      console.log("Fetching news...");
      const { data, error } = await supabase
        .from('news')
        .select('*')
        .eq('is_static_page', false)
        .order('created_at', { ascending: false });

      if (error) throw error;
      console.log("News fetched:", data);
      return data;
    }
  });

  const handleDelete = async (id: string) => {
    try {
      // Get the news item to access its featured image
      const newsItem = newsItems?.find(item => item.id === id);
      
      // If there's a featured image, delete it from storage
      if (newsItem?.featured_image) {
        const imagePath = newsItem.featured_image.split('/').pop();
        if (imagePath) {
          const { error: storageError } = await supabase.storage
            .from('news_images')
            .remove([imagePath]);
          
          if (storageError) {
            console.error("Error deleting image:", storageError);
            throw storageError;
          }
        }
      }

      // Delete the news record from the database
      const { error } = await supabase
        .from('news')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast.success("Artykuł został usunięty");
      queryClient.invalidateQueries({ queryKey: ['news'] });
    } catch (error) {
      console.error("Error deleting news:", error);
      toast.error("Nie udało się usunąć artykułu");
    }
  };

  const handleEdit = (news: any) => {
    setEditingNews(news);
    setShowEditor(true);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[200px]">
        <div className="text-lg">Ładowanie...</div>
      </div>
    );
  }

  return (
    <>
      <h1 className="text-3xl font-bold text-[rgb(128_0_32_/_var(--tw-text-opacity))]">
        Aktualności
      </h1>
      <div className="max-w-4xl mx-auto mt-6">
        <div className="flex justify-between items-center mb-6">
          {adminMode && (
            <Button onClick={() => {
              setEditingNews(null);
              setShowEditor(!showEditor);
            }}>
              <PlusCircle className="mr-2 h-4 w-4" />
              {showEditor ? "Anuluj" : "Dodaj artykuł"}
            </Button>
          )}
        </div>
        
        {showEditor && adminMode && (
          <div className="mb-8">
            <NewsEditor 
              existingNews={editingNews} 
              onSuccess={() => {
                setShowEditor(false);
                setEditingNews(null);
              }} 
            />
          </div>
        )}

        <div className="space-y-4">
          {newsItems?.map((item) => (
            <div key={item.id} className="relative">
              <NewsCard 
                {...item} 
                date={item.created_at}
              />
              {adminMode && (
                <NewsAdminControls
                  onEdit={() => handleEdit(item)}
                  onDelete={() => handleDelete(item.id)}
                />
              )}
            </div>
          ))}
        </div>

        {(!newsItems || newsItems.length === 0) && (
          <div className="text-center text-muted-foreground mt-8">
            Brak aktualności
          </div>
        )}
      </div>
    </>
  );
}

export default Index;