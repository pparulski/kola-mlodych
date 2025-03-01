
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
        sidebar_position?: number | null;
      } = {
        title,
        content,
        featured_image: featuredImage,
        show_in_sidebar: showInSidebar,
      };

      if (existingPage?.id) {
        // If we're updating visibility from false to true, we need to assign a new position
        if (showInSidebar && !existingPage.show_in_sidebar) {
          const { data: maxPosition } = await supabase
            .from('static_pages')
            .select('sidebar_position')
            .eq('show_in_sidebar', true)
            .order('sidebar_position', { ascending: false })
            .limit(1)
            .single();
          
          updateData.sidebar_position = (maxPosition?.sidebar_position || 0) + 1;
        } else if (!showInSidebar) {
          // If hiding from sidebar, remove position
          updateData.sidebar_position = null;
        }

        const { error } = await supabase
          .from('static_pages')
          .update(updateData)
          .eq('id', existingPage.id);

        if (error) throw error;

        toast.success("Strona została zaktualizowana");
      } else {
        let sidebarPosition = null;
        
        if (showInSidebar) {
          // Get the highest current position and add 1
          const { data: maxPosition } = await supabase
            .from('static_pages')
            .select('sidebar_position')
            .eq('show_in_sidebar', true)
            .order('sidebar_position', { ascending: false })
            .limit(1)
            .single();
          
          sidebarPosition = (maxPosition?.sidebar_position || 0) + 1;
        }

        const { data, error } = await supabase
          .from('static_pages')
          .insert({
            ...updateData,
            created_by: user?.id,
            slug: defaultSlug,
            sidebar_position: sidebarPosition,
          })
          .select();

        if (error) throw error;

        toast.success("Strona została zapisana");
      }

      queryClient.invalidateQueries({ queryKey: ['static-pages'] });
      queryClient.invalidateQueries({ queryKey: ['static-pages-sidebar'] });
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
