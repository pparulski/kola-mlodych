
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { StaticPageEditor } from "@/components/static/StaticPageEditor";
import { StaticPageList } from "@/components/manage/StaticPageList";
import type { StaticPage } from "@/types/staticPages";
import { toast } from "sonner";

export function ManagePages() {
  const [isCreating, setIsCreating] = useState(false);
  const [editingPage, setEditingPage] = useState<StaticPage | null>(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    console.log("ManagePages component mounted");
  }, []);

  const { data: pages, isLoading, error, refetch } = useQuery({
    queryKey: ['static-pages'],
    queryFn: async () => {
      console.log("Fetching all static pages");
      try {
        // Fetch all static pages
        const { data: allPages, error: pagesError } = await supabase
          .from('static_pages')
          .select('*')
          .order('created_at', { ascending: false });

        if (pagesError) {
          console.error("Error fetching static pages:", pagesError);
          throw pagesError;
        }

        console.log("Fetched static pages:", allPages?.length || 0);
        if (allPages && allPages.length > 0) {
          console.log("First page title:", allPages[0].title);
          console.log("First page slug:", allPages[0].slug);
        }
        return allPages as StaticPage[];
      } catch (err) {
        console.error("Exception in static pages query:", err);
        throw err;
      }
    },
    staleTime: 0 // Always get fresh data
  });

  const deleteMutation = useMutation({
    mutationFn: async (pageId: string) => {
      if (!pageId) throw new Error("Page ID is required");
      
      console.log("Deleting static page:", pageId);
      const { error } = await supabase
        .from('static_pages')
        .delete()
        .eq('id', pageId);
      
      if (error) {
        console.error("Error deleting page:", error);
        throw error;
      }
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

  const handleDelete = async (pageId: string) => {
    if (!pageId) {
      toast.error("Nie można usunąć strony - brak ID");
      return;
    }

    if (window.confirm('Czy na pewno chcesz usunąć tę stronę?')) {
      deleteMutation.mutate(pageId);
    }
  };

  if (error) {
    console.error("Error loading pages:", error);
    return (
      <div className="p-4 bg-destructive/10 border border-destructive text-destructive rounded-md">
        <p>Wystąpił błąd podczas ładowania stron: {String(error)}</p>
        <Button 
          onClick={() => refetch()}
          variant="outline"
          className="mt-2"
        >
          Spróbuj ponownie
        </Button>
      </div>
    );
  }

  if (isLoading) {
    return <div className="p-4">Ładowanie stron...</div>;
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
    />
  );
}
