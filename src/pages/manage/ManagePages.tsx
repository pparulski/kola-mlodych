
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { StaticPageEditor } from "@/components/static/StaticPageEditor";
import { StaticPageList } from "@/components/manage/StaticPageList";
import type { StaticPage } from "@/types/staticPages";
import { toast } from "sonner";

export function ManagePages() {
  const [isCreating, setIsCreating] = useState(false);
  const [editingPage, setEditingPage] = useState<StaticPage | null>(null);
  const queryClient = useQueryClient();

  const { data: pages, isLoading } = useQuery({
    queryKey: ['static-pages'],
    queryFn: async () => {
      // First get all pages that are visible in sidebar, ordered by position
      const { data: visiblePages, error: visibleError } = await supabase
        .from('static_pages')
        .select('*')
        .eq('show_in_sidebar', true)
        .order('sidebar_position', { ascending: true, nullsFirst: false });

      if (visibleError) throw visibleError;

      // Then get all pages that are not visible in sidebar
      const { data: hiddenPages, error: hiddenError } = await supabase
        .from('static_pages')
        .select('*')
        .eq('show_in_sidebar', false)
        .order('created_at', { ascending: false });

      if (hiddenError) throw hiddenError;

      // Combine both arrays, with hidden pages at the end
      return [...(visiblePages || []), ...(hiddenPages || [])] as StaticPage[];
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (pageId: string) => {
      if (!pageId) throw new Error("Page ID is required");
      
      const { error } = await supabase
        .from('static_pages')
        .delete()
        .eq('id', pageId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['static-pages'] });
      queryClient.invalidateQueries({ queryKey: ['static-pages-sidebar'] });
      toast.success("Strona została usunięta");
    },
    onError: (error) => {
      console.error("Error deleting page:", error);
      toast.error("Nie udało się usunąć strony");
    }
  });

  const updatePositionMutation = useMutation({
    mutationFn: async ({ pageId, direction }: { pageId: string; direction: 'up' | 'down' }) => {
      // Get the current page and its position
      const currentPage = pages?.find(p => p.id === pageId);
      if (!currentPage || !currentPage.show_in_sidebar) return;

      const sidebarPages = pages?.filter(p => p.show_in_sidebar)
        .sort((a, b) => (a.sidebar_position || 0) - (b.sidebar_position || 0)) || [];
      
      const currentIndex = sidebarPages.findIndex(p => p.id === pageId);
      if (currentIndex === -1) return;
      
      const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
      if (newIndex < 0 || newIndex >= sidebarPages.length) return;
      
      // Swap positions with adjacent page
      const adjacentPage = sidebarPages[newIndex];
      const tempPosition = currentPage.sidebar_position;
      
      const { error: error1 } = await supabase
        .from('static_pages')
        .update({ sidebar_position: adjacentPage.sidebar_position })
        .eq('id', currentPage.id);
      
      if (error1) throw error1;
      
      const { error: error2 } = await supabase
        .from('static_pages')
        .update({ sidebar_position: tempPosition })
        .eq('id', adjacentPage.id);
      
      if (error2) throw error2;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['static-pages'] });
      queryClient.invalidateQueries({ queryKey: ['static-pages-sidebar'] });
      toast.success("Pozycja została zmieniona");
    },
    onError: () => {
      toast.error("Nie udało się zmienić pozycji strony");
    }
  });

  const handleDelete = async (pageId: string) => {
    if (!pageId) {
      toast.error("Nie można usunąć strony - brak ID");
      return;
    }

    if (window.confirm('Czy na pewno chcesz usunąć tę stronę?')) {
      deleteMutation.mutate(pageId);
    }
  };

  if (isLoading) {
    return <div>Ładowanie...</div>;
  }

  if (isCreating || editingPage) {
    return (
      <div className="space-y-4">
        <Button 
          variant="outline" 
          onClick={() => {
            setIsCreating(false);
            setEditingPage(null);
          }}
        >
          Wróć do listy
        </Button>
        <StaticPageEditor
          existingPage={editingPage || undefined}
          onSuccess={() => {
            setIsCreating(false);
            setEditingPage(null);
            queryClient.invalidateQueries({ queryKey: ['static-pages'] });
            queryClient.invalidateQueries({ queryKey: ['static-pages-sidebar'] });
          }}
        />
      </div>
    );
  }

  return (
    <StaticPageList
      pages={pages || []}
      onCreateNew={() => setIsCreating(true)}
      onEdit={setEditingPage}
      onDelete={handleDelete}
      updatePositionMutation={updatePositionMutation}
    />
  );
}
