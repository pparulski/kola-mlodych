
import { NewsArticle } from "@/types/news";
import { NewsEditorForm } from "./news/editor/NewsEditorForm";

interface NewsEditorProps {
  existingNews?: NewsArticle | null;
  onSuccess?: () => void;
}

export function NewsEditor({ existingNews, onSuccess }: NewsEditorProps) {
  return (
    <NewsEditorForm 
      existingNews={existingNews} 
      onSuccess={onSuccess} 
    />
  );
}
