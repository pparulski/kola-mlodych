
import { Button } from "../ui/button";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { StaticPage } from "@/types/staticPages";
import { Checkbox } from "../ui/checkbox";
import { Label } from "../ui/label";
import { StaticPageImageUpload } from "./StaticPageImageUpload";
import { StaticPageTinyMCE } from "./StaticPageTinyMCE";

interface StaticPageEditorProps {
  existingPage?: StaticPage;
  onSuccess?: () => void;
  defaultSlug?: string;
}

export function StaticPageEditor({ existingPage, onSuccess, defaultSlug }: StaticPageEditorProps) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [featuredImage, setFeaturedImage] = useState<string | null>(null);
  const [showInSidebar, setShowInSidebar] = useState(existingPage?.show_in_sidebar ?? true);
  const queryClient = useQueryClient();

  useEffect(() => {
    if (existingPage) {
      setTitle(existingPage.title);
      setContent(existingPage.content);
      setFeaturedImage(existingPage.featured_image || null);
      setShowInSidebar(existingPage.show_in_sidebar ?? true);
    }
  }, [existingPage]);

  const handleSubmit = async () => {
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

        const { error } = await supabase
          .from('static_pages')
          .insert({
            ...updateData,
            created_by: user?.id,
            slug: defaultSlug,
            sidebar_position: sidebarPosition,
          });

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

  return (
    <div className="space-y-4">
      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Tytuł strony..."
        className="w-full p-2 border rounded text-black bg-white"
      />

      <StaticPageImageUpload
        featuredImage={featuredImage}
        onImageUpload={(url) => setFeaturedImage(url)}
      />

      <div className="flex items-center space-x-2">
        <Checkbox
          id="show-in-sidebar"
          checked={showInSidebar}
          onCheckedChange={(checked) => setShowInSidebar(checked as boolean)}
        />
        <Label htmlFor="show-in-sidebar">Pokaż w menu bocznym</Label>
      </div>

      <StaticPageTinyMCE 
        content={content}
        onEditorChange={setContent}
      />

      <Button onClick={handleSubmit} className="mt-4">
        {existingPage ? "Zaktualizuj" : "Opublikuj"}
      </Button>
    </div>
  );
}
