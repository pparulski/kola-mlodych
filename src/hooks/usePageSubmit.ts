
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

      // Generate a slug from title if not provided
      const slug = defaultSlug || title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

      const updateData: {
        title: string;
        content: string;
        featured_image: string | null;
        show_in_sidebar: boolean;
        slug?: string;
      } = {
        title,
        content,
        featured_image: featuredImage,
        show_in_sidebar: showInSidebar,
      };

      // Only include slug for new pages
      if (!existingPage?.id) {
        updateData.slug = slug;
      }

      console.log("Saving page data:", existingPage ? "Update" : "Create", updateData);

      if (existingPage?.id) {
        const { error } = await supabase
          .from('static_pages')
          .update(updateData)
          .eq('id', existingPage.id);

        if (error) {
          console.error("Error updating static page:", error);
          throw error;
        }

        toast.success("Strona została zaktualizowana");
      } else {
        const { data, error } = await supabase
          .from('static_pages')
          .insert({
            ...updateData,
            created_by: user?.id,
            slug: slug,
          })
          .select();

        if (error) {
          console.error("Error creating static page:", error);
          throw error;
        }

        console.log("New page created:", data);
        toast.success("Strona została zapisana");
      }

      // Invalidate all related queries to update UI
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
