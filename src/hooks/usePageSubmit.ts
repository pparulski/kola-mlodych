
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { StaticPage } from "@/types/staticPages";

export function usePageSubmit(
  existingPage?: StaticPage,
  onSuccess?: () => void,
  defaultSlug?: string
) {
  const [title, setTitle] = useState(existingPage?.title || "");
  const [content, setContent] = useState(existingPage?.content || "");
  const [featuredImage, setFeaturedImage] = useState<string | null>(
    existingPage?.featured_image || null
  );
  const [showInSidebar, setShowInSidebar] = useState(
    existingPage?.show_in_sidebar ?? true
  );
  const queryClient = useQueryClient();

  const handleSubmit = async (selectedCategories: string[]) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!title.trim()) {
        toast.error("Tytuł jest wymagany");
        return;
      }

      const updateData: {
        title: string;
        content: string;
        featured_image: string | null;
        show_in_sidebar: boolean;
      } = {
        title,
        content,
        featured_image: featuredImage,
        show_in_sidebar: showInSidebar,
      };

      if (existingPage?.id) {
        const { error } = await supabase
          .from('static_pages')
          .update(updateData)
          .eq('id', existingPage.id);

        if (error) throw error;

        toast.success("Strona została zaktualizowana");
      } else {
        const { data, error } = await supabase
          .from('static_pages')
          .insert({
            ...updateData,
            created_by: user?.id,
            slug: defaultSlug,
          })
          .select();

        if (error) throw error;

        toast.success("Strona została zapisana");
      }

      queryClient.invalidateQueries({ queryKey: ['static-pages'] });
      queryClient.invalidateQueries({ queryKey: ['static-pages-sidebar'] });
      queryClient.invalidateQueries({ queryKey: ['menu-items'] });
      
      if (!existingPage) {
        setTitle("");
        setContent("");
        setFeaturedImage(null);
        setShowInSidebar(true);
      }
      onSuccess?.();
    } catch (error) {
      console.error("Error saving static page:", error);
      toast.error("Nie udało się zapisać strony");
    }
  };

  return {
    title,
    setTitle,
    content, 
    setContent,
    featuredImage,
    setFeaturedImage,
    showInSidebar,
    setShowInSidebar,
    handleSubmit
  };
}
