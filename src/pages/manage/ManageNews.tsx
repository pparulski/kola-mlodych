
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { NewsArticle } from "@/types/news";
import { NewsEditorSection } from "@/components/news/NewsEditorSection";
import { NewsListSection } from "@/components/news/NewsListSection";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { updateAllNewsArticleSlugs } from "@/utils/slugUtils";

export function ManageNews() {
  const [editingNews, setEditingNews] = useState<NewsArticle | null>(null);
  const [isUpdatingSlugs, setIsUpdatingSlugs] = useState<boolean>(false);

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

  const handleUpdateAllSlugs = async () => {
    setIsUpdatingSlugs(true);
    try {
      const updatedCount = await updateAllNewsArticleSlugs();
      
      if (updatedCount > 0) {
        toast.success(`Zaktualizowano ${updatedCount} adresów URL artykułów`);
        refetch(); // Refresh the list after updating
      } else {
        toast.info("Nie znaleziono artykułów do aktualizacji");
      }
    } catch (error) {
      console.error("Error updating slugs:", error);
      toast.error("Błąd podczas aktualizacji adresów URL artykułów");
    } finally {
      setIsUpdatingSlugs(false);
    }
  };

  if (isLoading) {
    return <div>Wczytywanie...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <h1 className="text-3xl font-bold">Zarządzaj aktualnościami</h1>
        
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleUpdateAllSlugs}
          disabled={isUpdatingSlugs}
          className="flex items-center gap-2"
        >
          <RefreshCw className={`h-4 w-4 ${isUpdatingSlugs ? 'animate-spin' : ''}`} />
          Aktualizuj wszystkie adresy URL
        </Button>
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
