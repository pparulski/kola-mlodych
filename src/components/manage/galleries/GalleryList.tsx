
import { Gallery } from "@/types/galleries";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Edit, Trash } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface GalleryListProps {
  galleries: Gallery[];
  onEdit: (gallery: Gallery) => void;
}

export function GalleryList({ galleries, onEdit }: GalleryListProps) {
  const queryClient = useQueryClient();

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('galleries')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['galleries'] });
      toast.success("Galeria usunięta");
    },
    onError: (error) => {
      console.error('Error deleting gallery:', error);
      toast.error("Nie udało się usunąć galerii");
    }
  });

  if (galleries.length === 0) {
    return (
      <div className="text-center text-muted-foreground">
        Nie ma jeszcze żadnych galerii
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {galleries.map((gallery) => (
        <Card key={gallery.id}>
          <CardContent className="p-4">
            <div className="flex justify-between items-start gap-4">
              <div>
                <h3 className="font-medium">{gallery.title}</h3>
                {gallery.description && (
                  <p className="text-sm text-muted-foreground">{gallery.description}</p>
                )}
                <p className="text-xs text-muted-foreground mt-1">
                  Liczba zdjęć: {gallery.gallery_images?.length || 0}
                </p>
              </div>
              
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => onEdit(gallery)}
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => {
                    if (confirm('Czy na pewno chcesz usunąć tę galerię?')) {
                      deleteMutation.mutate(gallery.id);
                    }
                  }}
                >
                  <Trash className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
