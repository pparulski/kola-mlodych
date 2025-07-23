import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { NewsArticle } from "@/types/news";
import { generateSlug } from "@/utils/slugUtils";

interface UseNewsEditorFormProps {
  existingNews?: NewsArticle | null;
  onSuccess?: () => void;
  selectedCategories: string[];
  setSelectedCategories: (categories: string[]) => void;
  categories: any[] | null;
  newsCategories: any[] | null;
}

export function useNewsEditorForm({
  existingNews,
  onSuccess,
  selectedCategories,
  setSelectedCategories,
  categories,
  newsCategories
}: UseNewsEditorFormProps) {
  const [title, setTitle] = useState<string>("");
  const [content, setContent] = useState<string>("");
  const [featuredImage, setFeaturedImage] = useState<string | null>(null);
  const [shortUrl, setShortUrl] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const queryClient = useQueryClient();

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
        const { error } = await supabase
          .from('news')
          .update({
            title,
            content,
            featured_image: featuredImage,
            short_url: shortUrl || null,
          })
          .eq('id', existingNews.id);

        if (error) throw error;

        await supabase
          .from('news_categories')
          .delete()
          .eq('news_id', existingNews.id);

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
        const slug = await generateSlug(title);
        const { data, error } = await supabase
          .from('news')
          .insert({
            title,
            content,
            featured_image: featuredImage,
            created_by: user?.id,
            slug,
            short_url: shortUrl || null,
          })
          .select();

        if (error) throw error;

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

      if (!existingNews) {
        setTitle("");
        setContent("");
        setFeaturedImage(null);
        setShortUrl("");
        setSelectedCategories([]);
      }

      queryClient.invalidateQueries({ queryKey: ['news'] });
      queryClient.invalidateQueries({ queryKey: ['all-news'] });
      
      onSuccess?.();
    } catch (error) {
      console.error("Error submitting news:", error);
      toast.error("Wystąpił błąd podczas zapisywania artykułu");
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    title,
    setTitle,
    content,
    setContent,
    featuredImage,
    setFeaturedImage,
    shortUrl,
    setShortUrl,
    isSubmitting,
    handleSubmit
  };
}
