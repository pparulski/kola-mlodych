
import { NewsArticle } from "@/types/news";
import { NewsAdminControls } from "@/components/news/NewsAdminControls";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { format } from "date-fns";
import { pl } from "date-fns/locale";

interface NewsListSectionProps {
  news: NewsArticle[];
  onEdit: (article: NewsArticle) => void;
}

export function NewsListSection({ news, onEdit }: NewsListSectionProps) {
  const queryClient = useQueryClient();

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

  return (
    <div className="space-y-4">
      <h2 className="text-xl">Wszystkie artykuły</h2>
      {news?.map((article: NewsArticle) => (
        <div key={article.id} className="relative border p-4 rounded-lg">
          <div className="flex flex-col gap-1">
            <h3 className="text-lg font-semibold">{article.title}</h3>
            <p className="text-sm text-muted-foreground italic">
              Dodano: {format(new Date(article.date), 'dd MMMM yyyy, HH:mm', { locale: pl })}
            </p>
          </div>
          <NewsAdminControls 
            onEdit={() => onEdit(article)}
            onDelete={() => handleDelete(article.id)}
          />
        </div>
      ))}
    </div>
  );
}
