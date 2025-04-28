
import { NewsArticle } from "@/types/news";
import { useNewsCategories } from "@/hooks/useNewsCategories";
import { useNewsEditorForm } from "@/hooks/useNewsEditorForm";
import { TitleInput } from "./TitleInput";
import { FeaturedImageUpload } from "./FeaturedImageUpload";
import { CategorySelector } from "./CategorySelector";
import { RichTextEditor } from "@/components/news/editor/RichTextEditor"; // Adjust path
import { SubmitButton } from "./SubmitButton";

interface NewsEditorFormProps {
  existingNews?: NewsArticle | null;
  onSuccess?: () => void;
}

export function NewsEditorForm({ existingNews, onSuccess }: NewsEditorFormProps) {
  const { 
    selectedCategories, 
    setSelectedCategories, 
    categories, 
    newsCategories 
  } = useNewsCategories(existingNews?.id);

  const {
    title,
    setTitle,
    content,
    setContent,
    featuredImage,
    setFeaturedImage,
    isSubmitting,
    handleSubmit
  } = useNewsEditorForm({
    existingNews,
    onSuccess,
    selectedCategories,
    setSelectedCategories,
    categories,
    newsCategories
  });

  return (
    <div className="space-y-4">
      <TitleInput 
        title={title} 
        setTitle={setTitle} 
      />

      <FeaturedImageUpload 
        featuredImage={featuredImage} 
        setFeaturedImage={setFeaturedImage} 
      />

      <CategorySelector 
        selectedCategories={selectedCategories} 
        setSelectedCategories={setSelectedCategories}
        categories={categories || []}
      />

      <RichTextEditor 
        value={content} 
        onEditorChange={setContent} 
      />

      <SubmitButton 
        isSubmitting={isSubmitting} 
        onClick={handleSubmit} 
        isEditing={!!existingNews} 
      />
    </div>
  );
}
