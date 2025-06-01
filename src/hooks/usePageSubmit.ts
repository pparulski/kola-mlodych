
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
  const [showInSidebar, setShowInSidebar] = useState(
    existingPage?.show_in_sidebar ?? true
  );
  const queryClient = useQueryClient();

  const handleSubmit = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!title.trim()) {
        toast.error("Tytuł jest wymagany");
        return;
      }

      console.log("Submitting page with title:", title);

      // Generate a slug from title if not provided
      let slug = defaultSlug;
      
      if (!slug) {
        if (existingPage?.slug) {
          // Use existing slug for update
          slug = existingPage.slug;
          console.log("Using existing slug:", slug);
        } else {
          // Generate new slug for create
          slug = title.toLowerCase()
                      .replace(/[^a-z0-9]+/g, '-')
                      .replace(/^-|-$/g, '');
          console.log("Generated new slug:", slug);
        }
      }

      // Create basic update data structure - without featured_image which doesn't exist in the DB
      const updateData: {
        title: string;
        content: string;
        show_in_sidebar: boolean;
        slug?: string;
      } = {
        title,
        content,
        show_in_sidebar: showInSidebar,
      };

      // Only include slug for new pages
      if (!existingPage?.id) {
        updateData.slug = slug;
      }

      console.log("Saving page data:", existingPage ? "Update" : "Create", updateData);

      if (existingPage?.id) {
        console.log("Updating existing page with ID:", existingPage.id);
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
        console.log("Creating new page");
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
      queryClient.invalidateQueries({ queryKey: ['static-page', slug] }); // Add this to update the page if it's currently viewed
      
      if (!existingPage) {
        setTitle("");
        setContent("");
        setShowInSidebar(true);
      }
      onSuccess?.();
    } catch (error) {
      console.error("Error saving static page:", error);
      toast.error("Nie udało się zapisać strony: " + (error instanceof Error ? error.message : String(error)));
    }
  };

  return {
    title,
    setTitle,
    content, 
    setContent,
    showInSidebar,
    setShowInSidebar,
    handleSubmit
  };
}
