
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { NewsArticle } from "@/types/news";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FileUpload } from "@/components/FileUpload";
import { Editor } from "@tinymce/tinymce-react";
import { Label } from "@/components/ui/label";
import { CategorySelector } from "./CategorySelector";
import { useNewsCategories } from "@/hooks/useNewsCategories";
import { generateSlug } from "@/utils/slugUtils";

interface NewsEditorFormProps {
  existingNews?: NewsArticle | null;
  onSuccess?: () => void;
}

export function NewsEditorForm({ existingNews, onSuccess }: NewsEditorFormProps) {
  const [title, setTitle] = useState<string>("");
  const [content, setContent] = useState<string>("");
  const [featuredImage, setFeaturedImage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const queryClient = useQueryClient();
  
  const { 
    selectedCategories, 
    setSelectedCategories, 
    categories, 
    newsCategories 
  } = useNewsCategories(existingNews?.id);

  useEffect(() => {
    if (existingNews) {
      setTitle(existingNews.title);
      setContent(existingNews.content);
      setFeaturedImage(existingNews.featured_image);
    }
  }, [existingNews]);

  useEffect(() => {
    if (newsCategories) {
      setSelectedCategories(newsCategories);
    }
  }, [newsCategories, setSelectedCategories]);

  const handleSubmit = async () => {
    if (!title.trim()) {
      toast.error("Tytuł nie może być pusty");
      return;
    }

    if (!content.trim()) {
      toast.error("Treść nie może być pusta");
      return;
    }

    setIsSubmitting(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (existingNews) {
        // Update existing news
        const { error } = await supabase
          .from('news')
          .update({
            title,
            content,
            featured_image: featuredImage,
          })
          .eq('id', existingNews.id);

        if (error) throw error;

        // Update categories - first delete existing
        await supabase
          .from('news_categories')
          .delete()
          .eq('news_id', existingNews.id);

        // Then add the new selected categories
        if (selectedCategories.length > 0 && categories) {
          const categoryRecords = categories
            .filter(cat => selectedCategories.includes(cat.slug))
            .map(cat => ({
              news_id: existingNews.id,
              category_id: cat.id
            }));

          if (categoryRecords.length > 0) {
            const { error: catError } = await supabase
              .from('news_categories')
              .insert(categoryRecords);
            
            if (catError) throw catError;
          }
        }

        toast.success("Artykuł został zaktualizowany");
      } else {
        // Create new news
        const slug = await generateSlug(title);
        const { data, error } = await supabase
          .from('news')
          .insert({
            title,
            content,
            featured_image: featuredImage,
            created_by: user?.id,
            slug,
          })
          .select();

        if (error) throw error;

        // Add categories for the new article
        if (selectedCategories.length > 0 && categories && data && data[0]) {
          const newsId = data[0].id;
          const categoryRecords = categories
            .filter(cat => selectedCategories.includes(cat.slug))
            .map(cat => ({
              news_id: newsId,
              category_id: cat.id
            }));

          if (categoryRecords.length > 0) {
            const { error: catError } = await supabase
              .from('news_categories')
              .insert(categoryRecords);
            
            if (catError) throw catError;
          }
        }

        toast.success("Artykuł został dodany");
      }

      // Reset form fields for adding a new article
      if (!existingNews) {
        setTitle("");
        setContent("");
        setFeaturedImage(null);
        setSelectedCategories([]);
      }

      // Invalidate queries to refresh the news list
      queryClient.invalidateQueries({ queryKey: ['news'] });
      queryClient.invalidateQueries({ queryKey: ['all-news'] });
      
      // Call the success callback
      onSuccess?.();
    } catch (error) {
      console.error("Error submitting news:", error);
      toast.error("Wystąpił błąd podczas zapisywania artykułu");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="title">Tytuł</Label>
        <Input
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Tytuł artykułu..."
          className="w-full"
        />
      </div>

      <div>
        <Label htmlFor="featured-image">Zdjęcie wyróżniające</Label>
        <FileUpload
          onUpload={(url) => setFeaturedImage(url)}
          currentValue={featuredImage}
          acceptedFileTypes="image/*"
        />
      </div>

      <CategorySelector 
        selectedCategories={selectedCategories} 
        setSelectedCategories={setSelectedCategories}
        categories={categories || []}
      />

      <div>
        <Label htmlFor="content">Treść</Label>
        <Editor
          apiKey="qagffr3pkuv17a8on1afax661irst1hbr4e6tbv888sz91jc"
          value={content}
          onEditorChange={(newContent) => setContent(newContent)}
          init={{
            height: 400,
            menubar: false,
            plugins: [
              'advlist', 'autolink', 'lists', 'link', 'image', 'charmap', 'preview',
              'anchor', 'searchreplace', 'visualblocks', 'code', 'fullscreen',
              'insertdatetime', 'media', 'table', 'code', 'help', 'wordcount'
            ],
            toolbar: 'undo redo | formatselect | ' +
              'bold italic backcolor | alignleft aligncenter ' +
              'alignright alignjustify | bullist numlist outdent indent | ' +
              'removeformat | help',
            content_style: 'body { font-family:Helvetica,Arial,sans-serif; font-size:14px }'
          }}
        />
      </div>

      <Button
        onClick={handleSubmit}
        disabled={isSubmitting}
        className="w-full"
      >
        {isSubmitting
          ? "Zapisywanie..."
          : existingNews
            ? "Zaktualizuj artykuł"
            : "Dodaj artykuł"}
      </Button>
    </div>
  );
}
