
import { NewsEditor } from "@/components/NewsEditor";
import { NewsArticle } from "@/types/news";
import { useQueryClient } from "@tanstack/react-query";

interface NewsEditorSectionProps {
  editingNews: NewsArticle | null;
  onSuccess: () => void;
}

export function NewsEditorSection({ editingNews, onSuccess }: NewsEditorSectionProps) {
  const queryClient = useQueryClient();

  return (
    <div>
      <h2 className="text-xl mb-4">
        {editingNews ? "Edytuj artykuł" : "Dodaj nowy artykuł"}
      </h2>
      <NewsEditor 
        existingNews={editingNews} 
        onSuccess={() => {
          onSuccess();
          queryClient.invalidateQueries({ queryKey: ['news'] });
        }}
        key={editingNews?.id || 'new'} 
      />
    </div>
  );
}
