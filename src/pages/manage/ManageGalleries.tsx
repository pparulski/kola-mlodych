
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { GalleryList } from "@/components/manage/galleries/GalleryList";
import { GalleryEditor } from "@/components/manage/galleries/GalleryEditor";
import { Gallery } from "@/types/galleries";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { PlusCircle, Info } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

export function ManageGalleries() {
  const [editingGallery, setEditingGallery] = useState<Gallery | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  const { data: galleries, isLoading } = useQuery({
    queryKey: ['galleries'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('article_galleries')
        .select('*, gallery_images(*)');
      
      if (error) {
        toast.error("Failed to load galleries");
        throw error;
      }
      
      return data as Gallery[];
    },
  });

  const handleCreateNew = () => {
    setEditingGallery(null);
    setIsCreating(true);
  };

  const handleCancel = () => {
    setEditingGallery(null);
    setIsCreating(false);
  };

  const handleEdit = (gallery: Gallery) => {
    setIsCreating(false);
    setEditingGallery(gallery);
  };

  if (isLoading) {
    return <div className="flex justify-center p-8">Loading...</div>;
  }

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-2xl font-bold mb-6">Zarządzaj galeriami</h1>
      
      <Alert className="mb-6 border-blue-200 bg-blue-50 dark:bg-blue-900/20">
        <Info className="h-4 w-4" />
        <AlertDescription>
          Aby dodać zdjęcia do galerii, najpierw utwórz nową galerię, a następnie edytuj ją, aby dodać zdjęcia.
        </AlertDescription>
      </Alert>
      
      <div className="grid gap-6 lg:grid-cols-2">
        <div>
          {isCreating || editingGallery ? (
            <GalleryEditor
              gallery={editingGallery}
              onCancel={handleCancel}
            />
          ) : (
            <div className="flex flex-col items-center justify-center p-8 border rounded-md bg-muted/20">
              <p className="mb-4 text-muted-foreground">Wybierz galerię do edycji lub dodaj nową</p>
              <Button onClick={handleCreateNew}>
                <PlusCircle className="mr-2 h-4 w-4" />
                Dodaj nową galerię
              </Button>
            </div>
          )}
        </div>
        
        <div>
          <div className="mb-4">
            <h2 className="text-xl font-medium">Twoje galerie</h2>
          </div>
          <GalleryList
            galleries={galleries || []}
            onEdit={handleEdit}
          />
        </div>
      </div>
    </div>
  );
}
