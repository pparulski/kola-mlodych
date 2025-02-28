
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
import { useQuery } from "@tanstack/react-query";
import { Category } from "@/types/categories";
import { Badge } from "@/components/ui/badge";
import { Check } from "lucide-react";

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
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const queryClient = useQueryClient();

  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name');

      if (error) throw error;
      return data as Category[];
    },
  });

  // Fetch existing page categories if editing
  const { data: pageCategories } = useQuery({
    queryKey: ['page-categories', existingPage?.id],
    queryFn: async () => {
      if (!existingPage?.id) return [];
      
      const { data, error } = await supabase
        .from('static_page_categories')
        .select(`
          category_id,
          categories(id, slug)
        `)
        .eq('static_page_id', existingPage.id);

      if (error) throw error;
      return data.map(item => item.categories.slug) as string[];
    },
    enabled: !!existingPage?.id,
  });

  useEffect(() => {
    if (existingPage) {
      setTitle(existingPage.title);
      setContent(existingPage.content);
      setFeaturedImage(existingPage.featured_image || null);
      setShowInSidebar(existingPage.show_in_sidebar ?? true);
    }
  }, [existingPage]);

  useEffect(() => {
    if (pageCategories) {
      setSelectedCategories(pageCategories);
    }
  }, [pageCategories]);

  const toggleCategory = (slug: string) => {
    if (selectedCategories.includes(slug)) {
      setSelectedCategories(selectedCategories.filter(c => c !== slug));
    } else {
      setSelectedCategories([...selectedCategories, slug]);
    }
  };

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

        // Update categories - first delete existing
        await supabase
          .from('static_page_categories')
          .delete()
          .eq('static_page_id', existingPage.id);

        // Then add the new selected categories
        if (selectedCategories.length > 0 && categories) {
          const categoryRecords = categories
            .filter(cat => selectedCategories.includes(cat.slug))
            .map(cat => ({
              static_page_id: existingPage.id,
              category_id: cat.id
            }));

          if (categoryRecords.length > 0) {
            const { error: catError } = await supabase
              .from('static_page_categories')
              .insert(categoryRecords);
            
            if (catError) throw catError;
          }
        }

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

        // Add categories for the new page
        if (selectedCategories.length > 0 && categories && data && data[0]) {
          const pageId = data[0].id;
          const categoryRecords = categories
            .filter(cat => selectedCategories.includes(cat.slug))
            .map(cat => ({
              static_page_id: pageId,
              category_id: cat.id
            }));

          if (categoryRecords.length > 0) {
            const { error: catError } = await supabase
              .from('static_page_categories')
              .insert(categoryRecords);
            
            if (catError) throw catError;
          }
        }

        toast.success("Strona została zapisana");
      }

      queryClient.invalidateQueries({ queryKey: ['static-pages'] });
      queryClient.invalidateQueries({ queryKey: ['static-pages-sidebar'] });
      if (!existingPage) {
        setTitle("");
        setContent("");
        setFeaturedImage(null);
        setShowInSidebar(true);
        setSelectedCategories([]);
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

      <div>
        <Label>Kategorie</Label>
        <div className="flex flex-wrap gap-2 mt-2">
          {categories?.map((category) => (
            <Badge
              key={category.id}
              variant={selectedCategories.includes(category.slug) ? "default" : "outline"}
              className="cursor-pointer flex items-center gap-1 px-3 py-1 text-sm"
              onClick={() => toggleCategory(category.slug)}
            >
              {selectedCategories.includes(category.slug) && (
                <Check className="h-3 w-3" />
              )}
              {category.name}
            </Badge>
          ))}
        </div>
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
