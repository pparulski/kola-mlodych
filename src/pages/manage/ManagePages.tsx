
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, ArrowUp, ArrowDown } from "lucide-react";
import { useState } from "react";
import { StaticPageEditor } from "@/components/static/StaticPageEditor";
import type { StaticPage } from "@/types/staticPages";
import { toast } from "sonner";

export function ManagePages() {
  const [isCreating, setIsCreating] = useState(false);
  const [editingPage, setEditingPage] = useState<StaticPage | null>(null);
  const queryClient = useQueryClient();

  const { data: pages, isLoading } = useQuery({
    queryKey: ['static-pages'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('static_pages')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as StaticPage[];
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
      const currentPage = pages?.find(p => p.id === pageId);
      if (!currentPage || !currentPage.show_in_sidebar) return;

      const sidebarPages = pages?.filter(p => p.show_in_sidebar) || [];
      const currentIndex = sidebarPages.findIndex(p => p.id === pageId);
      
      if (currentIndex === -1) return;
      
      const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
      if (newIndex < 0 || newIndex >= sidebarPages.length) return;
      
      const pageToSwap = sidebarPages[newIndex];

      // Update both pages
      const { error: error1 } = await supabase
        .from('static_pages')
        .update({ sidebar_position: newIndex + 1 })
        .eq('id', pageId);

      if (error1) throw error1;

      const { error: error2 } = await supabase
        .from('static_pages')
        .update({ sidebar_position: currentIndex + 1 })
        .eq('id', pageToSwap.id);

      if (error2) throw error2;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['static-pages'] });
      queryClient.invalidateQueries({ queryKey: ['static-pages-sidebar'] });
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

  const visibleInSidebar = pages?.filter(page => page.show_in_sidebar) || [];
  
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Zarządzaj stronami</h1>
        <Button onClick={() => setIsCreating(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Dodaj nową stronę
        </Button>
      </div>

      <div className="grid gap-4">
        {pages?.map((page) => (
          <div
            key={page.id}
            className="p-4 border rounded-lg flex justify-between items-center"
          >
            <div className="flex-1">
              <h2 className="font-semibold">{page.title}</h2>
              <p className="text-sm text-muted-foreground">/{page.slug}</p>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-sm text-muted-foreground">
                  {page.show_in_sidebar ? "Widoczna w menu" : "Ukryta w menu"}
                </span>
                {page.show_in_sidebar && (
                  <span className="text-sm text-muted-foreground">
                    (Pozycja: {visibleInSidebar.findIndex(p => p.id === page.id) + 1})
                  </span>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              {page.show_in_sidebar && (
                <div className="flex gap-1">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => updatePositionMutation.mutate({ pageId: page.id, direction: 'up' })}
                    disabled={visibleInSidebar.findIndex(p => p.id === page.id) === 0}
                  >
                    <ArrowUp className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => updatePositionMutation.mutate({ pageId: page.id, direction: 'down' })}
                    disabled={visibleInSidebar.findIndex(p => p.id === page.id) === visibleInSidebar.length - 1}
                  >
                    <ArrowDown className="h-4 w-4" />
                  </Button>
                </div>
              )}
              <Button
                variant="outline"
                onClick={() => setEditingPage(page)}
              >
                Edytuj
              </Button>
              <Button
                variant="destructive"
                size="icon"
                onClick={() => handleDelete(page.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
